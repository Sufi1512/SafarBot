import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, isToday, isBefore } from 'date-fns';
import { ChevronLeftIcon, ChevronRightIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';

interface CustomDatePickerProps {
  value?: Date;
  onChange?: (date: Date) => void;
  placeholder?: string;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
  label?: string;
}

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  value,
  onChange,
  placeholder = "Select date",
  minDate,
  maxDate,
  className = "",
  label
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(value || new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(value);
  const [showAbove, setShowAbove] = useState(false);
  const [calendarPosition, setCalendarPosition] = useState({ top: 0, left: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value) {
      setSelectedDate(value);
      setCurrentMonth(value);
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const targetNode = event.target as Node;
      const clickedInsideTrigger = containerRef.current?.contains(targetNode);
      const clickedInsideCalendar = calendarRef.current?.contains(targetNode);

      if (clickedInsideTrigger || clickedInsideCalendar) {
        return; // Ignore clicks inside the trigger or the calendar portal
      }

      setIsOpen(false);
    };

    const handleResize = () => {
      if (isOpen) {
        checkPositioning();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleResize);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize);
    };
  }, [isOpen]);

  const checkPositioning = () => {
    if (!buttonRef.current) return;
    
    const buttonRect = buttonRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const calendarHeight = 450; // Approximate height of the calendar including padding
    const calendarWidth = 320; // Calendar width
    const buffer = 20; // Extra space buffer
    
    const spaceBelow = viewportHeight - buttonRect.bottom - buffer;
    const spaceAbove = buttonRect.top - buffer;
    
    // Show above if there's not enough space below but enough space above
    const shouldShowAbove = spaceBelow < calendarHeight && spaceAbove >= calendarHeight;
    setShowAbove(shouldShowAbove);
    
    // Calculate position
    let top = shouldShowAbove 
      ? buttonRect.top - calendarHeight - 12 // 12px margin
      : buttonRect.bottom + 12; // 12px margin
    
    let left = buttonRect.left + (buttonRect.width / 2) - (calendarWidth / 2);
    
    // Ensure calendar doesn't go outside viewport horizontally
    if (left < buffer) {
      left = buffer;
    } else if (left + calendarWidth > viewportWidth - buffer) {
      left = viewportWidth - calendarWidth - buffer;
    }
    
    // Ensure calendar doesn't go outside viewport vertically
    if (top < buffer) {
      top = buffer;
    } else if (top + calendarHeight > viewportHeight - buffer) {
      top = viewportHeight - calendarHeight - buffer;
    }
    
    setCalendarPosition({ top, left });
  };

  const handleDateSelect = (date: Date) => {
    if (minDate && isBefore(date, minDate)) return;
    if (maxDate && isBefore(maxDate, date)) return;
    
    setSelectedDate(date);
    onChange?.(date);
    setIsOpen(false);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => 
      direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1)
    );
  };

  const renderCalendar = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const dateFormat = "d";
    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = day;
        const isCurrentMonth = isSameMonth(day, monthStart);
        const isSelected = selectedDate && isSameDay(day, selectedDate);
        const isCurrentDay = isToday(day);
        const isDisabled = (minDate && isBefore(day, minDate)) || (maxDate && isBefore(maxDate, day));

        days.push(
          <motion.button
            key={day.toString()}
            type="button"
            whileHover={{ scale: isCurrentMonth && !isDisabled ? 1.1 : 1 }}
            whileTap={{ scale: isCurrentMonth && !isDisabled ? 0.95 : 1 }}
            onClick={() => isCurrentMonth && !isDisabled && handleDateSelect(cloneDay)}
            disabled={isDisabled}
            className={`
              relative w-10 h-10 rounded-xl text-sm font-bold transition-all duration-200
              ${isSelected 
                ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg ring-2 ring-cyan-200 dark:ring-cyan-700' 
                : isCurrentDay
                ? 'bg-gradient-to-br from-cyan-50 to-blue-50 text-cyan-600 border-2 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-400 dark:border-cyan-700'
                : isCurrentMonth
                ? 'text-gray-700 dark:text-gray-300 hover:bg-gradient-to-br hover:from-cyan-50 hover:to-blue-50 dark:hover:bg-gray-700 hover:text-cyan-600 dark:hover:text-cyan-400'
                : 'text-gray-400 dark:text-gray-600'
              }
              ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              ${!isCurrentMonth ? 'opacity-40' : ''}
            `}
          >
            {format(day, dateFormat)}
            {isCurrentDay && !isSelected && (
              <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full" />
            )}
          </motion.button>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div key={day.toString()} className="grid grid-cols-7 gap-1">
          {days}
        </div>
      );
      days = [];
    }

    return rows;
  };

  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
      )}
      
      <motion.button
        ref={buttonRef}
        type="button"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={() => {
          checkPositioning();
          setIsOpen(!isOpen);
        }}
        className={`
          relative w-full px-4 py-5 text-left border-2 rounded-2xl transition-all duration-300 group
          ${isOpen 
            ? 'border-cyan-500 ring-4 ring-cyan-500/20 shadow-lg' 
            : 'border-gray-200 dark:border-gray-600 hover:border-cyan-400 dark:hover:border-cyan-500'
          }
          bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm text-gray-900 dark:text-white
          focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 shadow-sm hover:shadow-md
        `}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CalendarDaysIcon className={`w-5 h-5 transition-colors duration-200 ${
              isOpen ? 'text-cyan-500' : 'text-gray-400 group-hover:text-cyan-500'
            }`} />
            <span className={`text-lg font-medium ${
              selectedDate ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'
            }`}>
              {selectedDate ? format(selectedDate, 'MMM dd, yyyy') : placeholder}
            </span>
          </div>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronRightIcon className="w-5 h-5 text-gray-400" />
          </motion.div>
        </div>
      </motion.button>

      {isOpen && createPortal(
        <AnimatePresence>
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              ref={calendarRef}
              initial={{ opacity: 0, y: showAbove ? -10 : 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: showAbove ? -10 : 10, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="fixed bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 w-80"
              style={{
                filter: 'drop-shadow(0 25px 25px rgb(0 0 0 / 0.15))',
                zIndex: 9999,
                top: calendarPosition.top,
                left: calendarPosition.left
              }}
            >
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-6">
              <motion.button
                whileHover={{ scale: 1.1, backgroundColor: 'rgba(6, 182, 212, 0.1)' }}
                whileTap={{ scale: 0.9 }}
                onClick={() => navigateMonth('prev')}
                className="p-3 rounded-xl hover:bg-cyan-50 dark:hover:bg-cyan-900/30 transition-all duration-200 border border-transparent hover:border-cyan-200 dark:hover:border-cyan-700"
              >
                <ChevronLeftIcon className="w-5 h-5 text-gray-600 dark:text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors" />
              </motion.button>
              
              <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                {format(currentMonth, 'MMMM yyyy')}
              </h3>
              
              <motion.button
                whileHover={{ scale: 1.1, backgroundColor: 'rgba(6, 182, 212, 0.1)' }}
                whileTap={{ scale: 0.9 }}
                onClick={() => navigateMonth('next')}
                className="p-3 rounded-xl hover:bg-cyan-50 dark:hover:bg-cyan-900/30 transition-all duration-200 border border-transparent hover:border-cyan-200 dark:hover:border-cyan-700"
              >
                <ChevronRightIcon className="w-5 h-5 text-gray-600 dark:text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors" />
              </motion.button>
            </div>

            {/* Week Days */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map(day => (
                <div key={day} className="h-10 flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    {day}
                  </span>
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="space-y-1">
              {renderCalendar()}
            </div>

            {/* Quick Actions */}
            <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleDateSelect(new Date())}
                className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors duration-200"
              >
                Today
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
              >
                Cancel
              </motion.button>
            </div>
          </motion.div>
          </>
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};

export default CustomDatePicker;
