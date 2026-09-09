import { describe, expect, it } from 'vitest';
import { researchHealth } from './index';

describe('research provider health', () => {
  it('reports Agent Reach as unavailable when the bridge is absent', async () => {
    const providers = await researchHealth({});
    const agentReach = providers.find((provider) => provider.id === 'agentReach');
    expect(agentReach?.available).toBe(false);
    expect(agentReach?.reason).toContain('bridge');
  });

  it('keeps manual research available', async () => {
    const providers = await researchHealth({});
    expect(providers.find((provider) => provider.id === 'manual')?.available).toBe(true);
  });
});
