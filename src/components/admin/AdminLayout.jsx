import { useState } from 'react';
import AdminTopNavigation from './AdminTopNavigation';
import AdminSidebar from './AdminSidebar';

const AdminLayout = ({ children, activePage, onPageChange }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleSidebarCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
    // If we're collapsing, make sure it's open
    if (!sidebarCollapsed && !sidebarOpen) {
      setSidebarOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Top Navigation */}
      <AdminTopNavigation 
        onToggleSidebar={toggleSidebar}
        onToggleCollapse={toggleSidebarCollapse}
        sidebarCollapsed={sidebarCollapsed}
      />

      <div className="flex">
        {/* Sidebar */}
        <AdminSidebar 
          isOpen={sidebarOpen}
          isCollapsed={sidebarCollapsed}
          activePage={activePage}
          onPageChange={onPageChange}
          onClose={() => setSidebarOpen(false)}
          onToggleCollapse={toggleSidebarCollapse}
        />

        {/* Main Content */}
        <div className={`flex-1 transition-all duration-300 ${
          sidebarOpen 
            ? sidebarCollapsed 
              ? 'lg:ml-16' 
              : 'lg:ml-64' 
            : 'ml-0'
        }`}>
          <main className="p-4 sm:p-6 pt-24 min-h-screen">
            <div className="space-y-6">
              {children}
            </div>
          </main>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminLayout;