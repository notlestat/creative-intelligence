import { NextResponse } from 'next/server';
import { getDb } from '@/db';
import { competitors, memoryEntries, projects } from '@/db/schema';
import { projectSchema } from '@/lib/schemas';

export async function GET() {
  try {
    return NextResponse.json({ projects: await getDb().select().from(projects) });
  } catch (error) {
    return NextResponse.json({ projects: [], availability: 'Database unavailable', detail: error instanceof Error ? error.message : 'Unknown error' }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const parsed = projectSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid project' }, { status: 400 });
  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  const value = parsed.data;
  try {
    const db = getDb();
    await db.insert(projects).values({
      id, mode: value.mode, name: value.name, website: value.website || null, brief: value.brief, objective: value.objective,
      audience: value.audience || null, referencesJson: JSON.stringify(value.references), competitorsJson: JSON.stringify(value.competitors),
      notes: value.notes || null, releaseType: value.releaseType || null, releaseName: value.releaseName || null,
      themesJson: JSON.stringify(value.themes), releaseDate: value.releaseDate || null, userLyrics: value.userLyrics || null,
      collaboratorsJson: JSON.stringify(value.collaborators), createdAt: now, updatedAt: now,
    });
    const initialMemory = [
      { field: 'Brief', value: value.brief, confidence: 'HIGH' as const },
      { field: 'Objective', value: value.objective, confidence: 'HIGH' as const },
      ...(value.audience ? [{ field: 'Audience supplied at intake', value: value.audience, confidence: 'MEDIUM' as const }] : []),
      ...(value.notes ? [{ field: 'Constraints and notes', value: value.notes, confidence: 'HIGH' as const }] : []),
      ...(value.mode === 'ARTIST' && value.releaseName ? [{ field: 'Release', value: [value.releaseType, value.releaseName].filter(Boolean).join(' — '), confidence: 'HIGH' as const }] : []),
      ...(value.mode === 'ARTIST' && value.themes.length ? [{ field: 'User-supplied themes', value: value.themes.join(', '), confidence: 'HIGH' as const }] : []),
    ];
    await db.insert(memoryEntries).values(initialMemory.map((item) => ({
      id: crypto.randomUUID(), projectId: id, ...item, evidenceJson: '["project-intake"]', updatedAt: now,
    })));
    if (value.competitors.length) {
      await db.insert(competitors).values(value.competitors.map((name) => ({
        id: crypto.randomUUID(), projectId: id, name, evidenceJson: '["project-intake"]',
      })));
    }
    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Project storage is unavailable.', detail: error instanceof Error ? error.message : 'Unknown error' }, { status: 503 });
  }
}
