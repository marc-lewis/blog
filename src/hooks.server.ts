import type { Handle, HandleServerError } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import { validateSession, getSessionId, cleanupExpiredSessions } from '$lib/server/auth';

/**
 * Main request handler.
 * Validates sessions for admin routes and attaches session to locals.
 */
export const handle: Handle = async ({ event, resolve }) => {
	const sessionId = getSessionId(event.cookies);

	// Validate session for all requests (attaches to locals if valid)
	if (sessionId) {
		const session = await validateSession(sessionId);
		if (session) {
			event.locals.session = session;
		}
	}

	// Protect admin routes (except login page)
	if (event.url.pathname.startsWith('/admin')) {
		// Allow login page without authentication
		if (event.url.pathname === '/admin/login') {
			// If already logged in, redirect to admin dashboard
			if (event.locals.session) {
				throw redirect(303, '/admin');
			}
			return resolve(event);
		}

		// Require authentication for all other admin routes
		if (!event.locals.session) {
			throw redirect(303, '/admin/login');
		}
	}

	// Protect admin API routes
	// Note: API endpoints should also check locals.session and return 401
	// This is a belt-and-suspenders approach

	return resolve(event);
};

/**
 * Server error handler.
 * Logs errors with a unique ID for tracking.
 */
export const handleError: HandleServerError = async ({ error, event, status, message }) => {
	const errorId = crypto.randomUUID();

	// Log to console (in production, send to error tracking service)
	console.error({
		errorId,
		error,
		path: event.url.pathname,
		status,
		message
	});

	return {
		message: 'An unexpected error occurred',
		errorId
	};
};

// Periodic cleanup of expired sessions (runs on first request, then periodically)
let cleanupScheduled = false;

if (!cleanupScheduled) {
	cleanupScheduled = true;
	// Run cleanup every hour
	setInterval(
		async () => {
			try {
				await cleanupExpiredSessions();
			} catch (e) {
				console.error('Failed to cleanup expired sessions:', e);
			}
		},
		60 * 60 * 1000
	);
}
