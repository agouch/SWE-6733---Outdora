import React from 'react';
import { render, waitFor, screen } from '@testing-library/react-native';
import MatchingScreen from '../MatchingScreen';
import { NavigationContainer } from '@react-navigation/native';
import { collection, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth } from '../firebaseConfig';

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


  
  /*it('fetches and displays matches correctly', async () => {
    getDoc.mockResolvedValueOnce({
      exists: () => true,
      data: () => ({
        matches: [{ id: 'unique-id', username: 'testuser' }],
      }),
    });

    const { getByText } = renderWithNavigation(<MatchingScreen navigation={mockNavigation} />);

    await waitFor(() => {
      expect(getByText('Username: testuser')).toBeTruthy();
    });
  });
*/

it('renders match card correctly', async () => {
  const potentialMatches = [
    {
      firstname: 'Test',
      lastname: 'User',
      age: 25,
      username: 'testuser',
      gender: 'Female',
      imageUrl: 'https://example.com/image.jpg',
      distance: 10,
      instagramUsername: 'testusergram',
    },
  ];

  // Render the MatchingScreen with NavigationContainer
  render(
    <NavigationContainer>
      <MatchingScreen potentialMatches={potentialMatches} fetchPotentialMatches={() => {}} />
    </NavigationContainer>
  );
  console.log("SCREEN DEBUG:");
  screen.debug();
  // Check if the card is rendered with expected content
  await waitFor(() => {
    expect(screen.getByText('Test User, 25')).toBeTruthy();
    expect(screen.getByText('@testuser')).toBeTruthy();
    expect(screen.getByText('Female')).toBeTruthy();
    expect(screen.getByText('Distance: 10 miles')).toBeTruthy();
    expect(screen.getByText('Instagram: @testusergram')).toBeTruthy();
  });

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

  it('handles duplicate matches', async () => {
    getDoc.mockResolvedValueOnce({
      exists: () => true,
      data: () => ({
        matches: [{ id: 'unique-id1', username: 'testuser' }, { id: 'unique-id2', username: 'testuser' }],
      }),
    });

    const { getByText, queryAllByText } = renderWithNavigation(<MatchingScreen navigation={mockNavigation} />);

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

    const { getByText } = renderWithNavigation(<MatchingScreen navigation={mockNavigation} />);

    await waitFor(() => {
      expect(getByText('Username: N/A')).toBeTruthy();
    });
  });
});
