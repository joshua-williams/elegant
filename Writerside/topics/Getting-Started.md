# Database: Getting Started
<show-structure depth="1"/>

## Introduction

Modern applications depend on reliable, efficient database interactions. Elegant simplifies this process by providing a clean, expressive interface for working with databases. Whether you need raw SQL power, a fluent query builder, or an elegant ORM, this toolkit has you covered.

Elegant offers native support for four popular database systems:

* **MySQL** - The world's most popular open-source database
* **MariaDB** - A performance-enhanced MySQL fork
* **PostgreSQL** - Advanced open-source relational database
* **SQLite** - Lightweight, file-based database perfect for development

## Configuration

### Setting Up Your Database Connection

Database configuration is managed through the `elegant.config.js` file in your project root. This file defines your database connections and specifies which one to use by default.

Here's a complete configuration example:

```javaScript
export default {
  default: 'mysql',
  connections: {
    mysql: {
      dialect: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 3306,
      database: process.env.DB_DATABASE,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD
    },
    postgres: {
      dialect: 'postgres',
      host: process.env.PG_HOST || 'localhost',
      port: parseInt(process.env.PG_PORT) || 5432,
      database: process.env.PG_DATABASE,
      user: process.env.PG_USER,
      password: process.env.PG_PASSWORD
    },

    sqlite: {
      dialect: 'sqlite',
      database: 'database/database.sqlite'
    }
  },
  migrations: {
    table: 'migrations',
    directory: 'resources/database/migrations',
  },
}
```

### Environment Variables
It's best practice to store sensitive database credentials in environment variables. Create a `.env` file in your project root:

```
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=my_database
DB_USER=my_user
DB_PASSWORD=my_password
```

You may override the default config and migrations path with Elegant specific environment variables.
```bash
ELEGANT_CONFIG_PATH=relative/path/elegant.config.js
ELEGANT_MIGRATION_DIR=relative/path/to/migrations
```

> **Quick Setup Tip**
>
> Run `elegant init` and select SQLite to automatically create the database file and run initial migrations.
>
{style="note"}


## Executing SQL Queries

### Establishing a Connection

Before running queries, establish a connection to your database:

```typescript 
import Elegant from '@pristine/elegant';
const db = await Elegant.connection();
```
In most applications, a single database instance is created and shared across multiple services throughout the application lifecycle. Elegant elegantly implements the singleton design pattern to ensure efficient resource management and connection reuse:
```typescript
const db = await Elegant.singleton();
```

To use a specific connection (other than the default):
```typescript 
const db = await Elegant.singleton('postgres');
```

Gracefully disconnect from an Elegant database instance that was instantiated using the `connection` method:
```typescript
const db = await Elegant.connection()
await db.disconnect()
```
Disconnect from all Elegant database instances that were created with the `singleton` method:
```typescript
await Elegant.disconnect()
```
### SELECT Queries

Retrieve data using the `select` method:

```typescript 
import Elegant from '@pristine/elegant';
const db = await Elegant.singleton(); 
const users = await db.select('SELECT * FROM users WHERE active = ?', [true]);
```


**Parameters:**
- First argument: SQL query string
- Second argument: Array of parameter bindings

The `select` method returns an array of results. Each result is a plain object with column names as properties.

### Type-Safe Queries

Leverage TypeScript's type system for better code safety and IDE support:
```typescript
interface User { 
  id: number; 
  name: string; 
  email: string; 
  active: boolean; 
}
const users = await db.select<User>( 'SELECT * FROM users WHERE active = ?', [true] );
  // TypeScript now knows the structure of users 
   users.forEach(user => { console.log(user.email); // Type-safe access 
});
```


### Retrieving Scalar Values

When you need a single value instead of a full result set, use the `scalar` method:

```typescript
const maxId = await db.scalar ('SELECT MAX(id) FROM users'); 
const userCount = await db.scalar('SELECT COUNT(*) FROM users WHERE active = ?', [true]);
```

### UPDATE Queries

Modify existing records with the `update` method, which returns the number of affected rows:

