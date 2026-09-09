import Link from 'next/link';
import { SourceForm } from '@/components/axis/source-form';

export default async function NewSourcePage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  return <main className="new-project-page"><header><Link href={`/projects/${projectId}`}>Back to project</Link><span>Project inbox</span></header><section><p className="kicker">New source</p><h1>Add material without changing what it means.</h1><p>Axis stores the source first. A person or a validated research step decides whether it supports a fact, observation, inference, signal or creative proposal.</p></section><SourceForm projectId={projectId} /></main>;
}
