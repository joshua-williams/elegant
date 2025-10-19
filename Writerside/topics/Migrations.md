# Database: Migrations

<show-structure depth="1"/>

## Introduction

Database migrations are version control for your database schema. They allow your team to define, share, and track changes to the database structure over time. With migrations, you can:

- **Track Changes** - Every schema modification is recorded and versioned
- **Collaborate Safely** - Team members can pull schema changes alongside code changes
- **Rollback Errors** - Undo problematic migrations when issues arise
- **Environment Parity** - Ensure consistent database structure across development, staging, and production
- **Automate Deployment** - Run migrations as part of your deployment pipeline

Elegant's migration system provides a database-agnostic API that works consistently across MySQL, MariaDB, PostgreSQL, and SQLite.

## Creating Migrations

### Generate Migration Files

Use the `make:migration` command to create a new migration file:

```bash
elegant make:migration CreateUsersTable
```

This generates a timestamped migration file in your `resources/database/migrations` directory:
```bash
resources/database/migrations/20250101120000_CreateUsersTable.ts
```

The timestamp prefix ensures migrations run in the correct order.
### Custom Migration Path
Specify a different location for your migrations:
```bash
elegant make:migration CreatePostsTable --path ./database/migrations
```

### Naming Conventions
Use descriptive names that clearly indicate what the migration does:
```bash
# Good migration names
elegant make:migration CreateUsersTable
elegant make:migration AddEmailVerificationToUsers
elegant make:migration CreateOrdersTable
elegant make:migration AddIndexToProductsSku

# Avoid vague names
elegant make:migration UpdateDatabase
elegant make:migration Changes
```

## Migration Structure
### Basic Structure
A migration class contains two essential methods:
```typescript
import { Migration } from '@pristine/elegant';

export class CreateUsersTable extends Migration {
  /**
   * Run the migration - creates schema changes
   */
  async up() {
    await this.schema.create('users', (table) => {
      table.id();
      table.string('name');
      table.string('email').unique();
      table.string('password');
      table.boolean('active').default(true);
      table.timestamps();
    });
  }

  /**
   * Reverse the migration - undoes schema changes
   */
  async down() {
    await this.schema.drop('users');
  }
}
```

**`up()` Method** - Defines forward changes (creating tables, adding columns, etc.)
**`down()` Method** - Defines how to undo those changes (dropping tables, removing columns, etc.)
### Migration Properties
Customize migration behavior with class properties:

```typescript
export class CreateUsersTable extends Migration {
  // Use a specific database connection
  connection = 'analytics';
  
  // Skip this migration conditionally
  shouldRun() {
    return process.env.ENABLE_USERS_TABLE === 'true';
  }
  
  async up() {
    // Migration logic
  }
  
  async down() {
    // Rollback logic
  }
}
```

## Creating Tables
### Basic Table Creation
Create a new table using the method: `create`

```typescript
await this.schema.create('users', (table) => {
  table.id();
  table.string('name');
  table.string('email');
  table.timestamps();
});
```

### Complete Example
Here's a comprehensive table definition:

```typescript
export class CreateUsersTable extends Migration {
  async up() {
    await this.schema.create('users', (table) => {
      // Primary key
      table.id();
      
      // String columns
      table.string('name', 100);
      table.string('email').unique();
      table.text('bio').nullable();
      
      // Numeric columns
      table.integer('age').nullable();
      table.decimal('balance', 10, 2).default(0);
      
      // Boolean columns
      table.boolean('active').default(true);
      table.boolean('email_verified').default(false);
      
      // Date/Time columns
      table.timestamp('email_verified_at').nullable();
      table.timestamps(); // created_at and updated_at
    });
  }
  
  async down() {
    await this.schema.drop('users');
  }
}
```

## Column Types
### String Columns
```typescript
// VARCHAR with default length (255)
table.string('name');

// VARCHAR with custom length
table.string('code', 50);

// CHAR with specified length
table.char('country_code', 2);

// TEXT column for long content
table.text('description');

// LONGTEXT for very large content
table.longText('article_content');
```

