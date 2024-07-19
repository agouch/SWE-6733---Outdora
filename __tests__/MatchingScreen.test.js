import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import MatchingScreen from '../MatchingScreen';
import { collection, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth } from '../firebaseConfig';

// Mock the dependencies
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'unique-id'),
}));

jest.mock('../firebaseConfig', () => ({
  auth: {
    currentUser: { uid: 'user1' },
  },
  firestore: {},
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  getDocs: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  updateDoc: jest.fn(),
}));

const mockNavigation = { navigate: jest.fn() };

describe('MatchingScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', async () => {
    const { getByText } = render(<MatchingScreen navigation={mockNavigation} />);
    await waitFor(() => {
      expect(getByText('Matches')).toBeTruthy();
    });
  });

  it('fetches and displays matches correctly', async () => {
    getDoc.mockResolvedValueOnce({
      exists: () => true,
      data: () => ({
        matches: [{ id: 'unique-id', username: 'testuser' }],
      }),
    });

    const { getByText } = render(<MatchingScreen navigation={mockNavigation} />);

    await waitFor(() => {
      expect(getByText('Username: testuser')).toBeTruthy();
    });
  });


  it('handles no matches found', async () => {
    getDoc.mockResolvedValueOnce({
      exists: () => true,
      data: () => ({
        matches: [],
      }),
    });

    const { getByText } = render(<MatchingScreen navigation={mockNavigation} />);
    await waitFor(() => {
      expect(getByText('No matches found.')).toBeTruthy();
    });
  });

  it('handles duplicate matches', async () => {
    getDoc.mockResolvedValueOnce({
      exists: () => true,
      data: () => ({
        matches: [{ id: 'unique-id1', username: 'testuser' }, { id: 'unique-id2', username: 'testuser' }],
      }),
    });

    const { getByText, queryAllByText } = render(<MatchingScreen navigation={mockNavigation} />);

    await waitFor(() => {
      expect(queryAllByText('Username: testuser').length).toBe(2);
    });
  });

  it('handles incomplete user data', async () => {
    getDoc.mockResolvedValueOnce({
      exists: () => true,
      data: () => ({
        matches: [{ id: 'unique-id' }],
      }),
    });

    const { getByText } = render(<MatchingScreen navigation={mockNavigation} />);

    await waitFor(() => {
      expect(getByText('Username: N/A')).toBeTruthy();
    });
  });
});
