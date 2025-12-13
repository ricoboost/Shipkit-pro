/**
 * RPC Router
 * Re-exports all server actions for type-safe API calls
 */

// Export all server actions
export * from './actions';

// Export schemas and types for client-side validation
export { schemas, responses } from './index';
export type {
  PaginationInput,
  IdInput,
  UserCreateInput,
  UserUpdateInput,
  OrganizationCreateInput,
  OrganizationUpdateInput,
  InvitationCreateInput,
  AIChatInput,
  AICompletionInput,
  SubscriptionCreateInput,
  ApiKeyCreateInput,
} from './index';
