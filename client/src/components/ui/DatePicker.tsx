import React from "react";
import { format } from "date-fns";
import { DayPicker } from "react-day-picker";
import { CalendarIcon } from "@heroicons/react/24/outline";

interface DatePickerProps {
  label?: string;
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  minDate?: Date;
  maxDate?: Date;
  showOutsideDays?: boolean;
}

const DatePicker: React.FC<DatePickerProps> = ({
  label,
  value,
  onChange,
  placeholder = "Choose a date",
  disabled = false,
  className = "",
  minDate,
  maxDate,
  showOutsideDays = true,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type="text"
          value={value ? format(value, "PPP") : ""}
          placeholder={placeholder}
          disabled={disabled}
          readOnly
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={`${className} w-full px-4 py-3 border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200 focus:shadow-lg focus:bg-white dark:focus:bg-gray-800 rounded-lg cursor-pointer`}
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <CalendarIcon className="h-5 w-5 text-gray-400" />
        </div>
        
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
            <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl border-0 p-4 min-w-[320px]">
              <DayPicker
                mode="single"
                selected={value}
                onSelect={(date) => {
                  onChange?.(date);
                  setIsOpen(false);
                }}
                showOutsideDays={showOutsideDays}
                disabled={minDate ? { before: minDate } : undefined}
                fromDate={minDate}
                toDate={maxDate}
                className="border-0"
                classNames={{
                  caption: "flex justify-center py-2 mb-4 relative items-center",
                  caption_label: "text-sm font-semibold text-gray-900 dark:text-white",
                  nav: "flex items-center",
                  nav_button:
                    "h-8 w-8 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded-lg transition-colors duration-200",
                  nav_button_previous: "absolute left-1",
                  nav_button_next: "absolute right-1",
                  table: "w-full border-collapse",
                  head_row: "flex font-medium text-gray-900 dark:text-white mb-2",
                  head_cell: "m-1 w-9 font-medium text-sm text-gray-600 dark:text-gray-400",
                  row: "flex w-full mt-1",
                  cell: "text-gray-600 dark:text-gray-300 rounded-lg h-10 w-10 text-center text-sm p-0 m-1 relative hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200",
                  day: "h-10 w-10 p-0 font-normal hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200",
                  day_range_end: "day-range-end",
                  day_selected:
                    "rounded-lg bg-blue-500 text-white hover:bg-blue-600 hover:text-white focus:bg-blue-500 focus:text-white shadow-md",
                  day_today: "rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-semibold",
                  day_outside:
                    "day-outside text-gray-400 dark:text-gray-500 opacity-50",
                  day_disabled: "text-gray-300 dark:text-gray-600 opacity-50 cursor-not-allowed",
                  day_hidden: "invisible",
                }}

              />
            </div>
          </div>
        )}
      </div>
      
      {/* Backdrop to close picker when clicking outside */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default DatePicker;
