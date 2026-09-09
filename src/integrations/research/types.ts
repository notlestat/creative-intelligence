import type { Finding } from '@/lib/schemas';

export type ResearchCapability = 'web' | 'reddit' | 'x' | 'youtube' | 'instagram' | 'rss' | 'manual';

export type ProviderHealth = {
  id: string;
  label: string;
  available: boolean;
  capabilities: ResearchCapability[];
  reason?: string;
};

export type ResearchRequest = {
  query: string;
  projectName: string;
  sourceUrl?: string;
};

export interface ResearchProvider {
  id: string;
  health(): Promise<ProviderHealth>;
  research(request: ResearchRequest): Promise<Finding[]>;
}
