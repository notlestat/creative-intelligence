import { env } from 'cloudflare:workers';
import { and, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getDb } from '@/db';
import { canvases } from '@/db/schema';

const canvasSchema = z.object({
  name: z.string().min(2).max(120),
  kind: z.enum(['CREATIVE_BOARD', 'MOODBOARD', 'STORYBOARD', 'HANDOFF']),
  scene: z.string().min(20).max(5_000_000),
});

export async function POST(request: Request, context: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await context.params;
  const parsed = canvasSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  const now = new Date().toISOString();
  const [existing] = await getDb().select().from(canvases).where(and(eq(canvases.projectId, projectId), eq(canvases.kind, parsed.data.kind))).limit(1);
  const id = existing?.id ?? crypto.randomUUID();
  const sceneFileKey = `projects/${projectId}/canvases/${id}.excalidraw`;
  await env.FILES.put(sceneFileKey, parsed.data.scene, { httpMetadata: { contentType: 'application/json' } });
  if (existing) await getDb().update(canvases).set({ name: parsed.data.name, sceneFileKey, updatedAt: now }).where(eq(canvases.id, id));
  else await getDb().insert(canvases).values({ id, projectId, name: parsed.data.name, kind: parsed.data.kind, sceneFileKey, updatedAt: now });
  return NextResponse.json({ id, stored: true }, { status: existing ? 200 : 201 });
}
