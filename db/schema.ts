import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

const timestamp = () => text().notNull();

export const projects = sqliteTable('projects', {
  id: text().primaryKey(),
  mode: text({ enum: ['BRAND', 'ARTIST'] }).notNull(),
  name: text().notNull(), website: text(), brief: text().notNull(), objective: text().notNull(), audience: text(),
  referencesJson: text('references_json').notNull().default('[]'),
  competitorsJson: text('competitors_json').notNull().default('[]'),
  notes: text(), releaseType: text('release_type'), releaseName: text('release_name'),
  themesJson: text('themes_json').notNull().default('[]'), releaseDate: text('release_date'),
  userLyrics: text('user_lyrics'), collaboratorsJson: text('collaborators_json').notNull().default('[]'),
  stage: text().notNull().default('UNDERSTANDING'),
  isDemo: integer('is_demo', { mode: 'boolean' }).notNull().default(false),
  createdAt: timestamp(), updatedAt: timestamp(),
}, (table) => [index('idx_projects_updated_at').on(table.updatedAt)]);

export const sources = sqliteTable('sources', {
  id: text().primaryKey(), projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  kind: text({ enum: ['URL', 'IMAGE', 'SCREENSHOT', 'NOTE', 'PDF', 'QUOTE', 'REFERENCE'] }).notNull(),
  title: text().notNull(), sourceUrl: text('source_url'), fileKey: text('file_key'), content: text(),
  status: text({ enum: ['READY', 'UNAVAILABLE', 'NEEDS_REVIEW'] }).notNull().default('READY'), capturedAt: timestamp(),
}, (table) => [index('idx_sources_project').on(table.projectId)]);

export const memoryEntries = sqliteTable('memory_entries', {
  id: text().primaryKey(), projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  field: text().notNull(), value: text().notNull(), confidence: text({ enum: ['LOW', 'MEDIUM', 'HIGH'] }).notNull(),
  evidenceJson: text('evidence_json').notNull().default('[]'), updatedAt: timestamp(),
}, (table) => [index('idx_memory_project_field').on(table.projectId, table.field)]);

export const findings = sqliteTable('findings', {
  id: text().primaryKey(), projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  sourceId: text('source_id').references(() => sources.id, { onDelete: 'set null' }),
  category: text({ enum: ['BRAND', 'AUDIENCE', 'CULTURE', 'COMPETITORS', 'CATEGORY', 'VISUAL', 'CONTENT', 'PRODUCT', 'COMMUNITY'] }).notNull(),
  classification: text({ enum: ['FACT', 'OBSERVATION', 'INFERENCE', 'SIGNAL', 'CREATIVE_PROPOSAL'] }).notNull(),
  finding: text().notNull(), sourceLabel: text('source_label').notNull(), sourceUrl: text('source_url'),
  observedAt: timestamp(), confidence: text({ enum: ['LOW', 'MEDIUM', 'HIGH'] }).notNull(), relevance: text().notNull(),
}, (table) => [index('idx_findings_project_category').on(table.projectId, table.category), index('idx_findings_source').on(table.sourceId)]);

export const competitors = sqliteTable('competitors', {
  id: text().primaryKey(), projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  name: text().notNull(), website: text(), positioning: text(), audience: text(), products: text(), pricing: text(),
  visualLanguage: text('visual_language'), campaignPatterns: text('campaign_patterns'), messaging: text(),
  contentPatterns: text('content_patterns'), strengths: text(), weaknesses: text(), similarities: text(), differences: text(),
  evidenceJson: text('evidence_json').notNull().default('[]'),
}, (table) => [index('idx_competitors_project').on(table.projectId)]);

export const signals = sqliteTable('signals', {
  id: text().primaryKey(), projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  type: text({ enum: ['AUDIENCE', 'CULTURE', 'VISUAL', 'COMPETITOR', 'PRODUCT', 'NARRATIVE', 'BEHAVIOURAL', 'COMMUNITY', 'PERFORMANCE'] }).notNull(),
  title: text().notNull(), description: text().notNull(), evidenceJson: text('evidence_json').notNull(),
  strength: text({ enum: ['WEAK', 'EMERGING', 'MODERATE', 'STRONG'] }).notNull(),
  confidence: text({ enum: ['LOW', 'MEDIUM', 'HIGH'] }).notNull(), freshness: text().notNull(),
  creativeRelevance: text('creative_relevance').notNull(), implication: text().notNull(), counterEvidence: text('counter_evidence'),
}, (table) => [index('idx_signals_project_type').on(table.projectId, table.type)]);

