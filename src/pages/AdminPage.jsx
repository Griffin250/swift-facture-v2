import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import AdminLayout from '../components/admin/AdminLayout';
import AdminDashboardPanel from '../components/admin/panels/AdminDashboardPanel';
import AdminUsersPanel from '../components/admin/panels/AdminUsersPanel';
import AdminOrganizationsPanel from '../components/admin/panels/AdminOrganizationsPanel';
import AdminSettingsPanel from '../components/admin/panels/AdminSettingsPanel';
import AdminAccountPanel from '../components/admin/panels/AdminAccountPanel';

// Placeholder components for other panels
const AdminSubscriptionsPanel = () => {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        {t('admin.subscriptions.title')}
      </h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-8">
        <p className="text-gray-500 dark:text-gray-400 text-center">
          {t('admin.subscriptions.placeholder')}
        </p>
      </div>
    </div>
  );
};

const AdminDocumentsPanel = () => {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        {t('admin.documents.title')}
      </h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-8">
        <p className="text-gray-500 dark:text-gray-400 text-center">
          {t('admin.documents.placeholder')}
        </p>
      </div>
    </div>
  );
};

const AdminClientsPanel = () => {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        {t('admin.clients.title')}
      </h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-8">
        <p className="text-gray-500 dark:text-gray-400 text-center">
          {t('admin.clients.placeholder')}
        </p>
      </div>
    </div>
  );
};

const AdminSupportPanel = () => {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        {t('admin.support.title')}
      </h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-8">
        <p className="text-gray-500 dark:text-gray-400 text-center">
          {t('admin.support.placeholder')}
        </p>
      </div>
    </div>
  );
};

const AdminMonitoringPanel = () => {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        {t('admin.monitoring.title')}
      </h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-8">
        <p className="text-gray-500 dark:text-gray-400 text-center">
          {t('admin.monitoring.placeholder')}
        </p>
      </div>
    </div>
  );
};

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
        return <AdminSubscriptionsPanel />;
      case 'documents':
        return <AdminDocumentsPanel />;
      case 'clients':
        return <AdminClientsPanel />;
      case 'support':
        return <AdminSupportPanel />;
      case 'monitoring':
        return <AdminMonitoringPanel />;
      case 'settings':
        return <AdminSettingsPanel />;
      case 'account':
        return <AdminAccountPanel />;
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