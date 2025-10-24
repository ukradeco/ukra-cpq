import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './contexts/AuthContext'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// إنشاء مثيل من QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 دقائق
      refetchOnWindowFocus: false,
    },
  },
})

console.log('Starting application...');
const rootElement = document.getElementById('root');
console.log('Root element found:', rootElement);

if (!rootElement) {
  throw new Error('Root element not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
)