export const opportunities = sqliteTable('opportunities', {
  id: text().primaryKey(), projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  title: text().notNull(), oneLine: text('one_line').notNull(), observed: text().notNull(), whyItMatters: text('why_it_matters').notNull(),
  audience: text().notNull(), tension: text().notNull(), evidenceJson: text('evidence_json').notNull(), counterEvidence: text('counter_evidence'),
  whyThisProject: text('why_this_project').notNull(), whyNow: text('why_now').notNull(), creativePossibility: text('creative_possibility').notNull(),
  risk: text().notNull(), originality: integer().notNull(), brandFit: integer('brand_fit').notNull(),
  evidenceStrength: integer('evidence_strength').notNull(), feasibility: integer().notNull(),
  confidence: text({ enum: ['LOW', 'MEDIUM', 'HIGH'] }).notNull(), recommendation: integer({ mode: 'boolean' }).notNull().default(false),
  status: text({ enum: ['PENDING', 'APPROVED', 'REJECTED', 'SAVED'] }).notNull().default('PENDING'), editedAt: text('edited_at'),
}, (table) => [index('idx_opportunities_project_status').on(table.projectId, table.status)]);

export const creativeDevelopments = sqliteTable('creative_developments', {
  id: text().primaryKey(), opportunityId: text('opportunity_id').notNull().references(() => opportunities.id, { onDelete: 'cascade' }),
  contentJson: text('content_json').notNull(), status: text({ enum: ['DRAFT', 'READY_FOR_REVIEW', 'APPROVED'] }).notNull().default('DRAFT'), updatedAt: timestamp(),
}, (table) => [index('idx_developments_opportunity').on(table.opportunityId)]);

export const artDirections = sqliteTable('art_directions', {
  id: text().primaryKey(), developmentId: text('development_id').notNull().references(() => creativeDevelopments.id, { onDelete: 'cascade' }),
  contentJson: text('content_json').notNull(), status: text({ enum: ['DRAFT', 'READY_FOR_REVIEW', 'APPROVED'] }).notNull().default('DRAFT'), updatedAt: timestamp(),
}, (table) => [index('idx_art_direction_development').on(table.developmentId)]);

export const storyboards = sqliteTable('storyboards', {
  id: text().primaryKey(), projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  title: text().notNull(), framesJson: text('frames_json').notNull(), status: text({ enum: ['DRAFT', 'READY_FOR_REVIEW', 'APPROVED'] }).notNull().default('DRAFT'), updatedAt: timestamp(),
}, (table) => [index('idx_storyboards_project').on(table.projectId)]);

export const canvases = sqliteTable('canvases', {
  id: text().primaryKey(), projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  name: text().notNull(), kind: text({ enum: ['CREATIVE_BOARD', 'MOODBOARD', 'STORYBOARD', 'HANDOFF'] }).notNull(),
  sceneFileKey: text('scene_file_key').notNull(), previewFileKey: text('preview_file_key'), updatedAt: timestamp(),
}, (table) => [index('idx_canvases_project_kind').on(table.projectId, table.kind)]);

export const handoffs = sqliteTable('handoffs', {
  id: text().primaryKey(), projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  recipient: text().notNull(), contentJson: text('content_json').notNull(), canvasId: text('canvas_id').references(() => canvases.id, { onDelete: 'set null' }),
  status: text({ enum: ['DRAFT', 'READY_FOR_REVIEW', 'APPROVED'] }).notNull().default('DRAFT'), updatedAt: timestamp(),
}, (table) => [index('idx_handoffs_project_recipient').on(table.projectId, table.recipient)]);

export const feedback = sqliteTable('feedback', {
  id: text().primaryKey(), projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  entityType: text('entity_type').notNull(), entityId: text('entity_id').notNull(),
  decision: text({ enum: ['APPROVE', 'REJECT', 'SAVE', 'EDIT', 'COMMENT'] }).notNull(), note: text(), createdAt: timestamp(),
}, (table) => [index('idx_feedback_project').on(table.projectId), index('idx_feedback_entity').on(table.entityType, table.entityId)]);
