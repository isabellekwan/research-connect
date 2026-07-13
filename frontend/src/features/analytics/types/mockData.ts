import type { ViewStat } from "../api/analyticsApi";

export const mockStudyViews = [
    { day: 'Mon', views: 45 },
    { day: 'Tue', views: 52 },
    { day: 'Wed', views: 38 },
    { day: 'Thu', views: 65 },
    { day: 'Fri', views: 48 },
];

export const mockEnrollmentStats = [
    { status: 'Confirmed', count: 24 },
    { status: 'Pending', count: 12 },
    { status: 'Canceled', count: 3 },
];

export interface Study {
    id: string;
    title: string;
    datePosted: string;
    status: 'Active' | 'Completed' | 'Draft';
}

// This generates 25 fake studies to test pagination
export const mockStudies: Study[] = Array.from({ length: 25 }, (_, i) => ({
    id: `study-${i + 1}`,
    title: `Research Study on ${['Cognitive Load', 'Sleep Patterns', 'UI Navigation', 'Dietary Habits'][i % 4]}`,
    datePosted: `2026-07-${(i % 28 + 1).toString().padStart(2, '0')}`,
    status: i % 5 === 0 ? 'Completed' : 'Active',
}));

// Aggregate data for the "All Studies Overview" state
export const aggregateStudyViews: ViewStat[] = [
  { day: 'Mon', views: 185 },
  { day: 'Tue', views: 242 },
  { day: 'Wed', views: 198 },
  { day: 'Thu', views: 305 },
  { day: 'Fri', views: 218 },
];

// Generator function that builds unique data based on the selected study ID
export const generateMockStudyViews = (studyId: string): ViewStat[] => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  
  // Extract the number from "study-X" to use as a mathematical seed
  const idNumber = parseInt(studyId.split('-')[1]) || 1;

  return days.map((day, index) => {
    // A math formula so the graph looks different for every study, but stays the same if you click away and click back.
    const uniqueOffset = (idNumber * (index + 3)) % 40;
    return {
      day,
      views: 12 + uniqueOffset + (index * 4) 
    };
  });
};
