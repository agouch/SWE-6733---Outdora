import React from 'react';
import { render } from '@testing-library/react-native';
import MessageBubble from '../MessageBubble';

describe('MessageBubble', () => {
  it('renders the message text', () => {
    const message = 'Hello, this is a test message';
    const { getByText } = render(<MessageBubble message={message} isSender={true} />);
    expect(getByText(message)).toBeTruthy();
  });

  // Additional simple tests
  it('has the correct font size for message text', () => {
    const message = 'Hello, this is a test message';
    const { getByText } = render(<MessageBubble message={message} isSender={true} />);
    const messageElement = getByText(message);
    const styles = messageElement.props.style;
    expect(styles.fontSize).toBe(16);
  });

});
