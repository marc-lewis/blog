import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import Footer from './Footer.svelte';

describe('Footer', () => {
	describe('and when it renders', () => {
		beforeEach(() => {
			render(Footer);
		});

		it('should render without errors', () => {
			expect(screen.getByRole('contentinfo')).toBeInTheDocument();
		});

		it('should have a top border', () => {
			const footer = screen.getByRole('contentinfo');
			expect(footer).toHaveClass('border-t', 'border-black');
		});
	});

	describe('and when displaying the copyright', () => {
		let mockYear: number;

		beforeEach(() => {
			mockYear = 2026;
			vi.useFakeTimers();
			vi.setSystemTime(new Date(mockYear, 0, 22));
			render(Footer);
		});

		afterEach(() => {
			vi.useRealTimers();
		});

		it('should display the current year', () => {
			expect(screen.getByText(new RegExp(mockYear.toString()))).toBeInTheDocument();
		});

		it('should display the copyright notice', () => {
			expect(screen.getByText(/marc lewis/i)).toBeInTheDocument();
		});
	});

	describe('and when rendering social links', () => {
		beforeEach(() => {
			render(Footer);
		});

		it('should have a GitHub link', () => {
			const githubLink = screen.getByRole('link', { name: /github/i });
			expect(githubLink).toHaveAttribute('href', 'https://github.com/marclewis');
			expect(githubLink).toHaveAttribute('target', '_blank');
			expect(githubLink).toHaveAttribute('rel', 'noopener noreferrer');
		});

		it('should have a LinkedIn link', () => {
			const linkedinLink = screen.getByRole('link', { name: /linkedin/i });
			expect(linkedinLink).toHaveAttribute('href', 'https://linkedin.com/in/marclewis');
			expect(linkedinLink).toHaveAttribute('target', '_blank');
			expect(linkedinLink).toHaveAttribute('rel', 'noopener noreferrer');
		});

		it('should have an RSS link', () => {
			const rssLink = screen.getByRole('link', { name: /rss/i });
			expect(rssLink).toHaveAttribute('href', '/rss.xml');
		});
	});
});
