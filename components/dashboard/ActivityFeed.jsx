import Link from 'next/link';
import { motion } from 'framer-motion';
import { Skeleton } from '../ui/skeleton';

const ActivityFeed = ({ activities, isLoading }) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-start space-x-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">
          Belum ada aktivitas terbaru. Mulai dengan mengerjakan tes!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 pt-1 text-xl">{activity.icon}</div>
            <div className="flex-1 min-w-0">
              <Link href={activity.link} className="block">
                <p className="text-sm font-medium text-gray-900 dark:text-white hover:underline">
                  {activity.message}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {activity.date}
                </p>
              </Link>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default ActivityFeed;
