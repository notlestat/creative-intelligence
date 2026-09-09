import { NextResponse } from 'next/server';
import { getDb } from '@/db';
import { feedback, opportunities } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const decisionSchema = z.object({
  entityType: z.string().min(2), entityId: z.string().min(1),
  decision: z.enum(['APPROVE', 'REJECT', 'SAVE', 'EDIT', 'COMMENT']), note: z.string().max(2000).optional(),
});

export async function POST(request: Request, context: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await context.params;
  const parsed = decisionSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  const item = parsed.data;
  await getDb().insert(feedback).values({ id: crypto.randomUUID(), projectId, ...item, createdAt: new Date().toISOString() });
  if (item.entityType === 'opportunity' && item.decision !== 'COMMENT' && item.decision !== 'EDIT') {
    const status = item.decision === 'APPROVE' ? 'APPROVED' : item.decision === 'REJECT' ? 'REJECTED' : 'SAVED';
    await getDb().update(opportunities).set({ status }).where(eq(opportunities.id, item.entityId));
  }
  return NextResponse.json({ stored: true }, { status: 201 });
}
