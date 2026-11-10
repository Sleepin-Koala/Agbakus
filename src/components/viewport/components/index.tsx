import React from 'react';

// --- BOUTON RÉUTILISABLE ---
interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'success' | 'danger';
  children: React.ReactNode;
}

export const ActionButton: React.FC<ActionButtonProps> = ({ 
  variant = 'primary', 
  children, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "px-5 py-3 rounded-xl font-medium tracking-wide transition-all duration-200 shadow-md active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100 text-sm md:text-base";
  
  const variants = {
    primary: "bg-amber-900 hover:bg-amber-800 text-amber-50 border border-amber-950/20 shadow-amber-900/10",
    success: "bg-emerald-600 hover:bg-emerald-500 text-emerald-50 shadow-emerald-600/10",
    danger: "bg-rose-700 hover:bg-rose-600 text-rose-50 shadow-rose-700/10"
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

// --- OVERLAY / MODALE RÉUTILISABLE ---
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-scale-up">
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-800 bg-slate-950/40">
          <h3 className="font-semibold text-lg text-amber-50">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 text-xl font-bold p-1">&times;</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};
