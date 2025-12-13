/**
 * Unified Auth Client
 *
 * Provides a provider-agnostic authentication API that works with NextAuth,
 * Supabase Auth, or Better Auth. Switch providers via the AUTH_PROVIDER
 * environment variable without changing application code.
 *
 * @example
 * ```typescript
 * import { auth } from '@/lib/auth';
 *
 * // Get current session (server-side)
 * const session = await auth.getSession();
 * if (session?.user) {
 *   console.log('Logged in as:', session.user.email);
 * }
 *
 * // Sign in with credentials
 * const result = await auth.signIn({
 *   email: 'user@example.com',
 *   password: 'securepassword',
 * });
 *
 * // Sign in with OAuth
 * const { url } = await auth.signInWithOAuth('google');
 * // Redirect user to url
 * ```
 *
 * @module lib/auth
 */

import {
  AuthProvider,
  AuthProviderInterface,
  AuthSession,
  AuthUser,
  SignInOptions,
  SignUpOptions,
  ResetPasswordOptions,
  UpdatePasswordOptions,
  isValidAuthProvider,
} from './types';

/**
 * Factory functions for lazy-loading auth providers.
 * This reduces bundle size by only loading the configured provider.
 * @internal
 */
const providerFactories: Record<AuthProvider, () => Promise<AuthProviderInterface>> = {
  nextauth: async () => {
    const { NextAuthProvider } = await import('./nextauth');
    return new NextAuthProvider();
  },
  supabase: async () => {
    const { SupabaseAuthProvider } = await import('./supabase');
    return new SupabaseAuthProvider();
  },
  betterauth: async () => {
    const { BetterAuthProvider } = await import('./betterauth');
    return new BetterAuthProvider();
  },
};

/** Cached provider instance for singleton pattern @internal */
let cachedProvider: AuthProviderInterface | null = null;

/**
 * Gets the configured auth provider instance.
 *
 * The provider is determined by the AUTH_PROVIDER environment variable:
 * - `nextauth` (default): Uses NextAuth.js
 * - `supabase`: Uses Supabase Auth
 * - `betterauth`: Uses Better Auth
 *
 * The provider is lazily loaded and cached for subsequent calls.
 *
 * @returns The configured auth provider instance
 * @throws Error if AUTH_PROVIDER is set to an invalid value
 *
 * @example
 * ```typescript
 * const provider = await getAuthProvider();
 * const session = await provider.getSession();
 * ```
 */
export async function getAuthProvider(): Promise<AuthProviderInterface> {
  if (cachedProvider) return cachedProvider;

  const providerName = process.env.AUTH_PROVIDER || 'nextauth';

  if (!isValidAuthProvider(providerName)) {
    throw new Error(
      `Invalid AUTH_PROVIDER: ${providerName}. Must be 'nextauth', 'supabase', or 'betterauth'.`
    );
  }

  cachedProvider = await providerFactories[providerName]();
  return cachedProvider;
}

/**
 * Unified authentication API object.
 *
 * Provides convenient methods for common auth operations without
 * needing to call getAuthProvider() directly. All methods automatically
 * use the configured auth provider.
 *
 * @example
 * ```typescript
 * import { auth } from '@/lib/auth';
 *
 * // In an API route
 * const session = await auth.getSession();
 * if (!session?.user) {
 *   return Response.json({ error: 'Unauthorized' }, { status: 401 });
 * }
 * ```
 */
