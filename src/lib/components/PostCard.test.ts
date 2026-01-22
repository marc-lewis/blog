import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import { faker } from '@faker-js/faker';
import PostCard from './PostCard.svelte';
import type { PostMeta } from '$utils/posts';

describe('PostCard', () => {
	let mockPost: PostMeta;

	beforeEach(() => {
		mockPost = {
			title: faker.lorem.sentence(),
			description: faker.lorem.paragraph(),
			date: faker.date.past().toISOString(),
			tags: [faker.lorem.word(), faker.lorem.word()],
			published: true,
			slug: faker.lorem.slug()
		};
	});

	describe('and when it renders', () => {
		beforeEach(() => {
			render(PostCard, { props: { post: mockPost } });
		});

		it('should render without errors', () => {
			expect(screen.getByRole('article')).toBeInTheDocument();
		});

		it('should display the post title', () => {
			expect(screen.getByText(mockPost.title)).toBeInTheDocument();
		});

		it('should display the post description', () => {
			expect(screen.getByText(mockPost.description)).toBeInTheDocument();
		});

		it('should have a link to the blog post', () => {
			const link = screen.getByRole('link', { name: mockPost.title });
			expect(link).toHaveAttribute('href', `/blog/${mockPost.slug}`);
		});
	});

	describe('and when the post has tags', () => {
		beforeEach(() => {
			render(PostCard, { props: { post: mockPost } });
		});

		it('should render all tags', () => {
			for (const tag of mockPost.tags) {
				expect(screen.getByText(tag)).toBeInTheDocument();
			}
		});
	});

	describe('and when the post has no tags', () => {
		beforeEach(() => {
			mockPost.tags = [];
			render(PostCard, { props: { post: mockPost } });
		});

		it('should not render the tags container', () => {
			const article = screen.getByRole('article');
			const tagContainers = article.querySelectorAll('.flex.flex-wrap.gap-2');
			expect(tagContainers.length).toBe(0);
		});
	});
});
