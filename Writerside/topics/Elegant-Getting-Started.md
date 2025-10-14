# Elegant ORM: Getting Started

## Introduction

The Elegant ORM (Object-Relational Mapper) transforms database tables into intuitive TypeScript classes, letting you work with database records as objects rather than writing raw SQL. This object-oriented approach makes your code more maintainable, readable, and enjoyable to write.

With Elegant ORM, each database table is represented by a Model class. These models provide methods to query, insert, update, and delete records while maintaining type safety and providing a clean, expressive API.

## Why Use an ORM?

**Type Safety** - Define your data structures once, and TypeScript ensures you're always working with the correct types.

**Productivity** - Write less code. Instead of crafting SQL for every operation, use intuitive methods that handle the heavy lifting.

**Maintainability** - Business logic stays in your application code, not scattered across SQL strings throughout your codebase.

**Flexibility** - When you need raw SQL power, it's always available. Elegant ORM complements rather than replaces SQL.

## Configuration

Before using Elegant models, ensure your database connection is properly configured in your `elegant.config.js` file:

```javascript 
export default {
  default: 'mysql',
  connections: {
    mysql: {
      dialect: 'mysql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT) || 3306,
      database: process.env.DB_DATABASE,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD
    }
  }
}
```


For detailed configuration options, see the [database configuration guide](Getting-Started.md#configuration).

## Defining Models

Models are TypeScript classes that extend the `Elegant` base class. Each model corresponds to a database table.

### Basic Model Structure

```typescript 
import { Model } from '@pristine/elegant';
export class User extends Model { // The table associated with the model
  protected table = 'users';
  // The primary key for the table protected 
  primaryKey = 'id';
  // Type definitions for your model 
  id!: number; 
  name!: string;
  email!: string;
  created_at!: Date; 
  updated_at!: Date; 
}

```


### Model Conventions

Elegant follows sensible conventions to minimize configuration:

- **Table Names** - By default, the model class name is converted to snake_case and pluralized (e.g., `UserProfile` → `user_profiles`)
- **Primary Keys** - Assumes an auto-incrementing column named `id`
- **Timestamps** - Automatically manages `created_at` and `updated_at` columns

You can override these conventions as needed:

```typescript 
export class Account extends Model {
  protected table = 'account_records'; // Custom table name protected
  primaryKey = 'account_id'; // Custom primary key
  public timestamps = false; // Disable timestamp management
}
```

## Retrieving Models

Once you've defined a model, you can start querying your database:

### Retrieving All Records

```typescript 
import { User } from './models/User';
const users = await User.all();
users.forEach(user => { console.log(user.name); });
```


### Finding by Primary Key

```typescript 
// Find user with ID 1 
const user = await User.find(1);
if (user) { console.log(user.email); }
```

```typescript
// Find or throw an error if not found 
const user = await User.findOrFail(1);
```

### Adding Constraints

```typescript 
// Find all active 
users const activeUsers = await User.where('active', true).get();
```

```typescript
// Find users with complex conditions 
const vipUsers = await User
  .where('subscription_type', 'premium') 
  .where('status', 'active') 
  .orderBy('created_at', 'desc') 
  .limit(10) 
  .get();
```


## Creating and Updating Models

### Creating New Records

There are several ways to create new model instances:
#### Method 1: Create and save
```typescript 

const user = new User(); 
user.name = 'Jane Doe'; 
user.email = 'jane@example.com'; 
await user.save();
```
#### Method 2: Create with attributes
```typescript
const user = await User.create({ 
  name: 'John Smith', 
  email: 'john@example.com' 
});
```
#### Method 3: Mass assignment
```typescript
const users = await User.createMany([ 
  { name: 'Alice', email: 'alice@example.com' }, 
  { name: 'Bob', email: 'bob@example.com' } 
]);

```

### Updating Records

#### Update a single model
```typescript 
const user = await User.find(1); 
user.name = 'Updated Name'; 
await user.save();
```

#### Update using query
```typescript
await User 
  .where('status', 'inactive') 
  .update({ status: 'archived' });
```

#### Update or create
```typescript
const user = await User.updateOrCreate( 
  { email: 'user@example.com' }, 
  // Search criteria 
  { name: 'User Name', active: true } 
  // Values to update/create 
);
```


## Deleting Models

### Delete Single Records

#### Delete after retrieving
```typescript 
const user = await User.find(1); 
await user.delete();
```

#### Delete by primary key
```typescript
await User.destroy(1);
```

#### Delete multiple by IDs
```typescript
await User.destroy([1, 2, 3]);
```

### Delete with Constraints

#### Delete all inactive
```typescript 
users await User.where('active', false).delete();
```

#### Delete with conditions
```typescript
await User 
  .where('created_at', '<', oldDate) 
  .where('verified', false) 
  .delete();
```

## Relationships

Define relationships between models to work with related data:

```typescript 
export class User extends Model { 
  // One-to-many relationship 
  posts() { 
    return this.hasMany(Post, 'user_id'); 
  }
  // One-to-one relationship 
  profile() { 
    return this.hasOne(Profile, 'user_id'); 
  }
  // Many-to-many relationship
  roles() { 
    return this.belongsToMany(Role, 'user_roles'); 
  }
}
// Access relationships 
const user = await User.find(1);
const posts = await user.posts().get(); 
const profile = await user.profile().first();
```

## Working with Timestamps

Elegant automatically manages `created_at` and `updated_at` timestamps:

```typescript
const user = await User.create({
  name: 'Jane Doe',
  email: 'jane@example.com'
});

console.log(user.created_at); // Current timestamp
console.log(user.updated_at); // Current timestamp

// Update the model
user.name = 'Jane Smith';
await user.save();

console.log(user.updated_at); // Updated to current timestamp
```

Disable timestamps if your table doesn't use them:

```typescript
export class Log extends Model {
  protected table = 'logs';
  public timestamps = false;
}
```

### Advanced Features
#### Using Different Conections
Specify which database connection a model should use:
```typescript
export class AnalyticsEvent extends Model {
  protected connection = 'analytics';
  protected table = 'events';
}
```

### Custom Queries
Drop down to raw SQL when needed:

```typescript
const users = await User.raw(
  'SELECT * FROM users WHERE created_at > ?',
  [lastWeek]
);
```

### Eager Loading
Optimize queries by loading relationships upfront:

```typescript
// N+1 problem - makes many queries
const users = await User.all();
for (const user of users) {
  const posts = await user.posts().get(); // Query per user
}

// Eager loading - single query
const users = await User.with('posts').get();
for (const user of users) {
  console.log(user.posts); // Already loaded
}
```

## Best Practices
1. **Use Type Definitions** - Define all model properties with TypeScript types for better IDE support
3. **Eager Load Relationships** - Avoid N+1 query problems by using eager loading
4. **Validate Data** - Implement validation in your models before saving
5. **Use Transactions** - Wrap related operations in transactions to maintain data integrity

## Next Steps
- Explore the [Query Builder](Query-Builder.md) for more complex queries
- Learn about [Migrations](Migrations.md) to manage your database schema
- Review [database configuration](Getting-Started.md) options
