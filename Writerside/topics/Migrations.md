# Database: Migrations

## Introduction

Migrations are like version control for your database, allowing your team to define and share the application's database schema definition. If you have ever had to tell a teammate to manually add a column to their local database schema after pulling in your changes from source control, you've faced the problem that database migrations solve.

The Elegant Schema instance provides database agnostic support for creating and manipulating tables across all of Elegant's supported database systems. Typically, migrations will use this class to create and modify database tables and columns.

## Generating Migrations
You may use the `make:migration` Elegant command to generate a database migration. The new migration will be placed in your `resources/database/migrations` directory. Each migration filename contains a timestamp that allows Elegant to determine the order of the migrations:

```bash
elegant make:migration create_users_table
```
If you would like to specify a custom path for the generated migration, you may use the --path option when executing the make:migration command. The given path should be relative to your application's base path.


## Migration Structure
A migration class contains two methods: `up` and `down`. The `up` method is used to add new tables, columns, or indexes to your database, while the `down` method should reverse the operations performed by the `up` method.

Within both of these methods, you may use the Elegant schema builder to expressively create and modify tables. To learn about all the methods available on the Schema builder, check out its documentation. For example, the following migration creates a `users` table:

```typescript
import { Migration } from 'elegant';

export class CreateUsersTable extends Migration {
  up() {
    this.schema.create('users', (table) => {
      table.increments('id');
      table.string('name');
      table.timestamps();
    });
  }
  down() {
    this.schema.drop('users');
  }
}
```

### Setting the Migration Connection

If your migration will be interacting with a database connection other than your application's default database connection, you should set the $connection property of your migration:

```typescript
export class CreateUsersTable extends Migration {
  $connection = 'pgsql';
}
```

## Tables
Creating Tables
To create a new database table, use the `create` method on the Schema facade. The `create` method accepts two arguments: the first is the name of the table, while the second is a closure which receives a `SchemaTable` object that may be used to define the new table:

```typescript
export class CreateUsersTable extends Migration {
  up() {
    this.schema.create('users', (table) => {
      table.increments('id');
      table.string('name');
      table.timestamps();
    });
  }
  down() {
    this.schema.drop('users');
  }
}
```

When creating the table, you may use any of the schema builder's column methods to define the table's columns.

### Database Connection and Table Options

If you want to perform a schema operation on a database connection that is not your application's default connection, use the connection method:

```typescript

this.schema.connection('pgsql').create('users', (table) => {
  table.increments('id');
  table.string('name');
  table.timestamps();
})

```

In addition, a few other properties and methods may be used to define other aspects of the table's creation. The engine property may be used to specify the table's storage engine when using MariaDB or MySQL:

```typescript
this.schema.create('users', (table) => {
  table.engine('InnoDB');
})
```

The `charset` and `collation` properties may be used to specify the character set and collation for the created table when using MariaDB or MySQL:

```typescript
this.schema.create('users', (table) => {
  table.charset('utf8mb4');
  table.collation('utf8mb4_unicode_ci');
})
```

The `temporary` method may be used to indicate that the table should be "temporary". Temporary tables are only visible to the current connection's database session and are dropped automatically when the connection is closed:
