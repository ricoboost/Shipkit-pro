/**
 * NextAuth.js v5 Implementation
 */

import NextAuth, { type Session } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import Google from 'next-auth/providers/google';
import GitHub from 'next-auth/providers/github';
import Discord from 'next-auth/providers/discord';
import Credentials from 'next-auth/providers/credentials';
import { compare, hash } from 'bcryptjs';
import { db } from '@/lib/db';
import {
  AuthProviderInterface,
  AuthSession,
  AuthUser,
  SignInOptions,
  SignUpOptions,
  ResetPasswordOptions,
  UpdatePasswordOptions,
  ImpersonationData,
} from './types';

// Import type augmentation
import '@/types/next-auth';
import { getImpersonationState, getImpersonatedUser } from '@/lib/impersonation';

// NextAuth configuration
// SECURITY: Session hardened with shorter expiry, secure cookies, and sameSite
export const { handlers, auth: getNextAuthSession, signIn, signOut } = NextAuth({
  // @ts-expect-error - PrismaAdapter types are incompatible with NextAuth v5
  adapter: PrismaAdapter(db),
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours (was 30 days default)
    updateAge: 60 * 60, // Update session every 1 hour
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production'
        ? '__Secure-authjs.session-token'
        : 'authjs.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  trustHost: true,
  pages: {
    signIn: '/login',
    error: '/login',
    verifyRequest: '/verify',
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    Discord({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    }),
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Missing credentials');
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.passwordHash) {
          throw new Error('Invalid credentials');
        }

        const isValid = await compare(credentials.password as string, user.passwordHash);

        if (!isValid) {
          throw new Error('Invalid credentials');
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role || 'USER';
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      // Grant signup bonus credits
      const bonusCredits = parseInt(process.env.SIGNUP_BONUS_CREDITS || '100', 10);
      if (bonusCredits > 0 && user.id) {
        await db.creditBalance.create({
          data: {
            userId: user.id,
            balance: bonusCredits,
            ledger: {
              create: {
                amount: bonusCredits,
                type: 'GRANT',
                description: 'Signup bonus',
              },
            },
          },
        });
      }
    },
  },
});

// Provider class implementing the interface
export class NextAuthProvider implements AuthProviderInterface {
  async getSession(): Promise<AuthSession | null> {
    const session = await getNextAuthSession();
    if (!session?.user) return null;

    // Check for impersonation
    const impersonationState = await getImpersonationState();

    if (impersonationState) {
      // Verify the admin user matches the session user
      if (session.user.id !== impersonationState.adminId) {
        // Session doesn't match impersonation admin, ignore impersonation
        return this.buildNormalSession(session);
      }

      // Get the impersonated user
      const impersonatedUser = await getImpersonatedUser(impersonationState);
      if (!impersonatedUser) {
        // Target user no longer exists, return normal session
        return this.buildNormalSession(session);
      }

      // Return session as the impersonated user with impersonation metadata
      const impersonation: ImpersonationData = {
        isImpersonating: true,
        impersonatedBy: {
          id: impersonationState.adminId,
          email: impersonationState.adminEmail,
          name: impersonationState.adminName,
        },
        originalUserId: impersonationState.adminId,
      };

      return {
        user: {
          id: impersonatedUser.id,
          email: impersonatedUser.email,
          name: impersonatedUser.name || undefined,
          image: impersonatedUser.image || undefined,
          role: impersonatedUser.role as 'USER' | 'ADMIN',
          provider: 'nextauth',
        },
        expiresAt: new Date(session.expires),
        impersonation,
      };
    }

    return this.buildNormalSession(session);
  }

  private buildNormalSession(session: Session): AuthSession {
    return {
      user: {
        id: session.user.id,
        email: session.user.email!,
        name: session.user.name || undefined,
        image: session.user.image || undefined,
        role: session.user.role || 'USER',
        provider: 'nextauth',
      },
      expiresAt: new Date(session.expires),
    };
  }

  async getUser(): Promise<AuthUser | null> {
    const session = await this.getSession();
    return session?.user || null;
  }

