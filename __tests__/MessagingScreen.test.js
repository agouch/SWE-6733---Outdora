import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import MessagingScreen from '../MessagingScreen';
import { auth, firestore } from '../firebaseConfig';
import { doc, getDoc, updateDoc, onSnapshot, orderBy, query, collection, addDoc } from 'firebase/firestore';
import { Alert } from 'react-native';

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'unique-id'),
}));

jest.mock('../firebaseConfig', () => ({
  auth: {
    currentUser: { uid: 'user1' },
  },
  firestore: {},
}));

jest.mock('firebase/firestore', () => {
  const originalFirestore = jest.requireActual('firebase/firestore');
  return {
    ...originalFirestore,
    collection: jest.fn(),
    addDoc: jest.fn(),
    getDoc: jest.fn(),
    updateDoc: jest.fn(),
    onSnapshot: jest.fn(),
    orderBy: jest.fn(),
    query: jest.fn(),
    doc: jest.fn(),
  };
});

jest.spyOn(Alert, 'alert');

const mockNavigation = { navigate: jest.fn(), goBack: jest.fn() };
const mockRoute = { params: { matchId: 'match1', recipientId: 'user2' } };

describe('MessagingScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { getByPlaceholderText } = render(<MessagingScreen route={mockRoute} navigation={mockNavigation} />);
    expect(getByPlaceholderText('Type a message')).toBeTruthy();
  });

  it('displays messages correctly', async () => {
    onSnapshot.mockImplementation((query, callback) => {
      callback({
        docs: [
          {
            id: 'msg1',
            data: () => ({ text: 'Hello', senderId: 'user1' }),
          },
        ],
      });
      return jest.fn();
    });

    const { getByText } = render(<MessagingScreen route={mockRoute} navigation={mockNavigation} />);

    await waitFor(() => {
      expect(getByText('Hello')).toBeTruthy();
    });
  });

  it('handles incomplete user data', async () => {
    onSnapshot.mockImplementation((query, callback) => {
      callback({
        docs: [
          {
            id: 'msg1',
            data: () => ({ text: 'Hello' }),
          },
        ],
      });
      return jest.fn();
    });

    const { getByText } = render(<MessagingScreen route={mockRoute} navigation={mockNavigation} />);

    await waitFor(() => {
      expect(getByText('Hello')).toBeTruthy();
    });
  });

  it('triggers the unmatch function', async () => {
    const { getByText } = render(<MessagingScreen route={mockRoute} navigation={mockNavigation} />);
    
    const unmatchButton = getByText('Unmatch');
    fireEvent.press(unmatchButton);
    
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Confirm Unmatch',
        'Are you sure you want to unmatch this person?',
        expect.any(Array),
        { cancelable: false }
      );
    });
  });

  it('should send a message successfully', async () => {
    const text = 'Test message';
    const collectionReference = 'collectionReference';
    
    collection.mockReturnValueOnce(collectionReference);
    addDoc.mockResolvedValueOnce();

    const { getByPlaceholderText, getByText } = render(<MessagingScreen route={mockRoute} navigation={mockNavigation} />);
    
    fireEvent.changeText(getByPlaceholderText('Type a message'), text);
    fireEvent.press(getByText('Send'));

    await waitFor(() => {
      expect(collection).toHaveBeenCalledWith(firestore, 'matches', 'match1', 'messages');
    });
  });
});
