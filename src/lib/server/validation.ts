/**
 * Validation utilities for todos and posts.
 */

const TODO_DESCRIPTION_MAX_LENGTH = 280;
const POST_TITLE_MAX_LENGTH = 200;
const POST_DESCRIPTION_MAX_LENGTH = 500;
const TAG_NAME_MAX_LENGTH = 100;
const TAG_DESCRIPTION_MAX_LENGTH = 500;

export interface ValidationError {
	field: string;
	message: string;
}

export interface ValidationResult {
	valid: boolean;
	errors: ValidationError[];
}

/**
 * Validates a single emoji character.
 */
export function isValidEmoji(emoji: string): boolean {
	// Check it's a single grapheme (emoji or character)
	// This is a simplified check - emojis can be complex with ZWJ sequences
	if (!emoji || emoji.length === 0) {
		return false;
	}

	// Use the Segmenter API if available, otherwise basic check
	if (typeof Intl !== 'undefined' && Intl.Segmenter) {
		const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' });
		const segments = [...segmenter.segment(emoji)];
		return segments.length === 1;
	}

	// Fallback: allow 1-4 characters (covers most emojis including ZWJ sequences)
	return emoji.length >= 1 && emoji.length <= 8;
}

/**
 * Validates a todo description.
 */
export function isValidTodoDescription(description: string): boolean {
	return (
		typeof description === 'string' &&
		description.trim().length > 0 &&
		description.length <= TODO_DESCRIPTION_MAX_LENGTH
	);
}

/**
 * Validates a post title.
 */
export function isValidPostTitle(title: string): boolean {
	return (
		typeof title === 'string' && title.trim().length > 0 && title.length <= POST_TITLE_MAX_LENGTH
	);
}

/**
 * Validates a post description.
 */
export function isValidPostDescription(description: string): boolean {
	return (
		typeof description === 'string' &&
		description.trim().length > 0 &&
		description.length <= POST_DESCRIPTION_MAX_LENGTH
	);
}

/**
 * Validates a tag name.
 */
export function isValidTagName(name: string): boolean {
	return typeof name === 'string' && name.trim().length > 0 && name.length <= TAG_NAME_MAX_LENGTH;
}

/**
 * Validates a tag description (optional).
 */
export function isValidTagDescription(description: string | undefined | null): boolean {
	if (description === undefined || description === null || description === '') {
		return true; // Optional field
	}
	return typeof description === 'string' && description.length <= TAG_DESCRIPTION_MAX_LENGTH;
}

/**
 * Validates a hex colour code.
 */
export function isValidColour(colour: string | undefined | null): boolean {
	if (colour === undefined || colour === null || colour === '') {
		return true; // Optional field
	}
	return /^#[0-9A-Fa-f]{6}$/.test(colour);
}

/**
 * Validates a todo object for creation.
 */
export function validateTodoCreate(data: {
	emoji?: string;
	description?: string;
	tags?: string[];
}): ValidationResult {
	const errors: ValidationError[] = [];

	if (!data.emoji || !isValidEmoji(data.emoji)) {
		errors.push({ field: 'emoji', message: 'A valid emoji is required' });
	}

	if (!data.description || !isValidTodoDescription(data.description)) {
		errors.push({
			field: 'description',
			message: `Description is required and must be ${TODO_DESCRIPTION_MAX_LENGTH} characters or less`
		});
	}

	if (data.tags && !Array.isArray(data.tags)) {
		errors.push({ field: 'tags', message: 'Tags must be an array' });
	}

	return {
		valid: errors.length === 0,
		errors
	};
}

/**
 * Validates a post object for creation.
 */
export function validatePostCreate(data: {
	title?: string;
	slug?: string;
	description?: string;
	content?: string;
	tags?: string[];
	hashes?: string[];
}): ValidationResult {
	const errors: ValidationError[] = [];

	if (!data.title || !isValidPostTitle(data.title)) {
		errors.push({
			field: 'title',
			message: `Title is required and must be ${POST_TITLE_MAX_LENGTH} characters or less`
		});
	}

	if (!data.description || !isValidPostDescription(data.description)) {
		errors.push({
			field: 'description',
			message: `Description is required and must be ${POST_DESCRIPTION_MAX_LENGTH} characters or less`
		});
	}

	if (!data.content || typeof data.content !== 'string' || data.content.trim().length === 0) {
		errors.push({ field: 'content', message: 'Content is required' });
	}

	if (data.tags && !Array.isArray(data.tags)) {
		errors.push({ field: 'tags', message: 'Tags must be an array' });
	}

	if (data.hashes && !Array.isArray(data.hashes)) {
		errors.push({ field: 'hashes', message: 'Hashes must be an array' });
	}

	return {
		valid: errors.length === 0,
		errors
	};
}

/**
 * Validates a tag object for creation.
 */
export function validateTagCreate(data: {
	name?: string;
	description?: string;
	colour?: string;
}): ValidationResult {
	const errors: ValidationError[] = [];

	if (!data.name || !isValidTagName(data.name)) {
		errors.push({
			field: 'name',
			message: `Name is required and must be ${TAG_NAME_MAX_LENGTH} characters or less`
		});
	}

	if (!isValidTagDescription(data.description)) {
		errors.push({
			field: 'description',
			message: `Description must be ${TAG_DESCRIPTION_MAX_LENGTH} characters or less`
		});
	}

	if (!isValidColour(data.colour)) {
		errors.push({ field: 'colour', message: 'Colour must be a valid hex code (e.g., #FF5733)' });
	}

	return {
		valid: errors.length === 0,
		errors
	};
}
