import Link from 'next/link';
import { demoWorkspaces } from '@/lib/fixtures';

export default function SavedOpportunitiesPage() {
  const saved = Object.values(demoWorkspaces).flatMap((workspace) => workspace.opportunities.filter((item) => item.status === 'SAVED').map((item) => ({ ...item, project: workspace.project.name, projectId: workspace.project.id })));
  return <main className="index-page"><header><Link href="/">Axis</Link><span>Saved opportunities</span></header><section className="index-intro"><p className="kicker">Possibilities worth keeping</p><h1>Saved, not approved.</h1><p>A saved opportunity remains available for later work. It does not pass the human selection gate.</p></section><section className="saved-list">{saved.map((item) => <Link href={`/projects/${item.projectId}`} key={item.id}><span>{item.project}</span><h2>{item.title}</h2><p>{item.oneLine}</p></Link>)}</section></main>;
}
