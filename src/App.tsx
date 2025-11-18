import { type ComponentProps, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Analytics } from '@/components/Analytics';
import { LiveChat } from '@/components/LiveChat';
import { AIChatbot } from '@/components/AIChatbot';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { initSentry } from '@/lib/sentry';
import { env } from '@/config/env';
import './App.css';

// Initialize Sentry error tracking in production
initSentry();

/**
 * Handles chunk load errors by reloading the page once
 * This fixes issues when new builds are deployed and old chunks are removed
 */
const handleLazyLoadError = (error: Error, componentName: string) => {
  const isChunkLoadError =
    error.name === 'ChunkLoadError' ||
    error.message.includes('Failed to fetch dynamically imported module') ||
    error.message.includes('Importing a module script failed');

  if (isChunkLoadError) {
    const hasReloaded = sessionStorage.getItem('chunk_load_retry');

    if (!hasReloaded) {
      console.warn(`[App] Chunk load error detected for ${componentName}, reloading page...`);
      sessionStorage.setItem('chunk_load_retry', 'true');
      window.location.reload();
    } else {
      console.error(`[App] Chunk load error persists for ${componentName} after reload`);
      sessionStorage.removeItem('chunk_load_retry');
    }
  }
  throw error;
};

// Lazy load pages for better performance with chunk error handling
const Index = lazy(() => import('@/pages/Index').catch(err => handleLazyLoadError(err, 'Index')));
const NotFound = lazy(() => import('@/pages/NotFound').catch(err => handleLazyLoadError(err, 'NotFound')));
const Terms = lazy(() => import('@/pages/Terms').catch(err => handleLazyLoadError(err, 'Terms')));
const Privacy = lazy(() => import('@/pages/Privacy').catch(err => handleLazyLoadError(err, 'Privacy')));
const Refund = lazy(() => import('@/pages/Refund').catch(err => handleLazyLoadError(err, 'Refund')));
const Auth = lazy(() => import('@/pages/Auth').catch(err => handleLazyLoadError(err, 'Auth')));
const Dashboard = lazy(() => import('@/pages/Dashboard').catch(err => handleLazyLoadError(err, 'Dashboard')));
const ResellerDashboard = lazy(() => import('@/pages/ResellerDashboard').catch(err => handleLazyLoadError(err, 'ResellerDashboard')));
const AdminDashboard = lazy(() => import('@/pages/AdminDashboard').catch(err => handleLazyLoadError(err, 'AdminDashboard')));
const BotChat = lazy(() => import('@/pages/BotChat').catch(err => handleLazyLoadError(err, 'BotChat')));
const EnvCheck = lazy(() => import('@/pages/EnvCheck').catch(err => handleLazyLoadError(err, 'EnvCheck')));

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

type ChatbotBusinessType = NonNullable<ComponentProps<typeof AIChatbot>['businessType']>;

const SUPPORTED_BUSINESS_TYPES: ReadonlyArray<ChatbotBusinessType> = [
  'ecommerce',
  'saas',
  'realestate',
  'healthcare',
  'education',
  'hospitality',
  'finance',
  'support',
];

const DEFAULT_BUSINESS_TYPE: ChatbotBusinessType = 'support';

const isChatbotBusinessType = (value: string): value is ChatbotBusinessType =>
  SUPPORTED_BUSINESS_TYPES.includes(value as ChatbotBusinessType);

const businessType: ChatbotBusinessType = isChatbotBusinessType(env.businessType)
  ? env.businessType
  : DEFAULT_BUSINESS_TYPE;

function App() {
  // Clear chunk reload flag after successful app load
  if (sessionStorage.getItem('chunk_load_retry')) {
    // Wait a bit to ensure the app is fully loaded before clearing
    setTimeout(() => {
      sessionStorage.removeItem('chunk_load_retry');
    }, 1000);
  }

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router>
          <Analytics />
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/reseller" element={<ResellerDashboard />} />
              <Route path="/reseller-dashboard" element={<Navigate to="/reseller" replace />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/bot/:botId/chat" element={<BotChat />} />
              <Route path="/env-check" element={<EnvCheck />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/refund" element={<Refund />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          <Toaster />
          <LiveChat />
          <AIChatbot businessType={businessType} />
        </Router>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
