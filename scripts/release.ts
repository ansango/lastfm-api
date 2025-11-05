#!/usr/bin/env bun
/**
 * Complete Release Workflow
 * 
 * This script automates the entire release process:
 * 1. Runs tests
 * 2. Builds the project
 * 3. Updates changelog
 * 4. Bumps version
 * 5. Commits changes
 * 6. Creates git tag
 * 7. Creates GitHub release
 * 8. Publishes to npm
 * 
 * Usage:
 *   bun scripts/release.ts <patch|minor|major|alpha|beta>
 * 
 * Examples:
 *   bun scripts/release.ts patch    # 1.0.0 -> 1.0.1
 *   bun scripts/release.ts minor    # 1.0.0 -> 1.1.0
 *   bun scripts/release.ts major    # 1.0.0 -> 2.0.0
 *   bun scripts/release.ts alpha    # 1.0.0 -> 1.0.1-alpha.0
 *   bun scripts/release.ts beta     # 1.0.0 -> 1.0.1-beta.0
 */

import { execSync } from 'child_process';
import { readFileSync } from 'fs';

type ReleaseType = 'patch' | 'minor' | 'major' | 'alpha' | 'beta';

interface PackageJson {
	version: string;
	name: string;
}

function exec(command: string, description: string): void {
	console.log(`\n▶️  ${description}...`);
	try {
		execSync(command, { stdio: 'inherit' });
		console.log(`✅ ${description} completed`);
	} catch (error) {
		console.error(`❌ ${description} failed`);
		throw error;
	}
}

function getPackageInfo(): PackageJson {
	return JSON.parse(readFileSync('package.json', 'utf-8'));
}

function checkCleanWorkingDirectory(): void {
	const status = execSync('git status --porcelain', { encoding: 'utf-8' });
	if (status.trim()) {
		console.error('❌ Working directory is not clean');
		console.error('   Please commit or stash your changes first');
		process.exit(1);
	}
}

function getCurrentBranch(): string {
	return execSync('git branch --show-current', { encoding: 'utf-8' }).trim();
}

function bumpVersion(type: ReleaseType): string {
	console.log(`\n📈 Bumping version (${type})...`);

	const isPrerelease = type === 'alpha' || type === 'beta';
	const versionCommand = isPrerelease
		? `npm version prerelease --preid=${type} --no-git-tag-version`
		: `npm version ${type} --no-git-tag-version`;

	execSync(versionCommand, { stdio: 'pipe' });

	const newVersion = getPackageInfo().version;
	console.log(`✅ Version bumped to: ${newVersion}`);

	return newVersion;
}

function confirmRelease(version: string, type: ReleaseType, branch: string): boolean {
	console.log('\n📋 Release Summary:');
	console.log('─'.repeat(50));
	console.log(`  Package:  ${getPackageInfo().name}`);
	console.log(`  Version:  ${version}`);
	console.log(`  Type:     ${type}`);
	console.log(`  Branch:   ${branch}`);
	console.log('─'.repeat(50));

	const answer = prompt('\n❓ Proceed with release? (yes/no): ');
	return answer?.toLowerCase() === 'yes' || answer?.toLowerCase() === 'y';
}

function main() {
	console.log('🚀 Release Workflow\n');

	// Parse arguments
	const args = process.argv.slice(2);
	const releaseType = args[0] as ReleaseType;

	if (!releaseType || !['patch', 'minor', 'major', 'alpha', 'beta'].includes(releaseType)) {
		console.error('❌ Invalid release type');
		console.error('   Usage: bun scripts/release.ts <patch|minor|major|alpha|beta>');
		process.exit(1);
	}

	// Pre-flight checks
	console.log('🔍 Running pre-flight checks...');
	checkCleanWorkingDirectory();

	const branch = getCurrentBranch();
	if (branch !== 'main' && !releaseType.includes('alpha') && !releaseType.includes('beta')) {
		console.warn(`⚠️  Warning: You are on branch '${branch}', not 'main'`);
	}

	// Bump version
	const newVersion = bumpVersion(releaseType);

	// Confirm release
	if (!confirmRelease(newVersion, releaseType, branch)) {
		console.log('\n❌ Release cancelled');
		// Revert version bump
		execSync('git checkout package.json', { stdio: 'pipe' });
		process.exit(0);
	}

	try {
		// Run tests
		exec('bun test-real.ts', 'Running tests');

		// Build project
		exec('bun run build', 'Building project');

		// Generate changelog
		exec('bun scripts/changelog.ts', 'Generating changelog');

		// Commit changes
		exec(
			`git add -A && git commit -m "chore(release): ${newVersion}"`,
			'Committing changes'
		);

		// Create GitHub release
		const isPrerelease = releaseType === 'alpha' || releaseType === 'beta';
		const prereleaseFlag = isPrerelease ? '--prerelease' : '';
		exec(`bun scripts/github-release.ts ${prereleaseFlag}`, 'Creating GitHub release');

		// Publish to npm
		const npmTag = isPrerelease ? `--tag ${releaseType}` : '';
		exec(`npm publish ${npmTag}`.trim(), 'Publishing to npm');

		console.log('\n╔════════════════════════════════════════════════╗');
		console.log('║          ✨ Release Successful! ✨             ║');
		console.log('╚════════════════════════════════════════════════╝');
		console.log(`\n📦 Version ${newVersion} has been released!`);
		console.log(`🔗 https://github.com/ansango/lastfm-client-ts/releases/tag/v${newVersion}`);
		console.log(`📦 https://www.npmjs.com/package/lastfm-client-ts`);
		console.log('\n🎉 Don\'t forget to announce the release!\n');
	} catch (error) {
		console.error('\n❌ Release failed!');
		console.error('   You may need to clean up manually');
		process.exit(1);
	}
}

main();
