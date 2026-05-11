import React from 'react';
import { useApp } from '../../../context/AppContext';

interface PhaseConnectorProps {
  isCompleted: boolean;
  isActive: boolean;
}

export const PhaseConnector: React.FC<PhaseConnectorProps> = ({ isCompleted, isActive }) => {
  const { moduleTheme } = useApp();

  return (
    <div className="flex justify-center h-16 relative">
      <div 
        className={`w-1 h-full rounded-full transition-all duration-1000 absolute left-[39px]
          ${isCompleted ? '' : 'bg-slate-200 dark:bg-white/5'}
        `}
        style={isCompleted ? { backgroundColor: moduleTheme.accent } : {}}
      >
        {isActive && (
          <div 
            className="w-full h-1/2 bg-gradient-to-b from-transparent to-current animate-pulse"
            style={{ color: moduleTheme.accent }}
          />
        )}
      </div>
    </div>
  );
};
