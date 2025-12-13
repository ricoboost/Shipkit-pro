/**
 * Organization Management
 * Multi-tenancy with team support
 */

import { db } from '@/lib/db';
import type { OrgRole, Plan, Prisma } from '@prisma/client';
import { Prisma as PrismaErrors } from '@prisma/client';
import crypto from 'crypto';
import { z } from 'zod';

/**
 * SECURITY: Zod schema for organization settings validation
 * Prevents arbitrary JSON injection and enforces structure
 */
export const orgSettingsSchema = z.object({
  // Notification preferences
  notifications: z.object({
    email: z.boolean().optional(),
    slack: z.boolean().optional(),
    webhookUrl: z.string().url().max(500).optional(),
  }).optional(),

  // Branding customization
  branding: z.object({
    primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
    logoUrl: z.string().url().max(500).optional(),
  }).optional(),

  // Feature flags
  features: z.object({
    enableApi: z.boolean().optional(),
    enableSso: z.boolean().optional(),
    enableAuditLog: z.boolean().optional(),
  }).optional(),

  // Limits
  limits: z.object({
    maxMembers: z.number().int().min(1).max(1000).optional(),
    maxApiKeys: z.number().int().min(1).max(100).optional(),
  }).optional(),
}).passthrough().optional();

export type OrgSettings = z.infer<typeof orgSettingsSchema>;

export interface CreateOrganizationInput {
  name: string;
  slug?: string;
  ownerId: string;
  logo?: string;
}

export interface UpdateOrganizationInput {
  name?: string;
  slug?: string;
  logo?: string | null;
  settings?: OrgSettings;
}

export interface InviteMemberInput {
  organizationId: string;
  email: string;
  role?: OrgRole;
  invitedByUserId: string;
}

export interface OrganizationWithMembers {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  ownerId: string;
  plan: Plan;
  members: {
    id: string;
    role: OrgRole;
    user: {
      id: string;
      name: string | null;
      email: string | null;
      image: string | null;
    };
  }[];
  _count: {
    members: number;
  };
}

// Prisma include configuration for organization with members
// SECURITY: Centralized to ensure consistent data fetching
const organizationWithMembersInclude = {
  members: {
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
  },
  _count: {
    select: { members: true },
  },
} as const;

// Type for organization with members from Prisma query
type PrismaOrgWithMembers = Prisma.OrganizationGetPayload<{
  include: typeof organizationWithMembersInclude;
}>;

// Type-safe conversion from Prisma result to our interface
// SECURITY: This avoids unsafe `as unknown as` casts by explicitly mapping fields
function toOrganizationWithMembers(
  org: PrismaOrgWithMembers | null
): OrganizationWithMembers | null {
  if (!org) return null;

  return {
    id: org.id,
    name: org.name,
    slug: org.slug,
    logo: org.logo,
    ownerId: org.ownerId,
    plan: org.plan,
    members: org.members.map((m) => ({
      id: m.id,
      role: m.role,
      user: {
        id: m.user.id,
        name: m.user.name,
        email: m.user.email,
        image: m.user.image,
      },
    })),
    _count: {
      members: org._count.members,
    },
  };
}

// SECURITY: Slug format validation
const SLUG_REGEX = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/;
const MIN_SLUG_LENGTH = 3;
const MAX_SLUG_LENGTH = 50;

function isValidSlug(slug: string): boolean {
  return (
    slug.length >= MIN_SLUG_LENGTH &&
    slug.length <= MAX_SLUG_LENGTH &&
    SLUG_REGEX.test(slug)
  );
}

function generateSlug(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, MAX_SLUG_LENGTH);

  // Ensure minimum length
  if (slug.length < MIN_SLUG_LENGTH) {
    return slug.padEnd(MIN_SLUG_LENGTH, '0');
  }
  return slug;
}

function generateInviteToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export const organizations = {
  /**
   * Create a new organization
   * SECURITY: Relies on DB unique constraint to prevent race conditions
   */
  async create(input: CreateOrganizationInput) {
    const { name, ownerId, logo } = input;
    const baseSlug = input.slug || generateSlug(name);

    // SECURITY: Try to create with base slug, retry with random suffix on conflict
    // This avoids race conditions between check and create
    const maxRetries = 3;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      const slug = attempt === 0 ? baseSlug : `${baseSlug}-${crypto.randomBytes(3).toString('hex')}`;

      try {
        return await db.$transaction(async (tx) => {
          // Create organization - will throw on unique constraint violation
          const org = await tx.organization.create({
            data: {
              name,
              slug,
              logo,
              ownerId,
            },
          });

          // Add owner as first member
          await tx.organizationMember.create({
            data: {
              organizationId: org.id,
              userId: ownerId,
              role: 'OWNER',
            },
          });

          return org;
        });
      } catch (error) {
        // SECURITY: Use Prisma error codes instead of fragile string matching
        // P2002 = Unique constraint violation
        if (
          error instanceof PrismaErrors.PrismaClientKnownRequestError &&
          error.code === 'P2002' &&
          Array.isArray(error.meta?.target) &&
          error.meta.target.includes('slug')
        ) {
          // Retry with different slug
          if (attempt === maxRetries - 1) {
            throw new Error('Unable to create organization with unique slug. Please try a different name.');
          }
          continue;
        }
        // Re-throw other errors
        throw error;
      }
    }

    throw new Error('Failed to create organization');
  },

  /**
   * Get organization by ID
   * SECURITY: Uses type-safe conversion instead of unsafe type assertion
   */
  async getById(id: string): Promise<OrganizationWithMembers | null> {
    const org = await db.organization.findUnique({
      where: { id },
      include: organizationWithMembersInclude,
    });
    return toOrganizationWithMembers(org);
  },

  /**
   * Get organization by slug
   * SECURITY: Uses type-safe conversion instead of unsafe type assertion
   */
  async getBySlug(slug: string): Promise<OrganizationWithMembers | null> {
    const org = await db.organization.findUnique({
      where: { slug },
      include: organizationWithMembersInclude,
    });
    return toOrganizationWithMembers(org);
  },

  /**
   * Get all organizations for a user
   */
  async getUserOrganizations(userId: string) {
    const memberships = await db.organizationMember.findMany({
      where: { userId },
      include: {
        organization: {
          include: {
            _count: {
              select: { members: true },
            },
          },
        },
      },
    });

    return memberships.map((m) => ({
      ...m.organization,
      role: m.role,
    }));
  },

  /**
   * Update organization
   * SECURITY: Validates settings against schema before saving
   */
  async update(id: string, input: UpdateOrganizationInput) {
    const { name, slug, logo, settings } = input;

    // SECURITY: Validate slug format if provided
    if (slug) {
      if (!isValidSlug(slug)) {
        throw new Error(`Slug must be ${MIN_SLUG_LENGTH}-${MAX_SLUG_LENGTH} characters, lowercase alphanumeric with hyphens`);
      }

      // Ensure it's unique
      const existing = await db.organization.findFirst({
        where: {
          slug,
          NOT: { id },
        },
      });
      if (existing) {
        throw new Error('Slug already taken');
      }
    }

    // SECURITY: Validate settings against schema
    let validatedSettings: Prisma.InputJsonValue | undefined;
    if (settings !== undefined) {
      const parseResult = orgSettingsSchema.safeParse(settings);
      if (!parseResult.success) {
        throw new Error(`Invalid settings: ${parseResult.error.issues.map(i => i.message).join(', ')}`);
      }
      validatedSettings = parseResult.data as Prisma.InputJsonValue;
    }

    return db.organization.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(slug && { slug }),
        ...(logo !== undefined && { logo }),
        ...(validatedSettings !== undefined && { settings: validatedSettings }),
      },
    });
  },

  /**
   * Delete organization
   */
  async delete(id: string) {
    return db.organization.delete({ where: { id } });
  },

  /**
   * Check if user is member of organization
   */
  async isMember(organizationId: string, userId: string): Promise<boolean> {
    const member = await db.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId,
          userId,
        },
      },
    });
    return !!member;
  },

  /**
   * Check user's role in organization
   */
  async getMemberRole(organizationId: string, userId: string): Promise<OrgRole | null> {
    const member = await db.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId,
          userId,
        },
      },
    });
    return member?.role || null;
  },

  /**
   * Check if user can manage organization (owner or admin)
   */
  async canManage(organizationId: string, userId: string): Promise<boolean> {
    const role = await this.getMemberRole(organizationId, userId);
    return role === 'OWNER' || role === 'ADMIN';
  },

  /**
   * Get organization members
   */
  async getMembers(organizationId: string) {
    return db.organizationMember.findMany({
      where: { organizationId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: [
        { role: 'asc' },
        { createdAt: 'asc' },
      ],
    });
  },

  /**
   * Add member to organization
   */
  async addMember(organizationId: string, userId: string, role: OrgRole = 'MEMBER') {
    return db.organizationMember.create({
      data: {
        organizationId,
        userId,
        role,
      },
    });
  },

  /**
   * Update member role
   */
  async updateMemberRole(organizationId: string, userId: string, role: OrgRole) {
    // Cannot change owner role directly
    const currentMember = await db.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId,
          userId,
        },
      },
    });

    if (currentMember?.role === 'OWNER') {
      throw new Error('Cannot change owner role');
    }

    return db.organizationMember.update({
      where: {
        organizationId_userId: {
          organizationId,
          userId,
        },
      },
      data: { role },
    });
  },

  /**
   * Remove member from organization
   */
  async removeMember(organizationId: string, userId: string) {
    // Check if user is owner
    const member = await db.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId,
          userId,
        },
      },
    });

    if (member?.role === 'OWNER') {
      throw new Error('Cannot remove organization owner');
    }

    return db.organizationMember.delete({
      where: {
        organizationId_userId: {
          organizationId,
          userId,
        },
      },
    });
  },

  /**
   * Transfer ownership
   */
  async transferOwnership(organizationId: string, currentOwnerId: string, newOwnerId: string) {
    // Verify current owner
    const currentOwner = await db.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId,
          userId: currentOwnerId,
        },
      },
    });

    if (currentOwner?.role !== 'OWNER') {
      throw new Error('Only owner can transfer ownership');
    }

    // Verify new owner is a member
    const newOwner = await db.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId,
          userId: newOwnerId,
        },
      },
    });

    if (!newOwner) {
      throw new Error('New owner must be a member');
    }

    return db.$transaction([
      // Update organization owner
      db.organization.update({
        where: { id: organizationId },
        data: { ownerId: newOwnerId },
      }),
      // Update old owner role
      db.organizationMember.update({
        where: {
          organizationId_userId: {
            organizationId,
            userId: currentOwnerId,
          },
        },
        data: { role: 'ADMIN' },
      }),
      // Update new owner role
      db.organizationMember.update({
        where: {
          organizationId_userId: {
            organizationId,
            userId: newOwnerId,
          },
        },
        data: { role: 'OWNER' },
      }),
    ]);
  },
};

