import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { EnrollmentStat } from '../api/analyticsApi';
// import { mockEnrollmentStats } from '../mockData';

interface EnrollmentBarChartProps {
  data: EnrollmentStat[];
}

export const EnrollmentBarChart = ({ data }: EnrollmentBarChartProps) => {
  return (

    <div style={{ width: '100%', height: 350 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
            //data={mockEnrollmentStats}  // Used this line for mock data during testing
            data={data} 
            margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
        >
            {/* Subtle horizontal grid lines */}
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
            
            <XAxis dataKey="status" stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)' }} />
            <YAxis stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)' }} allowDecimals={false} />
            
            <Tooltip
                contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                itemStyle={{ color: 'var(--accent-main)' }}
                cursor={{ fill: 'var(--border-color)', opacity: 0.4 }}
            />
            
            {/* Make the bars have rounded top corners */}
            <Bar dataKey="count" fill="var(--accent-main)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};