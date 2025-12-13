/**
 * Admin User Detail Page
 * Full user management with editing, ban/suspend, credit adjustment
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
import { ArrowLeft, Mail, Calendar, CreditCard, Cpu, Users, Shield, Ban, UserCheck } from 'lucide-react';
import { UserActions } from '@/components/admin/user-actions';
import { UserEditor } from '@/components/admin/user-editor';
import { CreditAdjuster } from '@/components/admin/credit-adjuster';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminUserDetailPage({ params }: PageProps) {
  const { id } = await params;
  const user = await admin.getUser(id);

  if (!user) {
    notFound();
  }

  const statusColors: Record<string, string> = {
    ACTIVE: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    SUSPENDED: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    BANNED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/users">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">User Details</h1>
          <p className="text-muted-foreground">Manage user account and permissions</p>
        </div>
        <UserActions user={user} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Card */}
          <Card>
            <CardHeader>
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={user.image || undefined} />
                  <AvatarFallback className="text-xl">
                    {(user.name || user.email || 'U')[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-2xl">{user.name || 'Anonymous'}</CardTitle>
                    <Badge variant={user.role === 'ADMIN' ? 'destructive' : 'secondary'}>
                      {user.role}
                    </Badge>
                    <Badge className={statusColors[user.status]}>
                      {user.status}
                    </Badge>
                  </div>
                  <CardDescription className="flex items-center gap-1 mt-1">
                    <Mail className="h-4 w-4" />
                    {user.email}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {user.status !== 'ACTIVE' && user.bannedReason && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950 text-red-800 dark:text-red-200">
                  <p className="text-sm font-medium">Reason: {user.bannedReason}</p>
                  {user.bannedAt && (
                    <p className="text-xs mt-1">Since: {new Date(user.bannedAt).toLocaleDateString()}</p>
                  )}
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Joined {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Auth: {user.authProvider}
                  </span>
                </div>
                {user.lastLoginAt && (
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      Last login: {new Date(user.lastLoginAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Login count: {user.loginCount}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Edit User */}
          <UserEditor user={user} />

          {/* Credit History */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Credit History</CardTitle>
                  <CardDescription>Recent credit transactions</CardDescription>
                </div>
                <CreditAdjuster userId={user.id} currentBalance={user.creditBalance?.balance || 0} />
              </div>
            </CardHeader>
            <CardContent>
              {user.creditBalance?.ledger && user.creditBalance.ledger.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {user.creditBalance.ledger.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell className="text-sm">
                          {new Date(entry.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{entry.type}</Badge>
                        </TableCell>
                        <TableCell className={entry.amount > 0 ? 'text-green-600' : 'text-red-600'}>
                          {entry.amount > 0 ? '+' : ''}{entry.amount}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {entry.description || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground">No credit history</p>
              )}
            </CardContent>
          </Card>

          {/* AI Usage */}
          <Card>
            <CardHeader>
              <CardTitle>AI Usage</CardTitle>
              <CardDescription>Recent AI requests ({user._count.aiUsage} total)</CardDescription>
            </CardHeader>
            <CardContent>
              {user.aiUsage.length > 0 ? (
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
                    {user.aiUsage.map((usage) => (
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
          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Credits</span>
                </div>
                <span className="font-bold">{user.creditBalance?.balance || 0}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">AI Requests</span>
                </div>
                <span className="font-bold">{user._count.aiUsage}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Organizations</span>
                </div>
                <span className="font-bold">{user.memberships.length}</span>
              </div>
            </CardContent>
          </Card>

          {/* Subscription */}
          <Card>
            <CardHeader>
              <CardTitle>Subscription</CardTitle>
            </CardHeader>
            <CardContent>
              {user.subscription ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Plan</span>
                    <Badge>{user.subscription.plan}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <Badge variant={user.subscription.status === 'ACTIVE' ? 'default' : 'secondary'}>
                      {user.subscription.status}
                    </Badge>
                  </div>
                  {user.subscription.currentPeriodEnd && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Renews</span>
                      <span className="text-sm">
                        {new Date(user.subscription.currentPeriodEnd).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No subscription</p>
              )}
            </CardContent>
          </Card>

          {/* Organizations */}
          <Card>
            <CardHeader>
              <CardTitle>Organizations</CardTitle>
            </CardHeader>
            <CardContent>
              {user.memberships.length > 0 ? (
                <div className="space-y-2">
                  {user.memberships.map((membership) => (
                    <div key={membership.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                      <span className="text-sm font-medium">{membership.organization.name}</span>
                      <Badge variant="outline">{membership.role}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No organizations</p>
              )}
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle>Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">User ID</span>
                <code className="text-xs">{user.id.slice(0, 12)}...</code>
              </div>
              {user.referralCode && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Referral Code</span>
                  <code className="text-xs">{user.referralCode}</code>
                </div>
              )}
              {user.stripeCustomerId && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Stripe ID</span>
                  <code className="text-xs">{user.stripeCustomerId.slice(0, 12)}...</code>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
