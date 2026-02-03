/**
 * Toast Context
 * Global toast notification management
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Toast, ToastType } from '../components/common/Toast';

interface ToastConfig {
  message: string;
  type?: ToastType;
  duration?: number;
  position?: 'top' | 'bottom';
}

interface ToastContextType {
  showToast: (config: ToastConfig) => void;
  showSuccess: (message: string, duration?: number) => void;
  showError: (message: string, duration?: number) => void;
  showInfo: (message: string, duration?: number) => void;
  showWarning: (message: string, duration?: number) => void;
  hideToast: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toastConfig, setToastConfig] = useState<ToastConfig & { visible: boolean }>({
    visible: false,
    message: '',
    type: 'info',
    duration: 3000,
    position: 'top',
  });

  const showToast = useCallback((config: ToastConfig) => {
    setToastConfig({
      visible: true,
      message: config.message,
      type: config.type || 'info',
      duration: config.duration ?? 3000,
      position: config.position || 'top',
    });
  }, []);

  const showSuccess = useCallback((message: string, duration = 3000) => {
    showToast({ message, type: 'success', duration });
  }, [showToast]);

  const showError = useCallback((message: string, duration = 4000) => {
    showToast({ message, type: 'error', duration });
  }, [showToast]);

  const showInfo = useCallback((message: string, duration = 3000) => {
    showToast({ message, type: 'info', duration });
  }, [showToast]);

  const showWarning = useCallback((message: string, duration = 3500) => {
    showToast({ message, type: 'warning', duration });
  }, [showToast]);

  const hideToast = useCallback(() => {
    setToastConfig((prev) => ({ ...prev, visible: false }));
  }, []);

  return (
    <ToastContext.Provider
      value={{
        showToast,
        showSuccess,
        showError,
        showInfo,
        showWarning,
        hideToast,
      }}
    >
      {children}
      <Toast
        visible={toastConfig.visible}
        message={toastConfig.message}
        type={toastConfig.type}
        duration={toastConfig.duration}
        position={toastConfig.position}
        onHide={hideToast}
      />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
