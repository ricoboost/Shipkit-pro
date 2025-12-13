/**
 * Admin Organization Detail Page
 * Full organization management with editing, members, and stats
 */

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { admin } from '@/lib/admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ArrowLeft,
  Building2,
  Calendar,
  Users,
  Cpu,
  Mail,
  CreditCard,
  Clock,
  Crown,
  ExternalLink,
} from 'lucide-react';
import { OrgActions } from '@/components/admin/org-actions';
import { OrgEditor } from '@/components/admin/org-editor';
import { OrgMemberManager } from '@/components/admin/org-member-manager';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminOrganizationDetailPage({ params }: PageProps) {
  const { id } = await params;
  const org = await admin.getOrganization(id);

  if (!org) {
    notFound();
  }

  const stats = await admin.getOrganizationStats(id);

  const planColors: Record<string, string> = {
    FREE: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    STARTER: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    PRO: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    ENTERPRISE: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  };

  const roleColors: Record<string, string> = {
    OWNER: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
    ADMIN: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    MEMBER: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/organizations">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Organization Details</h1>
          <p className="text-muted-foreground">Manage organization settings and members</p>
        </div>
        <OrgActions organization={org} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Card */}
          <Card>
            <CardHeader>
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={org.logo || undefined} />
                  <AvatarFallback className="text-xl">
                    {org.name[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-2xl">{org.name}</CardTitle>
                    <Badge className={planColors[org.plan]}>
                      {org.plan}
                    </Badge>
                  </div>
                  <CardDescription className="flex items-center gap-1 mt-1">
                    <Building2 className="h-4 w-4" />
                    /{org.slug}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Created {new Date(org.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {stats.memberCount} member{stats.memberCount !== 1 ? 's' : ''}
                  </span>
                </div>
                {org.stripeCustomerId && (
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-mono">
                      {org.stripeCustomerId.slice(0, 16)}...
                    </span>
                  </div>
                )}
                {stats.pendingInvitations > 0 && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {stats.pendingInvitations} pending invitation{stats.pendingInvitations !== 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Edit Organization */}
          <OrgEditor organization={org} />

          {/* Members Management */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Members</CardTitle>
                  <CardDescription>Manage organization members and roles</CardDescription>
                </div>
                <OrgMemberManager organizationId={org.id} />
              </div>
            </CardHeader>
            <CardContent>
              {org.members.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {org.members.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={member.user.image || undefined} />
                              <AvatarFallback className="text-xs">
                                {(member.user.name || member.user.email)[0].toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-1">
                                <p className="font-medium text-sm">
                                  {member.user.name || 'Anonymous'}
                                </p>
                                {member.userId === org.ownerId && (
                                  <Crown className="h-3 w-3 text-amber-500" />
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground">{member.user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={roleColors[member.role]}>
                            {member.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={member.user.status === 'ACTIVE' ? 'default' : 'destructive'}>
                            {member.user.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(member.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Link href={`/admin/users/${member.userId}`}>
                            <Button variant="ghost" size="sm">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground">No members</p>
              )}
            </CardContent>
          </Card>

          {/* Pending Invitations */}
          {org.invitations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Pending Invitations</CardTitle>
                <CardDescription>Invitations awaiting acceptance</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead>Sent</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {org.invitations.map((invitation) => (
                      <TableRow key={invitation.id}>
                        <TableCell className="font-medium">{invitation.email}</TableCell>
                        <TableCell>
                          <Badge className={roleColors[invitation.role]}>
                            {invitation.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(invitation.expiresAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(invitation.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* AI Usage */}
          <Card>
            <CardHeader>
              <CardTitle>AI Usage</CardTitle>
              <CardDescription>Recent AI requests ({org._count.aiUsage} total)</CardDescription>
            </CardHeader>
            <CardContent>
              {org.aiUsage.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Model</TableHead>
                      <TableHead>Tokens</TableHead>
                      <TableHead>Credits</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {org.aiUsage.map((usage) => (
                      <TableRow key={usage.id}>
                        <TableCell className="text-sm">
                          {new Date(usage.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="font-mono text-sm">{usage.model}</TableCell>
                        <TableCell>{usage.totalTokens.toLocaleString()}</TableCell>
                        <TableCell>{usage.creditsUsed}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground">No AI usage</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Owner Card */}
          <Card>
            <CardHeader>
              <CardTitle>Owner</CardTitle>
            </CardHeader>
            <CardContent>
              <Link href={`/admin/users/${org.owner.id}`} className="block">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={org.owner.image || undefined} />
                    <AvatarFallback>
                      {(org.owner.name || org.owner.email)[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{org.owner.name || 'Anonymous'}</p>
                    <p className="text-sm text-muted-foreground truncate">{org.owner.email}</p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </div>
              </Link>
            </CardContent>
          </Card>

          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Members</span>
                </div>
                <span className="font-bold">{stats.memberCount}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Pending Invites</span>
                </div>
                <span className="font-bold">{stats.pendingInvitations}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">AI Requests</span>
                </div>
                <span className="font-bold">{stats.aiUsage.totalRequests.toLocaleString()}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Credits Used</span>
                </div>
                <span className="font-bold">{stats.aiUsage.totalCreditsUsed.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle>Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Org ID</span>
                <code className="text-xs">{org.id.slice(0, 12)}...</code>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Slug</span>
                <code className="text-xs">{org.slug}</code>
              </div>
              {org.stripeCustomerId && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Stripe ID</span>
                  <code className="text-xs">{org.stripeCustomerId.slice(0, 12)}...</code>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span>{new Date(org.createdAt).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
