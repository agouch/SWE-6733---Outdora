import React from 'react';
import { render, waitFor, screen } from '@testing-library/react-native';
import MatchingScreen from '../MatchingScreen';
import { NavigationContainer } from '@react-navigation/native';
import { getDoc } from 'firebase/firestore';

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
  arrayUnion: jest.fn(),
  arrayRemove: jest.fn(),
}));

const mockNavigation = { navigate: jest.fn() };

const renderWithNavigation = (component) => {
  return render(
    <NavigationContainer>
      {component}
    </NavigationContainer>
  );
};

describe('MatchingScreen', () => {
  beforeEach(() => { 
    jest.clearAllMocks();
  });

  it('renders correctly', async () => {
    const { getByText } = renderWithNavigation(<MatchingScreen navigation={mockNavigation} />);
    await waitFor(() => {
      expect(getByText('Matches')).toBeTruthy();
    });
  });

  it('displays loading indicator while fetching matches', () => {
    const { getByText } = renderWithNavigation(<MatchingScreen navigation={mockNavigation} />);
    expect(getByText('Loading...')).toBeTruthy();
  });

  it('handles no matches found', async () => {
    getDoc.mockResolvedValueOnce({
      exists: () => true,
      data: () => ({
        matches: [],
      }),
    });

    const { getByText } = renderWithNavigation(<MatchingScreen navigation={mockNavigation} />);
    await waitFor(() => {
      expect(getByText('No potential matches found')).toBeTruthy();
    });
  });

  it('displays error if no user data in match', async () => {
    const potentialMatches = [
      {
        firstname: '',
        lastname: '',
        age: null,
        username: '',
        gender: '',
        imageUrl: '',
        distance: null,
        instagramUsername: '',
      },
    ];

    render(
      <NavigationContainer>
        <MatchingScreen potentialMatches={potentialMatches} fetchPotentialMatches={() => {}} />
      </NavigationContainer>
    );

    await waitFor(() => {
      expect(screen.getByText('No potential matches found')).toBeTruthy();
    });
  });

  it('does not display Refresh Matches button if no potential matches', async () => {
    getDoc.mockResolvedValueOnce({
      exists: () => true,
      data: () => ({
        matches: [],
      }),
    });

    const { queryByText } = renderWithNavigation(<MatchingScreen navigation={mockNavigation} />);
    await waitFor(() => {
      expect(queryByText('Refresh Matches')).toBeNull();
    });
  });
});
