
import React from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, 
  ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Legend 
} from 'recharts';
import { AnalysisResult, StudentRecord, RiskLevel } from '../types';

interface DashboardChartsProps {
  analysis: AnalysisResult[];
  records: StudentRecord[];
}

const DashboardCharts: React.FC<DashboardChartsProps> = ({ analysis, records }) => {
  const riskData = [
    { name: RiskLevel.HIGH, value: analysis.filter(a => a.riskLevel === RiskLevel.HIGH).length, color: '#ef4444' },
    { name: RiskLevel.MODERATE, value: analysis.filter(a => a.riskLevel === RiskLevel.MODERATE).length, color: '#f59e0b' },
    { name: RiskLevel.ON_TRACK, value: analysis.filter(a => a.riskLevel === RiskLevel.ON_TRACK).length, color: '#10b981' },
  ].filter(d => d.value > 0);

  const scatterData = records.map(r => {
    const risk = analysis.find(a => a.studentId === r.studentId);
    return {
      attendance: r.attendanceRate,
      grade: r.midtermGrade,
      studentId: r.studentId,
      riskLevel: risk?.riskLevel || 'Unknown'
    };
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <i className="fa-solid fa-chart-pie text-indigo-500"></i>
          Risk Distribution
        </h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={riskData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {riskData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <i className="fa-solid fa-chart-scatter text-indigo-500"></i>
          Attendance vs. Academic Performance
        </h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis type="number" dataKey="attendance" name="Attendance" unit="%" domain={[0, 100]} />
              <YAxis type="number" dataKey="grade" name="Grade" unit="%" domain={[0, 100]} />
              <ZAxis type="category" dataKey="studentId" name="ID" />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter name="Students" data={scatterData} fill="#6366f1" />
              <Legend />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;
