/**
 * RPC Client Hooks
 * Client-side hooks for server actions with React Query
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as actions from './actions';

/**
 * Query keys for cache management
 */
export const queryKeys = {
  user: {
    current: ['user', 'current'] as const,
    list: (params?: { search?: string; page?: number }) =>
      ['users', 'list', params] as const,
  },
  organization: {
    list: ['organizations', 'list'] as const,
    detail: (id: string) => ['organizations', 'detail', id] as const,
    members: (id: string) => ['organizations', 'members', id] as const,
  },
  ai: {
    usage: (page?: number) => ['ai', 'usage', page] as const,
  },
  credits: {
    balance: ['credits', 'balance'] as const,
    history: (page?: number) => ['credits', 'history', page] as const,
  },
  subscription: {
    current: ['subscription', 'current'] as const,
  },
  apiKey: {
    list: ['apiKeys', 'list'] as const,
  },
};

// ============================================
// User Hooks
// ============================================

export function useCurrentUser() {
  return useQuery({
    queryKey: queryKeys.user.current,
    queryFn: () => actions.getCurrentUser(),
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: actions.updateCurrentUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.current });
    },
  });
}

export function useUsers(params?: { search?: string; page?: number }) {
  return useQuery({
    queryKey: queryKeys.user.list(params),
    queryFn: () => actions.listUsers({ page: params?.page ?? 1, limit: 20, search: params?.search }),
  });
}

// ============================================
// Organization Hooks
// ============================================

export function useOrganizations() {
  return useQuery({
    queryKey: queryKeys.organization.list,
    queryFn: () => actions.listOrganizations(),
  });
}

export function useOrganization(id: string) {
  return useQuery({
    queryKey: queryKeys.organization.detail(id),
    queryFn: () => actions.getOrganization({ id }),
    enabled: !!id,
  });
}

export function useCreateOrganization() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: actions.createOrganization,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.organization.list });
    },
  });
}

export function useUpdateOrganization() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: actions.updateOrganization,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.organization.list });
      queryClient.invalidateQueries({ queryKey: queryKeys.organization.detail(variables.id) });
    },
  });
}

export function useDeleteOrganization() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: actions.deleteOrganization,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.organization.list });
    },
  });
}

export function useInviteToOrganization() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: actions.inviteToOrganization,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.organization.members(variables.id) });
    },
  });
}

export function useOrganizationMembers(id: string) {
  return useQuery({
    queryKey: queryKeys.organization.members(id),
    queryFn: () => actions.listOrganizationMembers({ id }),
    enabled: !!id,
  });
}

// ============================================
// AI Hooks
// ============================================

export function useAIChat() {
  return useMutation({
    mutationFn: actions.aiChat,
  });
}

export function useAICompletion() {
  return useMutation({
    mutationFn: actions.aiCompletion,
  });
}

export function useAIUsageHistory(page: number = 1) {
  return useQuery({
    queryKey: queryKeys.ai.usage(page),
    queryFn: () => actions.getAIUsageHistory({ page, limit: 20 }),
  });
}

// ============================================
// Credits Hooks
// ============================================

export function useCreditsBalance() {
  return useQuery({
    queryKey: queryKeys.credits.balance,
    queryFn: () => actions.getCreditsBalance(),
  });
}

export function useCreditsHistory(page: number = 1) {
  return useQuery({
    queryKey: queryKeys.credits.history(page),
    queryFn: () => actions.getCreditsHistory({ page, limit: 20 }),
  });
}

// ============================================
// Subscription Hooks
// ============================================

export function useCurrentSubscription() {
  return useQuery({
    queryKey: queryKeys.subscription.current,
    queryFn: () => actions.getCurrentSubscription(),
  });
}

export function useCreateCheckout() {
  return useMutation({
    mutationFn: actions.createCheckoutSession,
  });
}

export function useCreateBillingPortal() {
  return useMutation({
    mutationFn: actions.createBillingPortalSession,
  });
}

// ============================================
// API Key Hooks
// ============================================

export function useApiKeys() {
  return useQuery({
    queryKey: queryKeys.apiKey.list,
    queryFn: () => actions.listApiKeys(),
  });
}

export function useCreateApiKey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: actions.createApiKey,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.apiKey.list });
    },
  });
}

export function useDeleteApiKey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: actions.deleteApiKey,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.apiKey.list });
    },
  });
}
