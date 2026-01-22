import {
	pgTable,
	text,
	boolean,
	timestamp,
	primaryKey,
	index
} from 'drizzle-orm/pg-core';

// Users table (for admin authentication)
export const users = pgTable('users', {
	id: text('id').primaryKey(),
	email: text('email').unique().notNull(),
	passwordHash: text('password_hash').notNull(),
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow()
});

// Todos table
export const todos = pgTable(
	'todos',
	{
		id: text('id').primaryKey(),
		hash: text('hash').unique().notNull(),
		emoji: text('emoji').notNull(),
		description: text('description').notNull(),
		completed: boolean('completed').default(false),
		createdAt: timestamp('created_at').defaultNow(),
		updatedAt: timestamp('updated_at').defaultNow(),
		completedAt: timestamp('completed_at')
	},
	(table) => [index('idx_todos_hash').on(table.hash), index('idx_todos_completed').on(table.completed)]
);

// Blog posts table
export const posts = pgTable(
	'posts',
	{
		id: text('id').primaryKey(),
		slug: text('slug').unique().notNull(),
		title: text('title').notNull(),
		description: text('description').notNull(),
		content: text('content').notNull(),
		published: boolean('published').default(false),
		createdAt: timestamp('created_at').defaultNow(),
		updatedAt: timestamp('updated_at').defaultNow(),
		publishedAt: timestamp('published_at')
	},
	(table) => [index('idx_posts_slug').on(table.slug), index('idx_posts_published').on(table.published)]
);

// Tags table
export const tags = pgTable(
	'tags',
	{
		id: text('id').primaryKey(),
		slug: text('slug').unique().notNull(),
		name: text('name').notNull(),
		description: text('description'),
		colour: text('colour'),
		createdAt: timestamp('created_at').defaultNow(),
		updatedAt: timestamp('updated_at').defaultNow()
	},
	(table) => [index('idx_tags_slug').on(table.slug)]
);

// Todo-Tag junction table
export const todoTags = pgTable(
	'todo_tags',
	{
		todoId: text('todo_id')
			.notNull()
			.references(() => todos.id, { onDelete: 'cascade' }),
		tagSlug: text('tag_slug')
			.notNull()
			.references(() => tags.slug, { onDelete: 'cascade' })
	},
	(table) => [primaryKey({ columns: [table.todoId, table.tagSlug] })]
);

// Post-Tag junction table
export const postTags = pgTable(
	'post_tags',
	{
		postId: text('post_id')
			.notNull()
			.references(() => posts.id, { onDelete: 'cascade' }),
		tagSlug: text('tag_slug')
			.notNull()
			.references(() => tags.slug, { onDelete: 'cascade' })
	},
	(table) => [primaryKey({ columns: [table.postId, table.tagSlug] })]
);

// Post-Hash junction table (linking posts to related todos)
export const postHashes = pgTable(
	'post_hashes',
	{
		postId: text('post_id')
			.notNull()
			.references(() => posts.id, { onDelete: 'cascade' }),
		hash: text('hash')
			.notNull()
			.references(() => todos.hash, { onDelete: 'cascade' })
	},
	(table) => [primaryKey({ columns: [table.postId, table.hash] })]
);

// Sessions table (for authentication)
export const sessions = pgTable(
	'sessions',
	{
		id: text('id').primaryKey(),
		userId: text('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		expiresAt: timestamp('expires_at').notNull(),
		createdAt: timestamp('created_at').defaultNow()
	},
	(table) => [
		index('idx_sessions_user_id').on(table.userId),
		index('idx_sessions_expires_at').on(table.expiresAt)
	]
);

// Type exports for use in the application
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Todo = typeof todos.$inferSelect;
export type NewTodo = typeof todos.$inferInsert;

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;

export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
