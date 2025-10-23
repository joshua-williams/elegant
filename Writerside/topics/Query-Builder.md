# Database: Query Builder

<show-structure depth="1"/>

## Introduction

Elegant's query builder provides an intuitive, fluent interface for constructing and executing database queries. Rather than writing raw SQL strings throughout your application, the query builder offers a chainable API that's both readable and maintainable.

The query builder works seamlessly across all supported database systems (MySQL, MariaDB, PostgreSQL, and SQLite), allowing you to write database-agnostic code. All queries use parameter binding automatically, protecting your application from SQL injection vulnerabilities without any additional effort on your part.

## Why Use the Query Builder?

**Readability** - Queries read like natural language, making your code easier to understand and maintain.

**Safety** - Automatic parameter binding eliminates SQL injection risks.

**Database Agnostic** - Write once, run on any supported database system.

**Type Safety** - TypeScript integration provides autocomplete and type checking.

**Maintainability** - Changes to query logic are easier to implement and test.

## Basic Query Execution

### Getting Started

Begin building queries by calling the `table` method on your database connection:

```typescript 
import Elegant from '@pristine/elegant';
const db = await Elegant.connection(); 
const queryBuilder = db.table('users')
```

### Retrieving All Records

Use the `get` method to fetch all rows from a table:

```typescript 
const db = await Elegant.connection(); 
const users = await db.table('users').get();
console.log(`Found ${users.length} users`);
```

The `get` method returns a `Collection` instance containing the query results. Each result is represented as a plain object.

### Type-Safe Results

Leverage TypeScript generics to add type safety to your queries:

```typescript 
interface User { 
  id: number; 
  name: string; 
  email: string; 
  created_at: Date;
}
const db = await Elegant.connection();
const users = await db.table('users').get<User>();
// TypeScript knows the structure 
users.forEach(user => { 
  console.log(user.name); 
  // Type-safe property access 
});
```

### Accessing Result Data

Query results are plain objects with column names as properties:

```typescript 
const users = await db.table('users').get();
for (const user of users) { 
  console.log(`Name: ${user.name}`); 
  console.log(`Email: ${user.email}`); 
}
```

## Selecting Specific Columns

### Select Method

By default, queries return all columns (`SELECT *`). Specify particular columns using the `select` method:

#### Select specific columns as an array
```typescript 
const users = await db 
  .table('users') 
  .select(['name', 'email']) 
  .get();

```

#### Select columns as comma-separated string
```typescript
const users = await db 
  .table('users') 
  .select('name, email')
  .get();
```

### Column Aliases

Create column aliases in your queries:

```typescript 
const users = await db .table('users') 
  .select(['name', 'email as user_email']) 
  .get();
// Access using the alias 
users.forEach(user => { 
  console.log(user.user_email); 
});
```

### Aggregate Functions

Perform calculations using SQL aggregate functions:

```typescript 
// Count records const 
count = await db .table('users') 
  .select('COUNT(*) as total') 
  .first();
console.log(`Total users: ${count.total}`);
// Calculate sum 
const revenue = await db .table('orders') 
  .select('SUM(amount) as total_revenue') 
  .first();
// Get average 
const avgAge = await db .table('users') 
  .select('AVG(age) as average_age')
  .first();
```

## Filtering Results

### Where Clauses

Use the query builder's `where` method to add conditional clauses to your queries. In its standard form, `where` accepts three arguments: the column name, a comparison operator (any operator supported by your database), and the value to compare against.
```typescript 
// Basic where clause 
const activeUsers = await db
  .table('users') 
  .where('active', '=', true)
  .get();
// Multiple conditions 
const results = await db 
  .table('users') 
  .where('status', '=', 'active') 
  .and('subscription', '=', 'premium')
  .get();
```

For convenience, when checking equality, you can omit the operator and pass the value directly as the second argument. Elegant assumes the `=` operator by default:
```typescript
await db.table('users').where('name', 'jack').get()
```

### Comparison Operators

The query builder supports various comparison operators:

#### Greater than
```typescript
const seniors = await db 
  .table('users') 
  .where('age', '>', 65) 
  .get();
```

#### Less than or equal
```typescript
const juniors = await db 
  .table('employees') 
  .where('years_experience', '<=', 2) 
  .get();
```

#### Not equal
```typescript
const nonAdmins = await db 
  .table('users')
  .where('role', '!=', 'admin') 
  .get();
```

### Logical Operators

Combine conditions using logical operators:

#### AND conditions (implicit)
```typescript 
const premiumActive = await db 
  .table('users') 
  .where('subscription', '=', 'premium') 
  .and('status', '=', 'active') 
  .get();
```

#### OR conditions
```typescript
const results = await db
  .table('users') 
  .where('role', '=', 'admin') 
  .or('role', '=', 'moderator') 
  .get();
```

#### Complex conditions
```typescript
const filtered = await db 
  .table('products') 
  .where('category', '=', 'electronics') 
  .and('price', '<', 1000) 
  .or('featured', '=', true) 
  .get();
```

### IN Clauses

Check if a column value exists in a set:

```typescript 
const users = await db 
  .table('users') 
  .where('status', 'IN', ['active', 'pending', 'trial']) 
  .get();
// With numeric values 
const posts = await db .table('posts') 
  .where('category_id', 'IN', [1, 3, 5, 7]) 
  .get();
```
### BETWEEN Clauses

Filter values within a range:
```typescript 
const recentOrders = await db 
  .table('orders') 
  .where('total', 'BETWEEN', [100, 500]) 
  .get();
// Date ranges 
const thisMonth = await db 
  .table('events') 
  .where('event_date', 'BETWEEN', [startDate, endDate]) 
  .get();
```

### NULL Checks

Check for NULL or NOT NULL values:

```typescript 
// IS NULL 
const unverified = await db 
  .table('users') 
  .where('email_verified_at', 'IS', null) 
  .get();
// IS NOT NULL 
const verified = await db
  .table('users') 
  .where('email_verified_at', 'IS NOT', null) 
  .get();
```

## Ordering Results

### Order By

Sort query results using `orderBy`:

#### Ascending order (default)
```typescript 
const users = await db 
  .table('users') 
  .orderBy('name') 
  .get();
```
#### Descending order
```typescript
const recentPosts = await db 
  .table('posts')
  .orderBy('created_at', 'DESC')
  .get();
```
#### Multiple columns
```typescript
const sorted = await db 
  .table('products') 
  .orderBy('category') 
  .orderBy('price', 'DESC') 
  .get();
```

### Random Ordering

Retrieve records in random order:

```typescript
const randomUsers = await db 
  .table('users') 
  .orderByRandom() 
  .limit(5) 
  .get();
```

## Limiting Results

### Limit

Restrict the number of records returned:

```typescript 
// Get first 10
const users = await db 
  .table('users') 
  .limit(10) 
  .get();
// Top 5 products by price 
const expensive = await db 
  .table('products')
  .orderBy('price', 'DESC') 
  .limit(5) 
  .get();
```

### Offset

Skip a specified number of records:

```typescript 
// Skip first 10, get next 10 
const users = await db 
  .table('users') 
  .offset(10) 
  .limit(10) 
  .get();
```

### Pagination

Implement pagination using `limit` and `offset`:

```typescript 
function paginate(page: number, perPage: number = 20) { 
  const offset = (page - 1) * perPage;
  return db .table('users') 
    .limit(perPage) 
    .offset(offset)
    .get();
}
// Get page 1 
const firstPage = await paginate(1, 20);
// Get page 3 
const thirdPage = await paginate(3, 20);
```

## Retrieving Single Records

### First

Get the first matching record:

```typescript 
const user = await db 
  .table('users') 
  .where('email', '=', 'john@example.com') 
  .first();
if (user) {
  console.log(user.name); 
} else { 
  console.log('User not found'); 
}
```

### Find by Primary Key

Retrieve a record by its primary key:

```typescript 
const user = await db 
  .table('users') 
  .find(42);
// Specify custom primary key column 
const product = await db 
  .table('products') 
  .find(100, 'product_id');
```


## Aggregate Methods

### Count

Count the number of records:

```typescript 
const userCount = await db.table('users').count();
console.log(`Total users: ${userCount}`);
// Count with conditions
const activeCount = await db 
  .table('users') 
  .where('status', '=', 'active') 
  .count();
```

### Min and Max

Find minimum and maximum values:

```typescript 
// Minimum price 
const minPrice = await db.table('products').min('price');
// Maximum age 
const maxAge = await db.table('users').max('age');
```

### Sum

Calculate the sum of a column:

```typescript 
const totalRevenue = await db 
  .table('orders') 
  .where('status', '=', 'completed') 
  .sum('amount');
console.log(`Revenue: $${totalRevenue}`);
```

### Average

