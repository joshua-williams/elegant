# Installation
<show-structure for="chapter,procedure" depth="2"/>

## Meet Elegant

Elegant is a TypeScript database toolkit that brings simplicity and expressiveness to database interactions. Built with developer experience in mind, Elegant provides an intuitive API for working with relational databases without sacrificing power or flexibility.

Whether you're building a REST API, web application, or data-intensive service, Elegant streamlines your database operations with a fluent query builder, comprehensive migration system, and powerful ORM capabilities.

### Why Choose Elegant?

When building modern applications, choosing the right database abstraction layer is crucial. Here's what sets Elegant apart:

**Multi-Database Support** - Write once, run anywhere. Elegant provides a unified API that works seamlessly across MySQL, MariaDB, PostgreSQL, and SQLite, allowing you to switch databases without rewriting code.

**Type Safety** - Built with TypeScript from the ground up, Elegant leverages type inference to catch errors at compile time and provide excellent IDE support with autocomplete and inline documentation.

**Developer Experience** - Elegant's fluent, chainable API reads like natural language, making database operations intuitive and your code more maintainable.

**Zero Dependencies Drama** - Elegant is designed to be lightweight and focused, minimizing bloat while maximizing functionality.

## Prerequisites

Before installing Elegant, ensure you have the following installed on your development machine:

- **Node.js** (version 16 or higher)
- **NPM**, **Yarn**, or **Bun** package manager

## Installation

### Adding Elegant to Your Project

Install Elegant using your preferred package manager:

#### Using NPM
`npm install @pristine/elegant`

#### Using Yarn
yarn add @pristine/elegant

#### Using Bun
`bun add @pristine/elegant`

### Setting Up NPM Scripts

Add Elegant commands to your `package.json` for quick access:

```json
{
  "scripts": {
    "db:migrate": "elegant migrate",
    "db:rollback": "elegant migrate:rollback",
    "db:status": "elegant migrate:status",
    "db:make:migration": "elegant make:migration"
  }
}
```

Now you can run migrations with simple commands:
```bash
npm run db:migrate 
npm run db:rollback
```

## Project Initialization

### Quick Start with Init Command

Elegant provides an initialization command that scaffolds your database configuration and directory structure:

#### Basic Initialization
```bash
npx elegant init
```

#### Custom Migrations Directory
```bash
npx elegant init --migration-dir ./database/migrations
```

```javascript
export default {
  default: 'mysql',
  connections: {
    mysql: {
      dialect: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 3306,
      database: process.env.DB_DATABASE || 'elegant_db',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || ''
    },
    sqlite: {
      dialect: 'sqlite',
      database: 'database/database.sqlite'
    }
  }
}
```

## Next Steps

Now that Elegant is installed, you're ready to:

1. [Configure your database connection](https://elegant.pristine.technology/getting-started.html#configuration)
2. [Run your first query](https://elegant.pristine.technology/getting-started.html)
3. [Create database migrations](https://elegant.pristine.technology/migrations.html)
4. [Build queries with the Query Builder](https://elegant.pristine.technology/query-builder.html)
5. [Define models with Elegant ORM](https://elegant.pristine.technology/elegant-getting-started.html)
