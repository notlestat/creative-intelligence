import { createAgentReachProvider } from './agent-reach';
import { manualResearchProvider } from './manual';
import { webResearchProvider } from './web';

export function researchProviders(environment: { AGENT_REACH_BASE_URL?: string }) {
  return [createAgentReachProvider(environment.AGENT_REACH_BASE_URL), webResearchProvider, manualResearchProvider];
}

export async function researchHealth(environment: { AGENT_REACH_BASE_URL?: string }) {
  return Promise.all(researchProviders(environment).map((provider) => provider.health()));
}
