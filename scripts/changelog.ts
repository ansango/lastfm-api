#!/usr/bin/env bun
/**
 * Generate CHANGELOG.md from git commits
 * 
 * Usage:
 *   bun scripts/changelog.ts [--from <tag>] [--to <tag>]
 * 
 * Examples:
 *   bun scripts/changelog.ts                    # All commits
 *   bun scripts/changelog.ts --from v1.0.0      # From specific tag
 *   bun scripts/changelog.ts --to HEAD          # Up to HEAD
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

interface Commit {
	hash: string;
	type: string;
	scope?: string;
	subject: string;
	body?: string;
	breaking?: boolean;
	author: string;
	date: string;
}

interface ChangelogSection {
	title: string;
	emoji: string;
	commits: Commit[];
}

const COMMIT_TYPES: Record<string, { title: string; emoji: string }> = {
	feat: { title: 'Features', emoji: '✨' },
	fix: { title: 'Bug Fixes', emoji: '🐛' },
	docs: { title: 'Documentation', emoji: '📚' },
	style: { title: 'Styles', emoji: '💎' },
	refactor: { title: 'Code Refactoring', emoji: '♻️' },
	perf: { title: 'Performance Improvements', emoji: '⚡' },
	test: { title: 'Tests', emoji: '✅' },
	build: { title: 'Build System', emoji: '🏗️' },
	ci: { title: 'Continuous Integration', emoji: '👷' },
	chore: { title: 'Chores', emoji: '🔧' },
	revert: { title: 'Reverts', emoji: '⏪' }
};

function getPackageVersion(): string {
	const packageJson = JSON.parse(readFileSync('package.json', 'utf-8'));
	return packageJson.version;
}

function parseCommit(commitLine: string): Commit | null {
	const [hash, author, date, ...messageParts] = commitLine.split('|');
	const message = messageParts.join('|');

	// Parse conventional commit format: type(scope): subject
	const match = message.match(/^(\w+)(?:\(([^)]+)\))?: (.+)$/);

	if (!match) {
		// Not a conventional commit, include it anyway
		return {
			hash: hash.trim(),
			type: 'other',
			subject: message.trim(),
			author: author.trim(),
			date: date.trim()
		};
	}

	const [, type, scope, subject] = match;
	const breaking = message.includes('BREAKING CHANGE') || message.includes('!:');

	return {
		hash: hash.trim(),
		type: type.toLowerCase(),
		scope: scope?.trim(),
		subject: subject.trim(),
		breaking,
		author: author.trim(),
		date: date.trim()
	};
}

function getCommits(from?: string, to: string = 'HEAD'): Commit[] {
	const range = from ? `${from}..${to}` : to;
	const format = '%h|%an|%ad|%s';

	try {
		const output = execSync(`git log ${range} --format="${format}" --date=short`, {
			encoding: 'utf-8'
		});

		return output
			.trim()
			.split('\n')
			.map(parseCommit)
			.filter((c): c is Commit => c !== null);
	} catch (error) {
		console.error('Error getting commits:', error);
		return [];
	}
}

function getLatestTag(): string | undefined {
	try {
		return execSync('git describe --tags --abbrev=0', { encoding: 'utf-8' }).trim();
	} catch {
		return undefined;
	}
}

function groupCommitsByType(commits: Commit[]): Map<string, Commit[]> {
	const groups = new Map<string, Commit[]>();

	for (const commit of commits) {
		const type = commit.type in COMMIT_TYPES ? commit.type : 'other';
		if (!groups.has(type)) {
			groups.set(type, []);
		}
		groups.get(type)!.push(commit);
	}

	return groups;
}

function generateMarkdown(version: string, date: string, commits: Commit[]): string {
	const breaking = commits.filter((c) => c.breaking);
	const grouped = groupCommitsByType(commits.filter((c) => !c.breaking));

	let markdown = `## [${version}] - ${date}\n\n`;

	// Breaking changes first
	if (breaking.length > 0) {
		markdown += `### 🚨 BREAKING CHANGES\n\n`;
		for (const commit of breaking) {
			const scope = commit.scope ? `**${commit.scope}**: ` : '';
			markdown += `- ${scope}${commit.subject} ([${commit.hash}](https://github.com/ansango/lastfm-client-ts/commit/${commit.hash}))\n`;
		}
		markdown += '\n';
	}

	// Other changes by type
	const typeOrder = ['feat', 'fix', 'perf', 'refactor', 'docs', 'test', 'build', 'ci', 'chore'];

	for (const type of typeOrder) {
		const typeCommits = grouped.get(type);
		if (!typeCommits || typeCommits.length === 0) continue;

		const { title, emoji } = COMMIT_TYPES[type];
		markdown += `### ${emoji} ${title}\n\n`;

		for (const commit of typeCommits) {
			const scope = commit.scope ? `**${commit.scope}**: ` : '';
			markdown += `- ${scope}${commit.subject} ([${commit.hash}](https://github.com/ansango/lastfm-client-ts/commit/${commit.hash}))\n`;
		}
		markdown += '\n';
	}

	return markdown;
}

function updateChangelog(newEntry: string): void {
	const changelogPath = 'CHANGELOG.md';
	let existingChangelog = '';

	if (existsSync(changelogPath)) {
		existingChangelog = readFileSync(changelogPath, 'utf-8');
	} else {
		existingChangelog = `# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

`;
	}

	// Insert new entry after the header
	const lines = existingChangelog.split('\n');
	const headerEndIndex = lines.findIndex((line) => line.startsWith('## ['));

	if (headerEndIndex === -1) {
		// No existing entries, append to end
		existingChangelog += '\n' + newEntry;
	} else {
		// Insert before first entry
		lines.splice(headerEndIndex, 0, newEntry);
		existingChangelog = lines.join('\n');
	}

	writeFileSync(changelogPath, existingChangelog);
	console.log('✅ CHANGELOG.md updated successfully!');
}

function main() {
	const args = process.argv.slice(2);
	let fromTag = args[args.indexOf('--from') + 1];
	const toTag = args[args.indexOf('--to') + 1] || 'HEAD';

	if (!fromTag) {
		fromTag = getLatestTag();
		if (fromTag) {
			console.log(`📌 Using latest tag: ${fromTag}`);
		} else {
			console.log('📌 No previous tag found, including all commits');
		}
	}

	const commits = getCommits(fromTag, toTag);
	if (commits.length === 0) {
		console.log('ℹ️  No commits found');
		return;
	}

	console.log(`📝 Found ${commits.length} commits`);

	const version = getPackageVersion();
	const date = new Date().toISOString().split('T')[0];

	const markdown = generateMarkdown(version, date, commits);
	updateChangelog(markdown);

	console.log('\n📋 Preview:\n');
	console.log(markdown);
}

main();
