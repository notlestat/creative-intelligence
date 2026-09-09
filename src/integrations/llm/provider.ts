import type { ZodType } from 'zod';

export type StructuredGeneration<T> = {
  schema: ZodType<T>;
  system: string;
  prompt: string;
  temperature?: number;
};

export interface LlmProvider {
  id: string;
  generate<T>(request: StructuredGeneration<T>): Promise<T>;
}

type OpenAICompatibleConfig = { apiKey: string; baseUrl?: string; model: string };

export class OpenAICompatibleProvider implements LlmProvider {
  readonly id = 'openai-compatible';
  constructor(private readonly config: OpenAICompatibleConfig) {}

  async generate<T>(request: StructuredGeneration<T>) {
    const base = this.config.baseUrl?.replace(/\/$/, '') || 'https://api.openai.com/v1';
    const response = await fetch(`${base}/chat/completions`, {
      method: 'POST',
      headers: { authorization: `Bearer ${this.config.apiKey}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        model: this.config.model, temperature: request.temperature ?? 0.2,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: `${request.system}\nReturn JSON only. Preserve unknowns. Never invent evidence, quotes or metrics.` },
          { role: 'user', content: request.prompt },
        ],
      }),
    });
    if (!response.ok) throw new Error(`LLM provider returned ${response.status}.`);
    const payload = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
    const content = payload.choices?.[0]?.message?.content;
    if (!content) throw new Error('LLM provider returned no structured content.');
    return request.schema.parse(JSON.parse(content));
  }
}
