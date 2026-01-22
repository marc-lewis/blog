import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import {
	verifyPassword,
	createSession,
	setSessionCookie,
	getUserByEmail,
	checkRateLimit,
	recordLoginAttempt,
	clearLoginAttempts
} from '$lib/server/auth';

export const load: PageServerLoad = async ({ locals }) => {
	// If already logged in, redirect to admin dashboard
	if (locals.session) {
		throw redirect(303, '/admin');
	}
};

export const actions: Actions = {
	default: async ({ request, cookies, getClientAddress }) => {
		const data = await request.formData();
		const email = data.get('email') as string;
		const password = data.get('password') as string;

		if (!email || !password) {
			return fail(400, { error: 'Email and password are required', email });
		}

		// Rate limiting
		const clientIp = getClientAddress();
		if (!checkRateLimit(clientIp)) {
			return fail(429, {
				error: 'Too many login attempts. Please try again in 15 minutes.',
				email
			});
		}

		// Get user
		const user = await getUserByEmail(email);

		if (!user) {
			recordLoginAttempt(clientIp);
			return fail(401, { error: 'Invalid email or password', email });
		}

		// Verify password
		const validPassword = await verifyPassword(password, user.passwordHash);

		if (!validPassword) {
			recordLoginAttempt(clientIp);
			return fail(401, { error: 'Invalid email or password', email });
		}

		// Clear rate limit on successful login
		clearLoginAttempts(clientIp);

		// Create session
		const session = await createSession(user.id);
		setSessionCookie(cookies, session.id);

		throw redirect(303, '/admin');
	}
};
