import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Test component to use the AuthContext
const TestComponent = () => {
  const { user, isAuthenticated, login, logout, token } = useAuth();

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    role: 'USER',
  };

  return (
    <div>
      <div data-testid="auth-status">
        {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
      </div>
      <div data-testid="user-info">
        {user ? user.email : 'No User'}
      </div>
      <div data-testid="token-info">
        {token ? 'Has Token' : 'No Token'}
      </div>
      <button
        data-testid="login-btn"
        onClick={() => login('mock-token', mockUser)}
      >
        Login
      </button>
      <button data-testid="logout-btn" onClick={logout}>
        Logout
      </button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    role: 'USER',
  };

  it('starts with unauthenticated state', () => {
    mockLocalStorage.getItem.mockReturnValue(null);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated');
    expect(screen.getByTestId('user-info')).toHaveTextContent('No User');
    expect(screen.getByTestId('token-info')).toHaveTextContent('No Token');
  });

  it('initializes with authenticated state when token and user exist in localStorage', () => {
    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === 'token') return 'existing-token';
      if (key === 'user') return JSON.stringify(mockUser);
      return null;
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
    expect(screen.getByTestId('user-info')).toHaveTextContent('test@example.com');
    expect(screen.getByTestId('token-info')).toHaveTextContent('Has Token');
  });

  it('handles login successfully', () => {
    mockLocalStorage.getItem.mockReturnValue(null);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated');

    fireEvent.click(screen.getByTestId('login-btn'));

    expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
    expect(screen.getByTestId('user-info')).toHaveTextContent('test@example.com');
    expect(screen.getByTestId('token-info')).toHaveTextContent('Has Token');

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('token', 'mock-token');
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(mockUser));
  });

  it('handles logout correctly', () => {
    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === 'token') return 'existing-token';
      if (key === 'user') return JSON.stringify(mockUser);
      return null;
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');

    fireEvent.click(screen.getByTestId('logout-btn'));

    expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated');
    expect(screen.getByTestId('user-info')).toHaveTextContent('No User');
    expect(screen.getByTestId('token-info')).toHaveTextContent('No Token');

    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('token');
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('user');
  });

  it('is not authenticated when only token exists without user', () => {
    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === 'token') return 'existing-token';
      if (key === 'user') return null;
      return null;
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated');
  });

  it('is not authenticated when only user exists without token', () => {
    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === 'token') return null;
      if (key === 'user') return JSON.stringify(mockUser);
      return null;
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated');
  });

  it('throws error when useAuth is used outside provider', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useAuth must be used within an AuthProvider');

    consoleError.mockRestore();
  });
}); 