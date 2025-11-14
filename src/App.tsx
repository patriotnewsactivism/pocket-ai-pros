import { type ComponentProps, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Analytics } from '@/components/Analytics';
import { LiveChat } from '@/components/LiveChat';
import { AIChatbot } from '@/components/AIChatbot';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { env } from '@/config/env';
import './App.css';

// Lazy load pages for better performance
const Index = lazy(() => import('@/pages/Index'));
const NotFound = lazy(() => import('@/pages/NotFound'));
const Terms = lazy(() => import('@/pages/Terms'));
const Privacy = lazy(() => import('@/pages/Privacy'));
const Refund = lazy(() => import('@/pages/Refund'));
const Auth = lazy(() => import('@/pages/Auth'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const ResellerDashboard = lazy(() => import('@/pages/ResellerDashboard'));
const BotChat = lazy(() => import('@/pages/BotChat'));

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
              <Route path="/bot/:botId/chat" element={<BotChat />} />
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
