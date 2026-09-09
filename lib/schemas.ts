import { z } from 'zod';

export const confidenceSchema = z.enum(['LOW', 'MEDIUM', 'HIGH']);
export const classificationSchema = z.enum(['FACT', 'OBSERVATION', 'INFERENCE', 'SIGNAL', 'CREATIVE_PROPOSAL']);

export const projectSchema = z.object({
  mode: z.enum(['BRAND', 'ARTIST']), name: z.string().trim().min(2).max(120),
  website: z.url().optional().or(z.literal('')), brief: z.string().trim().min(10).max(5000),
  objective: z.string().trim().min(3).max(1000), audience: z.string().trim().max(2000).optional(),
  references: z.array(z.string().trim()).default([]), competitors: z.array(z.string().trim()).default([]),
  notes: z.string().trim().max(5000).optional(), releaseType: z.string().trim().max(100).optional(),
  releaseName: z.string().trim().max(200).optional(), themes: z.array(z.string().trim()).default([]),
  releaseDate: z.string().optional(), userLyrics: z.string().max(20000).optional(), collaborators: z.array(z.string().trim()).default([]),
}).superRefine((project, ctx) => {
  if (project.mode === 'BRAND' && project.userLyrics) ctx.addIssue({ code: 'custom', path: ['userLyrics'], message: 'Lyrics are only accepted for artist projects.' });
});

export const findingSchema = z.object({
  category: z.enum(['BRAND', 'AUDIENCE', 'CULTURE', 'COMPETITORS', 'CATEGORY', 'VISUAL', 'CONTENT', 'PRODUCT', 'COMMUNITY']),
  classification: classificationSchema, finding: z.string().min(3), sourceLabel: z.string().min(2),
  sourceUrl: z.url().optional(), observedAt: z.iso.datetime(), confidence: confidenceSchema, relevance: z.string().min(3),
});

export const signalSchema = z.object({
  type: z.enum(['AUDIENCE', 'CULTURE', 'VISUAL', 'COMPETITOR', 'PRODUCT', 'NARRATIVE', 'BEHAVIOURAL', 'COMMUNITY', 'PERFORMANCE']),
  title: z.string().min(3), description: z.string().min(10), evidence: z.array(z.string().min(1)).min(1),
  strength: z.enum(['WEAK', 'EMERGING', 'MODERATE', 'STRONG']), confidence: confidenceSchema,
  freshness: z.string().min(3), creativeRelevance: z.string().min(3), implication: z.string().min(3), counterEvidence: z.string().optional(),
});

export const opportunitySchema = z.object({
  title: z.string().min(3), oneLine: z.string().min(5), observed: z.string().min(5), whyItMatters: z.string().min(5),
  audience: z.string().min(2), tension: z.string().min(5), evidence: z.array(z.string().min(1)).min(1),
  counterEvidence: z.string().optional(), whyThisProject: z.string().min(5), whyNow: z.string().min(5),
  creativePossibility: z.string().min(5), risk: z.string().min(3), originality: z.number().int().min(1).max(10),
  brandFit: z.number().int().min(1).max(10), evidenceStrength: z.number().int().min(1).max(10), feasibility: z.number().int().min(1).max(10),
  confidence: confidenceSchema, recommendation: z.boolean().default(false),
});

export const creativeDevelopmentSchema = z.object({
  insight: z.string().min(5), problem: z.string().min(5), tension: z.string().min(5),
  proposition: z.string().min(3), bigIdea: z.string().min(3), narrative: z.string().min(10),
  line: z.string().min(2), message: z.string().min(5), emotionalTarget: z.string().min(3),
  principles: z.array(z.string().min(3)).min(2), hero: z.string().min(5),
  supporting: z.array(z.string().min(3)).min(1), social: z.array(z.string().min(3)).default([]),
  film: z.array(z.string().min(3)).default([]), photography: z.array(z.string().min(3)).default([]),
  physical: z.array(z.string().min(3)).default([]), collaborations: z.array(z.string().min(3)).default([]),
  risks: z.array(z.string().min(3)).min(1),
});

export const artDirectionSchema = z.object({
  thesis: z.string().min(10), emotion: z.string().min(3), colour: z.string().min(3),
  contrast: z.string().min(3), texture: z.string().min(3), material: z.string().min(3),
  lighting: z.string().min(5), composition: z.string().min(5), camera: z.string().min(3),
  lens: z.string().min(3), people: z.string().min(3), casting: z.string().min(3),
  styling: z.string().min(3), location: z.string().min(3), productionDesign: z.string().min(3),
  typography: z.string().min(3), graphicSystem: z.string().min(3), motion: z.string().min(3),
  editingRhythm: z.string().min(3), do: z.array(z.string().min(3)).min(2),
  dont: z.array(z.string().min(3)).min(2),
});

export const storyboardFrameSchema = z.object({
  time: z.string().min(3), frame: z.string().min(5), camera: z.string().min(3), action: z.string().min(3),
  light: z.string().min(3), location: z.string().min(3), transition: z.string().min(3),
  audio: z.string().min(2), copy: z.string(), purpose: z.string().min(3),
});

export const storyboardSchema = z.object({
  title: z.string().min(3), frames: z.array(storyboardFrameSchema).min(3).max(16),
});

export const handoffSchema = z.object({
  title: z.string().min(3), purpose: z.string().min(5), summary: z.string().min(10),
  nonNegotiables: z.array(z.string().min(3)).min(2), deliverables: z.array(z.string().min(3)).min(1),
  technicalNotes: z.array(z.string().min(3)).default([]), openQuestions: z.array(z.string().min(3)).default([]),
  evidenceNotes: z.array(z.string().min(3)).min(1),
});

export type ProjectInput = z.infer<typeof projectSchema>;
export type Finding = z.infer<typeof findingSchema>;
export type Signal = z.infer<typeof signalSchema>;
export type Opportunity = z.infer<typeof opportunitySchema>;
export type CreativeDevelopment = z.infer<typeof creativeDevelopmentSchema>;
export type ArtDirection = z.infer<typeof artDirectionSchema>;
export type Storyboard = z.infer<typeof storyboardSchema>;
export type Handoff = z.infer<typeof handoffSchema>;