  async signIn(options: SignInOptions): Promise<{ url?: string; error?: string }> {
    if (options.provider) {
      return this.signInWithOAuth(options.provider);
    }

    try {
      await signIn('credentials', {
        email: options.email,
        password: options.password,
        redirectTo: options.redirectTo || '/dashboard',
      });
      return { url: options.redirectTo || '/dashboard' };
    } catch {
      return { error: 'Invalid credentials' };
    }
  }

  async signUp(options: SignUpOptions): Promise<{ user?: AuthUser; error?: string }> {
    try {
      const existingUser = await db.user.findUnique({
        where: { email: options.email },
      });

      if (existingUser) {
        return { error: 'Email already exists' };
      }

      const passwordHash = await hash(options.password, 12);

      const user = await db.user.create({
        data: {
          email: options.email,
          name: options.name,
          passwordHash,
          authProvider: 'NEXTAUTH',
        },
      });

      // Grant signup bonus
      const bonusCredits = parseInt(process.env.SIGNUP_BONUS_CREDITS || '100', 10);
      if (bonusCredits > 0) {
        await db.creditBalance.create({
          data: {
            userId: user.id,
            balance: bonusCredits,
            ledger: {
              create: {
                amount: bonusCredits,
                type: 'GRANT',
                description: 'Signup bonus',
              },
            },
          },
        });
      }

      // Handle referral
      if (options.referralCode) {
        const referrer = await db.user.findUnique({
          where: { referralCode: options.referralCode },
        });

        if (referrer) {
          await db.referral.create({
            data: {
              referrerId: referrer.id,
              referredId: user.id,
            },
          });
        }
      }

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name || undefined,
          role: user.role as 'USER' | 'ADMIN',
          provider: 'nextauth',
        },
      };
    } catch (error) {
      console.error('Sign up error:', error);
      return { error: 'Failed to create account' };
    }
  }

  async signOut(): Promise<void> {
    await signOut({ redirectTo: '/' });
  }

  async signInWithOAuth(provider: string): Promise<{ url: string; error?: string }> {
    try {
      const result = await signIn(provider, { redirect: false });
      return { url: result || '/dashboard' };
    } catch {
      return { url: `/login?error=OAuthError`, error: 'OAuth failed' };
    }
  }

  async resetPassword(options: ResetPasswordOptions): Promise<{ error?: string }> {
    // In NextAuth, this would typically use a magic link or custom reset flow
    // For now, return success (implement email flow later)
    const user = await db.user.findUnique({
      where: { email: options.email },
    });

    if (!user) {
      // Don't reveal if user exists
      return {};
    }

    // TODO: Generate reset token and send email
    return {};
  }

  async updatePassword(options: UpdatePasswordOptions): Promise<{ error?: string }> {
    const session = await this.getSession();
    if (!session) {
      return { error: 'Not authenticated' };
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return { error: 'User not found' };
    }

    // Verify current password if provided
    if (options.currentPassword && user.passwordHash) {
      const isValid = await compare(options.currentPassword, user.passwordHash);
      if (!isValid) {
        return { error: 'Current password is incorrect' };
      }
    }

    const newPasswordHash = await hash(options.newPassword, 12);

    await db.user.update({
      where: { id: session.user.id },
      data: { passwordHash: newPasswordHash },
    });

    return {};
  }

  async verifyEmail(token: string): Promise<{ error?: string }> {
    // NextAuth handles email verification via the adapter
    const verification = await db.verificationToken.findUnique({
      where: { token },
    });

    if (!verification || verification.expires < new Date()) {
      return { error: 'Invalid or expired token' };
    }

    await db.user.update({
      where: { email: verification.identifier },
      data: { emailVerified: new Date() },
    });

    await db.verificationToken.delete({
      where: { token },
    });

    return {};
  }

  async resendVerification(email: string): Promise<{ error?: string }> {
    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if user exists
      return {};
    }

    if (user.emailVerified) {
      return { error: 'Email already verified' };
    }

    // TODO: Generate verification token and send email
    return {};
  }
}
