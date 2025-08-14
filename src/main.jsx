import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from './apis/queryClient'; // 분리한 인스턴스 재사용
import App from './App';
import './index.css';

const container = document.getElementById('root');
if (!container) throw new Error('Root element "#root" not found');

const root = ReactDOM.createRoot(container);

root.render(
  <React.StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL || '/'}>
      <QueryClientProvider client={queryClient}>
        <App />
        {import.meta.env.DEV && (
          <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
        )}
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
