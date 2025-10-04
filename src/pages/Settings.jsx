import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  Monitor,
  Sun,
  Moon,
  Globe,
  Bell,
  Download,
  Upload,
  Palette,
  Settings as SettingsIcon,
  Save,
  RotateCcw,
  Shield,
  Database,
  Currency,
  Calendar,
  Hash
} from 'lucide-react';

const Settings = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  
  // Theme functionality disabled - coming soon

  // Settings state
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: false,
      invoiceReminders: true,
      paymentAlerts: true
    },
    preferences: {
      currency: 'USD',
      dateFormat: 'MM/DD/YYYY',
      numberFormat: 'US',
      invoicePrefix: 'INV',
      autoSave: true,
      compactMode: false
    },
    privacy: {
      analytics: true,
      crashReports: true,
      dataSharing: false
    }
  });

  const [hasChanges, setHasChanges] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('swiftfacture-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    }
  }, []);

  // Save settings to localStorage
  const saveSettings = useCallback(() => {
    try {
      localStorage.setItem('swiftfacture-settings', JSON.stringify(settings));
      setHasChanges(false);
      toast.success(t('settings.saved'));
    } catch (error) {
      toast.error(t('settings.saveError'));
      console.error('Error saving settings:', error);
    }
  }, [settings, t]);

  // Reset settings to defaults
  const resetSettings = useCallback(() => {
    const defaultSettings = {
      notifications: {
        email: true,
        push: false,
        invoiceReminders: true,
        paymentAlerts: true
      },
      preferences: {
        currency: 'USD',
        dateFormat: 'MM/DD/YYYY',
        numberFormat: 'US',
        invoicePrefix: 'INV',
        autoSave: true,
        compactMode: false
      },
      privacy: {
        analytics: true,
        crashReports: true,
        dataSharing: false
      }
    };
    setSettings(defaultSettings);
    setHasChanges(true);
    toast.success(t('settings.reset'));
  }, [t]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Ctrl/Cmd + S to save
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        if (hasChanges) {
          saveSettings();
        }
      }
      // Ctrl/Cmd + R to reset (with confirmation)
      if ((event.ctrlKey || event.metaKey) && event.key === 'r') {
        event.preventDefault();
        if (confirm(t('settings.confirmReset', 'Are you sure you want to reset all settings?'))) {
          resetSettings();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [hasChanges, t, resetSettings, saveSettings]);

  // Update setting helper
  const updateSetting = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
    setHasChanges(true);
  };

  // Theme options
  const themeOptions = [
    { value: 'light', label: t('settings.theme.light'), icon: Sun },
    { value: 'dark', label: t('settings.theme.dark'), icon: Moon },
    { value: 'system', label: t('settings.theme.system'), icon: Monitor }
  ];

  // Currency options
  const currencyOptions = [
    { value: 'USD', label: 'USD ($)', symbol: '$' },
    { value: 'EUR', label: 'EUR (€)', symbol: '€' },
    { value: 'GBP', label: 'GBP (£)', symbol: '£' },
    { value: 'CAD', label: 'CAD ($)', symbol: 'C$' },
    { value: 'JPY', label: 'JPY (¥)', symbol: '¥' },
  ];

  // Date format options
  const dateFormatOptions = [
    { value: 'MM/DD/YYYY', label: '12/31/2024 (US)' },
    { value: 'DD/MM/YYYY', label: '31/12/2024 (EU)' },
    { value: 'YYYY-MM-DD', label: '2024-12-31 (ISO)' },
    { value: 'DD MMM YYYY', label: '31 Dec 2024' }
  ];

  // Export data
  const exportData = () => {
    try {
      const data = {
        settings,
        language: i18n.language,
        exportDate: new Date().toISOString(),
        version: '1.0'
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `swiftfacture-settings-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success(t('settings.exportSuccess'));
    } catch (error) {
      toast.error(t('settings.exportError'));
      console.error('Export error:', error);
    }
  };

  // Import data
  const importData = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        
        if (imported.settings) {
          setSettings(imported.settings);
        }
        // Theme import disabled - coming soon
        if (imported.language) {
          i18n.changeLanguage(imported.language);
        }
        
        setHasChanges(true);
        toast.success(t('settings.importSuccess'));
      } catch (error) {
        toast.error(t('settings.importError'));
        console.error('Import error:', error);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-primary to-secondary rounded-xl shadow-lg">
              <SettingsIcon className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold gradient-text">{t('settings.title')}</h1>
          </div>
          <p className="text-muted-foreground text-lg">{t('settings.description')}</p>
        </div>

        {/* Save Changes Alert */}
        {hasChanges && (
          <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
            <Save className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800 dark:text-amber-200">
              {t('settings.unsavedChanges')}
              <Button 
                onClick={saveSettings} 
                className="ml-2 h-6 px-3 text-xs"
                variant="outline"
              >
                {t('settings.save')}
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Appearance Settings */}
          <Card className="card-modern">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                {t('settings.appearance.title')}
              </CardTitle>
              <CardDescription>{t('settings.appearance.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Theme Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">{t('settings.theme.title', 'Theme')}</Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {themeOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <Button
                        key={option.value}
                        variant="outline"
                        size="sm"
                        className="h-auto p-3 flex flex-col gap-2 transition-all duration-200 opacity-50 cursor-not-allowed"
                        disabled
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-xs font-medium">{option.label}</span>
                      </Button>
                    );
                  })}
                </div>
                <div className="text-xs text-gray-600 flex items-center gap-2">
                  <Badge variant="outline" className="text-orange-600 border-orange-300">
                    Coming Soon
                  </Badge>
                  <span>Theme selection will be available in a future update</span>
                </div>
              </div>

              <Separator />

              {/* Language Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  {t('settings.language.title')}
                </Label>
                <Select 
                  value={i18n.language} 
                  onValueChange={(value) => i18n.changeLanguage(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('settings.language.select')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Compact Mode */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">{t('settings.preferences.compactMode')}</Label>
                  <p className="text-xs text-muted-foreground">{t('settings.preferences.compactModeDesc')}</p>
                </div>
                <Switch
                  checked={settings.preferences.compactMode}
                  onCheckedChange={(checked) => updateSetting('preferences', 'compactMode', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="card-modern">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                {t('settings.notifications.title')}
              </CardTitle>
              <CardDescription>{t('settings.notifications.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">{t('settings.notifications.email')}</Label>
                  <p className="text-xs text-muted-foreground">{t('settings.notifications.emailDesc')}</p>
                </div>
                <Switch
                  checked={settings.notifications.email}
                  onCheckedChange={(checked) => updateSetting('notifications', 'email', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">{t('settings.notifications.invoiceReminders')}</Label>
                  <p className="text-xs text-muted-foreground">{t('settings.notifications.invoiceRemindersDesc')}</p>
                </div>
                <Switch
                  checked={settings.notifications.invoiceReminders}
                  onCheckedChange={(checked) => updateSetting('notifications', 'invoiceReminders', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">{t('settings.notifications.paymentAlerts')}</Label>
                  <p className="text-xs text-muted-foreground">{t('settings.notifications.paymentAlertsDesc')}</p>
                </div>
                <Switch
                  checked={settings.notifications.paymentAlerts}
                  onCheckedChange={(checked) => updateSetting('notifications', 'paymentAlerts', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Business Preferences */}
          <Card className="card-modern">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Currency className="w-5 h-5" />
                {t('settings.business.title')}
              </CardTitle>
              <CardDescription>{t('settings.business.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Currency */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">{t('settings.business.currency')}</Label>
                <Select 
                  value={settings.preferences.currency} 
                  onValueChange={(value) => updateSetting('preferences', 'currency', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencyOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date Format */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {t('settings.business.dateFormat')}
                </Label>
                <Select 
                  value={settings.preferences.dateFormat} 
                  onValueChange={(value) => updateSetting('preferences', 'dateFormat', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {dateFormatOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Invoice Prefix */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Hash className="w-4 h-4" />
                  {t('settings.business.invoicePrefix')}
                </Label>
                <Input
                  value={settings.preferences.invoicePrefix}
                  onChange={(e) => updateSetting('preferences', 'invoicePrefix', e.target.value)}
                  placeholder="INV"
                  className="w-full"
                />
              </div>

              {/* Auto Save */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">{t('settings.business.autoSave')}</Label>
                  <p className="text-xs text-muted-foreground">{t('settings.business.autoSaveDesc')}</p>
                </div>
                <Switch
                  checked={settings.preferences.autoSave}
                  onCheckedChange={(checked) => updateSetting('preferences', 'autoSave', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card className="card-modern">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                {t('settings.data.title')}
              </CardTitle>
              <CardDescription>{t('settings.data.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Export Data */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">{t('settings.data.export')}</Label>
                <Button 
                  onClick={exportData}
                  variant="outline" 
                  className="w-full justify-start"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {t('settings.data.exportButton')}
                </Button>
              </div>

              {/* Import Data */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">{t('settings.data.import')}</Label>
                <div className="relative">
                  <input
                    type="file"
                    accept=".json"
                    onChange={importData}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Button variant="outline" className="w-full justify-start">
                    <Upload className="w-4 h-4 mr-2" />
                    {t('settings.data.importButton')}
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Privacy Settings */}
              <div className="space-y-4">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  {t('settings.privacy.title')}
                </Label>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">{t('settings.privacy.analytics')}</Label>
                    <p className="text-xs text-muted-foreground">{t('settings.privacy.analyticsDesc')}</p>
                  </div>
                  <Switch
                    checked={settings.privacy.analytics}
                    onCheckedChange={(checked) => updateSetting('privacy', 'analytics', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">{t('settings.privacy.crashReports')}</Label>
                    <p className="text-xs text-muted-foreground">{t('settings.privacy.crashReportsDesc')}</p>
                  </div>
                  <Switch
                    checked={settings.privacy.crashReports}
                    onCheckedChange={(checked) => updateSetting('privacy', 'crashReports', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6">
          <Button 
            onClick={saveSettings} 
            className="flex-1 btn-primary"
            disabled={!hasChanges}
            aria-describedby={hasChanges ? "unsaved-changes" : undefined}
          >
            <Save className="w-4 h-4 mr-2" />
            {t('settings.save')}
          </Button>
          
          <Button 
            onClick={resetSettings} 
            variant="outline" 
            className="flex-1"
            title={t('settings.resetTooltip', 'Reset all settings to their default values')}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            {t('settings.reset')}
          </Button>
        </div>

        {/* Footer Info */}
        {user && (
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <div className="text-center text-sm text-muted-foreground">
                <p>{t('settings.userInfo', { email: user.email })}</p>
                <p>{t('settings.lastLogin', { date: new Date().toLocaleDateString() })}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Settings;