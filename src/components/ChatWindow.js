import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import AIThinkingIndicator from './AIThinkingIndicator';
import axios from 'axios';

const ChatWindowWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};
  position: relative;
`;

const MessagesWrapper = styled.div`
  flex-grow: 1;
  overflow-y: auto;
  padding: 10px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  box-sizing: border-box;
`;

const ErrorMessage = styled.div`
  background-color: ${props => props.theme.colors.error};
  color: white;
  padding: 10px;
  margin: 10px 0;
  border-radius: 5px;
`;

const ChatWindow = () => {
  const [messages, setMessages] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  console.log('Rendering ChatWindow. isAiThinking:', isAiThinking);

  const scrollToBottom = useCallback(() => {
    console.log('Scrolling to bottom');
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const sendMessage = useCallback(async (content) => {
    console.log('Sending message:', content);
    setError(null); // Clear any previous errors
    try {
      setMessages(prevMessages => {
        console.log('Adding user message to state');
        return [...prevMessages, { role: 'user', content }];
      });
      
      setIsAiThinking(true);
      console.log('Set isAiThinking to true');

      const response = await axios.post('http://localhost:8000/chat', {
        session_id: sessionId,
        message: content
      }, {
        timeout: 500000 // Set a 500-second timeout
      });

      console.log('Received response from server:', response.data);

      if (response.data && response.data.message) {
        setIsAiThinking(false);
        console.log('Set isAiThinking to false');

        setMessages(prevMessages => {
          console.log('Adding AI response to state');
          return [...prevMessages, { role: 'assistant', content: response.data.message }];
        });

        setSessionId(response.data.session_id);
        console.log('Updated session ID:', response.data.session_id);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setIsAiThinking(false);
      console.log('Set isAiThinking to false due to error');
      
      const errorMessage = error.response?.data?.error || error.message || 'An unexpected error occurred';
      setError(`Error: ${errorMessage}`);

      setMessages(prevMessages => {
        console.log('Adding error message to state');
        return [...prevMessages, { role: 'assistant', content: 'I apologize, but I encountered an error. Please try again.' }];
      });
    }
  }, [sessionId]);

  useEffect(() => {
    console.log('Messages or isAiThinking changed. Current state:', { messagesCount: messages.length, isAiThinking });
    scrollToBottom();
  }, [messages, isAiThinking, scrollToBottom]);

  useEffect(() => {
    console.log('Initial render. Setting up chat window.');
    // You can add any initial setup logic here
  }, []);

  return (
    <ChatWindowWrapper>
      <MessagesWrapper>
        <MessageList messages={messages} />
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {isAiThinking && <AIThinkingIndicator />}
        <div ref={messagesEndRef} />
      </MessagesWrapper>
      <MessageInput onSendMessage={sendMessage} disabled={isAiThinking} />
    </ChatWindowWrapper>
  );
};

export default ChatWindow;