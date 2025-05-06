import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './context/ThemeContext';
const queryClient = new QueryClient();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // <QueryClientProvider client={queryClient}>
  //   <App />
  // </QueryClientProvider>
  <React.StrictMode> {/* Optional but recommended */}
    <QueryClientProvider client={queryClient}>
      <ThemeProvider> {/* Ensure ThemeProvider wraps App */}
        <App />
      </ThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>
);

