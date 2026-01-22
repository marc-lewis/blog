import bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import type { Cookies } from '@sveltejs/kit';
import { db } from './db';
import { sessions, users } from './db/schema';
import { eq, lt } from 'drizzle-orm';

const SALT_ROUNDS = 12;
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days
const SESSION_COOKIE_NAME = 'session';

export interface Session {
	id: string;
	userId: string;
	expiresAt: Date;
	createdAt: Date | null;
}

/**
 * Hash a password using bcrypt.
 */
export async function hashPassword(password: string): Promise<string> {
	return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify a password against a hash.
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
	return bcrypt.compare(password, hash);
}

/**
 * Generate a secure random session ID.
 */
export function generateSessionId(): string {
	return randomBytes(32).toString('hex');
}

/**
 * Create a new session for a user.
 */
export async function createSession(userId: string): Promise<Session> {
	const session = {
		id: generateSessionId(),
		userId,
		expiresAt: new Date(Date.now() + SESSION_DURATION),
		createdAt: new Date()
	};

	await db.insert(sessions).values(session);
	return session;
}

/**
 * Validate a session by ID.
 * Returns the session if valid, null if invalid or expired.
 */
export async function validateSession(sessionId: string): Promise<Session | null> {
	const result = await db
		.select()
		.from(sessions)
		.where(eq(sessions.id, sessionId))
		.limit(1);

	const session = result[0];

	if (!session || session.expiresAt < new Date()) {
		// Clean up expired session if found
		if (session) {
			await deleteSession(sessionId);
		}
		return null;
	}

	return session;
}

/**
 * Delete a session.
 */
export async function deleteSession(sessionId: string): Promise<void> {
	await db.delete(sessions).where(eq(sessions.id, sessionId));
}

/**
 * Clean up all expired sessions.
 */
export async function cleanupExpiredSessions(): Promise<void> {
	await db.delete(sessions).where(lt(sessions.expiresAt, new Date()));
}

/**
 * Set the session cookie.
 */
export function setSessionCookie(cookies: Cookies, sessionId: string): void {
	cookies.set(SESSION_COOKIE_NAME, sessionId, {
		path: '/',
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'lax',
		maxAge: 7 * 24 * 60 * 60 // 7 days in seconds
	});
}

/**
 * Clear the session cookie.
 */
export function clearSessionCookie(cookies: Cookies): void {
	cookies.delete(SESSION_COOKIE_NAME, { path: '/' });
}

/**
 * Get the session ID from cookies.
 */
export function getSessionId(cookies: Cookies): string | undefined {
	return cookies.get(SESSION_COOKIE_NAME);
}

/**
 * Get user by email.
 */
export async function getUserByEmail(email: string) {
	const result = await db
		.select()
		.from(users)
		.where(eq(users.email, email))
		.limit(1);

	return result[0] ?? null;
}

// Rate limiting for login attempts (in-memory, resets on server restart)
const LOGIN_ATTEMPTS = new Map<string, { count: number; lastAttempt: number }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

/**
 * Check if an IP is rate limited.
 */
export function checkRateLimit(ip: string): boolean {
	const record = LOGIN_ATTEMPTS.get(ip);

	if (!record) return true;

	if (Date.now() - record.lastAttempt > LOCKOUT_DURATION) {
		LOGIN_ATTEMPTS.delete(ip);
		return true;
	}

	return record.count < MAX_ATTEMPTS;
}

/**
 * Record a login attempt for rate limiting.
 */
export function recordLoginAttempt(ip: string): void {
	const record = LOGIN_ATTEMPTS.get(ip);

	if (record) {
		record.count++;
		record.lastAttempt = Date.now();
	} else {
		LOGIN_ATTEMPTS.set(ip, { count: 1, lastAttempt: Date.now() });
	}
}

/**
 * Clear login attempts for an IP (after successful login).
 */
export function clearLoginAttempts(ip: string): void {
	LOGIN_ATTEMPTS.delete(ip);
}
