/**
 * Custom hooks for API calls using React Query
 * Provides type-safe, cached, and reactive API interactions
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from '@/hooks/use-toast';

interface ApiResponse {
  success: boolean;
  message?: string;
}

interface ApiErrorResponse {
  message: string;
}

// Contact form mutation
export function useContactForm() {
  return useMutation({
    mutationFn: api.submitContact,
    onSuccess: (data: ApiResponse) => {
      toast({
        title: 'Success!',
        description: data.message || 'Thank you for contacting us. We\'ll get back to you soon!',
      });
    },
    onError: (error: ApiErrorResponse) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit form. Please try again.',
        variant: 'destructive',
      });
    },
  });
}

// Newsletter subscription mutation
export function useNewsletterSubscription() {
  return useMutation({
    mutationFn: api.subscribe,
    onSuccess: (data: ApiResponse) => {
      toast({
        title: 'Subscribed!',
        description: data.message || 'You\'ve been successfully subscribed to our newsletter.',
      });
    },
    onError: (error: ApiErrorResponse) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to subscribe. Please try again.',
        variant: 'destructive',
      });
    },
  });
}

// Reseller application mutation
export function useResellerApplication() {
  return useMutation({
    mutationFn: api.applyReseller,
    onSuccess: (data: ApiResponse) => {
      toast({
        title: 'Application Submitted!',
        description: data.message || 'We\'ll review your application and get back to you within 2 business days.',
      });
    },
    onError: (error: ApiErrorResponse) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit application. Please try again.',
        variant: 'destructive',
      });
    },
  });
}

// Sign up mutation
export function useSignUp() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: api.signUp,
    onSuccess: (data: ApiResponse) => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      toast({
        title: 'Welcome!',
        description: data.message || 'Your account has been created successfully.',
      });
    },
    onError: (error: ApiErrorResponse) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create account. Please try again.',
        variant: 'destructive',
      });
    },
  });
}

// Get pricing query
export function usePricing() {
  return useQuery({
    queryKey: ['pricing'],
    queryFn: api.getPricing,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Get stats query
export function useStats() {
  return useQuery({
    queryKey: ['stats'],
    queryFn: api.getStats,
    staleTime: 1000 * 60, // 1 minute
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
  });
}
