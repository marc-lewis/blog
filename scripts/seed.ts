import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../src/lib/server/db/schema';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
	console.error('DATABASE_URL environment variable is not set');
	process.exit(1);
}

const client = postgres(DATABASE_URL);
const db = drizzle(client, { schema });

async function seed() {
	console.log('🌱 Seeding database...\n');

	// Create initial tags
	console.log('Creating tags...');
	const tagsData = [
		{ id: '1', slug: 'blog', name: 'Blog', colour: '#3b82f6' },
		{ id: '2', slug: 'infra', name: 'Infrastructure', colour: '#ef4444' },
		{ id: '3', slug: 'content', name: 'Content', colour: '#22c55e' },
		{ id: '4', slug: 'meta', name: 'Meta', colour: '#a855f7' }
	];

	for (const tag of tagsData) {
		await db
			.insert(schema.tags)
			.values(tag)
			.onConflictDoNothing();
	}
	console.log(`  ✓ Created ${tagsData.length} tags`);

	// Create initial todos
	console.log('Creating todos...');
	const todosData = [
		{ id: '1', hash: '000001', emoji: '🤖', description: 'Set up blog infrastructure' },
		{ id: '2', hash: '000002', emoji: '📝', description: 'Write first blog post' },
		{ id: '3', hash: '000003', emoji: '🔐', description: 'Implement authentication' },
		{ id: '4', hash: '000004', emoji: '🎨', description: 'Design admin panel UI' }
	];

	for (const todo of todosData) {
		await db
			.insert(schema.todos)
			.values(todo)
			.onConflictDoNothing();
	}
	console.log(`  ✓ Created ${todosData.length} todos`);

	// Link todos to tags
	console.log('Linking todos to tags...');
	const todoTagsData = [
		{ todoId: '1', tagSlug: 'blog' },
		{ todoId: '1', tagSlug: 'infra' },
		{ todoId: '2', tagSlug: 'content' },
		{ todoId: '2', tagSlug: 'blog' },
		{ todoId: '3', tagSlug: 'infra' },
		{ todoId: '4', tagSlug: 'blog' },
		{ todoId: '4', tagSlug: 'meta' }
	];

	for (const link of todoTagsData) {
		await db
			.insert(schema.todoTags)
			.values(link)
			.onConflictDoNothing();
	}
	console.log(`  ✓ Created ${todoTagsData.length} todo-tag links`);

	// Verify by querying
	console.log('\n📊 Verifying seed data...\n');

	const allTags = await db.select().from(schema.tags);
	console.log('Tags:', allTags.map((t) => t.name).join(', '));

	const allTodos = await db.select().from(schema.todos);
	console.log('Todos:');
	for (const todo of allTodos) {
		console.log(`  #${todo.hash} ${todo.emoji} ${todo.description}`);
	}

	console.log('\n✅ Database seeded successfully!');
}

seed()
	.catch((err) => {
		console.error('❌ Seed failed:', err);
		process.exit(1);
	})
	.finally(() => {
		client.end();
	});
