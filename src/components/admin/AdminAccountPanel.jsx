import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { profileService } from '../../services/profileService';
import { 
  User, 
  Key, 
  Shield,
  Globe,
  Camera,
  Save,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';

const AdminAccountPanel = () => {
  const { t } = useTranslation();
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Profile Settings
  const [profileSettings, setProfileSettings] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    title: '',
    bio: '',
    avatar: null,
    avatarPreview: null
  });

  // Password Settings
  const [passwordSettings, setPasswordSettings] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Account Preferences
  const [preferences, setPreferences] = useState({
    language: 'en',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    currency: 'USD',
    receiveEmailNotifications: true,
    receiveSystemAlerts: true,
    receiveDashboardDigest: true,
    digestFrequency: 'daily'
  });

  // Security Settings
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: false,
    lastPasswordChange: null,
    activeSessions: 1,
    loginHistory: []
  });

  useEffect(() => {
    // Load user data when component mounts
    const loadUserProfile = async () => {
      if (user) {
        setProfileSettings(prev => ({
          ...prev,
          firstName: user.user_metadata?.first_name || '',
          lastName: user.user_metadata?.last_name || '',
          email: user.email || '',
          phone: user.phone || '',
          title: user.user_metadata?.title || '',
          bio: user.user_metadata?.bio || ''
        }));

        // Load existing avatar
        try {
          const avatarUrl = await profileService.getUserAvatar();
          if (avatarUrl) {
            setProfileSettings(prev => ({
              ...prev,
              avatarPreview: avatarUrl
            }));
          }
        } catch (error) {
          console.error('Error loading avatar:', error);
        }
      }
    };

    loadUserProfile();
  }, [user]);

  const handleSaveProfile = async () => {
    setLoading(true);
    setSaveStatus(null);
    
    try {
      // Update profile using the profile service
      await profileService.updateUserProfile({
        firstName: profileSettings.firstName,
        lastName: profileSettings.lastName,
        companyName: profileSettings.title, // Using title as company name for now
        avatar: profileSettings.avatar
      });
      
      // Refresh user data to update avatar in navbar and other components
      await refreshUser();
      
      setSaveStatus({ type: 'success', message: t('admin.account.profileUpdateSuccess') });
      setTimeout(() => setSaveStatus(null), 3000);
      
      // Clear avatar file after successful upload but keep preview
      setProfileSettings(prev => ({ ...prev, avatar: null }));
    } catch (error) {
      console.error('Profile update error:', error);
      setSaveStatus({ type: 'error', message: t('admin.account.profileUpdateError') });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordSettings.newPassword !== passwordSettings.confirmPassword) {
      setSaveStatus({ type: 'error', message: t('admin.account.passwordMismatch') });
      return;
    }

    if (passwordSettings.newPassword.length < 8) {
      setSaveStatus({ type: 'error', message: t('admin.account.passwordTooShort') });
      return;
    }

    setLoading(true);
    setSaveStatus(null);
    
    try {
      // Simulate API call - replace with actual password change
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSaveStatus({ type: 'success', message: t('admin.account.passwordChangeSuccess') });
      setPasswordSettings({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error) {
      setSaveStatus({ type: 'error', message: t('admin.account.passwordChangeError') });
    } finally {
      setLoading(false);
    }
  };

  const handleSavePreferences = async () => {
    setLoading(true);
    setSaveStatus(null);
    
    try {
      // Simulate API call - replace with actual preferences update
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSaveStatus({ type: 'success', message: t('admin.account.preferencesUpdateSuccess') });
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error) {
      setSaveStatus({ type: 'error', message: t('admin.account.preferencesUpdateError') });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setSaveStatus({ type: 'error', message: t('admin.account.avatarTooLarge') });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileSettings(prev => ({
          ...prev,
          avatar: file,
          avatarPreview: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const InputGroup = ({ label, type = 'text', value, onChange, placeholder, required = false, description, disabled = false }) => (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {type === 'textarea' ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-800"
          rows={3}
        />
      ) : type === 'select' ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-800"
        >
          {placeholder && <option value="">{placeholder}</option>}
        </select>
      ) : type === 'checkbox' ? (
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={value}
            onChange={(e) => onChange(e.target.checked)}
            disabled={disabled}
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
          disabled={disabled}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-800"
        />
      )}
      {description && (
        <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
      )}
    </div>
  );

  const SettingsCard = ({ title, icon: Icon, children, onSave, showSave = true, saveButtonText }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Icon className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          </div>
          {showSave && onSave && (
            <button
              onClick={onSave}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>{saveButtonText || t('common.save')}</span>
            </button>
          )}
        </div>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('admin.account.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          {t('admin.account.subtitle')}
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

      {/* Profile Settings */}
      <SettingsCard
        title={t('admin.account.profile.title')}
        icon={User}
        onSave={handleSaveProfile}
        saveButtonText={t('admin.account.saveProfile')}
      >
        <div className="space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center space-x-6">
            <div className="relative">
              <div className="h-24 w-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                {profileSettings.avatarPreview ? (
                  <img 
                    src={profileSettings.avatarPreview} 
                    alt="Avatar preview" 
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User className="h-12 w-12 text-gray-400" />
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full cursor-pointer shadow-lg">
                <Camera className="h-4 w-4" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
            </div>
            <div>
              <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                {profileSettings.firstName} {profileSettings.lastName}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">{profileSettings.email}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                {t('admin.account.profile.avatarHint')}
              </p>
            </div>
          </div>

          {/* Profile Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputGroup
              label={t('admin.account.profile.firstName')}
              value={profileSettings.firstName}
              onChange={(value) => setProfileSettings(prev => ({ ...prev, firstName: value }))}
              placeholder="John"
              required
            />
            <InputGroup
              label={t('admin.account.profile.lastName')}
              value={profileSettings.lastName}
              onChange={(value) => setProfileSettings(prev => ({ ...prev, lastName: value }))}
              placeholder="Doe"
              required
            />
            <InputGroup
              label={t('admin.account.profile.email')}
              type="email"
              value={profileSettings.email}
              onChange={(value) => setProfileSettings(prev => ({ ...prev, email: value }))}
              placeholder="admin@swiftfacture.com"
              required
              disabled
              description={t('admin.account.profile.emailDisabled')}
            />
            <InputGroup
              label={t('admin.account.profile.phone')}
              type="tel"
              value={profileSettings.phone}
              onChange={(value) => setProfileSettings(prev => ({ ...prev, phone: value }))}
              placeholder="+1 (555) 123-4567"
            />
            <InputGroup
              label={t('admin.account.profile.jobTitle')}
              value={profileSettings.title}
              onChange={(value) => setProfileSettings(prev => ({ ...prev, title: value }))}
              placeholder="System Administrator"
            />
          </div>
          <InputGroup
            label={t('admin.account.profile.bio')}
            type="textarea"
            value={profileSettings.bio}
            onChange={(value) => setProfileSettings(prev => ({ ...prev, bio: value }))}
            placeholder={t('admin.account.profile.bioPlaceholder')}
          />
        </div>
      </SettingsCard>

      {/* Password Settings */}
      <SettingsCard
        title={t('admin.account.password.title')}
        icon={Key}
        onSave={handleChangePassword}
        saveButtonText={t('admin.account.savePassword')}
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div className="relative">
              <InputGroup
                label={t('admin.account.password.current')}
                type={showCurrentPassword ? 'text' : 'password'}
                value={passwordSettings.currentPassword}
                onChange={(value) => setPasswordSettings(prev => ({ ...prev, currentPassword: value }))}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
              >
                {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div className="relative">
              <InputGroup
                label={t('admin.account.password.new')}
                type={showNewPassword ? 'text' : 'password'}
                value={passwordSettings.newPassword}
                onChange={(value) => setPasswordSettings(prev => ({ ...prev, newPassword: value }))}
                placeholder="••••••••"
                required
                description={t('admin.account.password.requirements')}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
              >
                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div className="relative">
              <InputGroup
                label={t('admin.account.password.confirm')}
                type={showConfirmPassword ? 'text' : 'password'}
                value={passwordSettings.confirmPassword}
                onChange={(value) => setPasswordSettings(prev => ({ ...prev, confirmPassword: value }))}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        </div>
      </SettingsCard>

      {/* Preferences */}
      <SettingsCard
        title={t('admin.account.preferences.title')}
        icon={Globe}
        onSave={handleSavePreferences}
        saveButtonText={t('admin.account.savePreferences')}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputGroup
            label={t('admin.account.preferences.language')}
            type="select"
            value={preferences.language}
            onChange={(value) => setPreferences(prev => ({ ...prev, language: value }))}
          >
            <option value="en">English</option>
            <option value="fr">Français</option>
          </InputGroup>
          <InputGroup
            label={t('admin.account.preferences.timezone')}
            type="select"
            value={preferences.timezone}
            onChange={(value) => setPreferences(prev => ({ ...prev, timezone: value }))}
          >
            <option value="UTC">UTC</option>
            <option value="America/New_York">Eastern Time</option>
            <option value="America/Chicago">Central Time</option>
            <option value="America/Denver">Mountain Time</option>
            <option value="America/Los_Angeles">Pacific Time</option>
            <option value="Europe/London">London Time</option>
            <option value="Europe/Paris">Paris Time</option>
          </InputGroup>
          <InputGroup
            label={t('admin.account.preferences.dateFormat')}
            type="select"
            value={preferences.dateFormat}
            onChange={(value) => setPreferences(prev => ({ ...prev, dateFormat: value }))}
          >
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </InputGroup>
          <InputGroup
            label={t('admin.account.preferences.timeFormat')}
            type="select"
            value={preferences.timeFormat}
            onChange={(value) => setPreferences(prev => ({ ...prev, timeFormat: value }))}
          >
            <option value="12h">12 Hour</option>
            <option value="24h">24 Hour</option>
          </InputGroup>
          <InputGroup
            label={t('admin.account.preferences.currency')}
            type="select"
            value={preferences.currency}
            onChange={(value) => setPreferences(prev => ({ ...prev, currency: value }))}
          >
            <option value="USD">USD - US Dollar</option>
            <option value="EUR">EUR - Euro</option>
            <option value="GBP">GBP - British Pound</option>
            <option value="CAD">CAD - Canadian Dollar</option>
          </InputGroup>
          <InputGroup
            label={t('admin.account.preferences.digestFrequency')}
            type="select"
            value={preferences.digestFrequency}
            onChange={(value) => setPreferences(prev => ({ ...prev, digestFrequency: value }))}
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
            value={preferences.receiveEmailNotifications}
            onChange={(value) => setPreferences(prev => ({ ...prev, receiveEmailNotifications: value }))}
            placeholder={t('admin.account.preferences.receiveEmailNotifications')}
          />
          <InputGroup
            type="checkbox"
            value={preferences.receiveSystemAlerts}
            onChange={(value) => setPreferences(prev => ({ ...prev, receiveSystemAlerts: value }))}
            placeholder={t('admin.account.preferences.receiveSystemAlerts')}
          />
          <InputGroup
            type="checkbox"
            value={preferences.receiveDashboardDigest}
            onChange={(value) => setPreferences(prev => ({ ...prev, receiveDashboardDigest: value }))}
            placeholder={t('admin.account.preferences.receiveDashboardDigest')}
          />
        </div>
      </SettingsCard>

      {/* Security Overview */}
      <SettingsCard
        title={t('admin.account.security.title')}
        icon={Shield}
        showSave={false}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('admin.account.security.twoFactor')}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {securitySettings.twoFactorEnabled ? t('admin.account.security.twoFactorEnabled') : t('admin.account.security.twoFactorDisabled')}
              </p>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                {securitySettings.twoFactorEnabled ? t('admin.account.security.disable') : t('admin.account.security.enable')}
              </button>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('admin.account.security.activeSessions')}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('admin.account.security.activeSessionsCount', { count: securitySettings.activeSessions })}
              </p>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                {t('admin.account.security.manageSessions')}
              </button>
            </div>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('admin.account.security.lastPasswordChange')}
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {securitySettings.lastPasswordChange || t('admin.account.security.never')}
            </p>
          </div>
        </div>
      </SettingsCard>
    </div>
  );
};

export default AdminAccountPanel;