### Numeric Columns

```typescript
// Integer types
table.tinyInteger('status');      // TINYINT
table.smallInteger('quantity');   // SMALLINT
table.integer('views');           // INT
table.bigInteger('large_number'); // BIGINT

// Unsigned integers
table.unsignedTinyInteger('age');
table.unsignedInteger('count');
table.unsignedBigInteger('id');

// Decimal and floating point
table.decimal('price', 8, 2);     // DECIMAL(8,2)
table.float('rating');            // FLOAT
table.double('precise_value');    // DOUBLE
```

### Boolean Columns

```typescript
// Boolean (stored as TINYINT(1) in MySQL/MariaDB)
table.boolean('active');
table.boolean('is_admin').default(false);
```

### Date and Time Columns

```typescript
// Date only
table.date('birth_date');

// Time only
table.time('opening_time');

// DateTime
table.dateTime('event_start');

// Timestamp
table.timestamp('created_at');

// Timestamp with current time default
table.timestamp('updated_at').default('CURRENT_TIMESTAMP');

// Convenience method for created_at and updated_at
table.timestamps();
```

### JSON Columns

```typescript
// JSON column (where supported)
table.json('metadata');
table.json('settings').nullable();
```

### Binary Columns

```typescript
table.enum('status', ['pending', 'active', 'suspended', 'deleted']);
table.enum('role', ['user', 'admin', 'moderator']).default('user');
```

## Column Modifiers
### Constraints and Options
Add constraints and options to columns:

```typescript
await this.schema.create('products', (table) => {
  table.id();
  
  // Nullable columns
  table.string('description').nullable();
  
  // Default values
  table.integer('stock').default(0);
  table.boolean('featured').default(false);
  table.timestamp('published_at').default('CURRENT_TIMESTAMP');
  
  // Unique constraints
  table.string('sku').unique();
  table.string('slug').unique();
  
  // Unsigned (positive numbers only)
  table.integer('quantity').unsigned();
  
  // Auto-increment
  table.integer('sort_order').autoIncrement();
  
  // Comments (where supported)
  table.string('code').comment('Product identification code');
  
  table.timestamps();
});
```
### Primary Keys

```typescript
// Auto-incrementing integer primary key (recommended)
table.id();

// Custom primary key name
table.id('user_id');

// Composite primary key
table.integer('user_id');
table.integer('role_id');
table.primary(['user_id', 'role_id']);

// UUID primary key
table.uuid('id').primary();
```

### Foreign Keys
Define relationships between tables:
```typescript
await this.schema.create('posts', (table) => {
  table.id();
  table.string('title');
  table.text('content');
  
  // Foreign key to users table
  table.integer('user_id').unsigned();
  table.foreign('user_id')
    .references('id')
    .on('users')
    .onDelete('CASCADE')
    .onUpdate('CASCADE');
  
  table.timestamps();
});
```

Shorthand for foreign keys:

```typescript
// Creates unsigned integer and foreign key constraint
table.foreignId('user_id')
  .constrained()
  .onDelete('CASCADE');

// Custom table name
table.foreignId('author_id')
  .constrained('users')
  .onDelete('SET NULL');
```

### Indexes
Improve query performance with indexes:

```typescript
await this.schema.create('products', (table) => {
  table.id();
  table.string('name');
  table.string('sku');
  table.string('category');
  table.decimal('price', 10, 2);
  
  // Single column index
  table.index('sku');
  
  // Named index
  table.index('category', 'idx_products_category');
  
  // Composite index
  table.index(['category', 'price']);
  
  // Unique index
  table.unique('sku');
  table.unique(['category', 'sku']);
  
  table.timestamps();
});
```

## Modifying Tables
### Adding Columns
Add columns to existing tables:

