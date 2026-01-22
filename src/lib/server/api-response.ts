/**
 * Standard API response utilities.
 */

export interface ApiMeta {
	total?: number;
	page?: number;
	limit?: number;
}

export interface ApiSuccessResponse<T> {
	data: T;
	meta?: ApiMeta;
}

export interface ApiErrorDetail {
	field?: string;
}

export interface ApiError {
	code: string;
	message: string;
	details?: ApiErrorDetail;
}

export interface ApiErrorResponse {
	error: ApiError;
}

/**
 * Create a success response.
 */
export function successResponse<T>(data: T, meta?: ApiMeta): ApiSuccessResponse<T> {
	const response: ApiSuccessResponse<T> = { data };
	if (meta) {
		response.meta = meta;
	}
	return response;
}

/**
 * Create an error response.
 */
export function errorResponse(
	code: string,
	message: string,
	details?: ApiErrorDetail
): ApiErrorResponse {
	const response: ApiErrorResponse = {
		error: { code, message }
	};
	if (details) {
		response.error.details = details;
	}
	return response;
}

/**
 * Common error codes.
 */
export const ErrorCodes = {
	UNAUTHORIZED: 'UNAUTHORIZED',
	FORBIDDEN: 'FORBIDDEN',
	NOT_FOUND: 'NOT_FOUND',
	VALIDATION_ERROR: 'VALIDATION_ERROR',
	CONFLICT: 'CONFLICT',
	INTERNAL_ERROR: 'INTERNAL_ERROR'
} as const;

/**
 * Parse pagination params from URL.
 */
export function getPaginationParams(
	url: URL,
	defaults: { page: number; limit: number } = { page: 1, limit: 20 }
): { page: number; limit: number; offset: number } {
	const page = Math.max(1, parseInt(url.searchParams.get('page') ?? String(defaults.page), 10));
	const limit = Math.min(
		100,
		Math.max(1, parseInt(url.searchParams.get('limit') ?? String(defaults.limit), 10))
	);
	const offset = (page - 1) * limit;

	return { page, limit, offset };
}
