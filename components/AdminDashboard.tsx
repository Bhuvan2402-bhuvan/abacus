import React, { useMemo } from 'react';
import { LEVEL_CATEGORIES } from '../levels';

interface AdminDashboardProps {
  allUsersProgress: { [username: string]: string[] };
}

const ProgressBar: React.FC<{ current: number; total: number; category: string }> = ({ current, total, category }) => {
  const percentage = total > 0 ? (current / total) * 100 : 0;
  
  const colorClasses: { [key: string]: string } = {
    'Addition': 'bg-blue-600',
    'Subtraction': 'bg-red-600',
    'Multiplication': 'bg-green-600',
    'Division': 'bg-purple-600',
    'default': 'bg-gray-600'
  };

  const barColor = colorClasses[category] || colorClasses['default'];

  return (
    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-5 relative overflow-hidden">
      <div
        className={`h-5 rounded-full transition-all duration-500 ease-out ${barColor}`}
        style={{ width: `${percentage}%` }}
      ></div>
       <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white mix-blend-lighten">
        {`${current} / ${total}`}
      </span>
    </div>
  );
};


const AdminDashboard: React.FC<AdminDashboardProps> = ({ allUsersProgress }) => {

  const analysisData = useMemo(() => {
    const categoryInfo = LEVEL_CATEGORIES.reduce((acc, category) => {
        acc[category.name] = category.levels.length;
        return acc;
    }, {} as { [key: string]: number });
    
    const totalAvailableLevels = Object.values(categoryInfo).reduce((sum, count) => sum + count, 0);

    const studentData = Object.keys(allUsersProgress).map(username => {
        const completed = allUsersProgress[username];
        const categoryProgress = LEVEL_CATEGORIES.reduce((acc, cat) => {
            acc[cat.name] = {
                completed: completed.filter(id => id.startsWith(cat.name)).length,
                total: categoryInfo[cat.name]
            };
            return acc;
        }, {} as { [key: string]: { completed: number; total: number } });

        return {
            username,
            totalCompleted: completed.length,
            categoryProgress
        };
    });

    studentData.sort((a, b) => {
        const numA = parseInt(a.username.replace('student ', ''), 10);
        const numB = parseInt(b.username.replace('student ', ''), 10);
        return isNaN(numA) || isNaN(numB) ? a.username.localeCompare(b.username) : numA - numB;
    });

    const totalStudents = studentData.length;
    const totalCompletions = studentData.reduce((sum, student) => sum + student.totalCompleted, 0);
    const totalPossibleCompletions = totalStudents * totalAvailableLevels;
    const overallCompletionPercentage = totalPossibleCompletions > 0 ? ((totalCompletions / totalPossibleCompletions) * 100).toFixed(1) : '0.0';

    return {
      studentData,
      classSummary: {
        totalStudents,
        totalCompletions,
        totalAvailableLevels,
        overallCompletionPercentage
      }
    };
  }, [allUsersProgress]);

  const { studentData, classSummary } = analysisData;

  return (
    <div
      className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg shadow-2xl max-w-4xl w-full p-6 sm:p-8 mx-auto"
      aria-labelledby="dashboard-title"
      role="region"
    >
      <div className="flex justify-between items-center mb-8">
        <h2
          id="dashboard-title"
          className="text-2xl sm:text-3xl font-bold text-amber-800 dark:text-amber-300"
        >
          Admin Dashboard
        </h2>
      </div>

      <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-lg mb-8">
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Class Overview
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
              <p className="text-3xl font-bold text-amber-700 dark:text-amber-400">{classSummary.totalStudents}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Students</p>
            </div>
             <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{classSummary.totalCompletions}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Levels Completed</p>
            </div>
             <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">{classSummary.totalAvailableLevels}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Levels per Student</p>
            </div>
             <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{classSummary.overallCompletionPercentage}%</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Class Completion</p>
            </div>
          </div>
      </div>
      
      <div>
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Student Progress Details
          </h3>
          {studentData.length > 0 ? (
            <div className="space-y-6">
              {studentData.map(student => (
                <div key={student.username} className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 capitalize">{student.username}</h4>
                    <span className="text-sm font-bold bg-amber-200 text-amber-800 dark:bg-amber-800 dark:text-amber-200 px-3 py-1 rounded-full">
                      Completed: {student.totalCompleted}
                    </span>
                  </div>
                  
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                    {Object.entries(student.categoryProgress).map(([category, progress]) => (
                      <div key={category}>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{category}</label>
                        <ProgressBar current={progress.completed} total={progress.total} category={category} />
                      </div>
                    ))}
                   </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400 py-4">
              No student data is available.
            </p>
          )}
      </div>
    </div>
  );
};

export default AdminDashboard;