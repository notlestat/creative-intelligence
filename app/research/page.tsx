import Link from 'next/link';

const providers = [
  { name: 'Web reader', state: 'Available', scope: 'Public URLs and RSS' },
  { name: 'Agent Reach', state: 'Local only', scope: 'Web, Reddit, X, YouTube, Instagram and RSS when each backend is healthy' },
  { name: 'Manual', state: 'Available', scope: 'Founder-supplied material' },
];

export default function ResearchPage() {
  return <main className="index-page"><header><Link href="/">Axis</Link><span>Research sources</span></header><section className="index-intro"><p className="kicker">Availability is evidence too</p><h1>Use what works. Name what does not.</h1><p>Axis checks source availability per run. A missing platform never gets filled with plausible-sounding research.</p></section><section className="provider-table"><header><span>Provider</span><span>Status</span><span>Scope</span></header>{providers.map((provider) => <article key={provider.name}><strong>{provider.name}</strong><span>{provider.state}</span><p>{provider.scope}</p></article>)}</section></main>;
}
