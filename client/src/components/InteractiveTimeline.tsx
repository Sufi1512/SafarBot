import React from 'react';
import { motion } from 'framer-motion';
import { Clock, MapPin, Star, IndianRupee } from 'lucide-react';

interface Activity {
  time: string;
  title: string;
  description: string;
  location: string;
  duration: string;
  cost?: number | string;
  type: 'sightseeing' | 'restaurant' | 'transport' | 'hotel';
  image?: string;
}

interface DailyPlan {
  day: number;
  date: string;
  theme?: string;
  activities: Activity[];
}

interface InteractiveTimelineProps {
  dailyPlans: DailyPlan[];
  formatINR: (amount: number) => string;
  onActivityClick?: (activity: Activity) => void;
}

const InteractiveTimeline: React.FC<InteractiveTimelineProps> = ({
  dailyPlans,
  formatINR,
  onActivityClick
}) => {
  return (
    <div className="relative">
      {/* Vertical Timeline Line */}
      <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 opacity-30" />
      
      <div className="space-y-12">
        {dailyPlans.map((plan, planIndex) => (
          <motion.div
            key={plan.day}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: planIndex * 0.1 }}
            className="relative"
          >
            {/* Day Header */}
            <div className="flex items-center mb-6">
              <div className="relative z-10 flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 shadow-lg shadow-purple-500/50">
                <span className="text-white font-bold text-lg">{plan.day}</span>
              </div>
              <div className="ml-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Day {plan.day}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">{plan.date}</p>
                {plan.theme && (
                  <span className="inline-block mt-2 px-3 py-1 text-xs font-medium bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-700 dark:text-blue-300 rounded-full">
                    {plan.theme}
                  </span>
                )}
              </div>
            </div>

            {/* Activities Timeline */}
            <div className="ml-8 space-y-6">
              {plan.activities.map((activity, activityIndex) => (
                <motion.div
                  key={activityIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: activityIndex * 0.05 }}
                  className="relative group"
                >
                  {/* Timeline Dot */}
                  <div className="absolute -left-10 top-4 w-4 h-4 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 shadow-lg shadow-blue-500/50 group-hover:scale-150 transition-transform duration-300" />
                  
                  {/* Activity Card */}
                  <motion.div
                    whileHover={{ scale: 1.02, x: 10 }}
                    className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20 dark:border-gray-700/50 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 cursor-pointer"
                    onClick={() => onActivityClick?.(activity)}
                  >
                    {/* Gradient Border Effect */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-blue-500/20 group-hover:via-purple-500/20 group-hover:to-pink-500/20 transition-all duration-300 -z-10 blur-xl" />
                    
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                            <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                              {activity.time}
                            </span>
                          </div>
                          {activity.duration && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {activity.duration}
                            </span>
                          )}
                        </div>
                        
                        <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300">
                          {activity.title}
                        </h4>
                        
                        <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                          {activity.description}
                        </p>
                        
                        <div className="flex items-center gap-4 flex-wrap">
                          <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                            <MapPin className="w-4 h-4" />
                            <span className="text-sm">{activity.location}</span>
                          </div>
                          {activity.cost && (
                            <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                              <IndianRupee className="w-4 h-4" />
                              <span className="text-sm font-medium">
                                {typeof activity.cost === 'number' 
                                  ? formatINR(activity.cost) 
                                  : activity.cost}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Activity Type Icon */}
                      <div className="ml-4 p-3 rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30">
                        {activity.type === 'sightseeing' && '🏛️'}
                        {activity.type === 'restaurant' && '🍽️'}
                        {activity.type === 'transport' && '🚗'}
                        {activity.type === 'hotel' && '🏨'}
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default InteractiveTimeline;

