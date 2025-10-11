# Installation
<show-structure for="chapter,procedure" depth="2"/>

## Meet Elegant
Elegant is a web application framework with expressive, elegant syntax.

Elegant strives to provide an amazing developer experience while providing powerful features such as fluent query builder,
Object Relational Mapping, multiple database support, and more.

### Why Elegant? 
There are a variety of database tools and frameworks available to you when building a web application. 
However, we believe Elegant is the best choice for interfacing with your database.

## Creating a Elegant Project
Before creating your first Elegant project, make sure that your local machine has Node and NPM or Bun installed. 

### Installing Elegant
To install Elegant, you can use NPM or Yarn.
```bash
npm install @pristine/elegant
```

You can then setup npm scripts to run Elegant commands.

```bash

{
  "scripts": {
    "migrate:rollback": "elegant migrate rollback",
    "migrate:latest": "elegant migrate latest",
  }
}
```

#### Installing Elegant Globally
If you want to install Elegant globally, you can use NPM or Yarn.

```bash
npm install @pristine/elegant -g
```

### Initializing Configuration
To initialize Elegant, you can use the `elegant init` command to generate a configuration file, 
migrations directory, and seeders directory.

```bash
# initialize Elegant with migrations
npx elegant init --migration

# initialize Elegant with migrations in a custom path
npx elegant init --migration-path ./database/migrations

# initialize Elegant with migrations and seeders
npx elegant init --migration --seeder
```
