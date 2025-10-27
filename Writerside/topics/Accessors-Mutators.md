# Elegant: Accessors &amp; Mutators

<show-structure depth="2"/>

## Overview
Elegant provides powerful mechanisms to transform attribute values as they're read from or written to your database. These features enable you to:

* Automatically encrypt sensitive data during storage and decrypt it on retrieval
* Convert database strings into structured data types like arrays or objects
* Format values consistently across your application
* Implement custom business logic for attribute handling

### Understanding Accessors
Accessors modify attribute values when you retrieve them from a model instance. They act as intermediaries between the raw database value and the value your application code receives.
To create an accessor, define a protected method on your model class. The method name should use camelCase formatting to represent the underlying database column name.

Example: Creating a Name Accessor

```TypeScript
class User extends Model {
  gender:string
  firstName:string
  lastName:string
  name({accessor}) {
    accessor(name => this.gender === 'm' ? 'Mr. ' + name : 'Ms. ' + name)
  }
}
```

When you access user.name, Elegant automatically invokes this accessor, applying the appropriate title prefix based on the user's gender attribute.

### Accessing Transformed Values:
```typescript
const user = await User.find(1);
console.log(user.name); // "Mr. John Smith" or "Ms. Jane Doe"
```
The accessor executes transparently whenever you reference the attribute. Your application code works with the transformed value while the raw data remains unchanged in the database.
### Understanding Mutators
Mutators work in the opposite direction—they transform attribute values before saving them to the database. This ensures data consistency and can enforce formatting rules at the model level.

Example: Creating a First Name Mutator

```typescript
class User extends Model {
  firstName({ mutator }) {
    mutator(firstName => firstName === 'Williams' ? 'Bill' : firstName)
  }
}
```
In this example, the `firstName` method receives a configuration object containing a mutator function. You call mutator with a transformation function that takes the current value and modifies it. This function executes whenever the `firstName` attribute is accessed or modified.

How It Works:

* The transformation function receives the attribute's value as its parameter
* Your logic determines what transformation to apply
* The mutated value becomes what your application sees
* In this case, any user with the first name "Williams" will display as "Bill"

This pattern provides a clean, functional approach to attribute transformation that integrates seamlessly with Elegant's TypeScript-based architecture.

### Combining Accessors and Mutators
You can define both transformations for the same attribute, creating a complete bidirectional transformation pipeline:
```typescript
class User extends Model {
  firstName({ accessor, mutator }) {
    accessor(firstName => firstName.charAt(0).toUpperCase() + firstName.slice(1));
    mutator(firstName => firstName.toLowerCase());
  }
}
```
This approach keeps related transformation logic organized in one place. The mutator stores values in lowercase, while the accessor capitalizes them on retrieval, ensuring consistent data storage and presentation formatting.