export const auth = {
  /**
   * Gets the current user session.
   *
   * @returns The session object with user data, or null if not authenticated
   *
   * @example
   * ```typescript
   * const session = await auth.getSession();
   * if (session?.user) {
   *   console.log('User ID:', session.user.id);
   *   console.log('Email:', session.user.email);
   * }
   * ```
   */
  async getSession(): Promise<AuthSession | null> {
    const provider = await getAuthProvider();
    return provider.getSession();
  },

  /**
   * Gets the current authenticated user.
   *
   * @returns The user object, or null if not authenticated
   */
  async getUser(): Promise<AuthUser | null> {
    const provider = await getAuthProvider();
    return provider.getUser();
  },

  /**
   * Signs in a user with email and password credentials.
   *
   * @param options - Sign in options including email and password
   * @returns Object with redirect URL on success, or error message on failure
   *
   * @example
   * ```typescript
   * const result = await auth.signIn({
   *   email: 'user@example.com',
   *   password: 'password123',
   * });
   *
   * if (result.error) {
   *   console.error('Sign in failed:', result.error);
   * } else if (result.url) {
   *   // Redirect to the URL
   * }
   * ```
   */
  async signIn(options: SignInOptions): Promise<{ url?: string; error?: string }> {
    const provider = await getAuthProvider();
    return provider.signIn(options);
  },

  /**
   * Creates a new user account.
   *
   * @param options - Sign up options including email, password, and optional name
   * @returns Object with created user on success, or error message on failure
   *
   * @example
   * ```typescript
   * const result = await auth.signUp({
   *   email: 'newuser@example.com',
   *   password: 'securepassword',
   *   name: 'John Doe',
   * });
   *
   * if (result.error) {
   *   console.error('Sign up failed:', result.error);
   * } else {
   *   console.log('Created user:', result.user?.id);
   * }
   * ```
   */
  async signUp(options: SignUpOptions): Promise<{ user?: AuthUser; error?: string }> {
    const provider = await getAuthProvider();
    return provider.signUp(options);
  },

  /**
   * Signs out the current user.
   *
   * @example
   * ```typescript
   * await auth.signOut();
   * // User is now logged out
   * ```
   */
  async signOut(): Promise<void> {
    const provider = await getAuthProvider();
    return provider.signOut();
  },

  /**
   * Initiates OAuth sign in with a third-party provider.
   *
   * @param oauthProvider - The OAuth provider name (e.g., 'google', 'github', 'discord')
   * @returns Object with OAuth redirect URL, or error message on failure
   *
   * @example
   * ```typescript
   * const { url, error } = await auth.signInWithOAuth('google');
   * if (url) {
   *   // Redirect user to Google OAuth
   *   redirect(url);
   * }
   * ```
   */
  async signInWithOAuth(oauthProvider: string): Promise<{ url: string; error?: string }> {
    const provider = await getAuthProvider();
    return provider.signInWithOAuth(oauthProvider);
  },

  /**
   * Sends a password reset email to the user.
   *
   * @param options - Options including the user's email address
   * @returns Empty object on success, or object with error message
   *
   * @example
   * ```typescript
   * const result = await auth.resetPassword({
   *   email: 'user@example.com',
   * });
   *
   * if (!result.error) {
   *   console.log('Reset email sent');
   * }
   * ```
   */
  async resetPassword(options: ResetPasswordOptions): Promise<{ error?: string }> {
    const provider = await getAuthProvider();
    return provider.resetPassword(options);
  },

  /**
   * Updates the user's password.
   *
   * @param options - Options including current password and new password
   * @returns Empty object on success, or object with error message
   */
  async updatePassword(options: UpdatePasswordOptions): Promise<{ error?: string }> {
    const provider = await getAuthProvider();
    return provider.updatePassword(options);
  },

  /**
   * Verifies a user's email address using a verification token.
   *
   * @param token - The email verification token
   * @returns Empty object on success, or object with error message
   */
  async verifyEmail(token: string): Promise<{ error?: string }> {
    const provider = await getAuthProvider();
    return provider.verifyEmail(token);
  },

  /**
   * Resends the email verification email to a user.
   *
   * @param email - The user's email address
   * @returns Empty object on success, or object with error message
   */
  async resendVerification(email: string): Promise<{ error?: string }> {
    const provider = await getAuthProvider();
    return provider.resendVerification(email);
  },
};

// Re-export types
export type {
  AuthProvider,
  AuthProviderInterface,
  AuthSession,
  AuthUser,
  SignInOptions,
  SignUpOptions,
  ResetPasswordOptions,
  UpdatePasswordOptions,
} from './types';
