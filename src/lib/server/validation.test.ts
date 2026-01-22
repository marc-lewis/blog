import { describe, it, expect, beforeEach } from 'vitest';
import { faker } from '@faker-js/faker';
import {
	isValidEmoji,
	isValidTodoDescription,
	isValidPostTitle,
	isValidPostDescription,
	isValidTagName,
	isValidTagDescription,
	isValidColour,
	validateTodoCreate,
	validatePostCreate,
	validateTagCreate
} from './validation';

describe('validation.ts', () => {
	describe('isValidEmoji', () => {
		describe('and when the emoji is valid', () => {
			it('should return true for common emojis', () => {
				expect(isValidEmoji('🤖')).toBe(true);
				expect(isValidEmoji('📝')).toBe(true);
				expect(isValidEmoji('🎨')).toBe(true);
				expect(isValidEmoji('🔧')).toBe(true);
			});

			it('should return true for flag emojis', () => {
				expect(isValidEmoji('🇬🇧')).toBe(true);
			});
		});

		describe('and when the emoji is invalid', () => {
			it('should return false for empty string', () => {
				expect(isValidEmoji('')).toBe(false);
			});

			it('should return false for multiple emojis', () => {
				expect(isValidEmoji('🤖🔧')).toBe(false);
			});

			it('should return false for regular text with multiple characters', () => {
				expect(isValidEmoji('ab')).toBe(false);
				expect(isValidEmoji('hello')).toBe(false);
			});
		});
	});

	describe('isValidTodoDescription', () => {
		describe('and when the description is valid', () => {
			it('should return true for short descriptions', () => {
				expect(isValidTodoDescription('set up blog')).toBe(true);
			});

			it('should return true for descriptions at max length', () => {
				const maxDescription = 'a'.repeat(280);
				expect(isValidTodoDescription(maxDescription)).toBe(true);
			});
		});

		describe('and when the description is invalid', () => {
			it('should return false for empty string', () => {
				expect(isValidTodoDescription('')).toBe(false);
			});

			it('should return false for whitespace only', () => {
				expect(isValidTodoDescription('   ')).toBe(false);
			});

			it('should return false for descriptions over 280 characters', () => {
				const longDescription = 'a'.repeat(281);
				expect(isValidTodoDescription(longDescription)).toBe(false);
			});
		});
	});

	describe('isValidPostTitle', () => {
		describe('and when the title is valid', () => {
			it('should return true for typical titles', () => {
				expect(isValidPostTitle('Hello World')).toBe(true);
				expect(isValidPostTitle('My First Post')).toBe(true);
			});

			it('should return true for titles at max length', () => {
				const maxTitle = 'a'.repeat(200);
				expect(isValidPostTitle(maxTitle)).toBe(true);
			});
		});

		describe('and when the title is invalid', () => {
			it('should return false for empty string', () => {
				expect(isValidPostTitle('')).toBe(false);
			});

			it('should return false for titles over 200 characters', () => {
				const longTitle = 'a'.repeat(201);
				expect(isValidPostTitle(longTitle)).toBe(false);
			});
		});
	});

	describe('isValidPostDescription', () => {
		describe('and when the description is valid', () => {
			it('should return true for typical descriptions', () => {
				expect(isValidPostDescription('A brief summary of my post')).toBe(true);
			});

			it('should return true for descriptions at max length', () => {
				const maxDescription = 'a'.repeat(500);
				expect(isValidPostDescription(maxDescription)).toBe(true);
			});
		});

		describe('and when the description is invalid', () => {
			it('should return false for descriptions over 500 characters', () => {
				const longDescription = 'a'.repeat(501);
				expect(isValidPostDescription(longDescription)).toBe(false);
			});
		});
	});

	describe('isValidTagName', () => {
		describe('and when the name is valid', () => {
			it('should return true for typical tag names', () => {
				expect(isValidTagName('Blog')).toBe(true);
				expect(isValidTagName('Infrastructure')).toBe(true);
			});
		});

		describe('and when the name is invalid', () => {
			it('should return false for names over 100 characters', () => {
				const longName = 'a'.repeat(101);
				expect(isValidTagName(longName)).toBe(false);
			});
		});
	});

	describe('isValidTagDescription', () => {
		describe('and when the description is valid', () => {
			it('should return true for undefined', () => {
				expect(isValidTagDescription(undefined)).toBe(true);
			});

			it('should return true for null', () => {
				expect(isValidTagDescription(null)).toBe(true);
			});

			it('should return true for empty string', () => {
				expect(isValidTagDescription('')).toBe(true);
			});

			it('should return true for typical descriptions', () => {
				expect(isValidTagDescription('Blog-related content')).toBe(true);
			});
		});

		describe('and when the description is invalid', () => {
			it('should return false for descriptions over 500 characters', () => {
				const longDescription = 'a'.repeat(501);
				expect(isValidTagDescription(longDescription)).toBe(false);
			});
		});
	});

	describe('isValidColour', () => {
		describe('and when the colour is valid', () => {
			it('should return true for undefined', () => {
				expect(isValidColour(undefined)).toBe(true);
			});

			it('should return true for null', () => {
				expect(isValidColour(null)).toBe(true);
			});

			it('should return true for empty string', () => {
				expect(isValidColour('')).toBe(true);
			});

			it('should return true for valid hex colours', () => {
				expect(isValidColour('#FF5733')).toBe(true);
				expect(isValidColour('#3B82F6')).toBe(true);
				expect(isValidColour('#000000')).toBe(true);
				expect(isValidColour('#ffffff')).toBe(true);
			});
		});

		describe('and when the colour is invalid', () => {
			it('should return false for colours without #', () => {
				expect(isValidColour('FF5733')).toBe(false);
			});

			it('should return false for 3-digit hex', () => {
				expect(isValidColour('#F00')).toBe(false);
			});

			it('should return false for invalid hex characters', () => {
				expect(isValidColour('#GGGGGG')).toBe(false);
			});

			it('should return false for named colours', () => {
				expect(isValidColour('red')).toBe(false);
			});
		});
	});

	describe('validateTodoCreate', () => {
		let validTodo: { emoji: string; description: string; tags: string[] };

		beforeEach(() => {
			validTodo = {
				emoji: '🤖',
				description: faker.lorem.sentence(),
				tags: [faker.lorem.word()]
			};
		});

		describe('and when the todo data is valid', () => {
			it('should return valid: true with no errors', () => {
				const result = validateTodoCreate(validTodo);
				expect(result.valid).toBe(true);
				expect(result.errors).toHaveLength(0);
			});
		});

		describe('and when the emoji is missing', () => {
			it('should return valid: false with emoji error', () => {
				const result = validateTodoCreate({ ...validTodo, emoji: undefined });
				expect(result.valid).toBe(false);
				expect(result.errors).toContainEqual(
					expect.objectContaining({ field: 'emoji' })
				);
			});
		});

		describe('and when the description is missing', () => {
			it('should return valid: false with description error', () => {
				const result = validateTodoCreate({ ...validTodo, description: undefined });
				expect(result.valid).toBe(false);
				expect(result.errors).toContainEqual(
					expect.objectContaining({ field: 'description' })
				);
			});
		});

		describe('and when tags is not an array', () => {
			it('should return valid: false with tags error', () => {
				const result = validateTodoCreate({ ...validTodo, tags: 'not-an-array' as unknown as string[] });
				expect(result.valid).toBe(false);
				expect(result.errors).toContainEqual(
					expect.objectContaining({ field: 'tags' })
				);
			});
		});
	});

	describe('validatePostCreate', () => {
		let validPost: {
			title: string;
			slug: string;
			description: string;
			content: string;
			tags: string[];
		};

		beforeEach(() => {
			validPost = {
				title: faker.lorem.sentence(),
				slug: faker.lorem.slug(),
				description: faker.lorem.paragraph(),
				content: faker.lorem.paragraphs(3),
				tags: [faker.lorem.word()]
			};
		});

		describe('and when the post data is valid', () => {
			it('should return valid: true with no errors', () => {
				const result = validatePostCreate(validPost);
				expect(result.valid).toBe(true);
				expect(result.errors).toHaveLength(0);
			});
		});

		describe('and when multiple fields are missing', () => {
			it('should return errors for all invalid fields', () => {
				const result = validatePostCreate({});
				expect(result.valid).toBe(false);
				expect(result.errors.length).toBeGreaterThan(1);
			});
		});
	});

	describe('validateTagCreate', () => {
		let validTag: { name: string; description?: string; colour?: string };

		beforeEach(() => {
			validTag = {
				name: faker.lorem.word(),
				description: faker.lorem.sentence(),
				colour: '#3B82F6'
			};
		});

		describe('and when the tag data is valid', () => {
			it('should return valid: true with no errors', () => {
				const result = validateTagCreate(validTag);
				expect(result.valid).toBe(true);
				expect(result.errors).toHaveLength(0);
			});
		});

		describe('and when the name is missing', () => {
			it('should return valid: false with name error', () => {
				const result = validateTagCreate({ ...validTag, name: undefined });
				expect(result.valid).toBe(false);
				expect(result.errors).toContainEqual(
					expect.objectContaining({ field: 'name' })
				);
			});
		});

		describe('and when the colour is invalid', () => {
			it('should return valid: false with colour error', () => {
				const result = validateTagCreate({ ...validTag, colour: 'invalid' });
				expect(result.valid).toBe(false);
				expect(result.errors).toContainEqual(
					expect.objectContaining({ field: 'colour' })
				);
			});
		});
	});
});
