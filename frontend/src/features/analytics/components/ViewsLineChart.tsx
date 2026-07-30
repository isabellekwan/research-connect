import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { ViewStat } from '../api/analyticsApi';
// import { mockStudyViews } from '../mockData';

interface ViewsLineChartProps {
  data: ViewStat[];
}

export const ViewsLineChart = ({ data }: ViewsLineChartProps) => {
  return (
    <div style={{ width: '100%', height: 350 }}>
        <ResponsiveContainer width="100%" height="100%">
            {/* <LineChart data={mockStudyViews} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}> */}
            <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                
                <XAxis dataKey="day" stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)' }} />
                <YAxis stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)' }} allowDecimals={false} />
                
                {/* Tooltip background changes dynamically */}
                <Tooltip 
                    contentStyle={{ 
                    backgroundColor: 'var(--bg-card)', 
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-primary)'
                    }}
                    itemStyle={{ color: 'var(--accent-main)' }}
                />
                
                <Line 
                    type="monotone" 
                    dataKey="views" 
                    stroke="var(--accent-main)" 
                    strokeWidth={3}
                    dot={{ r: 4, fill: 'var(--bg-card)', stroke: 'var(--accent-main)', strokeWidth: 2 }}
                    activeDot={{ r: 6, fill: 'var(--accent-main)' }}
                />
            </LineChart>
      </ResponsiveContainer>
    </div>
  );
};