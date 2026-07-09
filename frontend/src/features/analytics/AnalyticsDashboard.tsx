import { useState, useEffect } from 'react';
import { StudySelector } from './components/StudySelector';
import { EnrollmentBarChart } from './components/EnrollmentBarChart';
import { ViewsLineChart } from './components/ViewsLineChart';
import { fetchEnrollmentStats, type EnrollmentStat } from './api/analyticsApi';
import { mockStudies, aggregateStudyViews, generateMockStudyViews } from './mockData';
import './Analytics.css'; 

export const AnalyticsDashboard = () => {
    // Set up state to hold the real data
    const [selectedStudyId, setSelectedStudyId] = useState<string | null>(null);
    const [enrollmentData, setEnrollmentData] = useState<EnrollmentStat[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch the data when the component mounts or when selectedStudyId changes
    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            // Pass selectedStudyId to this fetch function
            const data = await fetchEnrollmentStats();
            setEnrollmentData(data);
            setIsLoading(false);
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

        // State 3. We have data: Show the actual chart
        return <EnrollmentBarChart data={enrollmentData} />;
    };

    const renderViewsChart = () => {
        if (isLoading) return <div className="skeleton-chart"></div>;
        
        // Pass the mock data in as a prop, and also determine which data to show
        let chartData;
        if (selectedStudyId === null) {
            // State 1: When "All Studies" is selected, show the big aggregate numbers
            chartData = aggregateStudyViews;
        } else {
            // State 2: A specific study is selected, generate its unique data
            chartData = generateMockStudyViews(selectedStudyId);
        }

        // Pass the selected data into the chart
        return <ViewsLineChart data={chartData} />;
    };

    return (
        <div className="dashboard-container">
            <header>
                <h2>
                    {selectedStudyId 
                        ? `Analytics: ${mockStudies.find(s => s.id === selectedStudyId)?.title}` 
                        : 'Researcher Analytics Overview'}
                </h2>
            </header>

            <section className="metric-cards-row">
                <div className="metric-card">
                    <h3>Total Views</h3>
                    <p className="metric-value">248</p>
                </div>

                <div className="metric-card">
                    <h3>Views Today</h3>
                    <p className="metric-value">12</p>
                </div>
                    
                <div className="metric-card">
                    <h3>Total Sign-ups</h3>
                    <p className="metric-value">39</p>
                </div>

                <div className="metric-card">
                    <h3>Sign-ups Today</h3>
                    <p className="metric-value">8</p>
                </div>
            </section>

            {/* Study List Section */}
            <StudySelector 
                studies={mockStudies} 
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
    );
};