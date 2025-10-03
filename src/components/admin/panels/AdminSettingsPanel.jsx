import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Settings, 
  Mail, 
  Globe, 
  Shield, 
  Database,
  Bell,
  Palette,
  Key,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';

const AdminSettingsPanel = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  
  // Platform Settings
  const [platformSettings, setPlatformSettings] = useState({
    siteName: 'SwiftFacture',
    siteDescription: 'Professional Invoice & Receipt Generator',
    allowRegistration: true,
    requireEmailVerification: true,
    maintenanceMode: false,
    maxUsersPerAccount: 5,
    defaultCurrency: 'USD',
    defaultLanguage: 'en',
    timezone: 'UTC'
  });

  // Email Settings
  const [emailSettings, setEmailSettings] = useState({
    smtpHost: '',
    smtpPort: 587,
    smtpUsername: '',
    smtpPassword: '',
    fromEmail: 'noreply@swiftfacture.com',
    fromName: 'SwiftFacture',
    enableEmailNotifications: true,
    welcomeEmailEnabled: true,
    invoiceEmailEnabled: true
  });

  // Security Settings
  const [securitySettings, setSecuritySettings] = useState({
    passwordMinLength: 8,
    requireSpecialChars: true,
    requireNumbers: true,
    sessionTimeout: 24,
    maxLoginAttempts: 5,
    enableTwoFactor: false,
    allowPasswordReset: true
  });

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    enableSystemNotifications: true,
    enableUserActivityLogs: true,
    enableErrorReporting: true,
    notifyAdminOnNewUser: true,
    notifyAdminOnErrors: true,
    emailDigestFrequency: 'daily'
  });

  const handleSaveSettings = async (settingsType, settings) => {
    setLoading(true);
    setSaveStatus(null);
    
    try {
      // Simulate API call - replace with actual admin service call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSaveStatus({ type: 'success', message: t('admin.settings.saveSuccess') });
      
      // Auto-clear success message after 3 seconds
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error) {
      setSaveStatus({ type: 'error', message: t('admin.settings.saveError') });
    } finally {
      setLoading(false);
    }
  };

  const SettingsCard = ({ title, icon: Icon, children, onSave, settings }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Icon className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          </div>
          <button
            onClick={() => onSave(settings)}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span>{t('common.save')}</span>
          </button>
        </div>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );

  const InputGroup = ({ label, type = 'text', value, onChange, placeholder, required = false, description }) => (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {type === 'textarea' ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={3}
        />
      ) : type === 'select' ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {placeholder && <option value="">{placeholder}</option>}
        </select>
      ) : type === 'checkbox' ? (
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={value}
            onChange={(e) => onChange(e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">{placeholder}</span>
        </label>
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      )}
      {description && (
        <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('admin.settings.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          {t('admin.settings.subtitle')}
        </p>
      </div>

      {/* Save Status */}
      {saveStatus && (
        <div className={`p-4 rounded-lg flex items-center space-x-2 ${
          saveStatus.type === 'success' 
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
        }`}>
          {saveStatus.type === 'success' ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-500" />
          )}
          <span className={`text-sm ${
            saveStatus.type === 'success' ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'
          }`}>
            {saveStatus.message}
          </span>
        </div>
      )}

      {/* Platform Settings */}
      <SettingsCard
        title={t('admin.settings.platform.title')}
        icon={Globe}
        onSave={(settings) => handleSaveSettings('platform', settings)}
        settings={platformSettings}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputGroup
            label={t('admin.settings.platform.siteName')}
            value={platformSettings.siteName}
            onChange={(value) => setPlatformSettings(prev => ({ ...prev, siteName: value }))}
            placeholder="SwiftFacture"
            required
          />
          <InputGroup
            label={t('admin.settings.platform.defaultCurrency')}
            type="select"
            value={platformSettings.defaultCurrency}
            onChange={(value) => setPlatformSettings(prev => ({ ...prev, defaultCurrency: value }))}
          >
            <option value="USD">USD - US Dollar</option>
            <option value="EUR">EUR - Euro</option>
            <option value="GBP">GBP - British Pound</option>
            <option value="CAD">CAD - Canadian Dollar</option>
          </InputGroup>
          <InputGroup
            label={t('admin.settings.platform.siteDescription')}
            type="textarea"
            value={platformSettings.siteDescription}
            onChange={(value) => setPlatformSettings(prev => ({ ...prev, siteDescription: value }))}
            placeholder="Professional Invoice & Receipt Generator"
          />
          <InputGroup
            label={t('admin.settings.platform.defaultLanguage')}
            type="select"
            value={platformSettings.defaultLanguage}
            onChange={(value) => setPlatformSettings(prev => ({ ...prev, defaultLanguage: value }))}
          >
            <option value="en">English</option>
            <option value="fr">Français</option>
          </InputGroup>
          <InputGroup
            label={t('admin.settings.platform.maxUsersPerAccount')}
            type="number"
            value={platformSettings.maxUsersPerAccount}
            onChange={(value) => setPlatformSettings(prev => ({ ...prev, maxUsersPerAccount: parseInt(value) }))}
            placeholder="5"
          />
          <InputGroup
            label={t('admin.settings.platform.timezone')}
            type="select"
            value={platformSettings.timezone}
            onChange={(value) => setPlatformSettings(prev => ({ ...prev, timezone: value }))}
          >
            <option value="UTC">UTC</option>
            <option value="America/New_York">Eastern Time</option>
            <option value="America/Chicago">Central Time</option>
            <option value="America/Denver">Mountain Time</option>
            <option value="America/Los_Angeles">Pacific Time</option>
            <option value="Europe/London">London Time</option>
            <option value="Europe/Paris">Paris Time</option>
          </InputGroup>
        </div>
        <div className="mt-6 space-y-4">
          <InputGroup
            type="checkbox"
            value={platformSettings.allowRegistration}
            onChange={(value) => setPlatformSettings(prev => ({ ...prev, allowRegistration: value }))}
            placeholder={t('admin.settings.platform.allowRegistration')}
          />
          <InputGroup
            type="checkbox"
            value={platformSettings.requireEmailVerification}
            onChange={(value) => setPlatformSettings(prev => ({ ...prev, requireEmailVerification: value }))}
            placeholder={t('admin.settings.platform.requireEmailVerification')}
          />
          <InputGroup
            type="checkbox"
            value={platformSettings.maintenanceMode}
            onChange={(value) => setPlatformSettings(prev => ({ ...prev, maintenanceMode: value }))}
            placeholder={t('admin.settings.platform.maintenanceMode')}
          />
        </div>
      </SettingsCard>

      {/* Email Settings */}
      <SettingsCard
        title={t('admin.settings.email.title')}
        icon={Mail}
        onSave={(settings) => handleSaveSettings('email', settings)}
        settings={emailSettings}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputGroup
            label={t('admin.settings.email.smtpHost')}
            value={emailSettings.smtpHost}
            onChange={(value) => setEmailSettings(prev => ({ ...prev, smtpHost: value }))}
            placeholder="smtp.gmail.com"
          />
          <InputGroup
            label={t('admin.settings.email.smtpPort')}
            type="number"
            value={emailSettings.smtpPort}
            onChange={(value) => setEmailSettings(prev => ({ ...prev, smtpPort: parseInt(value) }))}
            placeholder="587"
          />
          <InputGroup
            label={t('admin.settings.email.smtpUsername')}
            value={emailSettings.smtpUsername}
            onChange={(value) => setEmailSettings(prev => ({ ...prev, smtpUsername: value }))}
            placeholder="your-email@gmail.com"
          />
          <InputGroup
            label={t('admin.settings.email.smtpPassword')}
            type="password"
            value={emailSettings.smtpPassword}
            onChange={(value) => setEmailSettings(prev => ({ ...prev, smtpPassword: value }))}
            placeholder="••••••••"
          />
          <InputGroup
            label={t('admin.settings.email.fromEmail')}
            type="email"
            value={emailSettings.fromEmail}
            onChange={(value) => setEmailSettings(prev => ({ ...prev, fromEmail: value }))}
            placeholder="noreply@swiftfacture.com"
          />
          <InputGroup
            label={t('admin.settings.email.fromName')}
            value={emailSettings.fromName}
            onChange={(value) => setEmailSettings(prev => ({ ...prev, fromName: value }))}
            placeholder="SwiftFacture"
          />
        </div>
        <div className="mt-6 space-y-4">
          <InputGroup
            type="checkbox"
            value={emailSettings.enableEmailNotifications}
            onChange={(value) => setEmailSettings(prev => ({ ...prev, enableEmailNotifications: value }))}
            placeholder={t('admin.settings.email.enableEmailNotifications')}
          />
          <InputGroup
            type="checkbox"
            value={emailSettings.welcomeEmailEnabled}
            onChange={(value) => setEmailSettings(prev => ({ ...prev, welcomeEmailEnabled: value }))}
            placeholder={t('admin.settings.email.welcomeEmailEnabled')}
          />
          <InputGroup
            type="checkbox"
            value={emailSettings.invoiceEmailEnabled}
            onChange={(value) => setEmailSettings(prev => ({ ...prev, invoiceEmailEnabled: value }))}
            placeholder={t('admin.settings.email.invoiceEmailEnabled')}
          />
        </div>
      </SettingsCard>

      {/* Security Settings */}
      <SettingsCard
        title={t('admin.settings.security.title')}
        icon={Shield}
        onSave={(settings) => handleSaveSettings('security', settings)}
        settings={securitySettings}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputGroup
            label={t('admin.settings.security.passwordMinLength')}
            type="number"
            value={securitySettings.passwordMinLength}
            onChange={(value) => setSecuritySettings(prev => ({ ...prev, passwordMinLength: parseInt(value) }))}
            placeholder="8"
          />
          <InputGroup
            label={t('admin.settings.security.sessionTimeout')}
            type="number"
            value={securitySettings.sessionTimeout}
            onChange={(value) => setSecuritySettings(prev => ({ ...prev, sessionTimeout: parseInt(value) }))}
            placeholder="24"
            description={t('admin.settings.security.sessionTimeoutDesc')}
          />
          <InputGroup
            label={t('admin.settings.security.maxLoginAttempts')}
            type="number"
            value={securitySettings.maxLoginAttempts}
            onChange={(value) => setSecuritySettings(prev => ({ ...prev, maxLoginAttempts: parseInt(value) }))}
            placeholder="5"
          />
        </div>
        <div className="mt-6 space-y-4">
          <InputGroup
            type="checkbox"
            value={securitySettings.requireSpecialChars}
            onChange={(value) => setSecuritySettings(prev => ({ ...prev, requireSpecialChars: value }))}
            placeholder={t('admin.settings.security.requireSpecialChars')}
          />
          <InputGroup
            type="checkbox"
            value={securitySettings.requireNumbers}
            onChange={(value) => setSecuritySettings(prev => ({ ...prev, requireNumbers: value }))}
            placeholder={t('admin.settings.security.requireNumbers')}
          />
          <InputGroup
            type="checkbox"
            value={securitySettings.enableTwoFactor}
            onChange={(value) => setSecuritySettings(prev => ({ ...prev, enableTwoFactor: value }))}
            placeholder={t('admin.settings.security.enableTwoFactor')}
          />
          <InputGroup
            type="checkbox"
            value={securitySettings.allowPasswordReset}
            onChange={(value) => setSecuritySettings(prev => ({ ...prev, allowPasswordReset: value }))}
            placeholder={t('admin.settings.security.allowPasswordReset')}
          />
        </div>
      </SettingsCard>

      {/* Notification Settings */}
      <SettingsCard
        title={t('admin.settings.notifications.title')}
        icon={Bell}
        onSave={(settings) => handleSaveSettings('notifications', settings)}
        settings={notificationSettings}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputGroup
            label={t('admin.settings.notifications.emailDigestFrequency')}
            type="select"
            value={notificationSettings.emailDigestFrequency}
            onChange={(value) => setNotificationSettings(prev => ({ ...prev, emailDigestFrequency: value }))}
          >
            <option value="never">Never</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </InputGroup>
        </div>
        <div className="mt-6 space-y-4">
          <InputGroup
            type="checkbox"
            value={notificationSettings.enableSystemNotifications}
            onChange={(value) => setNotificationSettings(prev => ({ ...prev, enableSystemNotifications: value }))}
            placeholder={t('admin.settings.notifications.enableSystemNotifications')}
          />
          <InputGroup
            type="checkbox"
            value={notificationSettings.enableUserActivityLogs}
            onChange={(value) => setNotificationSettings(prev => ({ ...prev, enableUserActivityLogs: value }))}
            placeholder={t('admin.settings.notifications.enableUserActivityLogs')}
          />
          <InputGroup
            type="checkbox"
            value={notificationSettings.enableErrorReporting}
            onChange={(value) => setNotificationSettings(prev => ({ ...prev, enableErrorReporting: value }))}
            placeholder={t('admin.settings.notifications.enableErrorReporting')}
          />
          <InputGroup
            type="checkbox"
            value={notificationSettings.notifyAdminOnNewUser}
            onChange={(value) => setNotificationSettings(prev => ({ ...prev, notifyAdminOnNewUser: value }))}
            placeholder={t('admin.settings.notifications.notifyAdminOnNewUser')}
          />
          <InputGroup
            type="checkbox"
            value={notificationSettings.notifyAdminOnErrors}
            onChange={(value) => setNotificationSettings(prev => ({ ...prev, notifyAdminOnErrors: value }))}
            placeholder={t('admin.settings.notifications.notifyAdminOnErrors')}
          />
        </div>
      </SettingsCard>
    </div>
  );
};

export default AdminSettingsPanel;