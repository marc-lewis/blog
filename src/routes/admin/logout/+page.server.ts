import type { Actions } from './$types';
import { redirect } from '@sveltejs/kit';
import { deleteSession, getSessionId, clearSessionCookie } from '$lib/server/auth';

export const actions: Actions = {
	default: async ({ cookies }) => {
		const sessionId = getSessionId(cookies);

		if (sessionId) {
			await deleteSession(sessionId);
		}

		clearSessionCookie(cookies);

		throw redirect(303, '/admin/login');
	}
};
