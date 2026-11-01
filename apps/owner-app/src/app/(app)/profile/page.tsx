'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building,
  User as UserIcon,
  Phone,
  Mail,
  MapPin,
  Lock,
  Globe,
  Moon,
  Sun,
  LogOut,
  Camera,
  Coins,
  CheckCircle,
  Users,
  Receipt,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Modal } from '@/components/ui/Modal';
import { useAuthStore } from '@/store/auth.store';
import { useLanguageStore } from '@/store/language.store';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const router = useRouter();
  const { user, updateUser, logout } = useAuthStore();
  const { language, setLanguage, theme, toggleTheme, t } = useLanguageStore();

  const business = user?.business;

  // Form states
  const [businessName, setBusinessName] = useState(business?.name || '');
  const [address, setAddress] = useState(business?.address || '');
  const [businessPhone, setBusinessPhone] = useState(business?.phone || '');
  const [openingBalance, setOpeningBalance] = useState(
    business?.openingBalance ? String(business.openingBalance) : '0'
  );

  const [isSaving, setIsSaving] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const res = await api.businesses.uploadLogo(file);
      if (business) {
        updateUser({
          business: { ...business, logo: res.logoUrl },
        });
      }
      toast.success(t('profile.updateSuccess', 'Logo updated successfully'));
    } catch (err: any) {
      toast.error('Failed to upload business logo');
    }
  };

  const handleSaveBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updated = await api.businesses.updateBusiness({
        name: businessName,
        address,
        phone: businessPhone,
        openingBalance: Number(openingBalance),
      });

      if (business) {
        updateUser({
          business: { ...business, ...updated },
        });
      }
      toast.success(t('profile.updateSuccess', 'Business settings updated'));
    } catch (err: any) {
      toast.error('Failed to update business settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsChangingPassword(true);
    try {
      await api.auth.changePassword({ currentPassword, newPassword });
      toast.success(t('profile.passwordChanged', 'Password updated successfully'));
      setShowPasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  return (
    <div className="min-h-screen pb-20">
      <PageHeader title={t('profile.title', 'Business Settings')} />

      <div className="p-4 space-y-5">
        {/* Business Logo & Hero Banner */}
        <div className="p-5 bg-gradient-to-r from-[#142B4A] to-[#2563EB] text-white rounded-3xl shadow-lg relative overflow-hidden flex flex-col items-center text-center">
          <div className="relative mb-3 group cursor-pointer">
            <div className="w-20 h-20 rounded-3xl bg-white/10 backdrop-blur-md border border-white/30 flex items-center justify-center overflow-hidden shadow-inner">
              {business?.logo ? (
                <img
                  src={business.logo}
                  alt={businessName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Building size={32} className="text-white" />
              )}
            </div>
            <label className="absolute -bottom-1 -right-1 p-2 rounded-full bg-white text-[#142B4A] shadow cursor-pointer hover:scale-105 transition-transform">
              <Camera size={14} />
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
            </label>
          </div>

          <h2 className="text-lg font-extrabold">{businessName || 'Business Profile'}</h2>
          <p className="text-xs text-blue-200/80 mt-0.5">{user?.name} (Owner)</p>
          <span className="mt-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/20 text-blue-100">
            Enterprise Tier
          </span>
        </div>

        {/* Business Details Form */}
        <form
          onSubmit={handleSaveBusiness}
          className="p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3.5"
        >
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {t('profile.businessDetails', 'Business Information')}
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {t('profile.businessName', 'Business Name')}
            </label>
            <div className="relative">
              <Building
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {t('profile.businessAddress', 'Business Address')}
            </label>
            <div className="relative">
              <MapPin
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="City, State, Pincode"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t('profile.businessPhone', 'Phone')}
              </label>
              <input
                type="tel"
                value={businessPhone}
                onChange={(e) => setBusinessPhone(e.target.value)}
                placeholder="+91..."
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t('profile.openingBalance', 'Opening Balance')}
              </label>
              <input
                type="number"
                value={openingBalance}
                onChange={(e) => setOpeningBalance(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full py-2.5 px-4 bg-[#2563EB] hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {isSaving ? t('common.loading', 'Saving...') : t('profile.updateBusiness', 'Save Business Profile')}
          </button>
        </form>

        {/* Preferences & Language */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {t('profile.preferences', 'Preferences')}
          </h3>

          <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <Globe size={18} className="text-[#2563EB]" />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {t('profile.language', 'App Language')}
              </span>
            </div>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 text-xs rounded-lg font-semibold transition-all ${
                  language === 'en'
                    ? 'bg-[#142B4A] dark:bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setLanguage('gu')}
                className={`px-2.5 py-1 text-xs rounded-lg font-semibold transition-all ${
                  language === 'gu'
                    ? 'bg-[#142B4A] dark:bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                }`}
              >
                ગુજરાતી
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2.5">
              {theme === 'dark' ? (
                <Moon size={18} className="text-blue-400" />
              ) : (
                <Sun size={18} className="text-amber-500" />
              )}
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {t('profile.theme', 'Theme Mode')}
              </span>
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              className="px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium capitalize"
            >
              {theme}
            </button>
          </div>
        </div>

        {/* Security & Password */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {t('profile.security', 'Security')}
          </h3>

          <button
            type="button"
            onClick={() => setShowPasswordModal(true)}
            className="w-full flex items-center justify-between py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Lock size={18} className="text-slate-400" />
              <span>{t('profile.changePassword', 'Change Password')}</span>
            </div>
            <span className="text-slate-400">›</span>
          </button>
        </div>

        {/* Logout Button */}
        <div>
          <button
            type="button"
            onClick={() => setShowLogoutModal(true)}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 font-bold text-xs hover:bg-rose-100 transition-all active:scale-[0.98]"
          >
            <LogOut size={16} />
            <span>{t('profile.logout', 'Log Out of Account')}</span>
          </button>
        </div>
      </div>

      {/* Change Password Modal */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title={t('profile.changePassword', 'Change Password')}
      >
        <form onSubmit={handleChangePassword} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              {t('profile.currentPassword', 'Current Password')}
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              {t('profile.newPassword', 'New Password')}
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              {t('profile.confirmNewPassword', 'Confirm New Password')}
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowPasswordModal(false)}
              className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
            >
              {t('common.cancel', 'Cancel')}
            </button>
            <button
              type="submit"
              disabled={isChangingPassword}
              className="flex-1 py-2 rounded-xl bg-[#2563EB] text-white text-xs font-semibold shadow"
            >
              {isChangingPassword ? t('common.loading', 'Updating...') : t('common.save', 'Update')}
            </button>
          </div>
        </form>
      </Modal>

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title={t('profile.logout', 'Log Out')}
        description={t(
          'profile.logoutConfirm',
          'Are you sure you want to log out of your owner account?'
        )}
        footer={
          <div className="flex gap-2 w-full">
            <button
              onClick={() => setShowLogoutModal(false)}
              className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
            >
              {t('common.cancel', 'Cancel')}
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow"
            >
              {t('profile.logout', 'Log Out')}
            </button>
          </div>
        }
      >
        <div />
      </Modal>
    </div>
  );
}