```typescript
export class AddPhoneToUsers extends Migration {
  async up() {
    await this.schema.table('users', (table) => {
      table.string('phone', 20).nullable();
      table.string('address').nullable();
    });
  }
  
  async down() {
    await this.schema.table('users', (table) => {
      table.dropColumn('phone');
      table.dropColumn('address');
    });
  }
}
```

### Modifying Columns
Change existing column definitions:

```typescript
export class ModifyUsersNameColumn extends Migration {
  async up() {
    await this.schema.table('users', (table) => {
      // Change column type or attributes
      table.string('name', 200).change();
      table.text('bio').nullable().change();
    });
  }
  
  async down() {
    await this.schema.table('users', (table) => {
      table.string('name', 100).change();
      table.text('bio').notNullable().change();
    });
  }
}
```

### Renaming Columns
Rename columns within a table:

```typescript
export class RenameUsersNameColumn extends Migration {
  async up() {
    await this.schema.table('users', (table) => {
      table.renameColumn('name', 'full_name');
    });
  }
  
  async down() {
    await this.schema.table('users', (table) => {
      table.renameColumn('full_name', 'name');
    });
  }
}
```

### Dropping Columns
Remove columns from tables:

```typescript
export class RemovePhoneFromUsers extends Migration {
  async up() {
    await this.schema.table('users', (table) => {
      table.dropColumn('phone');
      
      // Drop multiple columns
      table.dropColumns(['address', 'city', 'state']);
    });
  }
  
  async down() {
    await this.schema.table('users', (table) => {
      table.string('phone', 20).nullable();
      table.string('address').nullable();
      table.string('city', 100).nullable();
      table.string('state', 2).nullable();
    });
  }
}
```
### Managing Indexes
Add or remove indexes:

```typescript
export class AddIndexesToProducts extends Migration {
  async up() {
    await this.schema.table('products', (table) => {
      // Add indexes
      table.index('category');
      table.index(['category', 'status'], 'idx_category_status');
      table.unique('sku');
    });
  }
  
  async down() {
    await this.schema.table('products', (table) => {
      // Drop indexes
      table.dropIndex('category');
      table.dropIndex('idx_category_status');
      table.dropUnique('sku');
    });
  }
}
```

## Renaming and Dropping Tables
### Renaming Tables
```typescript
export class RenameUsersToAccounts extends Migration {
  async up() {
    await this.schema.rename('users', 'accounts');
  }
  
  async down() {
    await this.schema.rename('accounts', 'users');
  }
}
```

### Dropping Tables

```typescript
export class DropUsersTable extends Migration {
  async up() {
    await this.schema.drop('users');
  }
  
  async down() {
    // Recreate the table
    await this.schema.create('users', (table) => {
      table.id();
      table.string('name');
      table.string('email');
      table.timestamps();
    });
  }
}
```

### Drop If Exists
Safely drop tables that may not exist:

```typescript
export class DropOldTables extends Migration {
  async up() {
    await this.schema.dropIfExists('old_users');
    await this.schema.dropIfExists('deprecated_logs');
  }
  
  async down() {
    // Usually no down action needed for cleanup migrations
  }
}
```

## Creating Functions

Create stored functions within your migrations using the `table.fn()` method. Functions are reusable database routines that return a single value and can be called from queries.

### Basic Function Definition

```typescript 
await this.schema.fn('get_user_email', (fn) => { 
  fn('get_user_email', (fn) => { 
    fn.params.int('user_id_in');
     fn.returns.string('email_out');
    fn.body = `
      SELECT email INTO email_out FROM users WHERE id = user_id_in; 
      RETURN email_out; 
    `;
  });
})
```

**Return Type** - Specify what the function returns using `fn.returns`:

```typescript 
// Returns integer 
fn.returns.int('id'); 
// Returns VARCHAR(255) 
fn.returns.string('name'); 
// Returns DECIMAL(10,2) 
fn.returns.decimal('weight', 10, 2); 
// Returns boolean
fn.returns.boolean('is_active'); 
```
### Complete Examples

