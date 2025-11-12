/**
 * usePremium Hook
 * Handles premium model toggle and password verification
 */

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import { StorageKeys, getStorageBoolean, setStorageBoolean } from '@/lib/storage';

// Premium password from environment variable
const PREMIUM_PASSWORD = import.meta.env.VITE_PREMIUM_PASSWORD || 'power';

export const usePremium = () => {
  const [usePremiumModel, setUsePremiumModel] = useState(false);
  const [isPremiumUnlocked, setIsPremiumUnlocked] = useState(false);
  const [showPremiumDialog, setShowPremiumDialog] = useState(false);
  const [premiumPassword, setPremiumPassword] = useState('');

  // Check if premium is unlocked on mount
  useEffect(() => {
    const unlocked = getStorageBoolean(StorageKeys.PREMIUM_UNLOCKED);
    setIsPremiumUnlocked(unlocked);

    if (unlocked) {
      logger.debug('Premium mode unlocked');
    }
  }, []);

  const handlePremiumToggle = (checked: boolean) => {
    if (checked) {
      // If checking and not unlocked - show dialog
      if (!isPremiumUnlocked) {
        setShowPremiumDialog(true);
        return;
      }
      setUsePremiumModel(true);
      logger.info('Premium mode enabled');
    } else {
      setUsePremiumModel(false);
      logger.info('Premium mode disabled');
    }
  };

  const handlePremiumPassword = (password: string) => {
    if (password === PREMIUM_PASSWORD) {
      setStorageBoolean(StorageKeys.PREMIUM_UNLOCKED, true);
      setIsPremiumUnlocked(true);
      setUsePremiumModel(true);
      setShowPremiumDialog(false);
      setPremiumPassword('');
      toast.success('Tryb Premium odblokowany!');
      logger.info('Premium unlocked successfully');
    } else {
      toast.error('Nieprawidłowe hasło');
      setPremiumPassword('');
      logger.warn('Invalid premium password attempt');
    }
  };

  const closePremiumDialog = () => {
    setShowPremiumDialog(false);
    setPremiumPassword('');
  };

  return {
    usePremiumModel,
    isPremiumUnlocked,
    showPremiumDialog,
    premiumPassword,
    setPremiumPassword,
    handlePremiumToggle,
    handlePremiumPassword,
    closePremiumDialog,
  };
};
