'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreativeCanvas } from '@/components/axis/creative-canvas';

type Workspace = ReturnType<typeof import('@/lib/fixtures').getDemoWorkspace> & {
  sources?: Array<{ id: string; title: string; kind: string; status: string; sourceUrl: string | null; capturedAt: string }>;
  handoffs?: Array<{ id: string; recipient: string; status: string; content: Record<string, unknown> }>;
};

const navigation = ['overview', 'inbox', 'memory', 'research', 'competitors', 'signals', 'opportunities', 'develop', 'canvas', 'handoff', 'feedback'];

export function ProjectWorkspace({ workspace }: { workspace: Workspace }) {
  const { project } = workspace;
  const router = useRouter();
  const [decisionById, setDecisionById] = useState<Record<string, string>>(() =>
    Object.fromEntries(workspace.opportunities.map((opportunity) => [opportunity.id, opportunity.status])),
  );
  const [notice, setNotice] = useState(project.isDemo ? 'Demo evidence is fictional and never client-ready.' : 'Only sourced material is treated as evidence. Human approval remains authoritative.');
  const selected = useMemo(
    () => workspace.opportunities.filter((opportunity) => decisionById[opportunity.id] === 'APPROVED'),
    [decisionById, workspace.opportunities],
  );

  async function decide(id: string, decision: 'APPROVED' | 'REJECTED' | 'SAVED') {
    if (!project.isDemo) {
      const response = await fetch(`/api/projects/${project.id}/decisions`, {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ entityType: 'opportunity', entityId: id, decision: decision === 'APPROVED' ? 'APPROVE' : decision === 'REJECTED' ? 'REJECT' : 'SAVE' }),
      });
      if (!response.ok) {
        const result = await response.json() as { error?: string };
        setNotice(result.error || 'The decision could not be stored.');
        return;
      }
    }
    setDecisionById((current) => ({ ...current, [id]: decision }));
    setNotice(project.isDemo ? `${decision.toLowerCase()} for this demo session. Real projects store the decision in Axis Taste Memory.` : `${decision.toLowerCase()} and stored in Axis Taste Memory.`);
    router.refresh();
  }

  return (
    <main className="workspace-shell">
      <aside className="workspace-rail">
        <Link className="axis-mark compact" href="/" aria-label="Axis home"><span>A</span><i aria-hidden="true" /></Link>
        <div className="workspace-project-label"><span>{project.mode}</span><strong>{project.name}</strong></div>
        <Link className="back-link" href="/">All projects</Link>
      </aside>

      <Tabs className="workspace-main" defaultValue="overview">
        <header className="workspace-header">
          <div>
            <p>{project.mode === 'BRAND' ? 'Brand project' : 'Artist project'} / {project.stage.replaceAll('_', ' ')}</p>
            <h1>{project.name}</h1>
          </div>
          <div className="evidence-seal"><strong>{workspace.findings.length}</strong><span>visible findings</span></div>
        </header>
        <TabsList className="workspace-tabs" aria-label="Project workspace sections">
          {navigation.map((item) => <TabsTrigger key={item} value={item}>{item}</TabsTrigger>)}
        </TabsList>
        <p className="workspace-notice" aria-live="polite">{notice}</p>

        <TabsContent value="overview">
          <div className="overview-grid">
            <section className="workspace-lead">
              <p className="kicker">Working question</p>
              <h2>{project.objective}</h2>
              <p>{project.brief}</p>
            </section>
            <section className="workflow-path" aria-label="Axis project stages">
              {['Understanding', 'Research', 'Signals', 'Opportunities', 'Human selection', 'Creative development', 'Visual direction', 'Handoff'].map((stage, index) => (
                <div className={index < 4 ? 'complete' : ''} key={stage}><span>{index + 1}</span><strong>{stage}</strong></div>
              ))}
            </section>
          </div>
        </TabsContent>

        <TabsContent value="inbox">
          <section className="drop-surface">
            <div><span>Drop project material</span><h2>URLs, images, notes, PDFs, quotes and references</h2><p>Every item becomes a reusable source. Nothing becomes a fact until the evidence supports it.</p></div>
            <Link href={`/projects/${project.id}/inbox/new`}>Add source</Link>
          </section>
          {workspace.sources?.length ? <section className="source-ledger">
            {workspace.sources.map((source) => <article key={source.id}><span>{source.kind}</span><div><h2>{source.title}</h2><p>{source.sourceUrl || 'Stored project material'}</p></div><strong>{source.status.replaceAll('_', ' ')}</strong></article>)}
          </section> : null}
        </TabsContent>

        <TabsContent value="memory">
          <section className="memory-ledger">
            {workspace.memory.length ? workspace.memory.map((entry) => (
              <article key={entry.field}><header><h2>{entry.field}</h2><span data-confidence={entry.confidence}>{entry.confidence}</span></header><p>{entry.value}</p><footer>{entry.evidence.length ? `Evidence: ${entry.evidence.join(', ')}` : 'No evidence attached'}</footer></article>
            )) : <Empty title="Memory has not been built yet" action="Add sourced material first." />}
          </section>
        </TabsContent>

        <TabsContent value="research">
          {workspace.findings.length ? <section className="research-board">
            {workspace.findings.map((item) => (
              <article className={`finding finding-${item.classification.toLowerCase()}`} key={item.id}>
                <header><span>{item.classification.replace('_', ' ')}</span><span>{item.category}</span></header>
                <p>{item.finding}</p>
                <footer><strong>{item.sourceLabel}</strong><span>{item.observedAt} / {item.confidence} confidence</span><span>{item.relevance}</span></footer>
              </article>
            ))}
          </section> : <Empty title="No findings captured" action="Add a public URL or attributed note in the project inbox." />}
        </TabsContent>

        <TabsContent value="competitors">
          {workspace.competitors.length ? <section className="competitor-matrix">
            <header><span>Project</span><span>Position</span><span>Visual cluster</span><span>Pattern</span><span>Possible whitespace</span></header>
            {workspace.competitors.map((competitor) => <article key={competitor.name}><strong>{competitor.name}</strong><span>{competitor.position}</span><span>{competitor.visual}</span><span>{competitor.pattern}</span><span>{competitor.difference}<small>{competitor.evidence}</small></span></article>)}
          </section> : <Empty title="No competitors reviewed" action="Add public sources before making comparisons." />}
        </TabsContent>

        <TabsContent value="signals">
          {!workspace.signals.length ? <StageAction projectId={project.id} stage="SIGNALS" disabled={project.isDemo} onNotice={setNotice} /> : null}
          <section className="signal-list">
            {workspace.signals.map((signal) => <article key={signal.id}><div className="signal-strength"><span>{signal.type}</span><strong>{signal.strength}</strong></div><div><h2>{signal.title}</h2><p>{signal.description}</p><dl><dt>Implication</dt><dd>{signal.implication}</dd><dt>Counter-evidence</dt><dd>{signal.counterEvidence}</dd><dt>Evidence</dt><dd>{signal.evidence.join(', ')}</dd></dl></div></article>)}
          </section>
        </TabsContent>

        <TabsContent value="opportunities">
          {!workspace.opportunities.length ? <StageAction projectId={project.id} stage="OPPORTUNITIES" disabled={project.isDemo} onNotice={setNotice} /> : null}
          <section className="opportunity-stack">
            {workspace.opportunities.map((opportunity, index) => (
              <article className="opportunity" key={opportunity.id}>
                <header><span>0{index + 1}</span><div><p>{opportunity.recommendation ? 'Recommended' : 'Opportunity'}</p><h2>{opportunity.title}</h2><strong>{opportunity.oneLine}</strong></div><div className="opportunity-state">{decisionById[opportunity.id]}</div></header>
                <div className="opportunity-body"><dl><dt>What we observed</dt><dd>{opportunity.observed}</dd><dt>Why it matters</dt><dd>{opportunity.whyItMatters}</dd><dt>Tension</dt><dd>{opportunity.tension}</dd><dt>Creative possibility</dt><dd>{opportunity.creativePossibility}</dd><dt>Counter-evidence</dt><dd>{opportunity.counterEvidence}</dd><dt>Risk</dt><dd>{opportunity.risk}</dd></dl><div className="score-grid">{[['Originality', opportunity.originality], ['Brand fit', opportunity.brandFit], ['Evidence', opportunity.evidenceStrength], ['Feasibility', opportunity.feasibility]].map(([label, score]) => <span key={label}><strong>{score}/10</strong>{label}</span>)}</div></div>
                <footer><div><button type="button" onClick={() => decide(opportunity.id, 'APPROVED')}>Approve</button><button type="button" onClick={() => decide(opportunity.id, 'REJECTED')}>Reject</button><button type="button" onClick={() => decide(opportunity.id, 'SAVED')}>Save</button><button type="button" onClick={() => setNotice(opportunity.whyThisProject)}>Why?</button></div><span>{opportunity.confidence} confidence / Evidence: {opportunity.evidence.join(', ')}</span></footer>
              </article>
            ))}
          </section>
        </TabsContent>

        <TabsContent value="develop">
          {!('bigIdea' in workspace.development) && selected.length ? <StageAction projectId={project.id} stage="DEVELOPMENT" disabled={project.isDemo} onNotice={setNotice} /> : null}
          {selected.length || project.id === 'demo-fashion' ? <section className="development-grid">
            <article className="big-idea"><span>Big idea</span><h2>{String('bigIdea' in workspace.development ? workspace.development.bigIdea : 'Select an opportunity first')}</h2><p>{String('narrative' in workspace.development ? workspace.development.narrative : '')}</p></article>
            {'insight' in workspace.development && Object.entries(workspace.development).filter(([key]) => !['bigIdea', 'narrative'].includes(key)).map(([key, value]) => <article key={key}><h3>{key.replace(/([A-Z])/g, ' $1')}</h3>{Array.isArray(value) ? <ul>{value.map((item) => <li key={item}>{item}</li>)}</ul> : <p>{value}</p>}</article>)}
          </section> : <Empty title="Human selection comes first" action="Approve one to three opportunities before creative development." />}
        </TabsContent>

        <TabsContent value="canvas">
          {'thesis' in workspace.artDirection && !workspace.storyboard.length ? <StageAction projectId={project.id} stage="STORYBOARD" disabled={project.isDemo} onNotice={setNotice} /> : null}
          {workspace.storyboard.length ? <section className="storyboard-strip">{workspace.storyboard.map((frame, index) => <article key={`${frame.time}-${index}`}><span>{frame.time}</span><strong>{frame.frame}</strong><p>{frame.camera} / {frame.action}</p><small>{frame.purpose}</small></article>)}</section> : null}
          <CreativeCanvas projectId={project.id} />
        </TabsContent>

        <TabsContent value="handoff">
          {'bigIdea' in workspace.development && !('thesis' in workspace.artDirection) ? <StageAction projectId={project.id} stage="ART_DIRECTION" disabled={project.isDemo} onNotice={setNotice} /> : null}
          {'thesis' in workspace.artDirection ? <HandoffAction projectId={project.id} disabled={project.isDemo} onNotice={setNotice} /> : null}
          {'thesis' in workspace.artDirection ? <section className="handoff-sheet"><header><span>Photographer handoff</span><button onClick={() => window.print()} type="button">Print / PDF</button></header><h2>{String('bigIdea' in workspace.development ? workspace.development.bigIdea : 'Approved direction')}</h2><div className="handoff-columns"><div><h3>Emotional target</h3><p>{workspace.artDirection.emotion}</p><h3>Lighting</h3><p>{workspace.artDirection.lighting}</p><h3>Composition</h3><p>{workspace.artDirection.composition}</p></div><div><h3>Location</h3><p>{workspace.artDirection.location}</p><h3>Casting and styling</h3><p>{workspace.artDirection.people} {workspace.artDirection.styling}</p><h3>Do</h3><ul>{workspace.artDirection.do.map((item) => <li key={item}>{item}</li>)}</ul><h3>Don&apos;t</h3><ul>{workspace.artDirection.dont.map((item) => <li key={item}>{item}</li>)}</ul></div></div></section> : <Empty title="No approved direction to hand off" action="Develop and review an opportunity first." />}
          {workspace.handoffs?.map((handoff) => <section className="saved-handoff" key={handoff.id}><header><span>{handoff.recipient}</span><strong>{handoff.status.replaceAll('_', ' ')}</strong></header><h2>{typeof handoff.content.title === 'string' ? handoff.content.title : 'Saved handoff'}</h2><p>{typeof handoff.content.summary === 'string' ? handoff.content.summary : ''}</p></section>)}
        </TabsContent>

        <TabsContent value="feedback">
          <section className="feedback-list">{workspace.feedback.length ? workspace.feedback.map((item) => <article key={item.label}><span>{item.decision}</span><div><h2>{item.label}</h2><p>{item.note}</p></div></article>) : <Empty title="No taste feedback yet" action="Save what feels right and name what feels wrong." />}</section>
        </TabsContent>
      </Tabs>
    </main>
  );
}

