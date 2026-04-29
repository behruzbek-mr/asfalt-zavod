import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuthStore } from '../../store/auth';
import { useStore } from '../../store';
import LoginPage from '../auth/LoginPage';
import { Factory } from 'lucide-react';

export default function Layout() {
  const { isAuthenticated, fetchUsers } = useAuthStore();
  const { fetchInitialData, isLoaded } = useStore();

  useEffect(() => {
    if (isAuthenticated) {
      fetchUsers();
      fetchInitialData();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  if (!isLoaded) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-dark-900 text-white">
        <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center mb-6 animate-pulse">
          <Factory className="w-8 h-8 text-white" />
        </div>
        <p className="text-dark-300 animate-pulse">Ma'lumotlar yuklanmoqda...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-dark-900">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
