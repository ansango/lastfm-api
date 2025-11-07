/**
 * Example: Using Zod schemas for runtime validation
 * 
 * This file demonstrates how consumers can use the generated Zod schemas
 * to validate data at runtime.
 */

import { userGetInfoRequestSchema, userGetInfoResponseSchema } from './dist/entrypoints/user.schemas.js';

// Example 1: Validate request parameters
console.log('Example 1: Validate request parameters');
console.log('========================================\n');

const validParams = { user: 'ansango' };
const invalidParams = { username: 'ansango' }; // Wrong property name

try {
  const validated = userGetInfoRequestSchema.parse(validParams);
  console.log('✓ Valid params:', validated);
} catch (error) {
  console.error('✗ Validation failed:', error);
}

console.log('\n');

try {
  const validated = userGetInfoRequestSchema.parse(invalidParams);
  console.log('✓ Valid params:', validated);
} catch (error) {
  console.error('✗ Invalid params detected (expected)');
}

// Example 2: Safe parsing (doesn't throw)
console.log('\n\nExample 2: Safe parsing');
console.log('========================\n');

const result1 = userGetInfoRequestSchema.safeParse(validParams);
if (result1.success) {
  console.log('✓ Params are valid:', result1.data);
} else {
  console.error('✗ Validation errors:', result1.error);
}

const result2 = userGetInfoRequestSchema.safeParse(invalidParams);
if (result2.success) {
  console.log('✓ Params are valid:', result2.data);
} else {
  console.error('✗ Validation errors detected (expected)');
}

console.log('\n✓ Schema validation examples completed!');
