import { findingSchema } from '@/lib/schemas';
import type { ResearchProvider } from './types';

export const webResearchProvider: ResearchProvider = {
  id: 'web',
  async health() {
    return { id: 'web', label: 'Web reader', available: true, capabilities: ['web', 'rss'], reason: 'Reads supplied public URLs. Search uses Agent Reach when configured.' };
  },
  async research(request) {
    if (!request.sourceUrl) return [];
    const target = new URL(request.sourceUrl);
    if (!['http:', 'https:'].includes(target.protocol)) throw new Error('Only public HTTP URLs are accepted.');
    const response = await fetch(`https://r.jina.ai/${target.toString()}`, { headers: { accept: 'text/plain' } });
    if (!response.ok) throw new Error(`Web reader returned ${response.status}.`);
    const text = (await response.text()).slice(0, 8000);
    return [findingSchema.parse({
      category: 'BRAND', classification: 'OBSERVATION',
      finding: `Source captured for human or model-assisted review. ${text.slice(0, 360).replaceAll(/\s+/g, ' ').trim()}`,
      sourceLabel: target.hostname, sourceUrl: target.toString(), observedAt: new Date().toISOString(), confidence: 'LOW',
      relevance: 'Raw capture only. Review and reclassify before using it as evidence.',
    })];
  },
};
