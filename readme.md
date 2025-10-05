# Database: Getting Started

## Introduction

Almost every modern web application interacts with a database. Elegant makes interacting with databases extremely simple across a variety of supported databases using raw SQL, a [fluent query builder](./Writerside/Topics/Query-Builder.md), and the [Elegant ORM](./Writerside/Topics/Elegant-Getting-Started.md). Currently, Elegant provides first-party support for five databases:

* MySQL
* MariaDB
* PostgreSQL
* SQLite3
* SQL Server

### Configuration

The configuration for Elegant's database services is located in your application's `elegant.config.js` configuration file. In this file, you may define all of your database connections, as well as specify which connection should be used by default. Most of the configuration options within this file are driven by the values of your application's environment variables. Examples for most of Laravel's supported database systems are provided in this file.

#### SQLite Configuration

SQLite databases are contained within a single file on your filesystem. You can create a new SQLite database using the touch command in your terminal: `touch database/database.sqlite`. After the database has been created, you may easily configure your environment variables to point to this database by placing the absolute path to the database in the DB_DATABASE environment variable:

```bash
DB_CONNECTION=sqlite
DB_DATABASE=/absolute/path/to/database.sqlite
```

> **elegant init**
>
> If you use the `elegant init` command to create your Elegant configuration and select SQLite as your database, Elegant will automatically create a resources/database/database.sqlite file and run the default database migrations for you.
>
{style="note"}

## Running SQL Queries

Once you have configured your database connection, you may run queries using the Elegant instance. The Elegant instance provides methods for each type of query: `select`, `update`, `insert`, `delete`, and `statement`.

### Running a Select Query

To run a basic SELECT query, you may use the select method on the Elegant instance:

```typescript
import Elegant from '@elegant/core';

const db = await Elegant.connection();
const users = await db.select('select * from users where id = ?',[1])

```

The first argument passed to the `select` method is the SQL query, while the second argument is any parameter bindings that need to be bound to the query. Typically, these are the values of the `where` clause constraints. Parameter binding provides protection against SQL injection.

The `select` method will always return an `array` of results. You can pass a top type to the `select` method to cast the results to a specific type:

```typescript
const users:User[] = await db.select<User>('select * from users')
```

### Selecting Scalar Values

Sometimes your database query may result in a single, scalar value. Instead of being required to retrieve the query's scalar result from a record object, Laravel allows you to retrieve this value directly using the `scalar` method:

```typescript
const id:number = await db.scalar('select max(id) from users')
```

### Running an Update Statement

The `update` method should be used to update existing records in the database. The number of rows affected by the statement is returned by the method:

```typescript
const affected = await db.update('update users set votes = votes + 1 where name = ?', ['John'])
```

### Running a Delete Statement

The `delete` method should be used to delete records from the database. Like `update`, the number of rows affected will be returned by the method:

```typescript
const affected = await db.delete('delete from users where name = ?', ['John'])
```

### Insert/Update Multiple Records
When you need to insert or update multiple records at once, you may use the `statement` method. The `statement` method accepts a SQL statement and an array of parameter bindings. The `statement` method will return the number of rows affected by the statement:

```typescript
const users = [
  ["John", "Doe"],
  ["Jane", "Doe"],
  ["John", "Doe"]
]

const affected = await db.statement('insert into users (name, email) values (?, ?)', users)
```

### Running an Unprepared Statement

Sometimes you may want to execute an SQL statement without binding any values. You may use the `select` method to accomplish this:

```typescript
const user = await db.select('select * from users where id = 1')
```
> **SQL Injections**
>
> Since unprepared statements do not bind parameters, they may be vulnerable to SQL injection. You should never allow user controlled values within an unprepared statement.
>
{style="warning"}

### Implicit Commits

When using the Elegant instance's `statement` method within transactions, you must be careful to avoid statements that cause [implicit commits](https://dev.mysql.com/doc/refman/8.0/en/implicit-commit.html). These statements will cause the database engine to indirectly commit the entire transaction, leaving Laravel unaware of the database's transaction level. An example of such a statement is creating a database table:

```typescript
await db.statement('create table users (id int, name varchar(255))')
```
Please refer to the MySQL manual for [a list of all statements](https://dev.mysql.com/doc/refman/8.0/en/implicit-commit.html) that trigger implicit commits.

## Using Multiple Database Connections

If your application defines multiple connections in your `elegant.config.js` configuration file, you may access each connection via the `connection` method provided by the Elegant instance. The connection name passed to the connection method should correspond to one of the connections listed in your `elegant.config.js` configuration file or configured at runtime using the config helper:

```typescript
const db = await Elegant.connection('mysql')
```

You may access the raw, underlying driver instance of a connection using the getConnection method on a connection instance:
