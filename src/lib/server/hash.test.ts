import { describe, it, expect, beforeEach, vi } from 'vitest';
import { faker } from '@faker-js/faker';

// Mock the database module before importing hash
vi.mock('./db', () => ({
	db: {
		select: vi.fn().mockReturnThis(),
		from: vi.fn().mockReturnThis(),
		orderBy: vi.fn().mockReturnThis(),
		limit: vi.fn().mockResolvedValue([])
	}
}));

import { isValidHash, formatHash, parseHash } from './hash';

// Note: generateHash requires database connection, tested via integration tests

describe('hash.ts', () => {
	describe('isValidHash', () => {
		describe('and when the hash is valid', () => {
			it('should return true for 6-digit numeric hash', () => {
				expect(isValidHash('000001')).toBe(true);
				expect(isValidHash('123456')).toBe(true);
				expect(isValidHash('999999')).toBe(true);
			});
		});

		describe('and when the hash is invalid', () => {
			it('should return false for hashes with fewer than 6 digits', () => {
				expect(isValidHash('12345')).toBe(false);
				expect(isValidHash('1')).toBe(false);
				expect(isValidHash('')).toBe(false);
			});

			it('should return false for hashes with more than 6 digits', () => {
				expect(isValidHash('1234567')).toBe(false);
			});

			it('should return false for hashes containing non-numeric characters', () => {
				expect(isValidHash('12345a')).toBe(false);
				expect(isValidHash('abcdef')).toBe(false);
				expect(isValidHash('#00001')).toBe(false);
			});

			it('should return false for hashes with spaces', () => {
				expect(isValidHash('123 45')).toBe(false);
				expect(isValidHash(' 12345')).toBe(false);
			});
		});
	});

	describe('formatHash', () => {
		let mockHash: string;

		beforeEach(() => {
			mockHash = faker.string.numeric(6).padStart(6, '0');
		});

		describe('and when formatting a hash for display', () => {
			it('should prefix the hash with #', () => {
				expect(formatHash(mockHash)).toBe(`#${mockHash}`);
			});

			it('should handle 000001 correctly', () => {
				expect(formatHash('000001')).toBe('#000001');
			});
		});
	});

	describe('parseHash', () => {
		describe('and when parsing a display hash', () => {
			it('should remove the # prefix', () => {
				expect(parseHash('#000001')).toBe('000001');
				expect(parseHash('#123456')).toBe('123456');
			});

			it('should handle hashes without # prefix', () => {
				expect(parseHash('000001')).toBe('000001');
				expect(parseHash('123456')).toBe('123456');
			});
		});
	});
});
