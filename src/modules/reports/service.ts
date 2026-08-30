import type { LastFmConfig } from '@/core/config.js'
import { getMonthlyDigest } from './generators/digest.js'
import { getMilestones } from './generators/milestones.js'
import { getWrapped } from './generators/wrapped.js'
import type {
	ReportsMilestonesRequest,
	ReportsMilestonesResponse,
	ReportsMonthlyDigestRequest,
	ReportsMonthlyDigestResponse,
	ReportsWrappedRequest,
	ReportsWrappedResponse,
} from './schemas.js'

export interface ReportsService {
	/**
	 * Generates a comprehensive Year in Review / Wrapped report.
	 *
	 * @param {ReportsWrappedRequest} params
	 * @param {RequestInit} [init]
	 * @returns {Promise<ReportsWrappedResponse>}
	 */
	getWrapped: (params: ReportsWrappedRequest, init?: RequestInit) => Promise<ReportsWrappedResponse>

	/**
	 * Detects historical scrobble milestone achievements and projects the estimated date for the next target.
	 *
	 * @param {ReportsMilestonesRequest} params
	 * @param {RequestInit} [init]
	 * @returns {Promise<ReportsMilestonesResponse>}
	 */
	getMilestones: (params: ReportsMilestonesRequest, init?: RequestInit) => Promise<ReportsMilestonesResponse>

	/**
	 * Generates a monthly digest bulletin comparing listening activity to the previous month.
	 *
	 * @param {ReportsMonthlyDigestRequest} params
	 * @param {RequestInit} [init]
	 * @returns {Promise<ReportsMonthlyDigestResponse>}
	 */
	getMonthlyDigest: (params: ReportsMonthlyDigestRequest, init?: RequestInit) => Promise<ReportsMonthlyDigestResponse>
}

export function createReportsService(config: LastFmConfig): ReportsService {
	return {
		getWrapped: (params, init) => getWrapped(config, params, init),
		getMilestones: (params, init) => getMilestones(config, params, init),
		getMonthlyDigest: (params, init) => getMonthlyDigest(config, params, init),
	}
}
