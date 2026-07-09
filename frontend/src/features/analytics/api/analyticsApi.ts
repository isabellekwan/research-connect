export interface EnrollmentStat {
    status: string;
    count: number;
}

export interface ViewStat {
    day: string;
    views: number;
}

// Fetch function to get enrollment stats
export const fetchEnrollmentStats = async (): Promise<EnrollmentStat[]> => {
    try {
        const response = await fetch('/api/analytics/enrollments');
        
        if (!response.ok) {
        throw new Error('Failed to fetch enrollment data');
        }
        
        return await response.json();
    } catch (error) {
        console.error("API Error:", error);
        return []; // Return empty array on failure so the chart doesn't crash
    }
};