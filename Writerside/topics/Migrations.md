# Database: Migrations

## Introduction

Migrations are like version control for your database, allowing your team to define and share the application's database schema definition. If you have ever had to tell a teammate to manually add a column to their local database schema after pulling in your changes from source control, you've faced the problem that database migrations solve.

The Elegant Schema instance provides database agnostic support for creating and manipulating tables across all of Elegant's supported database systems. Typically, migrations will use this class to create and modify database tables and columns.

## Generating Migrations
You may use the `make:migration` Elegant command to generate a database migration. The new migration will be placed in your `resources/database/migrations` directory. Each migration filename contains a timestamp that allows Elegant to determine the order of the migrations:

```bash
elegant make:migration create_users_table
```
