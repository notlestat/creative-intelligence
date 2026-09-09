import { env } from 'cloudflare:workers';
import { desc, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { getDb } from '@/db';
import { findings, sources } from '@/db/schema';
import { webResearchProvider } from '@/src/integrations/research/web';

export async function GET(_: Request, context: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await context.params;
  const rows = await getDb().select().from(sources).where(eq(sources.projectId, projectId)).orderBy(desc(sources.capturedAt));
  return NextResponse.json({ sources: rows });
}

export async function POST(request: Request, context: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await context.params;
  const form = await request.formData();
  const upload = form.get('file');
  const asText = (value: FormDataEntryValue | null) => typeof value === 'string' ? value.trim() : '';
  const url = asText(form.get('url'));
  const note = asText(form.get('note'));
  const title = asText(form.get('title'));
  if (!title) return NextResponse.json({ error: 'A source title is required.' }, { status: 400 });

  const id = crypto.randomUUID();
  let kind: 'URL' | 'NOTE' | 'IMAGE' | 'PDF' | 'REFERENCE' = url ? 'URL' : 'NOTE';
  let fileKey: string | null = null;
  if (upload instanceof File && upload.size > 0) {
    if (upload.size > 20 * 1024 * 1024) return NextResponse.json({ error: 'Files must be 20 MB or smaller in v0.1.' }, { status: 413 });
    kind = upload.type === 'application/pdf' ? 'PDF' : upload.type.startsWith('image/') ? 'IMAGE' : 'REFERENCE';
    fileKey = `projects/${projectId}/sources/${id}/${upload.name.replaceAll(/[^a-zA-Z0-9._-]/g, '-')}`;
    await env.FILES.put(fileKey, await upload.arrayBuffer(), { httpMetadata: { contentType: upload.type || 'application/octet-stream' } });
  }
  const db = getDb();
  await db.insert(sources).values({
    id, projectId, kind, title, sourceUrl: url || null, fileKey, content: note || null,
    status: 'NEEDS_REVIEW', capturedAt: new Date().toISOString(),
  });
  let capturedFindings = 0;
  let researchWarning: string | undefined;
  if (url) {
    try {
      const result = await webResearchProvider.research({ query: title, projectName: projectId, sourceUrl: url });
      if (result.length) {
        await db.insert(findings).values(result.map((item) => ({
          id: crypto.randomUUID(), projectId, sourceId: id, category: item.category,
          classification: item.classification, finding: item.finding, sourceLabel: item.sourceLabel,
          sourceUrl: item.sourceUrl || null, observedAt: item.observedAt, confidence: item.confidence,
          relevance: item.relevance,
        })));
        capturedFindings = result.length;
      }
    } catch (error) {
      researchWarning = error instanceof Error ? error.message : 'The URL was saved but could not be captured.';
    }
  }
  return NextResponse.json({ id, kind, status: 'NEEDS_REVIEW', capturedFindings, researchWarning }, { status: 201 });
}
