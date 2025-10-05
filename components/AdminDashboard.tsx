import React, { useMemo, useState } from 'react';
import { LEVEL_CATEGORIES } from '../levels';

interface AdminDashboardProps {
  allUsersProgress: { [username: string]: string[] };
  onResetPassword: (username: string) => string;
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


const AdminDashboard: React.FC<AdminDashboardProps> = ({ allUsersProgress, onResetPassword }) => {
  const [userToReset, setUserToReset] = useState<string | null>(null);
  const [newPasswordInfo, setNewPasswordInfo] = useState<{ username: string; password: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleConfirmReset = () => {
    if (!userToReset) return;
    const newPassword = onResetPassword(userToReset);
    setNewPasswordInfo({ username: userToReset, password: newPassword });
    setUserToReset(null);
  };
  
  const handleCopyPassword = () => {
    if (newPasswordInfo) {
      navigator.clipboard.writeText(newPasswordInfo.password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  
  const handleCloseNewPasswordModal = () => {
    setNewPasswordInfo(null);
    setCopied(false);
  };


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
    <>
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
                      <div className="flex items-center gap-3">
                        <button 
                            onClick={() => setUserToReset(student.username)}
                            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1 bg-blue-100 dark:bg-blue-900/50 hover:bg-blue-200 dark:hover:bg-blue-800/50 transition-colors"
                            aria-label={`Reset password for ${student.username}`}
                        >
                            Reset Password
                        </button>
                        <span className="text-sm font-bold bg-amber-200 text-amber-800 dark:bg-amber-800 dark:text-amber-200 px-3 py-1 rounded-full">
                          Completed: {student.totalCompleted}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                      {Object.keys(student.categoryProgress).map((category) => {
                        const progress = student.categoryProgress[category];
                        return (
                          <div key={category}>
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{category}</label>
                            <ProgressBar current={progress.completed} total={progress.total} category={category} />
                          </div>
                        );
                      })}
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

      {userToReset && (
        <div 
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-reset-title"
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-md w-full p-6 sm:p-8">
            <h2 id="confirm-reset-title" className="text-2xl font-bold text-amber-800 dark:text-amber-300 mb-4">
              Confirm Password Reset
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to reset the password for <strong className="font-semibold capitalize">{userToReset}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-4">
              <button onClick={() => setUserToReset(null)} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">
                Cancel
              </button>
              <button onClick={handleConfirmReset} className="px-4 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 transition-colors">
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {newPasswordInfo && (
        <div 
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="reset-success-title"
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-md w-full p-6 sm:p-8 text-center">
            <h2 id="reset-success-title" className="text-2xl font-bold text-green-600 dark:text-green-400 mb-4">
              Password Reset Successful
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              The password for <strong className="font-semibold capitalize">{newPasswordInfo.username}</strong> has been changed.
            </p>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Please provide them with their new password:
            </p>

            <div className="relative bg-gray-100 dark:bg-gray-900 p-3 rounded-md mb-6">
              <code className="text-lg font-mono tracking-wider text-gray-800 dark:text-gray-200">
                {newPasswordInfo.password}
              </code>
              <button 
                onClick={handleCopyPassword}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                title="Copy to clipboard"
              >
                {copied ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                )}
              </button>
            </div>

            <button onClick={handleCloseNewPasswordModal} className="w-full px-6 py-2 bg-amber-700 text-white font-semibold rounded-md hover:bg-amber-800 transition-colors">
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminDashboard;