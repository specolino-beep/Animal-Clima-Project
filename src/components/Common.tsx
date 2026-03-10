import React from 'react';
import { motion } from 'motion/react';

interface ModuleCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}

export function ModuleCard({ title, description, icon, onClick }: ModuleCardProps) {
  return (
    <motion.div 
      whileHover={{ y: -4, shadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}
      onClick={onClick}
      className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm cursor-pointer transition-all group"
    >
      <div className="mb-6 bg-slate-50 w-16 h-16 rounded-2xl flex items-center justify-center group-hover:bg-emerald-50 transition-colors">
        {icon}
      </div>
      <h3 className="text-xl font-extrabold text-slate-900 mb-3 group-hover:text-emerald-600 transition-colors font-montserrat">{title}</h3>
      <p className="text-slate-500 leading-relaxed">{description}</p>
    </motion.div>
  );
}

interface InputCardProps {
  label: string;
  icon?: React.ReactNode;
  content?: React.ReactNode;
  // Support for direct numeric input
  value?: number;
  onChange?: (val: number) => void;
  unit?: string;
  description?: string;
}

export function InputCard({ label, icon, content, value, onChange, unit, description }: InputCardProps) {
  const [localValue, setLocalValue] = React.useState<string>(value?.toString() ?? '');

  React.useEffect(() => {
    if (value !== undefined && Number(localValue) !== value) {
      setLocalValue(value.toString());
    }
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalValue(val);
    
    if (val === '') {
      onChange?.(0);
    } else if (val !== '-' && val !== '.' && val !== '-.') {
      const num = Number(val);
      if (!isNaN(num)) {
        onChange?.(num);
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 h-full flex flex-col">
      <div className="flex items-center gap-2 text-emerald-600 font-semibold text-sm tracking-wider">
        {icon}
        <span>{label}</span>
      </div>
      <div className="flex-grow flex flex-col justify-center">
        {content ? content : (
          <div className="space-y-2">
            <div className="relative">
              <input
                type="text"
                inputMode="decimal"
                value={localValue}
                onChange={handleInputChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-medium pr-12"
              />
              {unit && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">{unit}</span>}
            </div>
            {description && <p className="text-[10px] text-slate-400 leading-tight">{description}</p>}
          </div>
        )}
      </div>
    </div>
  );
}

interface ResultCardProps {
  icon?: React.ReactNode;
  label: string;
  value: string | number;
  unit: string;
  description?: string;
  labelClassName?: string;
  valueClassName?: string;
}

export function ResultCard({ icon, label, value, unit, description, labelClassName, valueClassName }: ResultCardProps) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 group hover:border-emerald-200 transition-colors">
      {icon && (
        <div className="bg-slate-50 p-3 rounded-xl group-hover:bg-emerald-50 transition-colors">
          {icon}
        </div>
      )}
      <div className="flex flex-col flex-grow">
        <span className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${labelClassName || 'text-slate-400'}`}>{label}</span>
        <div className="flex items-baseline gap-1">
          <span className={`text-lg font-bold font-mono tracking-tight ${valueClassName || 'text-slate-900'}`}>
            {typeof value === 'number' ? value.toLocaleString('it-IT', { maximumFractionDigits: 2 }) : value}
          </span>
          <span className="text-[10px] font-medium text-slate-400">{unit}</span>
        </div>
        {description && <p className="text-[10px] text-slate-400 mt-1 leading-tight">{description}</p>}
      </div>
    </div>
  );
}
