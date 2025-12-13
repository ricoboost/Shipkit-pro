/**
 * Auth Provider Types
 * Unified types for all auth providers (NextAuth, Supabase, Better Auth)
 */

export type AuthProvider = 'nextauth' | 'supabase' | 'betterauth';

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  image?: string;
  role: 'USER' | 'ADMIN';
  emailVerified?: Date;
  provider: AuthProvider;
}

export interface ImpersonationData {
  isImpersonating: boolean;
  impersonatedBy?: {
    id: string;
    email: string;
    name?: string;
  };
  originalUserId?: string;
}

export interface AuthSession {
  user: AuthUser;
  accessToken?: string;
  expiresAt: Date;
  impersonation?: ImpersonationData;
}

export interface SignInOptions {
  email: string;
  password?: string;
  provider?: 'google' | 'github' | 'discord';
  redirectTo?: string;
}

export interface SignUpOptions {
  email: string;
  password: string;
  name?: string;
  referralCode?: string;
  metadata?: Record<string, unknown>;
}

export interface ResetPasswordOptions {
  email: string;
}

export interface UpdatePasswordOptions {
  currentPassword?: string;
  newPassword: string;
}

export interface AuthProviderInterface {
  // Session management
  getSession(): Promise<AuthSession | null>;
  getUser(): Promise<AuthUser | null>;

  // Authentication
  signIn(options: SignInOptions): Promise<{ url?: string; error?: string }>;
  signUp(options: SignUpOptions): Promise<{ user?: AuthUser; error?: string }>;
  signOut(): Promise<void>;

  // OAuth
  signInWithOAuth(provider: string): Promise<{ url: string; error?: string }>;

  // Password management
  resetPassword(options: ResetPasswordOptions): Promise<{ error?: string }>;
  updatePassword(options: UpdatePasswordOptions): Promise<{ error?: string }>;

  // Email verification
  verifyEmail(token: string): Promise<{ error?: string }>;
  resendVerification(email: string): Promise<{ error?: string }>;
}

// Type guard for auth provider
export function isValidAuthProvider(provider: string): provider is AuthProvider {
  return ['nextauth', 'supabase', 'betterauth'].includes(provider);
}
