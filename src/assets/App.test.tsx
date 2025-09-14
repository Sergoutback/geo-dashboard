import { describe, it, expect } from 'vitest'; 
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../App';

it('renders Geo Dashboard heading', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: /geo dashboard/i })).toBeInTheDocument();
});
