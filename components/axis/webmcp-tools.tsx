'use client';

import { useEffect } from 'react';

type WebMcpTool = {
  name: string;
  title: string;
  description: string;
  inputSchema: Record<string, unknown>;
  annotations: { readOnlyHint: boolean; untrustedContentHint: boolean };
  execute(input: unknown): Promise<unknown>;
};

type ModelContext = { registerTool(tool: WebMcpTool, options?: { signal?: AbortSignal }): void | Promise<void> };

export function WebMcpTools() {
  useEffect(() => {
    const context = (document as Document & { modelContext?: ModelContext }).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    const createProject: WebMcpTool = {
      name: 'create_axis_project', title: 'Create Axis project',
      description: 'Create a brand or artist project in Axis and return its project URL.',
      inputSchema: {
        type: 'object', additionalProperties: false, required: ['mode', 'name', 'brief', 'objective'],
        properties: {
          mode: { type: 'string', enum: ['BRAND', 'ARTIST'] }, name: { type: 'string', minLength: 2 },
          brief: { type: 'string', minLength: 10 }, objective: { type: 'string', minLength: 3 },
          website: { type: 'string' }, audience: { type: 'string' },
        },
      },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      async execute(input) {
        const value = input as Record<string, unknown>;
        const response = await fetch('/api/projects', {
          method: 'POST', headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ ...value, references: [], competitors: [], themes: [], collaborators: [] }),
        });
        const result = await response.json() as { id?: string; error?: string };
        if (!response.ok || !result.id) throw new Error(result.error ?? 'Project creation failed.');
        return { id: result.id, url: `/projects/${result.id}` };
      },
    };
    const recordDecision: WebMcpTool = {
      name: 'record_axis_decision', title: 'Record Axis decision',
      description: 'Record an approve, reject, save, edit or comment decision for a project item.',
      inputSchema: {
        type: 'object', additionalProperties: false, required: ['projectId', 'entityType', 'entityId', 'decision'],
        properties: {
          projectId: { type: 'string' }, entityType: { type: 'string' }, entityId: { type: 'string' },
          decision: { type: 'string', enum: ['APPROVE', 'REJECT', 'SAVE', 'EDIT', 'COMMENT'] }, note: { type: 'string' },
        },
      },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      async execute(input) {
        const value = input as Record<string, unknown>;
        const projectId = typeof value.projectId === 'string' ? value.projectId : '';
        if (!projectId) throw new Error('projectId is required.');
        const response = await fetch(`/api/projects/${projectId}/decisions`, {
          method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(value),
        });
        if (!response.ok) throw new Error('Decision could not be stored.');
        return { stored: true, projectId, entityId: value.entityId, decision: value.decision };
      },
    };
    for (const tool of [createProject, recordDecision]) {
      try { void Promise.resolve(context.registerTool(tool, { signal: lifecycle.signal })).catch(() => undefined); } catch { /* Unsupported implementations must not break the app. */ }
    }
    return () => lifecycle.abort();
  }, []);
  return null;
}
