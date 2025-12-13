# ShipKit DB - Database Skill

Generate Prisma schemas, migrations, and database patterns following ShipKit Pro conventions. Includes multi-tenancy, soft deletes, audit trails, and common patterns.

## Capabilities

### Schema Generation
- **Basic models**: Standard CRUD models with proper fields
- **Audit models**: Models with createdAt, updatedAt, deletedAt
- **Multi-tenant models**: Organization-scoped models
- **Relations**: 1:1, 1:N, N:N relationships

### Built-in Patterns
- Soft delete pattern
- Audit trail logging
- Multi-tenant data isolation
- Credit/usage tracking
- API key management

## Code Standards

```prisma
// 1. Use camelCase for field names
// 2. Use PascalCase for model names
// 3. Always include id, createdAt, updatedAt
// 4. Add indexes for frequently queried fields
// 5. Use @relation for explicit relations
// 6. Add comments for complex fields
```

## Usage Examples

### Create a Basic Model
```
"Create a Project model with name, description, and user ownership"
```

### Create a Multi-tenant Model
```
"Add a Team model that belongs to an organization"
```

### Add Soft Delete
```
"Add soft delete support to the Project model"
```

## Templates Available

| Template | Description |
|----------|-------------|
| `model-basic.prisma` | Basic model with standard fields |
| `model-audit.prisma` | Model with audit fields |
| `model-soft-delete.prisma` | Model with soft delete |
| `relations.prisma` | Common relationship patterns |

## Patterns Available

| Pattern | Description |
|---------|-------------|
| `multi-tenant.prisma` | Organization-based multi-tenancy |
| `credits-system.prisma` | Usage-based billing schema |

## Model Template

```prisma
model Resource {
  id          String   @id @default(cuid())

  // Core fields
  name        String
  description String?

  // Relations
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Audit fields
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  deletedAt   DateTime? // For soft delete

  // Indexes
  @@index([userId])
  @@index([createdAt])
}
```

## Multi-tenant Pattern

```prisma
model Resource {
  id             String       @id @default(cuid())

  // Multi-tenant relation
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  // Creator relation
  createdById    String
  createdBy      User         @relation(fields: [createdById], references: [id])

  // ... other fields

  @@index([organizationId])
}
```

## Integration with ShipKit

Generated schemas work with:
1. Existing User/Account/Session models
2. Organization multi-tenancy
3. Credit balance system
4. API key management
5. Audit logging
