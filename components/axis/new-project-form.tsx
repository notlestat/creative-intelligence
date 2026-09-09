'use client';

import { useState, type SubmitEvent } from 'react';
import { useRouter } from 'next/navigation';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export function NewProjectForm() {
  const router = useRouter();
  const [mode, setMode] = useState<'BRAND' | 'ARTIST'>('BRAND');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError('');
    const data = new FormData(event.currentTarget);
    const split = (value: FormDataEntryValue | null) => (typeof value === 'string' ? value : '').split('\n').map((item) => item.trim()).filter(Boolean);
    const response = await fetch('/api/projects', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        mode, name: data.get('name'), website: data.get('website'), brief: data.get('brief'), objective: data.get('objective'),
        audience: data.get('audience'), references: split(data.get('references')), competitors: split(data.get('competitors')),
        notes: data.get('notes'), releaseType: mode === 'ARTIST' ? data.get('releaseType') : undefined,
        releaseName: mode === 'ARTIST' ? data.get('releaseName') : undefined,
        themes: mode === 'ARTIST' ? split(data.get('themes')) : [], releaseDate: mode === 'ARTIST' ? data.get('releaseDate') : undefined,
        userLyrics: mode === 'ARTIST' ? data.get('userLyrics') : undefined,
        collaborators: mode === 'ARTIST' ? split(data.get('collaborators')) : [],
      }),
    });
    const result = await response.json() as { id?: string; error?: string };
    if (!response.ok || !result.id) {
      setError(result.error ?? 'The project could not be saved. Check the required fields.');
      setSaving(false);
      return;
    }
    router.push(`/projects/${result.id}`);
  }

  return (
    <form className="project-form" onSubmit={submit}>
      <fieldset>
        <legend>Project mode</legend>
        <RadioGroup className="mode-picker" onValueChange={(value) => setMode(value as 'BRAND' | 'ARTIST')} value={mode}>
          <Label><RadioGroupItem value="BRAND" />Brand<span>Fashion, lifestyle, beauty, product or ecommerce.</span></Label>
          <Label><RadioGroupItem value="ARTIST" />Artist<span>Musician, producer, single, EP, album or label project.</span></Label>
        </RadioGroup>
      </fieldset>
      <div className="form-grid">
        <Field label="Name" required><Input name="name" required /></Field>
        <Field label="Website"><Input name="website" type="url" placeholder="https://" /></Field>
        <Field className="full" label="Brief" required><Textarea name="brief" required rows={4} /></Field>
        <Field className="full" label="What decision should Axis help you make?" required><Textarea name="objective" required rows={3} /></Field>
        <Field className="full" label="Audience, if known"><Textarea name="audience" rows={3} /></Field>
        <Field label="References" hint="One URL or note per line"><Textarea name="references" rows={5} /></Field>
        <Field label="Competitors" hint="One per line"><Textarea name="competitors" rows={5} /></Field>
        {mode === 'ARTIST' && <>
          <Field label="Release type"><Input name="releaseType" placeholder="Single, EP or album" /></Field>
          <Field label="Release name"><Input name="releaseName" /></Field>
          <Field label="Release date"><Input name="releaseDate" type="date" /></Field>
          <Field label="Themes" hint="One per line"><Textarea name="themes" rows={4} /></Field>
          <Field label="Collaborators" hint="One per line"><Textarea name="collaborators" rows={4} /></Field>
          <Field className="full" label="User-supplied lyrics" hint="Axis never fetches copyrighted lyrics. Only paste lyrics you are allowed to analyse."><Textarea name="userLyrics" rows={7} /></Field>
        </>}
        <Field className="full" label="Notes"><Textarea name="notes" rows={4} /></Field>
      </div>
      {error && <p className="form-error" role="alert">{error}</p>}
      <footer><button disabled={saving} type="submit">{saving ? 'Saving project' : 'Create project'}</button><span>Unknown is valid. Empty fields stay unknown.</span></footer>
    </form>
  );
}

function Field({ label, hint, className = '', required, children }: { label: string; hint?: string; className?: string; required?: boolean; children: React.ReactNode }) {
  return <Label className={`form-field ${className}`}><span>{label}{required ? ' *' : ''}</span>{children}{hint && <small>{hint}</small>}</Label>;
}
