/**
 * usePremium Hook
 * Handles premium model toggle and password verification
 *
 * NOTE: This is a temporary solution with hardcoded password
 * TODO: Move to backend authentication with JWT tokens
 */

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

const PREMIUM_PASSWORD = 'power'; // TODO: Remove hardcoded password
const PREMIUM_KEY = 'premium_unlocked';

export const usePremium = () => {
  const [usePremiumModel, setUsePremiumModel] = useState(false);
  const [isPremiumUnlocked, setIsPremiumUnlocked] = useState(false);
  const [showPremiumDialog, setShowPremiumDialog] = useState(false);
  const [premiumPassword, setPremiumPassword] = useState('');

  // Check if premium is unlocked on mount
  useEffect(() => {
    const unlocked = localStorage.getItem(PREMIUM_KEY) === 'true';
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
      localStorage.setItem(PREMIUM_KEY, 'true');
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