```typescript 
const affectedRows = await db.update( 'UPDATE users SET last_login = NOW() WHERE email = ?', ['user@example.com'] );
console.log(`Updated ${affectedRows} user(s)`);
```

### DELETE Queries

Remove records using the `delete` method:
```typescript
const deletedRows = await db.delete(`DELETE FROM users WHERE is_active = 0`);
console.log(`Cleaned up ${deletedRows} expired session(s)`);
```

### Raw Queries Without Binding

```typescript 
const result = await db.select('SELECT * FROM users LIMIT 10');
```


> **Security Warning**
>
> Queries without parameter binding are vulnerable to SQL injection attacks. Never use user input directly in unprepared statements. Always use parameterized queries when dealing with user-provided data.
>
{style="warning"}

## Parameter Binding

Elegant uses parameterized queries to protect against SQL injection. Parameters are represented by `?` or `$n` placeholders depending the database dialect. 

MySQL and MariaDB and SQLite use `?` to represent parameters while Postgres use `$` followd by the parameter number.
```typescript 
// Safe - uses parameter binding 
const user = await db.select( 'SELECT * FROM users WHERE email = ?', [userInput] );
```

```typescript
// Dangerous - DO NOT DO THIS 
const email = 'no@email.com'
const user = await db.select(`SELECT * FROM users WHERE email = '${email}'`)
```


### Accessing the Underlying Driver

For advanced use cases, access the raw database driver:
```typescript
const db = await Elegant.connection(); 
const rawConnection = db.connection;
// Now you can use driver-specific features
```


## Database Transactions

Transactions ensure data integrity by grouping multiple operations into an atomic unit:
```typescript
const db = await Elegant.connection();
await db.transaction(async (trx) => {
  await trx.insert('INSERT INTO orders (user_id, total) VALUES (?, ?)', [userId, total]);
  await trx.update('UPDATE inventory SET quantity = quantity - ? WHERE product_id = ?', [qty, productId]);
  await trx.insert('INSERT INTO order_items (order_id, product_id) VALUES (?, ?)', [orderId, productId]);
});
```


Manual transaction control:

```typescript 
const db = await Elegant.connection();
await db.beginTransaction();
try {
  await db.insert('INSERT INTO accounts (name) VALUES (?)', ['Savings']);
  await db.update('UPDATE balances SET amount = amount - ? WHERE id = ?', [100, 1]);
  await db.commit();
} catch (error) {
  await db.rollback();
  throw error;
}
```


> **Important: Implicit Commits**
>
> Some SQL statements trigger implicit commits that cannot be rolled back. These include DDL statements like `CREATE TABLE`, `DROP TABLE`, `ALTER TABLE`, etc. Avoid these statements within transactions unless you understand their implications.
>
> Refer to your database documentation for a complete list of statements that cause implicit commits.
>
{style="warning"}

## Closing Connections

Close database connections when your application shuts down:

```typescript
const db = await Elegant.connection();
// ... perform database operations ...
await db.close();
```


## Database-Specific Notes

### MySQL and MariaDB

- Uses `?` for parameter placeholders
- Supports all standard features
- Recommended charset: `utf8mb4`
- Collation: `utf8mb4_unicode_ci`

### PostgreSQL

- Uses `$1`, `$2`, etc. for parameter placeholders
- Case-sensitive table and column names by default
- Supports advanced features like arrays and JSON operators
- Boolean type is native (not emulated)

### SQLite

- Uses `?` for parameter placeholders
- Lightweight, serverless database
- Limited ALTER TABLE support (some column modifications require table recreation)
- Foreign keys must be explicitly enabled in connection settings

---

## Additional Resources

For more information and support:

- GitHub Repository: https://github.com/joshua-williams/elegant
- Report Issues: https://github.com/joshua-williams/elegant/issues
- TypeScript Type Definitions: Included with package

---

## Next Steps

Now that you understand the basics of database operations with Elegant, explore more advanced features:

- [Query Builder](Query-Builder.md) - Build complex queries with a fluent interface
- [Migrations](Migrations.md) - Version control for your database schema
- [Elegant ORM](Elegant-Getting-Started.md) - Work with models instead of raw SQL


