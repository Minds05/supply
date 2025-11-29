
import React, { createContext, useState, useEffect, ReactNode } from 'react';

interface SettingsState {
  sensitivity: string;
  timeout: string;
  notifications: boolean;
  autoRemove: boolean;
}

interface SettingsContextType extends SettingsState {
  updateSettings: (newSettings: Partial<SettingsState>) => void;
}

const defaultSettings: SettingsState = {
  sensitivity: 'standard',
  timeout: '30s',
  notifications: true,
  autoRemove: false,
};

export const SettingsContext = createContext<SettingsContextType>({
  ...defaultSettings,
  updateSettings: () => {},
});

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SettingsState>(() => {
    try {
      const saved = localStorage.getItem('sentinel_settings');
      return saved ? JSON.parse(saved) : defaultSettings;
    } catch (e) {
      return defaultSettings;
    }
  });

  useEffect(() => {
    localStorage.setItem('sentinel_settings', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (newSettings: Partial<SettingsState>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  return (
    <SettingsContext.Provider value={{ ...settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};