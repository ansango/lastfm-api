#!/usr/bin/env bun

/**
 * Script to generate Zod schemas from TypeScript type definitions
 * Uses ts-to-zod to convert all *.types.ts files to *.schemas.ts
 */

import { execSync } from 'child_process';
import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

// Get all type files in src/services/
const servicesDir = join(process.cwd(), 'src', 'services');
const typeFiles = readdirSync(servicesDir).filter(file => file.endsWith('.types.ts'));

console.log(`Found ${typeFiles.length} type files to process...\n`);

// Process each type file
let successCount = 0;
let errorCount = 0;

for (const typeFile of typeFiles) {
  const inputPath = join('src', 'services', typeFile);
  const outputPath = inputPath.replace('.types.ts', '.schemas.ts');
  
  console.log(`Generating schemas for ${typeFile}...`);
  
  try {
    // Run ts-to-zod with options:
    // -k: keep comments
    // --skipParseJSDoc: skip JSDoc parsing (to avoid issues with Last.fm API quirks)
    // --skipValidation: skip type validation (ts-to-zod has issues with complex optional types)
    const command = `npx ts-to-zod "${inputPath}" "${outputPath}" -k --skipParseJSDoc --skipValidation`;
    execSync(command, { stdio: 'inherit' });
    
    // Post-process the generated file to improve z.any() schemas
    improveGeneratedSchemas(outputPath);
    
    successCount++;
    console.log(`✓ Generated ${outputPath}\n`);
  } catch (error) {
    errorCount++;
    console.error(`✗ Failed to generate ${outputPath}`);
    console.error(error);
    console.log('');
  }
}

console.log(`\n=== Summary ===`);
console.log(`Success: ${successCount}/${typeFiles.length}`);
console.log(`Errors: ${errorCount}/${typeFiles.length}`);

if (errorCount > 0) {
  console.error('\nSome schemas failed to generate. Please check the errors above.');
  process.exit(1);
}

console.log('\n✓ All schemas generated successfully!');

/**
 * Post-process generated schema files to replace z.any() with proper types
 * based on the schema name patterns from base.types.ts
 */
function improveGeneratedSchemas(filePath: string) {
  let content = readFileSync(filePath, 'utf-8');
  
  // Map of schema name patterns to their proper Zod types
  const replacements: Record<string, string> = {
    // String types
    'nameSchema = z.any();': 'nameSchema = z.string();',
    'mbidSchema = z.any();': 'mbidSchema = z.string();',
    'urlSchema = z.any();': 'urlSchema = z.string();',
    'playcountSchema = z.any();': 'playcountSchema = z.string();',
    'durationSchema = z.any();': 'durationSchema = z.string();',
    'listenersSchema = z.any();': 'listenersSchema = z.string();',
    'positionSchema = z.any();': 'positionSchema = z.string();',
    'publishedSchema = z.any();': 'publishedSchema = z.string();',
    'summarySchema = z.any();': 'summarySchema = z.string();',
    'contentSchema = z.any();': 'contentSchema = z.string();',
    'artistNameSchema = z.any();': 'artistNameSchema = z.string();',
    'albumNameSchema = z.any();': 'albumNameSchema = z.string();',
    'tagNameSchema = z.any();': 'tagNameSchema = z.string();',
    'trackNameSchema = z.any();': 'trackNameSchema = z.string();',
    'userNameSchema = z.any();': 'userNameSchema = z.string();',
    'ageSchema = z.any();': 'ageSchema = z.string();',
    'subscriberSchema = z.any();': 'subscriberSchema = z.string();',
    'realNameSchema = z.any();': 'realNameSchema = z.string();',
    'bootstrapSchema = z.any();': 'bootstrapSchema = z.string();',
    'artistCountSchema = z.any();': 'artistCountSchema = z.string();',
    'albumCountSchema = z.any();': 'albumCountSchema = z.string();',
    'trackCountSchema = z.any();': 'trackCountSchema = z.string();',
    'countrySchema = z.any();': 'countrySchema = z.string();',
    'playlistsSchema = z.any();': 'playlistsSchema = z.string();',
    'genderSchema = z.any();': 'genderSchema = z.string();',
    'typeSchema = z.any();': 'typeSchema = z.string();',
    'fromSchema = z.any();': 'fromSchema = z.string();',
    'toSchema = z.any();': 'toSchema = z.string();',
    'rankSchema = z.any();': 'rankSchema = z.string();',
    'textSchema = z.any();': 'textSchema = z.string();',
    'utsSchema = z.any();': 'utsSchema = z.string();',
    'langSchema = z.any();': 'langSchema = z.string();',
    'matchSchema = z.any();': 'matchSchema = z.string();',
    'roleSchema = z.any();': 'roleSchema = z.string();',
    'searchTermsSchema = z.any();': 'searchTermsSchema = z.string();',
    'startPageSchema = z.any();': 'startPageSchema = z.string();',
    'totalPagesSchema = z.any();': 'totalPagesSchema = z.string();',
    'totalResultsSchema = z.any();': 'totalResultsSchema = z.string();',
    'startIndexSchema = z.any();': 'startIndexSchema = z.string();',
    'itemsPerPageSchema = z.any();': 'itemsPerPageSchema = z.string();',
    'forSchema = z.any();': 'forSchema = z.string();',
    'locSchema = z.any();': 'locSchema = z.string();',
    
    // Number types
    'unixtimeSchema = z.any();': 'unixtimeSchema = z.number();',
    'reachSchema = z.any();': 'reachSchema = z.number();',
    
    // Union types (string | number)
    'totalSchema = z.any();': 'totalSchema = z.union([z.string(), z.number()]);',
    'pageSchema = z.any();': 'pageSchema = z.union([z.string(), z.number()]);',
    'countSchema = z.any();': 'countSchema = z.union([z.string(), z.number()]);',
    'limitSchema = z.any();': 'limitSchema = z.union([z.string(), z.number()]);',
  };
  
  // Apply all replacements
  let modified = false;
  for (const [pattern, replacement] of Object.entries(replacements)) {
    if (content.includes(pattern)) {
      content = content.replace(new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replacement);
      modified = true;
    }
  }
  
  // Write back if we made changes
  if (modified) {
    writeFileSync(filePath, content, 'utf-8');
    console.log(`  ↳ Improved ${Object.keys(replacements).filter(k => content.includes(k.replace(' = z.any();', ''))).length} schema definitions`);
  }
}
