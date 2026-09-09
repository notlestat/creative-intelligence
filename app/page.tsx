import Link from 'next/link';
import { listProjects } from '@/lib/data';

export default async function Home() {
  const projects = await listProjects();
  return (
    <main className="axis-shell">
      <aside className="axis-rail">
        <div className="axis-mark" aria-label="Axis">
          <span>A</span>
          <i aria-hidden="true" />
        </div>
        <nav aria-label="Primary navigation">
          <Link className="rail-link rail-link-active" href="/">
            Projects
          </Link>
          <Link className="rail-link" href="/research">
            Research
          </Link>
          <Link className="rail-link" href="/opportunities">
            Saved
          </Link>
        </nav>
        <div className="rail-foot">
          <span>Internal</span>
          <span>v0.1</span>
        </div>
      </aside>

      <section className="axis-home">
        <header className="home-header">
          <div>
            <p className="kicker">Axis creative intelligence</p>
            <h1>What should we create next?</h1>
          </div>
          <Link className="new-project" href="/projects/new">
            New project
          </Link>
        </header>

        <section className="working-strip" aria-label="Research source availability">
          <span className="live-dot" aria-hidden="true" />
          <strong>Research ready</strong>
          <span>Web and RSS available</span>
          <span>Social sources checked per project</span>
          <Link href="/research">Inspect sources</Link>
        </section>

        <section className="project-section">
          <div className="section-heading">
            <h2>Active projects</h2>
            <span>{projects.length} projects</span>
          </div>
          <div className="project-ledger">
            {projects.map((project, index) => (
              <Link
                className="project-row"
                href={`/projects/${project.id}`}
                key={project.id}
              >
                <span className="project-index">0{index + 1}</span>
                <span className="project-main">
                  <span className="project-meta">
                  {project.mode === 'BRAND' ? 'Brand' : 'Artist'} / {project.stage.replaceAll('_', ' ')}
                  </span>
                  <strong>{project.name}</strong>
                  <span>{project.brief}</span>
                </span>
                <span className="project-proof">
                  <strong>{project.evidenceCount}</strong>
                  sourced findings
                </span>
                <span className="project-open">Open</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="home-lower">
          <article>
            <div className="section-heading">
              <h2>Recent research</h2>
              <Link href="/research">View workspace</Link>
            </div>
            <p className="editorial-note">
              Evidence stays separate from interpretation. Every finding carries its
              source, date, confidence and classification.
            </p>
          </article>
          <article>
            <div className="section-heading">
              <h2>Decision rule</h2>
            </div>
            <p className="editorial-note">
              Axis can recommend. Only the creative director can approve, reject, save
              or edit an opportunity.
            </p>
          </article>
        </section>
      </section>
    </main>
  );
}
