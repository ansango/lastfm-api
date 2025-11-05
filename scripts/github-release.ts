#!/usr/bin/env bun
/**
 * Create a GitHub Release
 * 
 * Prerequisites:
 *   - Install GitHub CLI: https://cli.github.com/
 *   - Authenticate: gh auth login
 * 
 * Usage:
 *   bun scripts/github-release.ts [version] [--prerelease]
 * 
 * Examples:
 *   bun scripts/github-release.ts                  # Use package.json version
 *   bun scripts/github-release.ts v2.0.0          # Specific version
 *   bun scripts/github-release.ts --prerelease    # Mark as prerelease
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';

interface PackageJson {
	name: string;
	version: string;
	description: string;
}

function getPackageInfo(): PackageJson {
	const packageJson = JSON.parse(readFileSync('package.json', 'utf-8'));
	return {
		name: packageJson.name,
		version: packageJson.version,
		description: packageJson.description
	};
}

function checkGitHubCLI(): boolean {
	try {
		execSync('gh --version', { stdio: 'pipe' });
		return true;
	} catch {
		return false;
	}
}

function checkAuthentication(): boolean {
	try {
		execSync('gh auth status', { stdio: 'pipe' });
		return true;
	} catch {
		return false;
	}
}

function extractVersionChangelog(version: string): string {
	if (!existsSync('CHANGELOG.md')) {
		return 'No changelog available.';
	}

	const changelog = readFileSync('CHANGELOG.md', 'utf-8');
	const versionPattern = new RegExp(`## \\[${version}\\].*?(?=## \\[|$)`, 's');
	const match = changelog.match(versionPattern);

	if (!match) {
		return `Release ${version}\n\nSee CHANGELOG.md for details.`;
	}

	// Remove the version header and clean up
	let notes = match[0]
		.replace(/## \[.*?\].*?\n/, '')
		.trim();

	return notes || `Release ${version}`;
}

function getCurrentCommitHash(): string {
	return execSync('git rev-parse HEAD', { encoding: 'utf-8' }).trim();
}

function tagExists(tag: string): boolean {
	try {
		execSync(`git rev-parse ${tag}`, { stdio: 'pipe' });
		return true;
	} catch {
		return false;
	}
}

function createGitTag(version: string, message: string): void {
	const tag = version.startsWith('v') ? version : `v${version}`;

	if (tagExists(tag)) {
		console.log(`⚠️  Tag ${tag} already exists, skipping tag creation`);
		return;
	}

	try {
		execSync(`git tag -a ${tag} -m "${message}"`, { stdio: 'inherit' });
		execSync(`git push origin ${tag}`, { stdio: 'inherit' });
		console.log(`✅ Created and pushed tag: ${tag}`);
	} catch (error) {
		console.error('❌ Failed to create git tag:', error);
		throw error;
	}
}

function createGitHubRelease(
	version: string,
	notes: string,
	prerelease: boolean = false
): void {
	const tag = version.startsWith('v') ? version : `v${version}`;
	const title = `Release ${version}`;

	// Create temporary file for release notes
	const notesFile = `/tmp/release-notes-${Date.now()}.md`;
	Bun.write(notesFile, notes);

	try {
		const prereleaseFlag = prerelease ? '--prerelease' : '';
		const cmd = `gh release create ${tag} ${prereleaseFlag} --title "${title}" --notes-file "${notesFile}"`;

		console.log(`\n📦 Creating GitHub release: ${tag}`);
		execSync(cmd, { stdio: 'inherit' });
		console.log(`✅ GitHub release created successfully!`);
		console.log(`🔗 https://github.com/ansango/lastfm-client-ts/releases/tag/${tag}`);
	} catch (error) {
		console.error('❌ Failed to create GitHub release:', error);
		throw error;
	}
}

function isPrerelease(version: string): boolean {
	return /-(alpha|beta|rc)/.test(version);
}

function main() {
	console.log('🚀 GitHub Release Creator\n');

	// Check prerequisites
	if (!checkGitHubCLI()) {
		console.error('❌ GitHub CLI (gh) is not installed');
		console.error('📥 Install it from: https://cli.github.com/');
		process.exit(1);
	}

	if (!checkAuthentication()) {
		console.error('❌ Not authenticated with GitHub');
		console.error('🔐 Run: gh auth login');
		process.exit(1);
	}

	// Parse arguments
	const args = process.argv.slice(2);
	const pkg = getPackageInfo();
	const versionArg = args.find((arg) => !arg.startsWith('--'));
	const version = versionArg || pkg.version;
	const explicitPrerelease = args.includes('--prerelease');
	const prerelease = explicitPrerelease || isPrerelease(version);

	console.log(`📋 Package: ${pkg.name}`);
	console.log(`📌 Version: ${version}`);
	console.log(`🏷️  Prerelease: ${prerelease ? 'Yes' : 'No'}\n`);

	// Check if working directory is clean
	try {
		const status = execSync('git status --porcelain', { encoding: 'utf-8' });
		if (status.trim()) {
			console.warn('⚠️  Warning: Working directory has uncommitted changes');
			console.warn('   Commit or stash changes before creating a release\n');
		}
	} catch (error) {
		console.error('❌ Failed to check git status');
		process.exit(1);
	}

	// Extract changelog for this version
	const releaseNotes = extractVersionChangelog(version);

	console.log('📝 Release notes:\n');
	console.log('─'.repeat(50));
	console.log(releaseNotes);
	console.log('─'.repeat(50));
	console.log();

	// Create git tag
	createGitTag(version, `Release ${version}`);

	// Create GitHub release
	createGitHubRelease(version, releaseNotes, prerelease);

	console.log('\n✨ Release process completed!\n');
	console.log('Next steps:');
	console.log('  1. Verify the release on GitHub');
	console.log('  2. Run: npm publish' + (prerelease ? ' --tag alpha' : ''));
	console.log('  3. Announce the release 🎉\n');
}

main();