**Calculate User Statistics:**

```typescript 
await this.schema.fn('calculate_user_posts_count', (fn) => { 
  fn.params.int('user_id_in');
   fn.returns.int('post_count')
  fn.body = `
    SELECT COUNT(*) INTO post_count 
    FROM posts WHERE posts.user_id = user_id_in 
      AND posts.deleted_at IS NULL; 
   RETURN post_count; 
  `;
});
```
* `fn.params `are automatically declared with the respective type and available within the function body 
* `fn.returns` - the return type is automatically defined and is available withint the function body

**Format User Display Name:**

```typescript 
await this.schema.fn('get_user_display_name', (fn) => { 
  fn.params.int('user_id');
  fn.body = `
    DECLARE display_name VARCHAR(255); 
    SELECT CONCAT(first_name, ' ', last_name) INTO display_name 
    FROM users WHERE id = user_id; RETURN display_name;
  `; 
  fn.returns.string(); 
});
```

### Multiple Parameters

Functions can accept multiple parameters:

```typescript 
await this.schema.fn('calculate_discount_price', (fn) => { 
  fn.params.decimal('original_price', 10, 2); 
  fn.params.decimal('discount_percent', 5, 2); 
  fn.body = `RETURN original_price * (1 - discount_percent / 100);`; 
  fn.returns.decimal(10, 2); 
});
```

### Using Functions in Queries

Once created, you can call these functions in your queries:


```typescript 
// Using the query builder
const email = await db.table('users') 
  .selectRaw('get_user_email(id) as email') 
     .where('id', userId) 
  .first();
// Using raw queries 
const postCount = await db.raw( 'SELECT calculate_user_posts_count(?) as count', [userId] );
```

### Database Support

Function creation is currently supported for:
- **MySQL** - Full support
- **MariaDB** - Full support
- **PostgreSQL** - Syntax may differ, test thoroughly
- **SQLite** - Not supported (SQLite uses a different approach for functions)

### Best Practices

1. **Keep Functions Simple** - Complex logic is often better in application code
2. **Handle NULL Values** - Use `COALESCE()` or NULL checks
3. **Name Descriptively** - Use clear names like `calculate_*` or `get_*`
4. **Document Logic** - Add comments in complex function bodies
5. **Test Thoroughly** - Functions are harder to debug than application code

### Dropping Functions

To remove a function in a migration's `down()` method:

```typescript 
async down() { 
  await this.db.raw('DROP FUNCTION IF EXISTS get_user_email'); 
  await this.db.raw('DROP FUNCTION IF EXISTS calculate_user_posts_count');
}
```

> **Note:** Functions are database-specific features. If you need to support multiple database types, consider implementing the logic in your application code instead.
> {style="note"}


## Running Migrations
### Execute All Pending Migrations
Run all migrations that haven't been executed yet:

```bash
elegant migrate
```

This command:
1. Checks which migrations have already run
2. Executes pending migrations in chronological order
3. Records successful migrations in the migrations tracking table

### Check Migration Status
View which migrations have run and which are pending:

```bash
elegant migrate:status
```
Output example:
```console
Migration Status:
✓ 20250101120000_CreateUsersTable
✓ 20250101130000_CreatePostsTable
✗ 20250102140000_AddPhoneToUsers (pending)
```
### Migration Output
Migrations provide feedback as they run:

```console
Running migrations...
✓ CreateUsersTable
✓ CreatePostsTable
✓ AddPhoneToUsers

Migrations completed successfully.
```

## Rolling Back Migrations
### Rollback Last Batch
Undo the most recent migration batch:

```bash
elegant migrate:rollback
```
This executes the `down()` method of the last batch of migrations.
### Rollback Multiple Batches
Rollback a specific number of migration batches:
```bash
# Rollback last 3 batches
elegant migrate:rollback --step=3
```
### Rollback All Migrations
Reset the database to its initial state:
```bash
elegant migrate:reset
```

> Warning: Data Loss Rolling back migrations will drop tables and delete data. Always backup your database before rolling back migrations in production environments.
> {style="warning"}

Migration Best Practices
1. Always Provide Down Methods
   Every migration should have a working down() method:

```typescript
// Good
export class CreateUsersTable extends Migration {
  async up() {
    await this.schema.create('users', (table) => {
      // table definition
    });
  }
  
  async down() {
    await this.schema.drop('users');
  }
}

// Bad - missing down() implementation
export class CreateUsersTable extends Migration {
  async up() {
    await this.schema.create('users', (table) => {
      // table definition
    });
  }
  
  async down() {
    // TODO: Implement rollback
  }
}
```

### 2. Keep Migrations Focused
Each migration should do one thing:

```typescript
// Good - single purpose
export class AddEmailVerificationToUsers extends Migration {
  // Only adds email verification fields
}

// Bad - does too much
export class UpdateUsersAndPosts extends Migration {
  // Modifies multiple unrelated tables
}
```

### 3. Test Migrations Both Ways
Always test both `up()` and `down()` methods:

```bash
# Run migration
elegant migrate

# Test rollback
elegant migrate:rollback

# Re-run migration
elegant migrate
```

### 4. Use Descriptive Names
Migration names should clearly describe what they do:

```text
// Good
CreateUsersTable
AddEmailVerificationToUsers
AddIndexToProductsSku
CreateOrdersTable

// Bad
UpdateDatabase
Changes
Migration1
Fix
```

### 5. Handle Production Carefully
In production environments:
- **Backup first** - Always backup before running migrations
- **Review changes** - Understand what each migration does
- **Plan downtime** - Some migrations may require brief downtime
- **Test in staging** - Run migrations in a staging environment first
- **Monitor performance** - Large table alterations can be slow

### 6. Version Control
- Always commit migration files to version control
- Never modify migrations that have run in production
- Create new migrations to fix issues instead of editing old ones

## Database-Specific Considerations
### MySQL / MariaDB
```typescript
await this.schema.create('users', (table) => {
  table.id();
  table.string('name');
  
  // MySQL specific options
  table.engine('InnoDB');
  table.charset('utf8mb4');
  table.collation('utf8mb4_unicode_ci');
});
```

### PostgreSQL

```typescript
// PostgreSQL supports more advanced column types
table.json('metadata');          // JSON column
table.jsonb('settings');         // JSONB column (more efficient)
table.uuid('id').primary();      // UUID primary key
```

### SQLite
SQLite has some limitations:
- Limited `ALTER TABLE` support
- No `ENUM` type (use CHECK constraints)
- Foreign keys must be enabled explicitly

```typescript
// SQLite limitations
// ✓ Supported
table.string('name');
table.integer('age');

// ✗ Limited support
table.renameColumn('old', 'new');  // Not supported
table.dropColumn('column');         // Not supported
```

## Troubleshooting
### Migration Failed
If a migration fails midway:
1. Check the error message for details
2. Review the migration code
3. Fix the issue
4. Rollback if necessary: `elegant migrate:rollback`
5. Re-run the migration: `elegant migrate`

### Multiple Connections
Specify which connection to use:

```typescript
export class CreateAnalyticsEvents extends Migration {
  connection = 'analytics';
  
  async up() {
    await this.schema.create('events', (table) => {
      table.id();
      table.string('event_name');
      table.timestamps();
    });
  }
  
  async down() {
    await this.schema.drop('events');
  }
}
```

Run migrations for a specific connection:
```bash
elegant migrate --connection=analytics
```
## Next Steps
- Learn about [Query Builder](Query-Builder.md) to interact with your database
- Explore [Elegant ORM](Elegant-Getting-Started.md) for model-based interactions
- Review [database configuration](Getting-Started.md) options
