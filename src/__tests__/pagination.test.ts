import { describe, expect, test } from 'bun:test'
import { collectAll, iterateItems, iteratePages } from '../core/pagination.js'

describe('core/pagination', () => {
	const mockPages: Record<number, { tracks: Array<{ id: number; title: string }>; totalPages: number }> = {
		1: {
			tracks: [
				{ id: 1, title: 'Track 1' },
				{ id: 2, title: 'Track 2' },
			],
			totalPages: 3,
		},
		2: {
			tracks: [
				{ id: 3, title: 'Track 3' },
				{ id: 4, title: 'Track 4' },
			],
			totalPages: 3,
		},
		3: { tracks: [{ id: 5, title: 'Track 5' }], totalPages: 3 },
	}

	const fetchPage = async (params: { user: string; page: number }) => {
		const page = mockPages[params.page] ?? { tracks: [], totalPages: 3 }
		return page
	}

	const extract = (res: { tracks: Array<{ id: number; title: string }>; totalPages: number }) => ({
		items: res.tracks,
		totalPages: res.totalPages,
		currentPage: 1,
	})

	test('iterateItems streams items across multiple pages', async () => {
		const items: Array<{ id: number; title: string }> = []
		for await (const track of iterateItems(fetchPage, extract, { user: 'ansango' })) {
			items.push(track)
		}

		expect(items).toHaveLength(5)
		expect(items[0].title).toBe('Track 1')
		expect(items[4].title).toBe('Track 5')
	})

	test('iterateItems respects maxPages limit', async () => {
		const items: Array<{ id: number; title: string }> = []
		for await (const track of iterateItems(fetchPage, extract, { user: 'ansango' }, { maxPages: 2 })) {
			items.push(track)
		}

		expect(items).toHaveLength(4)
		expect(items[3].title).toBe('Track 4')
	})

	test('iterateItems respects maxItems limit', async () => {
		const items: Array<{ id: number; title: string }> = []
		for await (const track of iterateItems(fetchPage, extract, { user: 'ansango' }, { maxItems: 3 })) {
			items.push(track)
		}

		expect(items).toHaveLength(3)
		expect(items[2].title).toBe('Track 3')
	})

	test('collectAll collects all items into an array', async () => {
		const all = await collectAll(fetchPage, extract, { user: 'ansango' })
		expect(all).toHaveLength(5)
		expect(all.map((t) => t.id)).toEqual([1, 2, 3, 4, 5])
	})

	test('iteratePages yields full page responses', async () => {
		const pages: Array<{ tracks: Array<{ id: number; title: string }> }> = []
		for await (const page of iteratePages(fetchPage, (res) => ({ totalPages: res.totalPages, currentPage: 1 }), {
			user: 'ansango',
		})) {
			pages.push(page)
		}

		expect(pages).toHaveLength(3)
		expect(pages[0].tracks).toHaveLength(2)
		expect(pages[2].tracks).toHaveLength(1)
	})
})
