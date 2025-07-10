import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

// Mock fetch globally
global.fetch = jest.fn();

// Mock AbortSignal.timeout since it's not available in Jest environment
if (!global.AbortSignal.timeout) {
  global.AbortSignal.timeout = jest.fn(() => {
    const controller = new AbortController();
    return controller.signal;
  });
}

describe('App Component', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    fetch.mockClear();
    if (global.AbortSignal.timeout) {
      global.AbortSignal.timeout.mockClear();
    }
  });

  afterEach(() => {
    // Reset fetch mock after each test
    fetch.mockReset();
  });

  test('renders without crashing', () => {
    // Mock a successful fetch response
    fetch.mockResolvedValueOnce({
      ok: true,
      headers: {
        get: jest.fn().mockReturnValue('application/json'),
        entries: jest.fn().mockReturnValue([['content-type', 'application/json']])
      },
      json: async () => ({ greeting: 'Hello from backend!' })
    });

    render(<App />);
    expect(screen.getByText('Frontend Displaying Backend Data')).toBeInTheDocument();
  });

  test('displays main heading', () => {
    // Mock a successful fetch response
    fetch.mockResolvedValueOnce({
      ok: true,
      headers: {
        get: jest.fn().mockReturnValue('application/json'),
        entries: jest.fn().mockReturnValue([['content-type', 'application/json']])
      },
      json: async () => ({ greeting: 'Hello from backend!' })
    });

    render(<App />);
    expect(screen.getByRole('heading', { name: 'Frontend Displaying Backend Data' })).toBeInTheDocument();
  });

  test('shows loading state initially', () => {
    // Mock a delayed fetch response that never resolves
    fetch.mockImplementationOnce(() => new Promise(() => {}));

    render(<App />);
    // Check that at least one Loading... element exists (could be in paragraph or button)
    const loadingElements = screen.getAllByText('Loading...');
    expect(loadingElements.length).toBeGreaterThan(0);
  });

  test('displays refresh button', async () => {
    // Mock a successful fetch response
    fetch.mockResolvedValueOnce({
      ok: true,
      headers: {
        get: jest.fn().mockReturnValue('application/json'),
        entries: jest.fn().mockReturnValue([['content-type', 'application/json']])
      },
      json: async () => ({ greeting: 'Hello from backend!' })
    });

    render(<App />);
    
    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    const refreshButton = screen.getByRole('button', { name: /refresh data/i });
    expect(refreshButton).toBeInTheDocument();
    expect(refreshButton).not.toBeDisabled();
  });

  test('displays backend data when fetch succeeds', async () => {
    const mockData = {
      greeting: 'Hello from test backend!',
      version: '1.0.0',
      timestamp: '2023-01-01T00:00:00Z'
    };

    // Mock successful fetch
    fetch.mockResolvedValueOnce({
      ok: true,
      headers: {
        get: jest.fn().mockReturnValue('application/json'),
        entries: jest.fn().mockReturnValue([['content-type', 'application/json']])
      },
      json: async () => mockData
    });

    render(<App />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Hello from test backend!')).toBeInTheDocument();
    });

    expect(screen.getByText('1.0.0')).toBeInTheDocument();
  });

  test('displays error when fetch fails', async () => {
    // Mock failed fetch
    fetch.mockRejectedValueOnce(new Error('Network error'));

    render(<App />);

    // Wait for error to appear
    await waitFor(() => {
      expect(screen.getByText(/Error:/)).toBeInTheDocument();
    });

    // Check that the error message appears (could be in error div or debug section)
    const errorElements = screen.getAllByText(/Network error/);
    expect(errorElements.length).toBeGreaterThan(0);
  });

  test('refresh button triggers new fetch', async () => {
    // Mock initial successful fetch
    fetch.mockResolvedValueOnce({
      ok: true,
      headers: {
        get: jest.fn().mockReturnValue('application/json'),
        entries: jest.fn().mockReturnValue([['content-type', 'application/json']])
      },
      json: async () => ({ greeting: 'Initial data' })
    });

    render(<App />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Initial data')).toBeInTheDocument();
    });

    // Mock second fetch for refresh
    fetch.mockResolvedValueOnce({
      ok: true,
      headers: {
        get: jest.fn().mockReturnValue('application/json'),
        entries: jest.fn().mockReturnValue([['content-type', 'application/json']])
      },
      json: async () => ({ greeting: 'Refreshed data' })
    });

    // Click refresh button
    const refreshButton = screen.getByRole('button', { name: /refresh data/i });
    fireEvent.click(refreshButton);

    // Wait for refreshed data
    await waitFor(() => {
      expect(screen.getByText('Refreshed data')).toBeInTheDocument();
    });

    // Verify fetch was called twice (initial + refresh)
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  test('button is disabled during loading', async () => {
    // Mock a delayed fetch response
    let resolvePromise;
    const fetchPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    fetch.mockImplementationOnce(() => fetchPromise);

    render(<App />);

    // Button should be disabled during initial loading
    const refreshButton = screen.getByRole('button');
    expect(refreshButton).toBeDisabled();
    expect(refreshButton).toHaveTextContent('Loading...');

    // Resolve the promise
    resolvePromise({
      ok: true,
      headers: {
        get: jest.fn().mockReturnValue('application/json'),
        entries: jest.fn().mockReturnValue([['content-type', 'application/json']])
      },
      json: async () => ({ greeting: 'Hello!' })
    });

    // Wait for loading to finish
    await waitFor(() => {
      expect(refreshButton).not.toBeDisabled();
      expect(refreshButton).toHaveTextContent('Refresh Data');
    });
  });
}); 