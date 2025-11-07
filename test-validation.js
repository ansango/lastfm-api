/**
 * Validation test to demonstrate type checking
 */

import { userGetInfoRequestSchema, userSchema } from './dist/entrypoints/user.schemas.js';
import { imageSchema, periodSchema } from './dist/entrypoints/base.schemas.js';

console.log('Testing schema type validation\n');
console.log('================================\n');

// Test 1: Request with correct types
console.log('Test 1: userGetInfoRequestSchema');
const validRequest = userGetInfoRequestSchema.safeParse({ user: 'ansango' });
console.log('✓ Valid request:', validRequest.success);

// Test 2: Request with wrong type (number instead of string)
const invalidRequest = userGetInfoRequestSchema.safeParse({ user: 12345 });
console.log('✗ Invalid request (number):', invalidRequest.success);
if (!invalidRequest.success) {
  console.log('  Errors:', invalidRequest.error.issues.length);
}

// Test 3: Image schema with size validation
console.log('\nTest 2: imageSchema');
const validImage = imageSchema.safeParse({
  '#text': 'https://example.com/image.jpg',
  size: 'large'
});
console.log('✓ Valid image:', validImage.success);

const invalidImage = imageSchema.safeParse({
  '#text': 'https://example.com/image.jpg',
  size: 'invalid-size'
});
console.log('✗ Invalid image size:', invalidImage.success);
if (!invalidImage.success) {
  console.log('  Errors:', invalidImage.error.issues.length);
}

// Test 4: Period enum validation
console.log('\nTest 3: periodSchema');
const validPeriod = periodSchema.safeParse('7day');
console.log('✓ Valid period (7day):', validPeriod.success);

const invalidPeriod = periodSchema.safeParse('30day');
console.log('✗ Invalid period (30day):', invalidPeriod.success);
if (!invalidPeriod.success) {
  console.log('  Errors:', invalidPeriod.error.issues.length);
}

console.log('\n✓ All type validation tests completed!');
