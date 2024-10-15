import React from 'react';
import styled from 'styled-components';
import { ThemeProvider } from 'styled-components';
import theme from './theme'; // Ensure the path is correct
import ChatWindow from './components/ChatWindow';
import './App.css'; // Import the CSS for global styles

// Import desired languages for syntax highlighting with Prism.js
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-jsx';
// Add more languages as needed

// Create containers for flex layout
const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  max-width: 100vw;
  overflow-x: hidden;
`;

const ChatContainer = styled.div`
  flex: 1;
  max-width: 100%;
  overflow-x: hidden;
`;

function App() {
  return (
    <ThemeProvider theme={theme}>
      <AppContainer>
        <ChatContainer>
          <ChatWindow />
        </ChatContainer>
      </AppContainer>
    </ThemeProvider>
  );
}

export default App;
