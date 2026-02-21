
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, ShieldCheck, UserCircle } from 'lucide-react';
import { AnalysisResult, UniversityData } from './types';
import AdminView from './components/AdminView';
import StudentView from './components/StudentView';
import { generateUniversityData } from './services/dataParser';

type ViewMode = 'admin' | 'student';

const App: React.FC = () => {
  const [view, setView] = useState<ViewMode>('admin');
  const [analysis, setAnalysis] = useState<AnalysisResult[]>([]);
  // Persistent university data across view switches
  const [uniData, setUniData] = useState<UniversityData>(() => generateUniversityData());

  const resetData = () => {
    setUniData(generateUniversityData());
    setAnalysis([]);
  };

  return (
    <div className="min-h-screen flex flex-col selection:bg-indigo-100 selection:text-indigo-900">
      {/* Premium Navigation */}
      <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-md border-b border-slate-200/60 px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5 group cursor-default">
          <div className="p-2 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl text-white shadow-lg shadow-indigo-200 group-hover:scale-105 transition-transform">
            <GraduationCap size={20} strokeWidth={2.5} />
          </div>
          <div>
            <span className="text-lg font-extrabold tracking-tight text-slate-900 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">
              Succesify
            </span>
          </div>
        </div>
        
        <div className="flex items-center bg-slate-100/80 p-1 rounded-2xl border border-slate-200/50">
          <button
            onClick={() => setView('admin')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 ${
              view === 'admin' 
                ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/40 translate-y-[1px]' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck size={14} />
            ADMIN
          </button>
          <button
            onClick={() => setView('student')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 ${
              view === 'student' 
                ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/40 translate-y-[1px]' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserCircle size={14} />
            STUDENT
          </button>
        </div>
      </nav>

      <main className="flex-grow">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            {view === 'admin' ? (
              <AdminView 
                analysis={analysis} 
                setAnalysis={setAnalysis}
                uniData={uniData}
                onResetData={resetData}
              />
            ) : (
              <StudentView analysis={analysis} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="py-10 text-center">
        <div className="inline-flex items-center gap-2 text-slate-400 text-xs font-medium px-4 py-2 bg-slate-100/50 rounded-full border border-slate-200/30">
          <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse"></span>
          Predictive Analytics Engine &bull; {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
};

export default App;
