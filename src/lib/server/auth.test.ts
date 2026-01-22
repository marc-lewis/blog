import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { faker } from '@faker-js/faker';

// Mock bcrypt
vi.mock('bcrypt', () => ({
	default: {
		hash: vi.fn().mockResolvedValue('hashed_password'),
		compare: vi.fn().mockResolvedValue(true)
	}
}));

// Mock the database module
vi.mock('./db', () => ({
	db: {
		select: vi.fn().mockReturnThis(),
		from: vi.fn().mockReturnThis(),
		where: vi.fn().mockReturnThis(),
		limit: vi.fn().mockResolvedValue([]),
		insert: vi.fn().mockReturnThis(),
		values: vi.fn().mockResolvedValue(undefined),
		delete: vi.fn().mockReturnThis()
	}
}));

import bcrypt from 'bcrypt';
import {
	hashPassword,
	verifyPassword,
	generateSessionId,
	checkRateLimit,
	recordLoginAttempt,
	clearLoginAttempts
} from './auth';

describe('auth.ts', () => {
	describe('hashPassword', () => {
		describe('and when hashing a password', () => {
			let mockPassword: string;

			beforeEach(() => {
				mockPassword = faker.internet.password({ length: 16 });
			});

			it('should call bcrypt.hash with the password and salt rounds', async () => {
				await hashPassword(mockPassword);
				expect(bcrypt.hash).toHaveBeenCalledWith(mockPassword, 12);
			});

			it('should return the hashed password', async () => {
				const result = await hashPassword(mockPassword);
				expect(result).toBe('hashed_password');
			});
		});
	});

	describe('verifyPassword', () => {
		describe('and when verifying a password', () => {
			let mockPassword: string;
			let mockHash: string;

			beforeEach(() => {
				mockPassword = faker.internet.password({ length: 16 });
				mockHash = faker.string.alphanumeric(60);
			});

			it('should call bcrypt.compare with password and hash', async () => {
				await verifyPassword(mockPassword, mockHash);
				expect(bcrypt.compare).toHaveBeenCalledWith(mockPassword, mockHash);
			});

			it('should return true when password matches', async () => {
				vi.mocked(bcrypt.compare).mockResolvedValueOnce(true as never);
				const result = await verifyPassword(mockPassword, mockHash);
				expect(result).toBe(true);
			});

			it('should return false when password does not match', async () => {
				vi.mocked(bcrypt.compare).mockResolvedValueOnce(false as never);
				const result = await verifyPassword(mockPassword, mockHash);
				expect(result).toBe(false);
			});
		});
	});

	describe('generateSessionId', () => {
		describe('and when generating a session ID', () => {
			it('should return a string', () => {
				const sessionId = generateSessionId();
				expect(typeof sessionId).toBe('string');
			});

			it('should return a 64-character hex string', () => {
				const sessionId = generateSessionId();
				expect(sessionId).toMatch(/^[a-f0-9]{64}$/);
			});

			it('should generate unique IDs', () => {
				const ids = new Set<string>();
				for (let i = 0; i < 100; i++) {
					ids.add(generateSessionId());
				}
				expect(ids.size).toBe(100);
			});
		});
	});

	describe('rate limiting', () => {
		let mockIp: string;

		beforeEach(() => {
			mockIp = faker.internet.ip();
		});

		afterEach(() => {
			clearLoginAttempts(mockIp);
		});

		describe('checkRateLimit', () => {
			describe('and when no previous attempts', () => {
				it('should return true', () => {
					expect(checkRateLimit(mockIp)).toBe(true);
				});
			});

			describe('and when under the limit', () => {
				beforeEach(() => {
					for (let i = 0; i < 4; i++) {
						recordLoginAttempt(mockIp);
					}
				});

				it('should return true', () => {
					expect(checkRateLimit(mockIp)).toBe(true);
				});
			});

			describe('and when at the limit', () => {
				beforeEach(() => {
					for (let i = 0; i < 5; i++) {
						recordLoginAttempt(mockIp);
					}
				});

				it('should return false', () => {
					expect(checkRateLimit(mockIp)).toBe(false);
				});
			});
		});

		describe('recordLoginAttempt', () => {
			describe('and when recording attempts', () => {
				it('should increment the count', () => {
					recordLoginAttempt(mockIp);
					expect(checkRateLimit(mockIp)).toBe(true);

					recordLoginAttempt(mockIp);
					recordLoginAttempt(mockIp);
					recordLoginAttempt(mockIp);
					recordLoginAttempt(mockIp);

					expect(checkRateLimit(mockIp)).toBe(false);
				});
			});
		});

		describe('clearLoginAttempts', () => {
			describe('and when clearing attempts', () => {
				beforeEach(() => {
					for (let i = 0; i < 5; i++) {
						recordLoginAttempt(mockIp);
					}
				});

				it('should allow new attempts', () => {
					expect(checkRateLimit(mockIp)).toBe(false);
					clearLoginAttempts(mockIp);
					expect(checkRateLimit(mockIp)).toBe(true);
				});
			});
		});
	});
});
