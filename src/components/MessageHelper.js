// MessageHelper.js
import React, { memo, useState } from 'react';
import styled from 'styled-components';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-jsx';

// Styled components for messages and code blocks
const MessageWrapper = styled.div`
  display: flex;
  justify-content: ${props => (props.$isUser ? 'flex-end' : 'flex-start')};
  margin-bottom: 10px;
  width: 100%;
`;

const Message = styled.div`
  background-color: ${props => (props.$isUser ? props.theme.colors.mutedGreen : props.theme.colors.primary)};
  color: ${props => props.theme.colors.text};
  padding: 10px 15px;
  border-radius: 20px;
  max-width: 80%;
  word-wrap: break-word;
  white-space: pre-wrap;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
`;

const CodeBlockWrapper = styled.div`
  position: relative;
  margin-top: 10px;
  margin-bottom: 10px;
`;

const CodeBlock = styled.pre`
  background-color: #2d2d2d;
  border-radius: 4px;
  padding: 10px 10px 10px 3.8em;
  margin: 10px 0;
  font-family: 'Fira code', 'Fira Mono', monospace;
  font-size: 14px;
  line-height: 1.5;
  overflow-x: auto;
  counter-reset: line;

  code {
    display: block;
    position: relative;

    &::before {
      content: counter(line);
      counter-increment: line;
      position: absolute;
      left: -3em;
      width: 2.5em;
      text-align: right;
      color: rgba(255, 255, 255, 0.4);
    }
  }
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

// Styled components for actions
const ActionsWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-top: 5px;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  margin-left: 10px;
  font-size: 16px;
  color: ${props => props.theme.colors.text};
  opacity: 0.7;
  transition: opacity 0.2s;

  &:hover {
    opacity: 1;
  }
`;

// Response actions component
const ResponseActions = ({ content }) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(content).then(() => {
      alert('Response copied to clipboard!');
    });
  };

  const handleThumbsUp = () => {
    console.log('Thumbs up clicked');
    // Implement thumbs up logic here (e.g., save action, analytics)
  };

  const handleThumbsDown = () => {
    console.log('Thumbs down clicked');
    // Implement thumbs down logic here (e.g., feedback submission)
  };

  return (
    <ActionsWrapper>
      <ActionButton onClick={handleCopy} title="Copy full response">
        📋
      </ActionButton>
      <ActionButton onClick={handleThumbsUp} title="Thumbs up">
        👍
      </ActionButton>
      <ActionButton onClick={handleThumbsDown} title="Thumbs down">
        👎
      </ActionButton>
    </ActionsWrapper>
  );
};

// Main component with formatting, code highlighting, and response actions
const EnhancedMessage = memo(({ content, isUser }) => {
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

      // Handle code blocks and bold text
      while ((match = codeBlockRegex.exec(text)) !== null) {
        if (match.index > lastIndex) {
          const nonCodeBlockText = text.slice(lastIndex, match.index);
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

        const highlightedCode = Prism.highlight(
          code,
          Prism.languages[language] || Prism.languages.text,
          language
        );

        parts.push(
          <CodeBlockWrapper key={match.index}>
            <CopyButton onClick={() => copyToClipboard(code, codeBlockIndex)}>
              {copiedIndex === codeBlockIndex ? "✅ Copied" : "📋 Copy"}
            </CopyButton>
            <CodeBlock className={`language-${language}`}>
              <code dangerouslySetInnerHTML={{ __html: highlightedCode }} />
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
    <MessageWrapper $isUser={isUser}>
      <Message $isUser={isUser}>
        {formatContent(content)}
        {/* Show response actions only for non-user messages */}
        {!isUser && <ResponseActions content={content} />}
      </Message>
    </MessageWrapper>
  );
});

export default EnhancedMessage;
