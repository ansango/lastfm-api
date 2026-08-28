export function formatJsonLines(items: unknown[]): string {
	return items.map((item) => JSON.stringify(item)).join('\n')
}
