import Link from 'next/link';
import { NewProjectForm } from '@/components/axis/new-project-form';

export default function NewProjectPage() {
  return <main className="new-project-page"><header><Link href="/">Axis / Projects</Link><span>New project</span></header><section><p className="kicker">Start with the decision</p><h1>What should this project create next?</h1><p>Give Axis the material you already have. Research, signals and creative proposals stay visibly separate.</p></section><NewProjectForm /></main>;
}
