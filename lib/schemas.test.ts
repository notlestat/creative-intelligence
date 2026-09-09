import { describe, expect, it } from 'vitest';
import { findingSchema, handoffSchema, opportunitySchema, projectSchema, signalSchema, storyboardSchema } from './schemas';

describe('Axis evidence contracts', () => {
  it('keeps brand projects from accepting lyric material', () => {
    const result = projectSchema.safeParse({
      mode: 'BRAND', name: 'Example', brief: 'A sufficiently clear project brief.', objective: 'Choose the next campaign.',
      references: [], competitors: [], themes: [], collaborators: [], userLyrics: 'copyrighted text',
    });
    expect(result.success).toBe(false);
  });

  it('requires a source label for every finding', () => {
    const result = findingSchema.safeParse({
      category: 'PRODUCT', classification: 'FACT', finding: 'The product uses heavyweight cotton.',
      observedAt: new Date().toISOString(), confidence: 'HIGH', relevance: 'Defines the product truth.',
    });
    expect(result.success).toBe(false);
  });

  it('does not allow a signal without evidence', () => {
    const result = signalSchema.safeParse({
      type: 'VISUAL', title: 'A possible pattern', description: 'A pattern appears across several references.',
      evidence: [], strength: 'EMERGING', confidence: 'LOW', freshness: 'Captured today',
      creativeRelevance: 'May shape composition', implication: 'Test it',
    });
    expect(result.success).toBe(false);
  });

  it('does not allow an opportunity without evidence', () => {
    const result = opportunitySchema.safeParse({
      title: 'Long form', oneLine: 'Show the full silhouette.', observed: 'The sample uses cropped silhouettes.',
      whyItMatters: 'The product can look distinct.', audience: 'Design-aware buyers', tension: 'Compressed versus extended',
      evidence: [], whyThisProject: 'The cut supports it.', whyNow: 'Useful for the next brief.',
      creativePossibility: 'Tall portraits and posters.', risk: 'May feel cold', originality: 7, brandFit: 8,
      evidenceStrength: 4, feasibility: 8, confidence: 'LOW', recommendation: false,
    });
    expect(result.success).toBe(false);
  });

  it('caps opportunity scores at ten', () => {
    const base = {
      title: 'Long form', oneLine: 'Show the full silhouette.', observed: 'The sample uses cropped silhouettes.',
      whyItMatters: 'The product can look distinct.', audience: 'Design-aware buyers', tension: 'Compressed versus extended',
      evidence: ['finding-1'], whyThisProject: 'The cut supports it.', whyNow: 'Useful for the next brief.',
      creativePossibility: 'Tall portraits and posters.', risk: 'May feel cold', originality: 11, brandFit: 8,
      evidenceStrength: 4, feasibility: 8, confidence: 'LOW', recommendation: false,
    };
    expect(opportunitySchema.safeParse(base).success).toBe(false);
  });

  it('requires a production-usable storyboard sequence', () => {
    expect(storyboardSchema.safeParse({ title: 'One frame', frames: [] }).success).toBe(false);
  });

  it('requires evidence notes in recipient handoffs', () => {
    expect(handoffSchema.safeParse({
      title: 'Photographer brief', purpose: 'Create campaign stills', summary: 'A specific production direction.',
      nonNegotiables: ['Show the full product', 'Preserve the visual device'], deliverables: ['Six selects'],
      technicalNotes: [], openQuestions: [], evidenceNotes: [],
    }).success).toBe(false);
  });
});