Calculate the average value:
```typescript 
const avgRating = await db 
  .table('reviews') 
  .where('product_id', '=', 123) 
  .avg('rating');
```

## Joins

### Inner Join

Combine records from multiple tables:

```typescript 
const usersWithOrders = await db 
  .table('users') 
  .select(['users.name', 'orders.total', 'orders.created_at'])
  .join('orders', 'users.id', '=', 'orders.user_id')
  .get();
```

### Left Join

Include all records from the left table:

```typescript 
const allUsers = await db 
  .table('users')
  .select(['users.name', 'orders.total'])
  .leftJoin('orders', 'users.id', '=', 'orders.user_id') 
  .get();
```

### Complex Joins

Join multiple tables:

```typescript 
const data = await db 
  .table('users') 
  .select([ 
    'users.name',
    'orders.order_number', 
    'products.name as product_name'
  ]) 
  .join('orders', 'users.id', '=', 'orders.user_id') 
  .join('order_items', 'orders.id', '=', 'order_items.order_id') 
  .join('products', 'order_items.product_id', '=', 'products.id') 
  .get();
```

## Grouping Results

### Group By

Group records by column values:

```typescript 
const usersByCountry = await db 
  .table('users') 
  .select(['country', 'COUNT(*) as total']) 
  .groupBy('country') 
  .get();
```

### Having

Filter grouped results:

```typescript 
const popularCategories = await db 
  .table('products') 
  .select(['category', 'COUNT(*) as product_count']) 
  .groupBy('category') 
  .having('product_count', '>', 10) 
  .get();
```

## Insert Operations

### Inserting Records

Add new records to the database:

```typescript 
// Insert single record 
const userId = await db
  .table('users') 
  .insert({
    name: 'Jane Doe',
    email: 'jane@example.com', 
    active: true }
  );
console.log(`Created user with ID: ${userId}`);
```

### Batch Inserts

Insert multiple records at once:

```typescript 
const ids = await db 
  .table('users') 
  .insertMany([ 
    { name: 'Alice', email: 'alice@example.com' }, 
    { name: 'Bob', email: 'bob@example.com' }, 
    { name: 'Carol', email: 'carol@example.com' } 
  ]);
```

## Update Operations

### Updating Records

Modify existing records:

```typescript 
// Update with conditions 
const affected = await db
  .table('users') 
  .where('id', '=', 1) 
  .update({
    name: 'Updated Name', 
    updated_at: new Date() 
  });
console.log(`Updated ${affected} record(s)`);
```

### Increment and Decrement

Adjust numeric values:

```typescript 
// Increment a counter 
await db .table('posts') 
  .where('id', '=', 1) 
  .increment('view_count');
// Decrement inventory 
await db 
  .table('products')
  .where('id', '=', 100) 
  .decrement('stock', 5);
```

## Delete Operations

### Deleting Records

Remove records from the database:

```typescript 
// Delete with conditions 
const deleted = await db 
  .table('users')
  .where('status', '=', 'inactive') 
  .where('last_login', '<', cutoffDate)
  .delete();
```

### Truncate Table

Remove all records from a table:

```typescript 
await db.table('sessions').truncate();
```

## Raw Expressions

### Using Raw SQL

Include raw SQL in your queries when needed:

```typescript 
const results = await db
  .table('orders') 
  .select([ 'id', 'total', db.raw('DATE(created_at) as order_date') ])
  .get();
```

## Query Debugging

### Getting the SQL

View the generated SQL query:

```typescript 
const query = db 
  .table('users') 
  .where('status', '=', 'active') 
  .orderBy('created_at', 'DESC') 
  .limit(10);
// Get the SQL and parameters 
const { sql, bindings } = query.toSql();
console.log('SQL:', sql); 
console.log('Bindings:', bindings);
```

## Best Practices

1. **Use Parameter Binding** - Always use the query builder's methods instead of string concatenation
2. **Select Specific Columns** - Only retrieve the columns you need to improve performance
3. **Index Your Conditions** - Ensure columns used in `where` clauses are properly indexed
4. **Use Pagination** - Limit large result sets with `limit` and `offset`
5. **Leverage Aggregate Functions** - Use database-level aggregation instead of processing in application code
6. **Monitor Query Performance** - Use `toSql()` to review and optimize complex queries

## Next Steps

- Learn about [Migrations](Migrations.md) to manage your database schema
- Explore [Elegant ORM](Elegant-Getting-Started.md) for model-based database interactions
- Review [database configuration](Getting-Started.md) options
