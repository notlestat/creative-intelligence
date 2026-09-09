import type { ResearchProvider } from './types';

export const manualResearchProvider: ResearchProvider = {
  id: 'manual',
  async health() {
    return { id: 'manual', label: 'Manual sources', available: true, capabilities: ['manual'] };
  },
  async research() {
    return [];
  },
};
