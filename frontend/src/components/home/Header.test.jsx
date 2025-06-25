import React from 'react';
import { render, screen } from '@testing-library/react';
import Header from './Header';

describe('Header Component', () => {
  it('renders the main title', () => {
    render(<Header />);

    // Check for the main title
    const titleElement = screen.getByText(/Welcome to My App/i);
    expect(titleElement).toBeInTheDocument();
  });
});
