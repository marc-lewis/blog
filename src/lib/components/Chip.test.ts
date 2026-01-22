import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import { faker } from '@faker-js/faker';
import Chip from './Chip.svelte';

describe('Chip', () => {
	let mockLabel: string;

	beforeEach(() => {
		mockLabel = faker.lorem.word();
	});

	describe('and when it renders without href', () => {
		beforeEach(() => {
			render(Chip, { props: { label: mockLabel } });
		});

		it('should render as a span element', () => {
			const element = screen.getByText(mockLabel);
			expect(element.tagName).toBe('SPAN');
		});

		it('should display the label text', () => {
			expect(screen.getByText(mockLabel)).toBeInTheDocument();
		});

		it('should have the correct styling classes', () => {
			const element = screen.getByText(mockLabel);
			expect(element).toHaveClass('border', 'border-black', 'text-xs', 'italic');
		});
	});

	describe('and when it renders with href', () => {
		let mockHref: string;

		beforeEach(() => {
			mockHref = faker.internet.url();
			render(Chip, { props: { label: mockLabel, href: mockHref } });
		});

		it('should render as an anchor element', () => {
			const element = screen.getByText(mockLabel);
			expect(element.tagName).toBe('A');
		});

		it('should have the correct href attribute', () => {
			const element = screen.getByText(mockLabel);
			expect(element).toHaveAttribute('href', mockHref);
		});

		it('should display the label text', () => {
			expect(screen.getByText(mockLabel)).toBeInTheDocument();
		});

		it('should have hover styles', () => {
			const element = screen.getByText(mockLabel);
			expect(element).toHaveClass('hover:bg-black', 'hover:text-white');
		});
	});
});
