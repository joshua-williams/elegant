# Database: Query Builder

## Introduction
Elegant's database query builder provides a convenient, fluent interface to creating and running database queries. 
It can be used to perform most database operations in your application and works perfectly with all of Elegant's supported database systems.

The Elegant query builder uses parameter binding to protect your application against SQL injection attacks. 
There is no need to clean or sanitize strings passed to the query builder as query bindings.

## Running Database Queries

### Retrieving All Rows From a Table

You may use the `table` method provided by the Elegant instance to begin a query. The `table` method returns a 
fluent query builder instance for the given `table`, allowing you to chain more constraints onto the query and then 
finally retrieve the results of the query using the `get` method:

```typescript
import Elegant from 'elegant';

const db = await Elegant.connection();
const users = await db.table('users').get()
```
The get method returns an `Elegant.Collection` instance containing the results of the query where each result 
is an object literal. You may pass a top type to the get method to cast the results to a specific type:

```typescript
import User from './User';
import Elegant from 'elegant';

const db = await Elegant.connection()
const users:Collection<User> = await db.table('users').get<User>()
```

You may access each column's value by accessing the column as a property of the object:
```typescript
import User from './User';
import Elegant from 'elegant';

const db = await Elegant.connection()
const users:Collection<User> = await db.table('users').get<User>()

for (const user of users) {
  console.log(user.name)
}

```
