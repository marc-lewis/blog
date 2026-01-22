/**
 * Generates a URL-friendly slug from a string.
 * - Lowercase
 * - Hyphenated (spaces become hyphens)
 * - No special characters except hyphens
 */
export function generateSlug(name: string): string {
	return name
		.toLowerCase()
		.trim()
		.replace(/[^\w\s-]/g, '') // Remove special chars
		.replace(/\s+/g, '-') // Spaces to hyphens
		.replace(/-+/g, '-') // Collapse multiple hyphens
		.replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Validates that a slug is in the correct format.
 * - Lowercase only
 * - Hyphens allowed (not at start or end)
 * - No consecutive hyphens
 * - Max 50 characters for tags, 200 for posts
 */
export function isValidSlug(slug: string, maxLength = 200): boolean {
	if (slug.length === 0 || slug.length > maxLength) {
		return false;
	}

	// Must be lowercase alphanumeric with single hyphens, not at start/end
	return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

/**
 * Validates a tag slug (max 50 characters).
 */
export function isValidTagSlug(slug: string): boolean {
	return isValidSlug(slug, 50);
}

/**
 * Validates a post slug (max 200 characters).
 */
export function isValidPostSlug(slug: string): boolean {
	return isValidSlug(slug, 200);
}
