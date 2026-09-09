import { env } from 'cloudflare:workers';
import { NextResponse } from 'next/server';
import { researchHealth } from '@/src/integrations/research';

export async function GET() {
  const environment = env as unknown as { AGENT_REACH_BASE_URL?: string };
  return NextResponse.json({ providers: await researchHealth(environment) });
}
