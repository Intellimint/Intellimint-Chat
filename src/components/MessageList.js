import React, { useRef, useEffect, memo, useState } from 'react';
import styled from 'styled-components';
import EnhancedMessage from './MessageHelper';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-jsx';


const MessageListContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100vh - 60px);
  overflow-y: auto;
  padding: 20px;
  max-width: 100%;
  box-sizing: border-box;
`;

const MessageWrapper = styled.div`
  display: flex;
  justify-content: ${props => (props.isUser ? 'flex-end' : 'flex-start')};
  margin-bottom: 10px;
  width: 100%;
`;

const Message = styled.div`
  background-color: ${props => (props.isUser ? props.theme.colors.mutedGreen : props.theme.colors.primary)};
  color: ${props => props.theme.colors.text};
  padding: 10px 15px;
  border-radius: 20px;
  max-width: 80%;
  word-wrap: break-word;
  overflow-wrap: break-word;
  white-space: pre-wrap;
  box-sizing: border-box;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  line-height: 1.4;
  font-size: 1rem;
`;

const CodeBlockWrapper = styled.div`
  position: relative;
  margin-top: 10px;
  margin-bottom: 10px;
`;

const CodeBlock = styled.pre`
  background-color: #2d2d2d;
  border-radius: 4px;
  padding: 10px;
  margin: 10px 0;
  font-family: 'Fira code', 'Fira Mono', monospace;
  font-size: 14px;
  white-space: pre;
  word-break: normal;
  overflow-wrap: normal;
  max-width: 100%;
  overflow-x: auto;
  box-sizing: border-box;
  display: grid;
  grid-template-columns: 40px 1fr; /* Line number column and code column */
  grid-gap: 10px;

  code {
    display: block;
    line-height: 1.5;
  }
`;

const LineNumber = styled.span`
  text-align: right;
  color: rgba(255, 255, 255, 0.4);
  user-select: none; /* Prevent copying line numbers */
`;

const CodeContent = styled.code`
  white-space: pre-wrap;
`;

const CopyButton = styled.button`
  position: absolute;
  top: 5px;
  right: 5px;
  background: transparent;
  border: none;
  color: #fff;
  cursor: pointer;
  font-size: 0.8rem;
  padding: 5px;
  opacity: 0.7;
  transition: opacity 0.2s;

  &:hover {
    opacity: 1;
  }
`;

const MemoizedMessage = memo(({ content, isUser }) => {
  const [copiedIndex, setCopiedIndex] = useState(null);

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000); // Reset after 2 seconds
    });
  };

  const formatContent = (text) => {
    try {
      const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
      const boldTextRegex = /\*\*(.*?)\*\*/g;
      const parts = [];
      let lastIndex = 0;
      let match;
      let codeBlockIndex = 0;

      // Handle code blocks
      while ((match = codeBlockRegex.exec(text)) !== null) {
        if (match.index > lastIndex) {
          const nonCodeBlockText = text.slice(lastIndex, match.index);

          // Handle bold text within non-code parts
          const nonCodeWithBold = nonCodeBlockText.split(boldTextRegex).map((part, index) => {
            if (index % 2 === 1) {
              return <strong key={`bold-${index}`}>{part}</strong>;
            }
            return part;
          });
          parts.push(<div key={lastIndex}>{nonCodeWithBold}</div>);
        }

        const language = match[1] || 'text';
        const code = match[2].trim();

        const highlightedCode = Prism.languages[language]
          ? Prism.highlight(code, Prism.languages[language], language)
          : code;

        const codeLines = highlightedCode.split('\n').map((line, index) => (
          <React.Fragment key={index}>
            <LineNumber>{index + 1}</LineNumber>
            <CodeContent dangerouslySetInnerHTML={{ __html: line }} />
          </React.Fragment>
        ));

        parts.push(
          <CodeBlockWrapper key={match.index}>
            <CopyButton onClick={() => copyToClipboard(code, codeBlockIndex)}>
              {copiedIndex === codeBlockIndex ? "✅ Copied" : "📋 Copy"}
            </CopyButton>
            <CodeBlock>
              {codeLines}
            </CodeBlock>
          </CodeBlockWrapper>
        );

        lastIndex = match.index + match[0].length;
        codeBlockIndex++;
      }

      // Handle remaining non-code text
      if (lastIndex < text.length) {
        const remainingText = text.slice(lastIndex);
        const remainingWithBold = remainingText.split(boldTextRegex).map((part, index) => {
          if (index % 2 === 1) {
            return <strong key={`bold-${index}`}>{part}</strong>;
          }
          return part;
        });
        parts.push(<div key={lastIndex + text.length}>{remainingWithBold}</div>);
      }

      return parts;
    } catch (error) {
      console.error('Error formatting content:', error);
      return <div>{text}</div>;
    }
  };

  return (
    <MessageWrapper isUser={isUser}>
      <Message isUser={isUser}>{formatContent(content)}</Message>
    </MessageWrapper>
  );
});

const MessageList = ({ messages }) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (messages && messages.length) {
      scrollToBottom();
    }
  }, [messages]);

  if (!messages || !Array.isArray(messages)) {
    console.error('Messages prop is invalid');
    return null;
  }

  return (
    <MessageListContainer>
      {messages.map((message, index) => (
        <EnhancedMessage
          key={index}
          content={message.content || 'Message content unavailable'}
          isUser={message.role === 'user'}
        />
      ))}
      <div ref={messagesEndRef} />
    </MessageListContainer>
  );
};

export default memo(MessageList);
