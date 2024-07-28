import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import MessageInput from '../MessageInput';

describe('MessageInput', () => {
  it('renders correctly', () => {
    const { getByPlaceholderText } = render(<MessageInput />);
    expect(getByPlaceholderText('Type a message')).toBeTruthy();
  });

  it('calls onSend with the correct message', () => {
    const onSendMock = jest.fn();
    const { getByPlaceholderText, getByText } = render(<MessageInput onSend={onSendMock} />);
    const input = getByPlaceholderText('Type a message');

    fireEvent.changeText(input, 'Hello, world!');
    fireEvent.press(getByText('Send'));

    expect(onSendMock).toHaveBeenCalledWith('Hello, world!');
  });

  it('clears the input field after sending a message', () => {
    const onSendMock = jest.fn();
    const { getByPlaceholderText, getByText } = render(<MessageInput onSend={onSendMock} />);
    const input = getByPlaceholderText('Type a message');

    fireEvent.changeText(input, 'Hello, world!');
    fireEvent.press(getByText('Send'));

    expect(input.props.value).toBe('');
  });

  it('does not call onSend with an empty message', () => {
    const onSendMock = jest.fn();
    const { getByText } = render(<MessageInput onSend={onSendMock} />);

    fireEvent.press(getByText('Send'));

    expect(onSendMock).not.toHaveBeenCalled();
  });

  it('only calls handleSend when there is input text', () => {
    const onSendMock = jest.fn();
    const { getByPlaceholderText, getByText } = render(<MessageInput onSend={onSendMock} />);
    const input = getByPlaceholderText('Type a message');
    const sendButton = getByText('Send');

    fireEvent.press(sendButton);
    expect(onSendMock).not.toHaveBeenCalled();

    fireEvent.changeText(input, 'Hello');
    fireEvent.press(sendButton);
    expect(onSendMock).toHaveBeenCalledWith('Hello');
  });

  it('displays placeholder text correctly', () => {
    const { getByPlaceholderText } = render(<MessageInput />);
    const input = getByPlaceholderText('Type a message');
    expect(input.props.placeholder).toBe('Type a message');
  });

  it('handles input changes correctly', () => {
    const { getByPlaceholderText } = render(<MessageInput />);
    const input = getByPlaceholderText('Type a message');
    fireEvent.changeText(input, 'New message');
    expect(input.props.value).toBe('New message');
  });

  it('sets the correct keyboard appearance', () => {
    const { getByPlaceholderText } = render(<MessageInput />);
    const input = getByPlaceholderText('Type a message');
    expect(input.props.keyboardAppearance).toBe('light');
  });
});