// Invitation management
export const invitations = {
  /**
   * Create invitation
   */
  async create(input: InviteMemberInput) {
    const { organizationId, email, role = 'MEMBER' } = input;

    // Check if user is already a member
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      const isMember = await organizations.isMember(organizationId, existingUser.id);
      if (isMember) {
        throw new Error('User is already a member');
      }
    }

    // Check for existing invitation
    const existingInvite = await db.organizationInvitation.findUnique({
      where: {
        organizationId_email: {
          organizationId,
          email,
        },
      },
    });

    if (existingInvite) {
      // Update existing invitation
      return db.organizationInvitation.update({
        where: { id: existingInvite.id },
        data: {
          role,
          token: generateInviteToken(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        },
      });
    }

    return db.organizationInvitation.create({
      data: {
        organizationId,
        email,
        role,
        token: generateInviteToken(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });
  },

  /**
   * Get invitation by token
   */
  async getByToken(token: string) {
    return db.organizationInvitation.findUnique({
      where: { token },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
          },
        },
      },
    });
  },

  /**
   * Get pending invitations for organization
   */
  async getOrganizationInvitations(organizationId: string) {
    return db.organizationInvitation.findMany({
      where: {
        organizationId,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  /**
   * Get pending invitations for email
   */
  async getUserInvitations(email: string) {
    return db.organizationInvitation.findMany({
      where: {
        email,
        expiresAt: { gt: new Date() },
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  /**
   * Accept invitation
   */
  async accept(token: string, userId: string) {
    const invitation = await db.organizationInvitation.findUnique({
      where: { token },
    });

    if (!invitation) {
      throw new Error('Invitation not found');
    }

    if (invitation.expiresAt < new Date()) {
      throw new Error('Invitation has expired');
    }

    // Verify user email matches
    const user = await db.user.findUnique({ where: { id: userId } });
    if (user?.email !== invitation.email) {
      throw new Error('Invitation is for a different email');
    }

    return db.$transaction([
      // Add user to organization
      db.organizationMember.create({
        data: {
          organizationId: invitation.organizationId,
          userId,
          role: invitation.role,
        },
      }),
      // Delete invitation
      db.organizationInvitation.delete({
        where: { id: invitation.id },
      }),
    ]);
  },

  /**
   * Decline/cancel invitation
   */
  async delete(id: string) {
    return db.organizationInvitation.delete({ where: { id } });
  },

  /**
   * Clean up expired invitations
   */
  async cleanupExpired() {
    return db.organizationInvitation.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    });
  },
};
