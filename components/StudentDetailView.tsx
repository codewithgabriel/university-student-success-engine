
import React from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, BrainCircuit, Loader2, Activity, TrendingUp, 
  Lightbulb, Calendar, BookOpen, LogIn, Sparkles, User,
  Target, ShieldAlert, CheckCircle2
} from 'lucide-react';
import { StudentRecord, AnalysisResult, RiskLevel } from '../types';
import RiskBadge from './RiskBadge';

interface StudentDetailViewProps {
  student: StudentRecord;
  analysis?: AnalysisResult;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  onBack: () => void;
}

const StudentDetailView: React.FC<StudentDetailViewProps> = ({ 
  student, analysis, onAnalyze, isAnalyzing, onBack 
}) => {
  return (
    <div className="space-y-8">
      {/* Header Profile Section */}
      <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200/60 shadow-sm flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-[0.03] text-indigo-600 rotate-12 pointer-events-none">
          <User size={200} />
        </div>
        
        <div className="w-32 h-32 bg-indigo-50 rounded-[2rem] flex items-center justify-center text-indigo-600 relative shrink-0">
          <User size={64} strokeWidth={1.5} />
          <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-2 rounded-xl border-4 border-white">
            <CheckCircle2 size={16} />
          </div>
        </div>

        <div className="flex-grow text-center md:text-left space-y-2">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
            <h2 className="text-3xl font-black text-slate-900">{student.studentId}</h2>
            {analysis && <RiskBadge level={analysis.riskLevel} />}
          </div>
          <p className="text-slate-500 font-bold flex flex-wrap items-center justify-center md:justify-start gap-3">
            <span>{student.faculty}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
            <span>{student.department}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
            <span className="px-3 py-1 bg-slate-100 rounded-full text-xs text-slate-600">{student.level} Level</span>
          </p>
          <p className="text-slate-400 text-sm font-medium">Currently enrolled in {student.courseId}</p>
        </div>

        <div className="flex flex-col gap-3 shrink-0">
          <button 
            onClick={onAnalyze}
            disabled={isAnalyzing}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 disabled:bg-indigo-400 active:scale-95 transition-all shadow-xl shadow-indigo-100"
          >
            {isAnalyzing ? <Loader2 className="animate-spin" size={18} /> : <BrainCircuit size={18} />}
            {analysis ? 'Re-Analyze Student' : 'Initiate Deep Dive'}
          </button>
          <button 
            onClick={onBack}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-all"
          >
            <ArrowLeft size={16} /> Back to List
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Statistics Column */}
        <div className="lg:col-span-1 space-y-6">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] px-4">Core Metrics</h3>
          
          <div className="space-y-4">
            {[
              { label: 'Attendance Rate', value: `${student.attendanceRate}%`, icon: Calendar, color: 'indigo' },
              { label: 'Academic Average', value: `${student.midtermGrade}%`, icon: TrendingUp, color: 'emerald' },
              { label: 'Assignment Engagement', value: `${student.assignmentsAvg}%`, icon: BookOpen, color: 'blue' },
              { label: 'LMS Activity Logs', value: student.lmsLogins, icon: LogIn, color: 'violet' }
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 bg-${stat.color}-50 text-${stat.color}-600 rounded-2xl`}>
                    <stat.icon size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                    <p className="text-xl font-black text-slate-900">{stat.value}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* AI Analysis Column */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] px-4">AI Advisor Insights</h3>
          
          {analysis ? (
            <div className="grid grid-cols-1 gap-6">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-br from-indigo-600 to-violet-700 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-indigo-200 relative overflow-hidden"
              >
                <div className="absolute -bottom-8 -right-8 p-12 opacity-10 rotate-12">
                  <Sparkles size={160} />
                </div>
                <div className="relative z-10 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                      <Target size={24} />
                    </div>
                    <h4 className="text-xl font-black">Intervention Roadmap</h4>
                  </div>
                  <p className="text-indigo-50 text-lg font-medium leading-relaxed italic">
                    "{analysis.interventionStrategy}"
                  </p>
                  <div className="flex items-center gap-4 pt-4">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-widest text-indigo-200">Confidence Score</span>
                      <span className="text-2xl font-black">94.2%</span>
                    </div>
                    <div className="h-10 w-px bg-white/20"></div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-widest text-indigo-200">Risk Matrix</span>
                      <span className="text-2xl font-black">{analysis.riskScore}/100</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
                  <div className="flex items-center gap-3 text-rose-500">
                    <ShieldAlert size={20} strokeWidth={2.5} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Root Cause Analysis</span>
                  </div>
                  <p className="text-slate-600 text-sm font-medium leading-relaxed">
                    {analysis.rootCause}
                  </p>
                </div>

                <div className="bg-indigo-50/50 p-8 rounded-[2rem] border border-indigo-100 shadow-sm space-y-4">
                  <div className="flex items-center gap-3 text-indigo-600">
                    <Lightbulb size={20} strokeWidth={2.5} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Success Hacks</span>
                  </div>
                  <ul className="space-y-2">
                    {[
                      "Increase LMS login frequency by 25%",
                      "Schedule office hours for week 8",
                      "Join departmental peer-review group"
                    ].map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-slate-600 text-xs font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1 shrink-0"></span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-[2.5rem] p-20 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-300">
                <BrainCircuit size={40} />
              </div>
              <div className="max-w-xs">
                <h4 className="text-lg font-extrabold text-slate-900">Intelligence Required</h4>
                <p className="text-slate-500 text-xs font-medium mt-2">
                  Launch the deep dive analysis to generate predictive insights and strategic recommendations for this student.
                </p>
                <button 
                  onClick={onAnalyze}
                  className="mt-6 text-indigo-600 text-xs font-black uppercase tracking-widest hover:underline"
                >
                  Analyze Profile &rarr;
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDetailView;
