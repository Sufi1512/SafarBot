import React, { useState } from 'react';
import { DateRange } from 'react-day-picker';
import PageHeader from '../components/PageHeader';
import ModernCard from '../components/ui/ModernCard';
import DatePicker from '../components/ui/DatePicker';
import DateRangePicker from '../components/ui/DateRangePicker';

const DatePickerDemo: React.FC = () => {
  const [singleDate, setSingleDate] = useState<Date>();
  const [dateRange, setDateRange] = useState<DateRange>();
  const [minDate, setMinDate] = useState<Date>();
  const [maxDate, setMaxDate] = useState<Date>();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
      <PageHeader
        title="Date Picker Components"
        description="Explore the new date picker components with various configurations"
      />

      <div className="container-chisfis py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Single Date Picker */}
          <ModernCard className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Single Date Picker
            </h3>
            <div className="space-y-4">
              <DatePicker
                label="Select a Date"
                value={singleDate}
                onChange={setSingleDate}
                placeholder="Choose a date"
                className="w-full"
              />
              {singleDate && (
                <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Selected: {singleDate.toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </ModernCard>

          {/* Date Range Picker */}
          <ModernCard className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Date Range Picker
            </h3>
            <div className="space-y-4">
              <DateRangePicker
                label="Select Date Range"
                value={dateRange}
                onChange={setDateRange}
                placeholder="Choose date range"
                className="w-full"
              />
              {dateRange && (
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    From: {dateRange.from?.toLocaleDateString()}
                    {dateRange.to && ` - To: ${dateRange.to.toLocaleDateString()}`}
                  </p>
                </div>
              )}
            </div>
          </ModernCard>

          {/* Date Picker with Min Date */}
          <ModernCard className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Date Picker with Min Date
            </h3>
            <div className="space-y-4">
              <DatePicker
                label="Select Date (No Past Dates)"
                value={minDate}
                onChange={setMinDate}
                placeholder="Choose a future date"
                minDate={new Date()}
                className="w-full"
              />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                This picker prevents selecting dates before today
              </p>
            </div>
          </ModernCard>

          {/* Date Picker with Max Date */}
          <ModernCard className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Date Picker with Max Date
            </h3>
            <div className="space-y-4">
              <DatePicker
                label="Select Date (Limited Range)"
                value={maxDate}
                onChange={setMaxDate}
                placeholder="Choose a date within 30 days"
                maxDate={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)}
                className="w-full"
              />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                This picker limits selection to the next 30 days
              </p>
            </div>
          </ModernCard>

          {/* Disabled Date Picker */}
          <ModernCard className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Disabled Date Picker
            </h3>
            <div className="space-y-4">
              <DatePicker
                label="Disabled Date Picker"
                value={undefined}
                onChange={() => {}}
                placeholder="This picker is disabled"
                disabled={true}
                className="w-full"
              />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                This picker is disabled and cannot be interacted with
              </p>
            </div>
          </ModernCard>

          {/* Custom Styled Date Picker */}
          <ModernCard className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Custom Styled Date Picker
            </h3>
            <div className="space-y-4">
              <DatePicker
                label="Custom Style"
                value={undefined}
                onChange={() => {}}
                placeholder="Custom styled picker"
                className="w-full border-2 border-primary-500 focus:border-primary-600"
              />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                This picker has custom border styling
              </p>
            </div>
          </ModernCard>
        </div>

        {/* Usage Examples */}
        <ModernCard className="p-6 mt-8">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Usage Examples
          </h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                Basic Single Date Picker
              </h4>
              <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm overflow-x-auto">
{`<DatePicker
  label="Select a Date"
  value={date}
  onChange={setDate}
  placeholder="Choose a date"
/>`}
              </pre>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                Date Range Picker
              </h4>
              <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm overflow-x-auto">
{`<DateRangePicker
  label="Select Date Range"
  value={dateRange}
  onChange={setDateRange}
  placeholder="Choose date range"
/>`}
              </pre>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                Date Picker with Constraints
              </h4>
              <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm overflow-x-auto">
{`<DatePicker
  label="Select Date"
  value={date}
  onChange={setDate}
  minDate={new Date()}
  maxDate={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)}
  disabled={false}
  className="w-full"
/>`}
              </pre>
            </div>
          </div>
        </ModernCard>
      </div>
    </div>
  );
};

export default DatePickerDemo;
