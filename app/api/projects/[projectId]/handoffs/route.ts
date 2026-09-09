import { env } from 'cloudflare:workers';
import { desc, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getDb } from '@/db';
import { artDirections, creativeDevelopments, handoffs, opportunities } from '@/db/schema';
import { getProjectWorkspace } from '@/lib/data';
import { handoffSchema } from '@/lib/schemas';
import { OpenAICompatibleProvider } from '@/src/integrations/llm/provider';

const requestSchema = z.object({ recipient: z.enum(['PHOTOGRAPHER', 'DIRECTOR', 'DESIGNER', 'EDITOR', 'STYLIST', 'PRODUCER', 'CLIENT']) });

export async function POST(request: Request, context: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await context.params;
  const parsed = requestSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: 'Choose a valid handoff recipient.' }, { status: 400 });
  const environment = env as unknown as { OPENAI_API_KEY?: string; LLM_BASE_URL?: string; LLM_MODEL?: string };
  if (!environment.OPENAI_API_KEY || !environment.LLM_MODEL) return NextResponse.json({ error: 'AI generation is not configured. Add OPENAI_API_KEY and LLM_MODEL.' }, { status: 503 });
  const workspace = await getProjectWorkspace(projectId);
  if (!workspace) return NextResponse.json({ error: 'Project not found.' }, { status: 404 });
  const db = getDb();
  const [direction] = await db.select({ artDirection: artDirections, development: creativeDevelopments, opportunity: opportunities })
    .from(artDirections)
    .innerJoin(creativeDevelopments, eq(artDirections.developmentId, creativeDevelopments.id))
    .innerJoin(opportunities, eq(creativeDevelopments.opportunityId, opportunities.id))
    .where(eq(opportunities.projectId, projectId))
    .orderBy(desc(artDirections.updatedAt))
    .limit(1);
  if (!direction) return NextResponse.json({ error: 'Create art direction before a recipient handoff.' }, { status: 409 });
  const provider = new OpenAICompatibleProvider({ apiKey: environment.OPENAI_API_KEY, baseUrl: environment.LLM_BASE_URL, model: environment.LLM_MODEL });
  try {
    const result = await provider.generate({
      schema: handoffSchema,
      system: 'You are Axis Creative Intelligence. Produce a concise, production-usable handoff for the named recipient. Preserve unknowns, source boundaries and human approval. Do not add unverified claims or creative choices that conflict with the approved direction.',
      prompt: `Recipient: ${parsed.data.recipient}\nProject: ${JSON.stringify(workspace.project)}\nOpportunity: ${JSON.stringify(direction.opportunity)}\nDevelopment: ${direction.development.contentJson}\nArt direction: ${direction.artDirection.contentJson}\nStoryboard: ${JSON.stringify(workspace.storyboard)}`,
    });
    const now = new Date().toISOString();
    const id = crypto.randomUUID();
    await db.insert(handoffs).values({ id, projectId, recipient: parsed.data.recipient, contentJson: JSON.stringify(result), status: 'READY_FOR_REVIEW', updatedAt: now });
    return NextResponse.json({ id, recipient: parsed.data.recipient, stored: true }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Handoff generation failed.' }, { status: 502 });
  }
}
