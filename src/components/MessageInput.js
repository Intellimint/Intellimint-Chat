import React, { useState } from 'react';
import styled from 'styled-components';

const InputWrapper = styled.div`
  display: flex;
  padding: 10px;
  background-color: ${props => props.theme.colors.inputBackground};
  border-top: none;
  position: fixed;
  bottom: 0;
  width: calc(100% - 20px); /* Adjusted width to account for padding */
  left: 0;
  z-index: 1000;
`;

const Input = styled.input`
  flex-grow: 1;
  padding: 10px;
  font-size: 1.0rem;  /* Adjusted font size to match the rest of the app */
  border-radius: 5px;
  border: 1px solid ${props => props.theme.colors.border};
  background-color: ${props => props.theme.colors.input};  /* Set to dark grey */
  color: ${props => props.theme.colors.text};
  margin-right: 10px;
  outline: none;

  ::placeholder {
    color: ${props => props.theme.colors.text};  /* Placeholder text color */
  }
`;

const SendButton = styled.button`
  padding: 10px 20px;
  font-size: 1.2rem;  /* Match the font size of the input */
  background-color: ${props => props.theme.colors.mutedGreen};
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  white-space: nowrap;
  
  &:hover {
    background-color: ${props => props.theme.colors.hoverGreen};
  }
`;

const MessageInput = ({ onSendMessage }) => {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <InputWrapper>
      <Input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Type your message..."
      />
      <SendButton onClick={handleSend}>Send</SendButton>
    </InputWrapper>
  );
};

export default MessageInput;