function Empty({ title, action }: { title: string; action: string }) {
  return <section className="empty-state"><h2>{title}</h2><p>{action}</p></section>;
}

function StageAction({ projectId, stage, disabled, onNotice }: {
  projectId: string;
  stage: 'SIGNALS' | 'OPPORTUNITIES' | 'DEVELOPMENT' | 'ART_DIRECTION' | 'STORYBOARD';
  disabled: boolean;
  onNotice: (value: string) => void;
}) {
  const router = useRouter();
  const [working, setWorking] = useState(false);
  async function run() {
    setWorking(true);
    onNotice(`Building ${stage.toLowerCase().replaceAll('_', ' ')} from stored evidence…`);
    const response = await fetch(`/api/projects/${projectId}/generate`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ stage }) });
    const result = await response.json() as { error?: string; stored?: number };
    setWorking(false);
    if (!response.ok) return onNotice(result.error || 'The stage could not be generated.');
    onNotice(`${stage.replaceAll('_', ' ')} stored. ${result.stored ?? 0} structured item(s) added for review.`);
    router.refresh();
  }
  return <section className="stage-action"><div><span>Next controlled step</span><h2>Build {stage.toLowerCase().replaceAll('_', ' ')}</h2><p>Axis uses stored evidence and validates the structure. Existing work is never silently overwritten.</p></div><button type="button" disabled={disabled || working} onClick={run}>{working ? 'Working…' : 'Build stage'}</button></section>;
}

function HandoffAction({ projectId, disabled, onNotice }: { projectId: string; disabled: boolean; onNotice: (value: string) => void }) {
  const router = useRouter();
  const [recipient, setRecipient] = useState('PHOTOGRAPHER');
  const [working, setWorking] = useState(false);
  async function run() {
    setWorking(true);
    const response = await fetch(`/api/projects/${projectId}/handoffs`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ recipient }) });
    const result = await response.json() as { error?: string };
    setWorking(false);
    if (!response.ok) return onNotice(result.error || 'The handoff could not be created.');
    onNotice(`${recipient.toLowerCase()} handoff stored for review.`);
    router.refresh();
  }
  return <section className="handoff-action"><label>Recipient<select value={recipient} onChange={(event) => setRecipient(event.target.value)}>{['PHOTOGRAPHER', 'DIRECTOR', 'DESIGNER', 'EDITOR', 'STYLIST', 'PRODUCER', 'CLIENT'].map((item) => <option key={item}>{item}</option>)}</select></label><button type="button" disabled={disabled || working} onClick={run}>{working ? 'Building…' : 'Create recipient handoff'}</button></section>;
}
