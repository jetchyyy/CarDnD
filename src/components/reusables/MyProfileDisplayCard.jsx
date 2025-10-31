import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function MyProfileDisplayCard({ 
  title, 
  children, 
  isOpen = false,
  className = '' 
}) {
  const [isExpanded, setIsExpanded] = useState(isOpen);

  return (
    <div className={`bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl shadow-sm overflow-hidden ${className}`}>
      {/* Toggle Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-green-100/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="bg-green-600 rounded-full p-2">
            <svg 
              className="w-5 h-5 text-white" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
          </div>
          <div className="text-left">
            <h3 className="text-base font-bold text-green-900">
              {title}
            </h3>
            <p className="text-xs text-green-700">
              Click to {isExpanded ? 'hide' : 'view'} details
            </p>
          </div>
        </div>
        
        <div className="flex-shrink-0 ml-4">
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-green-700" />
          ) : (
            <ChevronDown className="w-5 h-5 text-green-700" />
          )}
        </div>
      </button>

      {/* Expandable Content */}
      <div 
        className={`transition-all duration-300 ease-in-out ${
          isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
        } overflow-hidden`}
      >
        <div className="p-4 pt-0 border-t border-green-200">
          {children}
        </div>
      </div>
    </div>
  );
}