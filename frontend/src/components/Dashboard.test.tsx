import React from 'react';
import { render, screen } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import Dashboard from './Dashboard';
import { AuthProvider } from '../context/AuthContext';
import { GET_DOCUMENTS_BY_USER_QUERY } from '../graphql/queries';

// Mock the fetch function for file downloads
global.fetch = jest.fn();

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

// Mock window.URL.createObjectURL
Object.defineProperty(window.URL, 'createObjectURL', {
  value: jest.fn(() => 'mock-url'),
});

Object.defineProperty(window.URL, 'revokeObjectURL', {
  value: jest.fn(),
});

describe('Dashboard', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    role: 'USER',
  };

  const mockDocuments = [
    {
      id: 'doc-1',
      title: 'Test Document 1',
      content: 'This is test content 1',
      fileName: 'test1.pdf',
      fileSize: 1024,
      mimeType: 'application/pdf',
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2023-01-01T00:00:00.000Z',
    },
    {
      id: 'doc-2',
      title: 'Test Document 2',
      content: 'This is test content 2',
      fileName: null,
      fileSize: null,
      mimeType: null,
      createdAt: '2023-01-02T00:00:00.000Z',
      updatedAt: '2023-01-02T00:00:00.000Z',
    },
  ];

  const mocks = [
    {
      request: {
        query: GET_DOCUMENTS_BY_USER_QUERY,
      },
      result: {
        data: {
          documentsByUser: mockDocuments,
        },
      },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === 'token') return 'mock-token';
      if (key === 'user') return JSON.stringify(mockUser);
      return null;
    });
  });

  const renderDashboard = () => {
    return render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <AuthProvider>
          <Dashboard />
        </AuthProvider>
      </MockedProvider>
    );
  };

  it('renders without crashing', () => {
    expect(() => renderDashboard()).not.toThrow();
  });

  it('displays the app bar with user email', () => {
    renderDashboard();
    
    expect(screen.getByText(/Document Manager - Welcome test@example.com/)).toBeInTheDocument();
  });

  it('displays the new document button', () => {
    renderDashboard();
    
    expect(screen.getByText('New Document')).toBeInTheDocument();
  });

  it('displays the upload file button', () => {
    renderDashboard();
    
    expect(screen.getByText('Upload File')).toBeInTheDocument();
  });

  it('displays logout button', () => {
    renderDashboard();
    
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    renderDashboard();
    
    // Check for loading indicator
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });
}); 