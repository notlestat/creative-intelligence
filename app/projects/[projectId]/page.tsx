import { ProjectWorkspace } from '@/components/axis/project-workspace';
import { demoWorkspaces, getDemoWorkspace } from '@/lib/fixtures';
import { getProjectWorkspace } from '@/lib/data';

export default async function ProjectPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  if (projectId in demoWorkspaces) return <ProjectWorkspace workspace={getDemoWorkspace(projectId)} />;
  const workspace = await getProjectWorkspace(projectId);
  if (!workspace) return <ProjectWorkspace workspace={getDemoWorkspace('demo-fashion')} />;
  return <ProjectWorkspace workspace={workspace as unknown as ReturnType<typeof getDemoWorkspace>} />;
}
