
 
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import MessagingScreen from '../MessagingScreen';
import { auth, firestore } from '../firebaseConfig';
import { doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';

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
  onSnapshot: jest.fn(),
}));

const mockNavigation = { navigate: jest.fn() };
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
    onSnapshot.mockImplementation((_, callback) => {
      callback({
        exists: () => true,
        data: () => ({
          matches: [
            {
              id: 'match1',
              chats: [{ id: 'msg1', text: 'Hello', senderId: 'user1' }],
            },
          ],
        }),
      });
      return jest.fn();
    });
 
    const { getByText } = render(<MessagingScreen route={mockRoute} navigation={mockNavigation} />);
 
    await waitFor(() => {
      expect(getByText('Hello')).toBeTruthy();
    });
  });
 
  it('handles incomplete user data', async () => {
    onSnapshot.mockImplementation((_, callback) => {
      callback({
        exists: () => true,
        data: () => ({
          matches: [{ id: 'match1', chats: [{ id: 'msg1', text: 'Hello' }] }],
        }),
      });
      return jest.fn();
    });
 
    const { getByText } = render(<MessagingScreen route={mockRoute} navigation={mockNavigation} />);
 
    await waitFor(() => {
      expect(getByText('Hello')).toBeTruthy();
    });
  });

  it('sends a new message and updates DB', async () => {
    doc.mockImplementation(() => ({ id: 'mockId' }));

    getDoc.mockImplementation(() =>
      Promise.resolve({
        exists: () => true,
        data: () => ({
          matches: [{ id: 'match1', chats: [] }],
        }),
      })
    );

    const { getByPlaceholderText, getByText } = render(<MessagingScreen route={mockRoute} navigation={mockNavigation} />);

    fireEvent.changeText(getByPlaceholderText('Type a message'), 'New message');
    const sendButton = getByText('Send');
    fireEvent.press(sendButton);

    await waitFor(() => {
      console.log('Calls to updateDoc:', updateDoc.mock.calls);
      expect(updateDoc).toHaveBeenCalledWith(
        { id: 'mockId' }, 
        { matches: expect.any(Array) }
      );
      expect(updateDoc).toHaveBeenCalledWith(
        { id: 'mockId' }, 
        { matches: expect.any(Array) }
      );
    });
  });
});