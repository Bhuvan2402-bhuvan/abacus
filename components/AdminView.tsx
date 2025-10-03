import React from 'react';
import AdminDashboard from './AdminDashboard';
import { CurrentUser } from '../types';

interface AdminViewProps {
  currentUser: CurrentUser | null;
  allUsersProgress: { [username: string]: string[] };
}

const AdminView: React.FC<AdminViewProps> = ({ currentUser, allUsersProgress }) => {
  const isAdmin = currentUser?.role === 'admin';

  if (isAdmin) {
    return <AdminDashboard allUsersProgress={allUsersProgress} />;
  }

  return (
    <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg shadow-2xl max-w-md w-full p-8 mx-auto text-center">
      <h2 className="text-2xl font-bold text-amber-800 dark:text-amber-300 mb-4">
        Access Denied
      </h2>
      <p className="text-gray-600 dark:text-gray-400">
        You do not have the required permissions to view this page. Please log in
        as an administrator.
      </p>
    </div>
  );
};

export default AdminView;
