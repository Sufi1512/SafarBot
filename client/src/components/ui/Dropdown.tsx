import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, Search } from 'lucide-react';

export interface DropdownOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  description?: string;
}

export interface DropdownProps {
  options: DropdownOption[];
  value: string | number;
  onChange: (value: string | number) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'filled' | 'ghost';
  className?: string;
  maxHeight?: number;
  showCheckmark?: boolean;
  onClear?: () => void;
}

const Dropdown: React.FC<DropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  label,
  error,
  disabled = false,
  searchable = false,
  clearable = false,
  size = 'md',
  variant = 'default',
  className = '',
  maxHeight = 200,
  showCheckmark = true,
  onClear,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter options based on search query
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (option.description && option.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Find selected option
  const selectedOption = options.find(option => option.value === value);

  // Size classes
  const sizeClasses = {
    sm: 'px-2 py-1.5 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-2.5 text-sm',
  };

  // Variant classes
  const variantClasses = {
    default: 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white',
    outline: 'bg-transparent border-2 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white',
    filled: 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white',
    ghost: 'bg-transparent border-0 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800',
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
          const option = filteredOptions[highlightedIndex];
          if (!option.disabled) {
            onChange(option.value);
            setIsOpen(false);
            setSearchQuery('');
            setHighlightedIndex(-1);
          }
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setSearchQuery('');
        setHighlightedIndex(-1);
        break;
    }
  };

  const handleOptionClick = (option: DropdownOption) => {
    if (!option.disabled) {
      onChange(option.value);
      setIsOpen(false);
      setSearchQuery('');
      setHighlightedIndex(-1);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClear) {
      onClear();
    } else {
      onChange('');
    }
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef} style={{ zIndex: 1000 }}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}

      {/* Dropdown Trigger */}
      <motion.button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={`
          relative w-full flex items-center justify-between rounded-xl border-2 transition-all duration-200 group
          ${sizeClasses[size]}
          ${variantClasses[variant]}
          ${error 
            ? 'border-red-500 focus:ring-red-500' 
            : `${!isOpen ? 'focus:ring-cyan-500 focus:border-cyan-500' : 'focus:ring-0 focus:border-cyan-500'}`}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-cyan-400 dark:hover:border-cyan-500'}
          ${isOpen ? 'ring-2 ring-cyan-500/20 border-cyan-500 shadow-lg' : 'shadow-sm hover:shadow-md'}
          bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm
        `}
        whileHover={!disabled ? { scale: 1.01 } : {}}
        whileTap={!disabled ? { scale: 0.99 } : {}}
      >
        <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {selectedOption?.icon && (
            <span className="flex-shrink-0 text-gray-500 dark:text-gray-400">
              {selectedOption.icon}
            </span>
          )}
          <span className={`truncate ${!selectedOption ? 'text-gray-500 dark:text-gray-400' : ''}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        
        <div className="flex items-center gap-1 flex-shrink-0">
          {clearable && selectedOption && (
            <motion.button
              onClick={handleClear}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>
          )}
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </motion.div>
        </div>
      </motion.button>

      {/* Error Message */}
      {error && (
        <motion.p
          className="mt-1 text-xs text-red-600 dark:text-red-400"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {error}
        </motion.p>
      )}

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute z-[99999] w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl"
            style={{ maxHeight: `${maxHeight}px` }}
          >
            {/* Search Input */}
            {searchable && (
              <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search options..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>
              </div>
            )}

            {/* Options List */}
            <div className="overflow-y-auto" style={{ maxHeight: `${maxHeight - (searchable ? 60 : 0)}px` }}>
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400 text-center">
                  {searchQuery ? 'No options found' : 'No options available'}
                </div>
              ) : (
                filteredOptions.map((option, index) => (
                  <motion.button
                    key={option.value}
                    onClick={() => handleOptionClick(option)}
                    disabled={option.disabled}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2 text-left text-sm transition-colors
                      ${option.disabled 
                        ? 'opacity-50 cursor-not-allowed text-gray-400' 
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer'
                      }
                      ${highlightedIndex === index ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
                      ${option.value === value ? 'bg-blue-100 dark:bg-blue-900/30' : ''}
                    `}
                    whileHover={!option.disabled ? { x: 2 } : {}}
                    whileTap={!option.disabled ? { scale: 0.98 } : {}}
                  >
                    {option.icon && (
                      <span className="flex-shrink-0 text-gray-500 dark:text-gray-400">
                        {option.icon}
                      </span>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 dark:text-white truncate">
                        {option.label}
                      </div>
                      {option.description && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {option.description}
                        </div>
                      )}
                    </div>

                    {showCheckmark && option.value === value && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.2 }}
                        className="flex-shrink-0 text-blue-600 dark:text-blue-400"
                      >
                        <Check className="w-4 h-4" />
                      </motion.div>
                    )}
                  </motion.button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dropdown;
