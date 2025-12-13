'use client';

/**
 * Organizations Table Component
 * Displays organizations with pagination
 */

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ChevronLeft, ChevronRight, Users, Building2, Eye } from 'lucide-react';

interface Organization {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  plan: string;
  stripeCustomerId: string | null;
  createdAt: Date;
  owner: {
    id: string;
    name: string | null;
    email: string;
  };
  _count: {
    members: number;
    aiUsage: number;
  };
}

interface OrganizationsTableProps {
  organizations: Organization[];
  total: number;
  hasMore: boolean;
  page: number;
  limit: number;
  filters: {
    search?: string;
    plan?: string;
  };
}

export function OrganizationsTable({
  organizations,
  total,
  hasMore,
  page,
  limit,
  filters,
}: OrganizationsTableProps) {
  const router = useRouter();

  const buildUrl = (newPage: number) => {
    const params = new URLSearchParams();
    if (filters.search) params.set('search', filters.search);
    if (filters.plan) params.set('plan', filters.plan);
    params.set('page', newPage.toString());
    return `/admin/organizations?${params.toString()}`;
  };

  const planColors: Record<string, string> = {
    FREE: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    STARTER: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    PRO: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    ENTERPRISE: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Organizations ({total})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {organizations.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No organizations found</p>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Organization</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Members</TableHead>
                  <TableHead>AI Requests</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {organizations.map((org) => (
                  <TableRow key={org.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={org.logo || undefined} />
                          <AvatarFallback className="text-xs">
                            {org.name[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{org.name}</p>
                          <p className="text-xs text-muted-foreground">/{org.slug}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/admin/users/${org.owner.id}`}
                        className="hover:underline"
                      >
                        <p className="text-sm">{org.owner.name || 'Anonymous'}</p>
                        <p className="text-xs text-muted-foreground">{org.owner.email}</p>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge className={planColors[org.plan]}>
                        {org.plan}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{org._count.members}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {org._count.aiUsage.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {new Date(org.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/admin/organizations/${org.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Showing {(page - 1) * limit + 1} - {Math.min(page * limit, total)} of {total}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => router.push(buildUrl(page - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!hasMore}
                  onClick={() => router.push(buildUrl(page + 1))}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
