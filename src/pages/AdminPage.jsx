import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import AdminLayout from '../components/admin/AdminLayout';
import AdminDashboardPanel from '../components/admin/panels/AdminDashboardPanel';
import AdminUsersPanel from '../components/admin/panels/AdminUsersPanel';
import AdminOrganizationsPanel from '../components/admin/panels/AdminOrganizationsPanel';
import AdminSettingsPanel from '../components/admin/panels/AdminSettingsPanel';
import AdminAccountPanel from '../components/admin/AdminAccountPanel';
import AdminDatabasePanel from '../components/admin/panels/AdminDatabasePanel';
import AdminTrialPanel from '../components/admin/panels/AdminTrialPanel';
import AdminClientsManagementPanel from '../components/admin/panels/AdminClientsManagementPanel';
import AdminDocumentsPanel from '../components/admin/panels/AdminDocumentsPanel';
import SupportPage from '../components/admin/SupportPage';
import MonitoringPage from '../components/admin/MonitoringPage';

// Placeholder components for other panels




const AdminPage = () => {
  const [activePage, setActivePage] = useState('dashboard');

  const renderContent = () => {
    switch (activePage) {
      case 'dashboard':
        return <AdminDashboardPanel />;
      case 'users':
        return <AdminUsersPanel />;
      case 'organizations':
        return <AdminOrganizationsPanel />;
      case 'subscriptions':
        return <AdminTrialPanel />;
      case 'documents':
        return <AdminDocumentsPanel />;
      case 'clients':
        return <AdminClientsManagementPanel />;
      case 'support':
        return <SupportPage />;
      case 'monitoring':
        return <MonitoringPage />;
      case 'settings':
        return <AdminSettingsPanel />;
      case 'account':
        return <AdminAccountPanel />;
      case 'database':
        return <AdminDatabasePanel />;
      default:
        return <AdminDashboardPanel />;
    }
  };

  return (
    <AdminLayout activePage={activePage} onPageChange={setActivePage}>
      {renderContent()}
    </AdminLayout>
  );
};

export default AdminPage;