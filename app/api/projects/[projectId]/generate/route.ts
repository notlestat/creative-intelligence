import { env } from 'cloudflare:workers';
import { and, desc, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getDb } from '@/db';
import {
  artDirections, creativeDevelopments, opportunities, projects, signals, storyboards,
} from '@/db/schema';
import { getProjectWorkspace } from '@/lib/data';
import {
  artDirectionSchema, creativeDevelopmentSchema, opportunitySchema, signalSchema, storyboardSchema,
} from '@/lib/schemas';
import { OpenAICompatibleProvider } from '@/src/integrations/llm/provider';

const requestSchema = z.object({ stage: z.enum(['SIGNALS', 'OPPORTUNITIES', 'DEVELOPMENT', 'ART_DIRECTION', 'STORYBOARD']) });
const signalOutputSchema = z.object({ signals: z.array(signalSchema).min(1).max(12) });
const opportunityOutputSchema = z.object({ opportunities: z.array(opportunitySchema).min(1).max(10) });

type LlmEnvironment = { OPENAI_API_KEY?: string; LLM_BASE_URL?: string; LLM_MODEL?: string };

export async function POST(request: Request, context: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await context.params;
  const parsed = requestSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: 'Choose a valid Axis generation stage.' }, { status: 400 });
  const environment = env as unknown as LlmEnvironment;
  if (!environment.OPENAI_API_KEY || !environment.LLM_MODEL) {
    return NextResponse.json({ error: 'AI generation is not configured. Add OPENAI_API_KEY and LLM_MODEL; the saved demos remain usable without them.' }, { status: 503 });
  }
  const workspace = await getProjectWorkspace(projectId);
  if (!workspace) return NextResponse.json({ error: 'Project not found.' }, { status: 404 });
  const provider = new OpenAICompatibleProvider({
    apiKey: environment.OPENAI_API_KEY, baseUrl: environment.LLM_BASE_URL, model: environment.LLM_MODEL,
  });
  const db = getDb();
  const now = new Date().toISOString();
  const evidence = {
    project: workspace.project,
    memory: workspace.memory,
    findings: workspace.findings,
    competitors: workspace.competitors,
    signals: workspace.signals,
    opportunities: workspace.opportunities,
    development: workspace.development,
    artDirection: workspace.artDirection,
  };
  const system = 'You are Axis Creative Intelligence. Separate observations from interpretations, use only supplied evidence IDs, keep unknowns explicit, include counter-evidence, and produce specific creative direction. Human approval is authoritative.';

  try {
    if (parsed.data.stage === 'SIGNALS') {
      if (workspace.findings.length === 0) return NextResponse.json({ error: 'Add and inspect at least one sourced finding first.' }, { status: 409 });
      if (workspace.signals.length) return NextResponse.json({ error: 'Signals already exist. v0.1 preserves them rather than silently replacing work.' }, { status: 409 });
      const result = await provider.generate({ schema: signalOutputSchema, system, prompt: `Derive a small set of decision-useful signals from this evidence. Every evidence value must be a supplied finding ID. JSON shape: {"signals": [...]}.\n${JSON.stringify(evidence)}` });
      await db.insert(signals).values(result.signals.map((item) => ({
        id: crypto.randomUUID(), projectId, type: item.type, title: item.title, description: item.description,
        evidenceJson: JSON.stringify(item.evidence), strength: item.strength, confidence: item.confidence,
        freshness: item.freshness, creativeRelevance: item.creativeRelevance, implication: item.implication,
        counterEvidence: item.counterEvidence || null,
      })));
      await db.update(projects).set({ stage: 'SIGNALS', updatedAt: now }).where(eq(projects.id, projectId));
      return NextResponse.json({ stored: result.signals.length, stage: parsed.data.stage }, { status: 201 });
    }

    if (parsed.data.stage === 'OPPORTUNITIES') {
      if (workspace.signals.length === 0) return NextResponse.json({ error: 'Generate or enter signals before opportunities.' }, { status: 409 });
      if (workspace.opportunities.length) return NextResponse.json({ error: 'Opportunities already exist. v0.1 preserves them rather than silently replacing work.' }, { status: 409 });
      const result = await provider.generate({ schema: opportunityOutputSchema, system, prompt: `Generate three to seven distinct opportunities. Recommendations are allowed; never label a winner. Every evidence value must be a supplied finding or signal ID. JSON shape: {"opportunities": [...]}.\n${JSON.stringify(evidence)}` });
      await db.insert(opportunities).values(result.opportunities.map((item) => ({
        id: crypto.randomUUID(), projectId, title: item.title, oneLine: item.oneLine, observed: item.observed,
        whyItMatters: item.whyItMatters, audience: item.audience, tension: item.tension,
        evidenceJson: JSON.stringify(item.evidence), counterEvidence: item.counterEvidence || null,
        whyThisProject: item.whyThisProject, whyNow: item.whyNow, creativePossibility: item.creativePossibility,
        risk: item.risk, originality: item.originality, brandFit: item.brandFit,
        evidenceStrength: item.evidenceStrength, feasibility: item.feasibility, confidence: item.confidence,
        recommendation: item.recommendation, status: 'PENDING' as const,
      })));
      await db.update(projects).set({ stage: 'OPPORTUNITIES', updatedAt: now }).where(eq(projects.id, projectId));
      return NextResponse.json({ stored: result.opportunities.length, stage: parsed.data.stage }, { status: 201 });
    }

    const [approved] = await db.select().from(opportunities)
      .where(and(eq(opportunities.projectId, projectId), eq(opportunities.status, 'APPROVED')))
      .orderBy(desc(opportunities.recommendation));
    if (!approved) return NextResponse.json({ error: 'Approve an opportunity before development.' }, { status: 409 });

    if (parsed.data.stage === 'DEVELOPMENT') {
      const [existing] = await db.select().from(creativeDevelopments).where(eq(creativeDevelopments.opportunityId, approved.id)).limit(1);
      if (existing) return NextResponse.json({ error: 'Creative development already exists for this opportunity.' }, { status: 409 });
      const result = await provider.generate({ schema: creativeDevelopmentSchema, system, prompt: `Develop the approved opportunity below. Make every execution traceable to the insight and tension. Avoid generic agency phrasing.\nApproved opportunity: ${JSON.stringify(approved)}\nEvidence: ${JSON.stringify(evidence)}` });
      await db.insert(creativeDevelopments).values({ id: crypto.randomUUID(), opportunityId: approved.id, contentJson: JSON.stringify(result), status: 'READY_FOR_REVIEW', updatedAt: now });
      await db.update(projects).set({ stage: 'CREATIVE_DEVELOPMENT', updatedAt: now }).where(eq(projects.id, projectId));
      return NextResponse.json({ stored: 1, stage: parsed.data.stage }, { status: 201 });
    }

    const [development] = await db.select().from(creativeDevelopments).where(eq(creativeDevelopments.opportunityId, approved.id)).orderBy(desc(creativeDevelopments.updatedAt)).limit(1);
    if (!development) return NextResponse.json({ error: 'Create development before visual direction.' }, { status: 409 });

    if (parsed.data.stage === 'ART_DIRECTION') {
      const [existing] = await db.select().from(artDirections).where(eq(artDirections.developmentId, development.id)).limit(1);
      if (existing) return NextResponse.json({ error: 'Art direction already exists for this development.' }, { status: 409 });
      const result = await provider.generate({ schema: artDirectionSchema, system, prompt: `Translate this development into concrete, concept-connected art direction. Ban vague terms unless each is made observable.\nDevelopment: ${development.contentJson}\nEvidence: ${JSON.stringify(evidence)}` });
      await db.insert(artDirections).values({ id: crypto.randomUUID(), developmentId: development.id, contentJson: JSON.stringify(result), status: 'READY_FOR_REVIEW', updatedAt: now });
      await db.update(projects).set({ stage: 'ART_DIRECTION', updatedAt: now }).where(eq(projects.id, projectId));
      return NextResponse.json({ stored: 1, stage: parsed.data.stage }, { status: 201 });
    }

    const [artDirection] = await db.select().from(artDirections).where(eq(artDirections.developmentId, development.id)).orderBy(desc(artDirections.updatedAt)).limit(1);
    if (!artDirection) return NextResponse.json({ error: 'Create art direction before the storyboard.' }, { status: 409 });
    const [existingStoryboard] = await db.select().from(storyboards).where(eq(storyboards.projectId, projectId)).limit(1);
    if (existingStoryboard) return NextResponse.json({ error: 'A storyboard already exists. v0.1 preserves manual edits.' }, { status: 409 });
    const result = await provider.generate({ schema: storyboardSchema, system, prompt: `Build an editable production storyboard using the supplied development and art direction. Use placeholder descriptions, not invented generated imagery.\nDevelopment: ${development.contentJson}\nArt direction: ${artDirection.contentJson}` });
    await db.insert(storyboards).values({ id: crypto.randomUUID(), projectId, title: result.title, framesJson: JSON.stringify(result.frames), status: 'READY_FOR_REVIEW', updatedAt: now });
    await db.update(projects).set({ stage: 'STORYBOARD', updatedAt: now }).where(eq(projects.id, projectId));
    return NextResponse.json({ stored: result.frames.length, stage: parsed.data.stage }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Generation failed without overwriting saved work.' }, { status: 502 });
  }
}
