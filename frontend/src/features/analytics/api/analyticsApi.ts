import { apiRequest } from "../../../api/client";

export interface EnrollmentStat {
    status: string;
    count: number;
}

export interface ViewStat {
    day: string;
    views: number;
}

export interface AnalyticsOverview {
    studiesPosted: number;
    totalViews: number;
    viewsToday: number;
    totalSignups: number;
    signupsToday: number;
}

const BROWSER_TIMEZONE = Intl.DateTimeFormat().resolvedOptions().timeZone;

function buildQuery(studyId: string | null, includeTimezone: boolean): string {
    const params = new URLSearchParams();
    if (studyId) params.set("studyId", studyId);
    if (includeTimezone) params.set("tz", BROWSER_TIMEZONE);
    const query = params.toString();
    return query ? `?${query}` : "";
}

export const fetchOverview = (studyId: string | null = null): Promise<AnalyticsOverview> =>
    apiRequest<AnalyticsOverview>(`/analytics/overview${buildQuery(studyId, true)}`);

export const fetchViewStats = (studyId: string | null = null): Promise<ViewStat[]> =>
    apiRequest<ViewStat[]>(`/analytics/views${buildQuery(studyId, true)}`);

export const fetchEnrollmentStats = (studyId: string | null = null): Promise<EnrollmentStat[]> =>
    apiRequest<EnrollmentStat[]>(`/analytics/enrollments${buildQuery(studyId, false)}`);
