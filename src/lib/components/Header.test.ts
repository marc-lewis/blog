import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import Header from './Header.svelte';

// Mock the $app/stores module
vi.mock('$app/stores', () => ({
	page: {
		subscribe: (fn: (value: { url: { pathname: string } }) => void) => {
			fn({ url: { pathname: '/' } });
			return () => {};
		}
	}
}));

describe('Header', () => {
	describe('and when it renders', () => {
		beforeEach(() => {
			render(Header);
		});

		it('should render without errors', () => {
			expect(screen.getByRole('navigation')).toBeInTheDocument();
		});

		it('should display the site name', () => {
			expect(screen.getByText('marclewis.io')).toBeInTheDocument();
		});

		it('should have a link to the homepage', () => {
			const homeLink = screen.getByRole('link', { name: 'marclewis.io' });
			expect(homeLink).toHaveAttribute('href', '/');
		});
	});

	describe('and when navigation links are rendered', () => {
		beforeEach(() => {
			render(Header);
		});

		it('should have a home link', () => {
			const links = screen.getAllByRole('link');
			const homeLink = links.find((link) => link.textContent === 'home');
			expect(homeLink).toBeInTheDocument();
			expect(homeLink).toHaveAttribute('href', '/');
		});

		it('should have a blog link', () => {
			const links = screen.getAllByRole('link');
			const blogLink = links.find((link) => link.textContent === 'blog');
			expect(blogLink).toBeInTheDocument();
			expect(blogLink).toHaveAttribute('href', '/blog');
		});

		it('should have an about link', () => {
			const links = screen.getAllByRole('link');
			const aboutLink = links.find((link) => link.textContent === 'about');
			expect(aboutLink).toBeInTheDocument();
			expect(aboutLink).toHaveAttribute('href', '/about');
		});
	});

	describe('and when the header has styling', () => {
		beforeEach(() => {
			render(Header);
		});

		it('should have a bottom border', () => {
			const header = screen.getByRole('banner');
			expect(header).toHaveClass('border-b', 'border-black');
		});
	});
});
