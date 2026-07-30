import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchResearcherStudies } from '../../api/studiesApi';
import type { Study } from '../../types';
import '../analytics/analytics.css';
import {
    fetchEnrollmentStats,
    fetchOverview,
    fetchViewStats,
    type AnalyticsOverview,
    type EnrollmentStat,
    type ViewStat,
} from './api/analyticsApi';
import { EnrollmentBarChart } from './components/EnrollmentBarChart';
import { StudySelector } from './components/StudySelector';
import { ViewsLineChart } from './components/ViewsLineChart';

const EMPTY_OVERVIEW: AnalyticsOverview = {
    studiesPosted: 0,
    totalViews: 0,
    viewsToday: 0,
    totalSignups: 0,
    signupsToday: 0,
};

export const AnalyticsDashboard = () => {
    const [studies, setStudies] = useState<Study[]>([]);
    const [selectedStudyId, setSelectedStudyId] = useState<string | null>(null);
    const [overview, setOverview] = useState<AnalyticsOverview>(EMPTY_OVERVIEW);
    const [enrollmentData, setEnrollmentData] = useState<EnrollmentStat[]>([]);
    const [viewsData, setViewsData] = useState<ViewStat[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Load the researcher's studies once, for the selector.
    useEffect(() => {
        fetchResearcherStudies()
            .then(({ studies }) => setStudies(studies))
            .catch((error) => console.error('Failed to load studies', error));
    }, []);

    // Fetch the metrics/charts when the component mounts or when selectedStudyId changes
    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                const [overviewData, enrollments, views] = await Promise.all([
                    fetchOverview(selectedStudyId),
                    fetchEnrollmentStats(selectedStudyId),
                    fetchViewStats(selectedStudyId),
                ]);
                setOverview(overviewData);
                setEnrollmentData(enrollments);
                setViewsData(views);
            } catch (error) {
                console.error('Failed to load analytics data', error);
                setOverview(EMPTY_OVERVIEW);
                setEnrollmentData([]);
                setViewsData([]);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [selectedStudyId]);

    // Helper function to handle the 3 possible states of the Bar chart
    const renderEnrollmentChart = () => {
        if (isLoading) {
            // State 1. Show the loading state
            return <div className="skeleton-chart"></div>;
        } 
        
        if (enrollmentData.length === 0) {
            // State 2. Fetch is finished, but there is no data in the database
            return (
                <div className="empty-state">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <p>No enrollment data available yet.</p>
                </div>
            );
        }

        // State 3. We have data, so show the actual chart
        return <EnrollmentBarChart data={enrollmentData} />;
    };

    const renderViewsChart = () => {
        if (isLoading) return <div className="skeleton-chart"></div>;
        return <ViewsLineChart data={viewsData} />;
    };

    return (
        <div className="analytics-page">
            <div className="dashboard-container">
                <header>
                    <h2>
                        {selectedStudyId
                            ? `Analytics: ${studies.find(s => s.id === selectedStudyId)?.title}`
                            : 'Researcher Analytics Overview'}
                    </h2>
                </header>

                <Link to="/researcher" className="back-link">← Researcher dashboard</Link>

                <section className="metric-cards-row">
                    <div className="metric-card">
                        <h3>Total Views</h3>
                        <p className="metric-value">{overview.totalViews}</p>
                    </div>

                    <div className="metric-card">
                        <h3>Views Today</h3>
                        <p className="metric-value">{overview.viewsToday}</p>
                    </div>

                    <div className="metric-card">
                        <h3>Total Sign-ups</h3>
                        <p className="metric-value">{overview.totalSignups}</p>
                    </div>

                    <div className="metric-card">
                        <h3>Sign-ups Today</h3>
                        <p className="metric-value">{overview.signupsToday}</p>
                    </div>

                    <div className="metric-card">
                        <h3>Studies Posted</h3>
                        <p className="metric-value">{overview.studiesPosted}</p>
                    </div>
                </section>

                {/* Study List Section */}
                <StudySelector
                    studies={studies}
                    selectedStudyId={selectedStudyId}
                    onSelectStudy={setSelectedStudyId}
                />

                {/* Charts Section */}
                <section className="charts-row">
                    <div className="chart-container">
                        <h3>Views Over Time</h3>
                        {renderViewsChart()}
                    </div>

                    <div className="chart-container">
                        <h3>Enrollment Status Breakdown</h3>
                        {renderEnrollmentChart()}
                    </div>
                </section>
            </div>
        </div>
    );
};