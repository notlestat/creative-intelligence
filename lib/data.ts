import { desc, eq } from 'drizzle-orm';
import { getDb } from '@/db';
import {
  artDirections, competitors, creativeDevelopments, feedback, findings, handoffs,
  memoryEntries, opportunities, projects, signals, sources, storyboards,
} from '@/db/schema';
import { demoProjects } from '@/lib/fixtures';

function jsonArray(value: string | null | undefined) {
  try {
    const parsed: unknown = JSON.parse(value || '[]');
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function jsonItems(value: string | null | undefined) {
  try {
    const parsed: unknown = JSON.parse(value || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function jsonObject(value: string | null | undefined) {
  try {
    const parsed: unknown = JSON.parse(value || '{}');
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed as Record<string, unknown> : {};
  } catch {
    return {};
  }
}

export async function listProjects() {
  try {
    const rows = await getDb().select().from(projects).orderBy(desc(projects.updatedAt));
    return [...rows.map((row) => ({ ...row, evidenceCount: 0 })), ...demoProjects];
  } catch {
    return demoProjects;
  }
}

export async function getProject(id: string) {
  try {
    const [row] = await getDb().select().from(projects).where(eq(projects.id, id)).limit(1);
    return row ?? null;
  } catch {
    return null;
  }
}

export async function getProjectWorkspace(id: string) {
  const db = getDb();
  const [project] = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
  if (!project) return null;
  const [sourceRows, memoryRows, findingRows, competitorRows, signalRows, opportunityRows, storyboardRows, feedbackRows, handoffRows] = await Promise.all([
    db.select().from(sources).where(eq(sources.projectId, id)).orderBy(desc(sources.capturedAt)),
    db.select().from(memoryEntries).where(eq(memoryEntries.projectId, id)).orderBy(desc(memoryEntries.updatedAt)),
    db.select().from(findings).where(eq(findings.projectId, id)).orderBy(desc(findings.observedAt)),
    db.select().from(competitors).where(eq(competitors.projectId, id)),
    db.select().from(signals).where(eq(signals.projectId, id)),
    db.select().from(opportunities).where(eq(opportunities.projectId, id)),
    db.select().from(storyboards).where(eq(storyboards.projectId, id)).orderBy(desc(storyboards.updatedAt)),
    db.select().from(feedback).where(eq(feedback.projectId, id)).orderBy(desc(feedback.createdAt)),
    db.select().from(handoffs).where(eq(handoffs.projectId, id)).orderBy(desc(handoffs.updatedAt)),
  ]);
  const developmentRows = await db.select({ development: creativeDevelopments })
    .from(creativeDevelopments)
    .innerJoin(opportunities, eq(creativeDevelopments.opportunityId, opportunities.id))
    .where(eq(opportunities.projectId, id))
    .orderBy(desc(creativeDevelopments.updatedAt));
  const artDirectionRows = await db.select({ artDirection: artDirections })
    .from(artDirections)
    .innerJoin(creativeDevelopments, eq(artDirections.developmentId, creativeDevelopments.id))
    .innerJoin(opportunities, eq(creativeDevelopments.opportunityId, opportunities.id))
    .where(eq(opportunities.projectId, id))
    .orderBy(desc(artDirections.updatedAt));

  return {
    project: { ...project, evidenceCount: findingRows.length, isDemo: false },
    sources: sourceRows,
    memory: memoryRows.map((entry) => ({ field: entry.field, value: entry.value, confidence: entry.confidence, evidence: jsonArray(entry.evidenceJson) })),
    findings: findingRows.map((item) => ({
      id: item.id, category: item.category, classification: item.classification, finding: item.finding,
      sourceLabel: item.sourceLabel, sourceUrl: item.sourceUrl ?? undefined, observedAt: item.observedAt.slice(0, 10),
      confidence: item.confidence, relevance: item.relevance,
    })),
    competitors: competitorRows.map((item) => ({
      name: item.name, position: item.positioning || 'UNKNOWN', visual: item.visualLanguage || 'UNKNOWN',
      pattern: item.campaignPatterns || item.contentPatterns || 'UNKNOWN', difference: item.differences || 'UNKNOWN',
      evidence: jsonArray(item.evidenceJson).join(', ') || 'No evidence attached',
    })),
    signals: signalRows.map((item) => ({
      id: item.id, type: item.type, title: item.title, description: item.description, evidence: jsonArray(item.evidenceJson),
      strength: item.strength, confidence: item.confidence, freshness: item.freshness,
      creativeRelevance: item.creativeRelevance, implication: item.implication, counterEvidence: item.counterEvidence || 'None recorded.',
    })),
    opportunities: opportunityRows.map((item) => ({
      id: item.id, title: item.title, oneLine: item.oneLine, observed: item.observed, whyItMatters: item.whyItMatters,
      audience: item.audience, tension: item.tension, evidence: jsonArray(item.evidenceJson),
      counterEvidence: item.counterEvidence || 'None recorded.', whyThisProject: item.whyThisProject, whyNow: item.whyNow,
      creativePossibility: item.creativePossibility, risk: item.risk, originality: item.originality,
      brandFit: item.brandFit, evidenceStrength: item.evidenceStrength, feasibility: item.feasibility,
      confidence: item.confidence, recommendation: item.recommendation, status: item.status,
    })),
    development: developmentRows[0] ? jsonObject(developmentRows[0].development.contentJson) : {},
    artDirection: artDirectionRows[0] ? jsonObject(artDirectionRows[0].artDirection.contentJson) : {},
    storyboard: storyboardRows[0] ? jsonItems(storyboardRows[0].framesJson) : [],
    feedback: feedbackRows.map((item) => ({ label: `${item.entityType} / ${item.entityId}`, note: item.note || 'No note added.', decision: item.decision })),
    handoffs: handoffRows.map((item) => ({ ...item, content: jsonObject(item.contentJson) })),
  };
}
