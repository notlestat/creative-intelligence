import type { ResearchProvider } from './types';

export function createAgentReachProvider(baseUrl?: string): ResearchProvider {
  return {
    id: 'agentReach',
    async health() {
      if (!baseUrl) return {
        id: 'agentReach', label: 'Agent Reach', available: false,
        capabilities: ['web', 'reddit', 'x', 'youtube', 'instagram', 'rss'],
        reason: 'The safe local CLI is installed, but this hosted runtime has no Agent Reach bridge URL.',
      };
      try {
        const response = await fetch(new URL('/health', baseUrl));
        if (!response.ok) throw new Error(`Health check returned ${response.status}`);
        return { id: 'agentReach', label: 'Agent Reach', available: true, capabilities: ['web', 'reddit', 'x', 'youtube', 'instagram', 'rss'] };
      } catch (error) {
        return { id: 'agentReach', label: 'Agent Reach', available: false, capabilities: [], reason: error instanceof Error ? error.message : 'Health check failed' };
      }
    },
    async research(request) {
      if (!baseUrl) throw new Error('Agent Reach bridge is not configured.');
      const response = await fetch(new URL('/research', baseUrl), {
        method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(request),
      });
      if (!response.ok) throw new Error(`Agent Reach returned ${response.status}.`);
      const payload = await response.json() as { findings?: unknown[] };
      return payload.findings as Awaited<ReturnType<ResearchProvider['research']>>;
    },
  };
}
