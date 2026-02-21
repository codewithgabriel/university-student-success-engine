
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, ChevronRight, GraduationCap, Users, 
  Download, Search, Database, 
  ArrowLeft, BrainCircuit, Table as TableIcon,
  Loader2, User, Activity, TrendingUp, Lightbulb,
  Calendar, BookOpen, LogIn, Sparkles, RefreshCw
} from 'lucide-react';
import { StudentRecord, AnalysisResult, UniversityData, RiskLevel } from '../types';
import { exportToCSV } from '../services/dataParser';
import { analyzeStudentData } from '../services/geminiService';
import RiskBadge from './RiskBadge';
import DashboardCharts from './DashboardCharts';
import StudentDetailView from './StudentDetailView';

interface AdminViewProps {
  analysis: AnalysisResult[];
  setAnalysis: (a: AnalysisResult[]) => void;
  uniData: UniversityData;
  onResetData: () => void;
}

const AdminView: React.FC<AdminViewProps> = ({ analysis, setAnalysis, uniData, onResetData }) => {
  const [currentPath, setCurrentPath] = useState<{ faculty?: string, department?: string }>({});
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  const activeFaculty = useMemo(() => 
    uniData.faculties.find(f => f.name === currentPath.faculty),
  [uniData, currentPath.faculty]);

  const activeDepartment = useMemo(() => 
    activeFaculty?.departments.find(d => d.name === currentPath.department),
  [activeFaculty, currentPath.department]);

  const selectedStudent = useMemo(() => {
    if (!activeDepartment || !selectedStudentId) return null;
    return activeDepartment.students.find(s => s.studentId === selectedStudentId);
  }, [activeDepartment, selectedStudentId]);

  const filteredStudents = useMemo(() => {
    if (!activeDepartment) return [];
    return activeDepartment.students.filter(s => 
      s.studentId.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [activeDepartment, searchQuery]);

  const pagedStudents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredStudents.slice(start, start + pageSize);
  }, [filteredStudents, currentPage]);

  const runAnalysis = async (students: StudentRecord[]) => {
    setIsAnalyzing(true);
    try {
      const results = await analyzeStudentData(students);
      setAnalysis([...analysis.filter(a => !results.some(r => r.studentId === a.studentId)), ...results]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleExport = () => {
    exportToCSV(analysis);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">
      {/* Top Header & Breadcrumb Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <nav className="flex items-center gap-3 text-sm font-bold">
          <button 
            onClick={() => { setCurrentPath({}); setSelectedStudentId(null); setCurrentPage(1); }}
            className={`flex items-center gap-2 transition-colors ${!currentPath.faculty ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Building2 size={16} /> University
          </button>
          {currentPath.faculty && (
            <>
              <ChevronRight size={14} className="text-slate-300" />
              <button 
                onClick={() => { setCurrentPath({ faculty: currentPath.faculty }); setSelectedStudentId(null); setCurrentPage(1); }}
                className={`transition-colors ${!currentPath.department ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {currentPath.faculty}
              </button>
            </>
          )}
          {currentPath.department && (
            <>
              <ChevronRight size={14} className="text-slate-300" />
              <button 
                onClick={() => { setSelectedStudentId(null); setCurrentPage(1); }}
                className={`transition-colors ${!selectedStudentId ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {currentPath.department}
              </button>
            </>
          )}
          {selectedStudentId && (
            <>
              <ChevronRight size={14} className="text-slate-300" />
              <span className="text-indigo-600">Profile: {selectedStudentId}</span>
            </>
          )}
        </nav>
        
        {/* Global Regenerate Button relocated from landing page */}
        <button 
          onClick={onResetData}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all active:scale-95"
          title="Regenerate all university data"
        >
          <RefreshCw size={14} /> Regenerate Dataset
        </button>
      </div>

      <AnimatePresence mode="wait">
        {selectedStudentId ? (
          <motion.div key="detail" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <StudentDetailView 
              student={selectedStudent!} 
              analysis={analysis.find(a => a.studentId === selectedStudentId)}
              onAnalyze={() => runAnalysis([selectedStudent!])}
              isAnalyzing={isAnalyzing}
              onBack={() => setSelectedStudentId(null)}
            />
          </motion.div>
        ) : !currentPath.faculty ? (
          <motion.div 
            key="uni" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {uniData.faculties.map(faculty => (
              <button 
                key={faculty.name}
                onClick={() => setCurrentPath({ faculty: faculty.name })}
                className="bg-white p-8 rounded-[2.5rem] border border-slate-200/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all text-left group"
              >
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <GraduationCap size={24} />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">{faculty.name}</h3>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                  {faculty.departments.length} Departments
                </p>
              </button>
            ))}
          </motion.div>
        ) : !currentPath.department ? (
          <motion.div 
            key="faculty" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {activeFaculty?.departments.map(dept => (
              <button 
                key={dept.name}
                onClick={() => setCurrentPath(prev => ({ ...prev, department: dept.name }))}
                className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm hover:shadow-lg transition-all text-left group"
              >
                <h4 className="font-bold text-slate-900 mb-4">{dept.name}</h4>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Users size={14} />
                    <span className="text-xs font-bold">{dept.students.length} Students</span>
                  </div>
                  <ChevronRight size={16} className="text-indigo-200 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            key="dept" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative flex-grow max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Filter by Matric No..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all font-bold text-sm"
                />
              </div>
              <div className="flex gap-3">
                {analysis.length > 0 && (
                  <button 
                    onClick={handleExport}
                    className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold text-sm hover:bg-slate-50 active:scale-95 transition-all shadow-sm"
                  >
                    <Download size={18} /> Export Results
                  </button>
                )}
                <button 
                  onClick={() => runAnalysis(activeDepartment?.students.slice(0, 50) || [])}
                  disabled={isAnalyzing}
                  className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 disabled:bg-indigo-400 active:scale-95 transition-all shadow-xl shadow-indigo-100"
                >
                  {isAnalyzing ? <Loader2 className="animate-spin" size={18} /> : <BrainCircuit size={18} />}
                  Batch Analysis (Top 50)
                </button>
              </div>
            </div>

            <div className="bg-white rounded-[2rem] border border-slate-200/60 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <tr>
                      <th className="px-6 py-4">Matric No.</th>
                      <th className="px-6 py-4">Level</th>
                      <th className="px-6 py-4">Attend %</th>
                      <th className="px-6 py-4">Performance</th>
                      <th className="px-6 py-4">AI Insight</th>
                      <th className="px-6 py-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-bold text-slate-600">
                    {pagedStudents.map((s) => {
                      const result = analysis.find(a => a.studentId === s.studentId);
                      return (
                        <tr 
                          key={s.studentId} 
                          className="hover:bg-indigo-50/20 transition-colors cursor-pointer group"
                          onClick={() => setSelectedStudentId(s.studentId)}
                        >
                          <td className="px-6 py-4 font-mono text-slate-900 group-hover:text-indigo-600 transition-colors">{s.studentId}</td>
                          <td className="px-6 py-4">{s.level}L</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="flex-grow h-1.5 bg-slate-100 rounded-full overflow-hidden w-16">
                                <div 
                                  className={`h-full ${s.attendanceRate < 50 ? 'bg-rose-500' : 'bg-indigo-500'}`}
                                  style={{ width: `${s.attendanceRate}%` }}
                                />
                              </div>
                              {s.attendanceRate}%
                            </div>
                          </td>
                          <td className="px-6 py-4">{s.midtermGrade}% Avg</td>
                          <td className="px-6 py-4">
                            {result ? (
                              <div className="flex items-center gap-3">
                                <RiskBadge level={result.riskLevel} />
                              </div>
                            ) : (
                              <span className="text-slate-300 italic">Unanalyzed</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <button className="p-2 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                              <ArrowLeft className="rotate-180" size={16} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              
              <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
                <p className="text-xs text-slate-400 font-bold">
                  Showing {Math.min(filteredStudents.length, (currentPage - 1) * pageSize + 1)}-{Math.min(filteredStudents.length, currentPage * pageSize)} of {filteredStudents.length}
                </p>
                <div className="flex gap-2">
                  <button 
                    disabled={currentPage === 1}
                    onClick={(e) => { e.stopPropagation(); setCurrentPage(prev => prev - 1); }}
                    className="px-4 py-1.5 rounded-lg border bg-white disabled:opacity-30 text-xs font-bold"
                  >
                    Prev
                  </button>
                  <button 
                    disabled={currentPage * pageSize >= filteredStudents.length}
                    onClick={(e) => { e.stopPropagation(); setCurrentPage(prev => prev + 1); }}
                    className="px-4 py-1.5 rounded-lg border bg-white disabled:opacity-30 text-xs font-bold"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminView;
