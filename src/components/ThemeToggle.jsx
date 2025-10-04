import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTranslation } from 'react-i18next';

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation('common');

  const themeOptions = [
    { value: 'light', label: t('settings.theme.light', 'Light'), icon: Sun },
    { value: 'dark', label: t('settings.theme.dark', 'Dark'), icon: Moon },
    { value: 'system', label: t('settings.theme.system', 'System'), icon: Monitor }
  ];

  const currentThemeOption = themeOptions.find(option => option.value === theme) || themeOptions[0];
  const CurrentIcon = currentThemeOption.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 px-0">
          <CurrentIcon className="h-4 w-4" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {themeOptions.map((option) => {
          const Icon = option.icon;
          return (
            <DropdownMenuItem
              key={option.value}
              onClick={() => setTheme(option.value)}
              className="cursor-pointer"
            >
              <Icon className="mr-2 h-4 w-4" />
              <span>{option.label}</span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ThemeToggle;