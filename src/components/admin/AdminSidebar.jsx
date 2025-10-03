import { useTranslation } from 'react-i18next';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  CreditCard, 
  FileText, 
  UserCheck, 
  HelpCircle, 
  Activity, 
  Settings,
  X,
  ChevronRight
} from 'lucide-react';

const AdminSidebar = ({ isOpen, isCollapsed, activePage, onPageChange, onClose, onToggleCollapse }) => {
  const { t } = useTranslation();

  const mainMenuItems = [
    { id: 'dashboard', label: t('admin.sidebar.dashboard'), icon: LayoutDashboard },
    { id: 'users', label: t('admin.sidebar.users'), icon: Users },
    { id: 'organizations', label: t('admin.sidebar.organizations'), icon: Building2 },
    { id: 'subscriptions', label: t('admin.sidebar.subscriptions'), icon: CreditCard },
    { id: 'documents', label: t('admin.sidebar.documents'), icon: FileText },
    { id: 'clients', label: t('admin.sidebar.clients'), icon: UserCheck },
    { id: 'support', label: t('admin.sidebar.support'), icon: HelpCircle },
    { id: 'monitoring', label: t('admin.sidebar.monitoring'), icon: Activity },
    { id: 'settings', label: t('admin.sidebar.systemSettings'), icon: Settings },
  ];



  const handleItemClick = (pageId) => {
    onPageChange(pageId);
    // Close sidebar on mobile after selection
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      {/* Sidebar */}
      <aside 
        className={`fixed left-0 top-16 z-50 h-[calc(100vh-4rem)] bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 transform ${
          isOpen ? 'translate-x-0' : '-translate-x-64'
        } lg:translate-x-0 lg:z-40 ${
          isCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        {/* Mobile Close Button */}
        <div className={`flex items-center p-4 lg:hidden ${
          isCollapsed ? 'justify-center' : 'justify-between'
        }`}>
          {!isCollapsed && (
            <span className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('admin.title')}
            </span>
          )}
          <button
            onClick={onClose}
            className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* Desktop Collapse Toggle - only show when collapsed */}
        {isCollapsed && (
          <div className="hidden lg:flex justify-center p-4 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={onToggleCollapse}
              className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title={t('admin.sidebar.expand', 'Expand sidebar')}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}

        {/* Navigation Menu */}
        <nav className={`mt-4 pb-4 ${isCollapsed ? 'px-2' : 'px-4'}`}>
          {/* Main Menu */}
          <div className="space-y-2">
            {!isCollapsed && (
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-3 py-2">
                {t('admin.sidebar.management')}
              </h3>
            )}
            <ul className="space-y-1">
              {mainMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activePage === item.id;
                
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => handleItemClick(item.id)}
                      className={`w-full flex items-center rounded-lg text-sm font-medium transition-colors group relative ${
                        isCollapsed 
                          ? 'justify-center px-3 py-3' 
                          : 'space-x-3 px-3 py-2'
                      } ${
                        isActive
                          ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    title={isCollapsed ? item.label : ''}
                  >
                    <Icon size={18} />
                    {!isCollapsed && <span>{item.label}</span>}
                    
                    {/* Tooltip for collapsed state */}
                    {isCollapsed && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                        {item.label}
                      </div>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>

          </div>
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            {!isCollapsed ? (
              <>
                <div>SwiftFacture Admin v1.0.0</div>
                <div className="mt-1">
                  <a href="/support" className="hover:text-blue-500">
                    {t('admin.footer.support')}
                  </a>
                </div>
              </>
            ) : (
              <div className="flex justify-center">
                <span title="SwiftFacture Admin v1.0.0" className="text-lg font-bold">
                  SF
                </span>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;