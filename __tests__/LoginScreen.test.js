import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import LoginScreen from '../LoginScreen';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import * as Google from 'expo-auth-session/providers/google';

jest.mock('../firebaseConfig', () => ({
  auth: {},
  firestore: {},
}));

jest.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: jest.fn(),
  GoogleAuthProvider: {
    credential: jest.fn(),
  },
  signInWithCredential: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  setDoc: jest.fn(),
  getDoc: jest.fn(),
}));

jest.mock('expo-auth-session/providers/google', () => ({
  useAuthRequest: jest.fn(() => [
    null,
    { type: 'success', params: { id_token: 'fake_token' } },
    jest.fn().mockResolvedValue({ type: 'success', params: { id_token: 'fake_token' } })
  ]),
}));

const mockNavigation = { navigate: jest.fn() };

describe('LoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { getByTestId, getByText } = render(<LoginScreen navigation={mockNavigation} />);

    expect(getByTestId('email-input')).toBeTruthy();
    expect(getByTestId('password-input')).toBeTruthy();
    expect(getByTestId('login-button')).toBeTruthy();
    expect(getByTestId('google-login-button')).toBeTruthy();
    expect(getByTestId('register-button')).toBeTruthy();
    expect(getByText('Continue with Email')).toBeTruthy();
    expect(getByText('Continue with Google')).toBeTruthy();
    expect(getByText('Register')).toBeTruthy();
  });

  it('updates email state when email input changes', () => {
    const { getByTestId } = render(<LoginScreen navigation={mockNavigation} />);
    fireEvent.changeText(getByTestId('email-input'), 'test@example.com');
    expect(getByTestId('email-input').props.value).toBe('test@example.com');
  });

  it('updates password state when password input changes', () => {
    const { getByTestId } = render(<LoginScreen navigation={mockNavigation} />);
    fireEvent.changeText(getByTestId('password-input'), 'password123');
    expect(getByTestId('password-input').props.value).toBe('password123');
  });

  it('toggles password visibility when eye icon is pressed', () => {
    const { getByTestId } = render(<LoginScreen navigation={mockNavigation} />);
    const passwordInput = getByTestId('password-input');
    const toggleButton = getByTestId('password-visibility-toggle');

    expect(passwordInput.props.secureTextEntry).toBe(true);
    fireEvent.press(toggleButton);
    expect(passwordInput.props.secureTextEntry).toBe(false);
  });

  it('handles email/password login', async () => {
    signInWithEmailAndPassword.mockResolvedValue({ user: { uid: '123' } });
    getDoc.mockResolvedValue({ exists: () => false });

    const { getByTestId } = render(<LoginScreen navigation={mockNavigation} />);

    fireEvent.changeText(getByTestId('email-input'), 'test@example.com');
    fireEvent.changeText(getByTestId('password-input'), 'password123');
    fireEvent.press(getByTestId('login-button'));

    await waitFor(() => {
      expect(signInWithEmailAndPassword).toHaveBeenCalledWith({}, 'test@example.com', 'password123');
      expect(mockNavigation.navigate).toHaveBeenCalledWith('Home');
    });
  });

  it('handles Google login', async () => {
    const mockResponse = { type: 'success', params: { id_token: 'fake_token' } };
    GoogleAuthProvider.credential.mockReturnValue('fake_credential');
    signInWithCredential.mockResolvedValue({ user: { uid: '123', email: 'test@example.com', displayName: 'Test User' } });
    getDoc.mockResolvedValue({ exists: () => false });
  
    const { getByTestId } = render(<LoginScreen navigation={mockNavigation} />);
    await act(async () => {

      fireEvent.press(getByTestId('google-login-button'));
  
      const { useAuthRequest } = require('expo-auth-session/providers/google');
      const [,, promptAsync] = useAuthRequest.mock.results[0].value;
      await promptAsync();
    });
  
    await waitFor(() => {
      expect(GoogleAuthProvider.credential).toHaveBeenCalledWith('fake_token');
      expect(signInWithCredential).toHaveBeenCalled();
      expect(mockNavigation.navigate).toHaveBeenCalledWith('Home');
    });
  });

  it('navigates to Register screen when Register button is pressed', () => {
    const { getByTestId } = render(<LoginScreen navigation={mockNavigation} />);
    fireEvent.press(getByTestId('register-button'));
    expect(mockNavigation.navigate).toHaveBeenCalledWith('Register');
  });

  it('displays error message for invalid email', async () => {
    signInWithEmailAndPassword.mockRejectedValue({ code: 'auth/invalid-email' });
    const { getByTestId, findByText } = render(<LoginScreen navigation={mockNavigation} />);

    fireEvent.changeText(getByTestId('email-input'), 'invalid-email');
    fireEvent.changeText(getByTestId('password-input'), 'password123');
    fireEvent.press(getByTestId('login-button'));

    expect(await findByText('Invalid email address')).toBeTruthy();
  });

  it('displays error message for user-disabled account', async () => {
    signInWithEmailAndPassword.mockRejectedValue({ code: 'auth/user-disabled' });
    const { getByTestId, findByText } = render(<LoginScreen navigation={mockNavigation} />);

    fireEvent.changeText(getByTestId('email-input'), 'disabled@example.com');
    fireEvent.changeText(getByTestId('password-input'), 'password123');
    fireEvent.press(getByTestId('login-button'));

    expect(await findByText('User account is disabled')).toBeTruthy();
  });

  it('displays error message for user not found', async () => {
    signInWithEmailAndPassword.mockRejectedValue({ code: 'auth/user-not-found' });
    const { getByTestId, findByText } = render(<LoginScreen navigation={mockNavigation} />);

    fireEvent.changeText(getByTestId('email-input'), 'notfound@example.com');
    fireEvent.changeText(getByTestId('password-input'), 'password123');
    fireEvent.press(getByTestId('login-button'));

    expect(await findByText('No user found with this email')).toBeTruthy();
  });

  it('creates user profile if it does not exist', async () => {
    signInWithEmailAndPassword.mockResolvedValue({ user: { uid: '123', email: 'new@example.com' } });
    getDoc.mockResolvedValue({ exists: () => false });

    const { getByTestId } = render(<LoginScreen navigation={mockNavigation} />);

    fireEvent.changeText(getByTestId('email-input'), 'new@example.com');
    fireEvent.changeText(getByTestId('password-input'), 'password123');
    fireEvent.press(getByTestId('login-button'));

    await waitFor(() => {
      expect(setDoc).toHaveBeenCalled();
      expect(mockNavigation.navigate).toHaveBeenCalledWith('Home');
    });
  });
});