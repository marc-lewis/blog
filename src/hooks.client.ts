import type { HandleClientError } from '@sveltejs/kit';

/**
 * Client error handler.
 * Logs errors with a unique ID for tracking.
 */
export const handleError: HandleClientError = async ({ error, status, message }) => {
	const errorId = crypto.randomUUID();

	// Log to console (in production, send to error tracking service like Sentry)
	console.error({
		errorId,
		error,
		status,
		message
	});

	return {
		message: 'Something went wrong',
		errorId
	};
};
