import React from 'react';
import { motion } from 'framer-motion';
import { IndianRupee, TrendingUp, PieChart } from 'lucide-react';

interface BudgetBreakdownProps {
  dailyPlans: any[];
  formatINR: (amount: number) => string;
  totalBudget?: number;
}

const BudgetBreakdown: React.FC<BudgetBreakdownProps> = ({
  dailyPlans,
  formatINR,
  totalBudget
}) => {
  // Calculate costs
  const calculateCosts = () => {
    const costs = dailyPlans.map((plan) => {
      const activityCost = (plan.activities || []).reduce((sum: number, activity: any) => {
        return sum + (activity.costValue || 0);
      }, 0);

      const mealCost = (plan.meals || []).reduce((sum: number, meal: any) => {
        return sum + (meal.priceValue || 0);
      }, 0);

      const transportCost = (plan.transport || []).reduce((sum: number, transport: any) => {
        return sum + (transport.costValue || 0);
      }, 0);

      return {
        day: plan.day,
        activity: activityCost,
        meals: mealCost,
        transport: transportCost,
        total: activityCost + mealCost + transportCost
      };
    });

    const total = costs.reduce((sum, day) => sum + day.total, 0);
    const activityTotal = costs.reduce((sum, day) => sum + day.activity, 0);
    const mealsTotal = costs.reduce((sum, day) => sum + day.meals, 0);
    const transportTotal = costs.reduce((sum, day) => sum + day.transport, 0);

    return {
      daily: costs,
      totals: {
        total,
        activity: activityTotal,
        meals: mealsTotal,
        transport: transportTotal
      },
      percentages: {
        activity: total > 0 ? (activityTotal / total) * 100 : 0,
        meals: total > 0 ? (mealsTotal / total) * 100 : 0,
        transport: total > 0 ? (transportTotal / total) * 100 : 0
      }
    };
  };

  const costs = calculateCosts();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/20 dark:border-gray-700/50"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30">
          <PieChart className="w-6 h-6 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Budget Breakdown</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Cost analysis and insights</p>
        </div>
      </div>

      {/* Total Cost */}
      <div className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200/50 dark:border-blue-700/50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-600 dark:text-gray-400 font-medium">Total Estimated Cost</span>
          <TrendingUp className="w-5 h-5 text-green-500" />
        </div>
        <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {formatINR(costs.totals.total)}
        </div>
        {totalBudget && (
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Budget: {formatINR(totalBudget)} • 
            <span className={`ml-1 font-medium ${costs.totals.total > totalBudget ? 'text-red-500' : 'text-green-500'}`}>
              {costs.totals.total > totalBudget ? 'Over' : 'Under'} by {formatINR(Math.abs(costs.totals.total - totalBudget))}
            </span>
          </div>
        )}
      </div>

      {/* Category Breakdown */}
      <div className="space-y-4 mb-8">
        <h4 className="font-semibold text-gray-900 dark:text-white">By Category</h4>
        
        {/* Activities */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Activities</span>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {formatINR(costs.totals.activity)} ({costs.percentages.activity.toFixed(1)}%)
            </span>
          </div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${costs.percentages.activity}%` }}
              transition={{ duration: 1, delay: 0.2 }}
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
            />
          </div>
        </div>

        {/* Meals */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Meals</span>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {formatINR(costs.totals.meals)} ({costs.percentages.meals.toFixed(1)}%)
            </span>
          </div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${costs.percentages.meals}%` }}
              transition={{ duration: 1, delay: 0.4 }}
              className="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full"
            />
          </div>
        </div>

        {/* Transport */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Transport</span>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {formatINR(costs.totals.transport)} ({costs.percentages.transport.toFixed(1)}%)
            </span>
          </div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${costs.percentages.transport}%` }}
              transition={{ duration: 1, delay: 0.6 }}
              className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full"
            />
          </div>
        </div>
      </div>

      {/* Daily Breakdown */}
      <div>
        <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Daily Breakdown</h4>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {costs.daily.map((day) => (
            <motion.div
              key={day.day}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: day.day * 0.05 }}
              className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                  {day.day}
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Day {day.day}</span>
              </div>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {formatINR(day.total)}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default BudgetBreakdown;

