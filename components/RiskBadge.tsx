
import React from 'react';
import { RiskLevel } from '../types';

interface RiskBadgeProps {
  level: RiskLevel;
}

const RiskBadge: React.FC<RiskBadgeProps> = ({ level }) => {
  const getStyles = () => {
    switch (level) {
      case RiskLevel.HIGH:
        return 'bg-rose-50 text-rose-600 border-rose-100 shadow-rose-100/50';
      case RiskLevel.MODERATE:
        return 'bg-amber-50 text-amber-600 border-amber-100 shadow-amber-100/50';
      case RiskLevel.ON_TRACK:
        return 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-emerald-100/50';
      default:
        return 'bg-slate-50 text-slate-500 border-slate-100 shadow-slate-100/50';
    }
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm transition-all hover:scale-105 select-none ${getStyles()}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60"></span>
      {level}
    </span>
  );
};

export default RiskBadge;
