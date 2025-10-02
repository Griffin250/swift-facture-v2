import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { Bell, Search, Menu, User, Settings, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';

const AdminTopNavigation = ({ onToggleSidebar, onToggleCollapse, sidebarCollapsed }) => {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSignOut = async () => {
    await signOut();
    setShowProfileMenu(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-50">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left Section - Logo and Menu Toggle */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors lg:hidden"
            >
              <Menu size={20} />
            </button>
            
            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title={sidebarCollapsed ? t('admin.sidebar.expand', 'Expand sidebar') : t('admin.sidebar.collapse', 'Collapse sidebar')}
            >
              {sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <img 
              src="/assets/logo/SwiftFactureLogo.png" 
              alt="SwiftFacture" 
              className="h-8 w-auto"
            />
            <span className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('admin.title')}
            </span>
          </div>
        </div>

        {/* Center Section - Search */}
        <div className="hidden md:flex flex-1 max-w-lg mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder={t('admin.search.placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Right Section - Notifications and Profile */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="relative p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors">
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              3
            </span>
          </button>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-2 p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            >
              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center">
                <User size={16} />
              </div>
              <span className="hidden sm:block text-sm font-medium">
                {user?.email || t('admin.profile.admin')}
              </span>
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                <div className="py-1">
                  <button
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Settings size={16} />
                    <span>{t('admin.profile.settings')}</span>
                  </button>
                  <hr className="border-gray-200 dark:border-gray-700" />
                  <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <LogOut size={16} />
                    <span>{t('admin.profile.logout')}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AdminTopNavigation;