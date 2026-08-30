/**
 * Generic pagination and async iterator utilities for Last.fm API endpoints.
 */

export interface PaginationOptions {
	/** Starting page number (1-indexed). Defaults to 1. */
	startPage?: number
	/** Maximum number of pages to fetch. Defaults to Infinity. */
	maxPages?: number
	/** Maximum total items to yield or collect. Defaults to Infinity. */
	maxItems?: number
	/** Optional delay in milliseconds between page requests (for gentle rate limiting). Defaults to 0. */
	delayMs?: number
}

export interface PageExtraction<TItem> {
	items: TItem[]
	totalPages: number
	currentPage: number
}

/**
 * Async generator yielding items across all paginated responses one by one.
 */
export async function* iterateItems<TItem, TParams extends Record<string, unknown>, TResponse>(
	fetchPage: (params: TParams & { page: number; limit?: number }) => Promise<TResponse>,
	extract: (response: TResponse) => PageExtraction<TItem>,
	params: TParams,
	options: PaginationOptions = {},
): AsyncGenerator<TItem, void, undefined> {
	const startPage = options.startPage ?? 1
	const maxPages = options.maxPages ?? Number.POSITIVE_INFINITY
	const maxItems = options.maxItems ?? Number.POSITIVE_INFINITY
	const delayMs = options.delayMs ?? 0

	let currentPage = startPage
	let pagesFetched = 0
	let itemsYielded = 0

	while (pagesFetched < maxPages && itemsYielded < maxItems) {
		const response = await fetchPage({
			...params,
			page: currentPage,
		})
		pagesFetched++

		const { items, totalPages } = extract(response)
		const itemList = Array.isArray(items) ? items : [items]

		for (const item of itemList) {
			if (!item) continue
			yield item
			itemsYielded++
			if (itemsYielded >= maxItems) {
				return
			}
		}

		if (currentPage >= totalPages || items.length === 0) {
			break
		}

		currentPage++

		if (delayMs > 0) {
			await new Promise((resolve) => setTimeout(resolve, delayMs))
		}
	}
}

/**
 * Collects all items from paginated requests into an in-memory array.
 */
export async function collectAll<TItem, TParams extends Record<string, unknown>, TResponse>(
	fetchPage: (params: TParams & { page: number; limit?: number }) => Promise<TResponse>,
	extract: (response: TResponse) => PageExtraction<TItem>,
	params: TParams,
	options: PaginationOptions = {},
): Promise<TItem[]> {
	const collected: TItem[] = []
	for await (const item of iterateItems(fetchPage, extract, params, options)) {
		collected.push(item)
	}
	return collected
}

/**
 * Async generator yielding whole page responses one by one.
 */
export async function* iteratePages<TParams extends Record<string, unknown>, TResponse>(
	fetchPage: (params: TParams & { page: number; limit?: number }) => Promise<TResponse>,
	extractPagination: (response: TResponse) => { totalPages: number; currentPage: number },
	params: TParams,
	options: PaginationOptions = {},
): AsyncGenerator<TResponse, void, undefined> {
	const startPage = options.startPage ?? 1
	const maxPages = options.maxPages ?? Number.POSITIVE_INFINITY
	const delayMs = options.delayMs ?? 0

	let currentPage = startPage
	let pagesFetched = 0

	while (pagesFetched < maxPages) {
		const response = await fetchPage({
			...params,
			page: currentPage,
		})
		pagesFetched++
		yield response

		const { totalPages } = extractPagination(response)
		if (currentPage >= totalPages) {
			break
		}
		currentPage++

		if (delayMs > 0) {
			await new Promise((resolve) => setTimeout(resolve, delayMs))
		}
	}
}
