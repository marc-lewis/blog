import { describe, it, expect, beforeEach } from 'vitest';
import { faker } from '@faker-js/faker';
import { generateSlug, isValidSlug, isValidTagSlug, isValidPostSlug } from './slug';

describe('slug.ts', () => {
	describe('generateSlug', () => {
		describe('and when generating a slug from a name', () => {
			it('should convert to lowercase', () => {
				expect(generateSlug('Hello World')).toBe('hello-world');
				expect(generateSlug('UPPERCASE')).toBe('uppercase');
			});

			it('should replace spaces with hyphens', () => {
				expect(generateSlug('hello world')).toBe('hello-world');
				expect(generateSlug('one two three')).toBe('one-two-three');
			});

			it('should remove special characters', () => {
				expect(generateSlug("hello! world?")).toBe('hello-world');
				expect(generateSlug('test@email.com')).toBe('testemailcom');
				expect(generateSlug('100% complete!')).toBe('100-complete');
			});

			it('should collapse multiple hyphens', () => {
				expect(generateSlug('hello - world')).toBe('hello-world');
				expect(generateSlug('test--case')).toBe('test-case');
			});

			it('should trim whitespace', () => {
				expect(generateSlug('  hello world  ')).toBe('hello-world');
			});

			it('should remove leading and trailing hyphens', () => {
				expect(generateSlug('-hello-world-')).toBe('hello-world');
				expect(generateSlug('  -test-  ')).toBe('test');
			});

			it('should handle realistic titles', () => {
				expect(generateSlug('My First Blog Post')).toBe('my-first-blog-post');
				expect(generateSlug("What's New in SvelteKit 2.0?")).toBe('whats-new-in-sveltekit-20');
				expect(generateSlug('Infrastructure')).toBe('infrastructure');
			});
		});
	});

	describe('isValidSlug', () => {
		describe('and when the slug is valid', () => {
			it('should return true for simple slugs', () => {
				expect(isValidSlug('hello')).toBe(true);
				expect(isValidSlug('hello-world')).toBe(true);
				expect(isValidSlug('my-first-post')).toBe(true);
			});

			it('should return true for slugs with numbers', () => {
				expect(isValidSlug('post-1')).toBe(true);
				expect(isValidSlug('2024-review')).toBe(true);
				expect(isValidSlug('sveltekit-20')).toBe(true);
			});
		});

		describe('and when the slug is invalid', () => {
			it('should return false for empty strings', () => {
				expect(isValidSlug('')).toBe(false);
			});

			it('should return false for slugs starting with hyphen', () => {
				expect(isValidSlug('-hello')).toBe(false);
			});

			it('should return false for slugs ending with hyphen', () => {
				expect(isValidSlug('hello-')).toBe(false);
			});

			it('should return false for slugs with consecutive hyphens', () => {
				expect(isValidSlug('hello--world')).toBe(false);
			});

			it('should return false for slugs with uppercase', () => {
				expect(isValidSlug('Hello')).toBe(false);
				expect(isValidSlug('helloWorld')).toBe(false);
			});

			it('should return false for slugs with special characters', () => {
				expect(isValidSlug('hello_world')).toBe(false);
				expect(isValidSlug('hello.world')).toBe(false);
				expect(isValidSlug('hello@world')).toBe(false);
			});

			it('should return false for slugs exceeding max length', () => {
				const longSlug = 'a'.repeat(201);
				expect(isValidSlug(longSlug)).toBe(false);
			});
		});

		describe('and when using custom max length', () => {
			it('should respect the custom max length', () => {
				const slug = 'a'.repeat(60);
				expect(isValidSlug(slug, 50)).toBe(false);
				expect(isValidSlug(slug, 100)).toBe(true);
			});
		});
	});

	describe('isValidTagSlug', () => {
		describe('and when validating tag slugs', () => {
			it('should accept valid tag slugs', () => {
				expect(isValidTagSlug('blog')).toBe(true);
				expect(isValidTagSlug('infrastructure')).toBe(true);
				expect(isValidTagSlug('svelte-kit')).toBe(true);
			});

			it('should reject slugs over 50 characters', () => {
				const longSlug = 'a'.repeat(51);
				expect(isValidTagSlug(longSlug)).toBe(false);
			});

			it('should accept slugs exactly 50 characters', () => {
				const exactSlug = 'a'.repeat(50);
				expect(isValidTagSlug(exactSlug)).toBe(true);
			});
		});
	});

	describe('isValidPostSlug', () => {
		let mockSlug: string;

		beforeEach(() => {
			mockSlug = faker.lorem.slug();
		});

		describe('and when validating post slugs', () => {
			it('should accept valid post slugs', () => {
				expect(isValidPostSlug('hello-world')).toBe(true);
				expect(isValidPostSlug('my-first-blog-post-about-sveltekit')).toBe(true);
			});

			it('should reject slugs over 200 characters', () => {
				const longSlug = 'a'.repeat(201);
				expect(isValidPostSlug(longSlug)).toBe(false);
			});

			it('should accept slugs exactly 200 characters', () => {
				const exactSlug = 'a'.repeat(200);
				expect(isValidPostSlug(exactSlug)).toBe(true);
			});
		});
	});
});
