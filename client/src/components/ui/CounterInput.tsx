import React from 'react';
import { Minus, Plus } from 'lucide-react';
import { cn } from '../../utils/cn';

interface CounterInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  className?: string;
  step?: number;
  "aria-label"?: string;
}

const CounterInput: React.FC<CounterInputProps> = ({
  value,
  onChange,
  min = 0,
  max = Number.POSITIVE_INFINITY,
  className,
  step = 1,
  "aria-label": ariaLabel,
}) => {
  const handleDecrease = () => {
    const nextValue = value - step;
    if (nextValue >= min) {
      onChange(nextValue);
    } else if (value !== min) {
      onChange(min);
    }
  };

  const handleIncrease = () => {
    const nextValue = value + step;
    if (nextValue <= max) {
      onChange(nextValue);
    } else if (value !== max) {
      onChange(max);
    }
  };

  return (
    <div
      className={cn(
        'flex items-center justify-between rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm',
        'px-3 py-1.5 select-none',
        className,
      )}
      aria-label={ariaLabel}
      role={ariaLabel ? 'spinbutton' : undefined}
      aria-valuenow={ariaLabel ? value : undefined}
      aria-valuemin={ariaLabel ? min : undefined}
      aria-valuemax={ariaLabel ? max : undefined}
    >
      <button
        type="button"
        onClick={handleDecrease}
        disabled={value <= min}
        className="flex h-8 w-8 items-center justify-center rounded-full text-lg font-medium text-primary-600 transition-colors hover:bg-primary-50 disabled:cursor-not-allowed disabled:text-gray-300 dark:hover:bg-primary-900/30"
        aria-label="Decrease"
      >
        <Minus className="h-4 w-4" strokeWidth={2.5} />
      </button>
      <span className="min-w-[2rem] text-center text-sm font-semibold text-gray-900 dark:text-white">
        {value}
      </span>
      <button
        type="button"
        onClick={handleIncrease}
        disabled={value >= max}
        className="flex h-8 w-8 items-center justify-center rounded-full text-lg font-medium text-primary-600 transition-colors hover:bg-primary-50 disabled:cursor-not-allowed disabled:text-gray-300 dark:hover:bg-primary-900/30"
        aria-label="Increase"
      >
        <Plus className="h-4 w-4" strokeWidth={2.5} />
      </button>
    </div>
  );
};

export default CounterInput;

