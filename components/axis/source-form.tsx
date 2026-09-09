'use client';

import { useState, type SubmitEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export function SourceForm({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [message, setMessage] = useState('');
  async function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('Saving source');
    const response = await fetch(`/api/projects/${projectId}/sources`, { method: 'POST', body: new FormData(event.currentTarget) });
    const result = await response.json() as { error?: string };
    if (!response.ok) return setMessage(result.error ?? 'The source could not be saved.');
    router.push(`/projects/${projectId}`);
  }
  return <form className="source-form" onSubmit={submit}>
    <Label>Source title<Input name="title" required /></Label>
    <Label>Public URL<Input name="url" type="url" placeholder="https://" /></Label>
    <Label>Image, screenshot or PDF<input className="file-input" name="file" type="file" accept="image/*,application/pdf,text/plain" /></Label>
    <Label>Note or quote<Textarea name="note" rows={8} /></Label>
    <p>Only upload material you are allowed to use. Quotes remain attributed to this source.</p>
    <button type="submit">Add to inbox</button>
    <output aria-live="polite">{message}</output>
  </form>;
}
