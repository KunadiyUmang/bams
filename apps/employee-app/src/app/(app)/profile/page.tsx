'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  Mail,
  Phone,
  Briefcase,
  Building,
  Globe,
  Sun,
  Moon,
  LogOut,
  Camera,
  Lock,
  Check,
  ChevronRight,
  Shield,
  Save,
} from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import Modal from '@/components/ui/Modal';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useAuthStore } from '@/store/auth.store';
import { useLanguageStore } from '@/store/language.store';
import { useTheme } from '@/providers';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout, updateUser, isLoading } = useAuthStore();
  const { t, language, setLanguage } = useLanguageStore();
  const { theme, setTheme } = useTheme();

  const [name, setName] = useState(user?.name || 'Employee');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatarUrl || null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // Change password inputs
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setAvatarPreview(uploadEvent.target?.result as string);
    };
    reader.readAsDataURL(file);

    try {
      const res = await api.uploads.uploadFile(file, 'avatar');
      await updateUser({ avatarUrl: res.url });
      toast.success('Profile photo updated!');
    } catch {
      toast.success('Profile photo updated locally');
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      await updateUser({ name, phone });
      toast.success(t('profile.profile_updated') || 'Profile updated successfully');
    } catch (err: any) {
      toast.error('Failed to update profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsChangingPassword(true);
    try {
      await api.auth.updateMe({ password: newPassword } as any);
      toast.success('Password changed successfully');
      setIsPasswordModalOpen(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleLogout = async () => {
    setIsLogoutModalOpen(false);
    await logout();
    router.replace('/login');
  };

  return (
    <div style={{ width: '100%' }}>
      <PageHeader title={t('profile.profile') || 'Profile & Settings'} />

      <div style={{ padding: '16px' }}>
        {/* Profile Avatar & Header Card */}
        <div
          className="bams-card"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '24px 16px',
            marginBottom: '16px',
            textAlign: 'center',
          }}
        >
          <div style={{ position: 'relative', marginBottom: '12px' }}>
            <div
              style={{
                width: '84px',
                height: '84px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-secondary-light)',
                color: 'var(--color-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                border: '3px solid var(--border-color)',
                fontSize: '2rem',
                fontWeight: 700,
              }}
            >
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt={user?.name || 'User'}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                user?.name?.charAt(0) || 'E'
              )}
            </div>

            {/* Camera Upload Button */}
            <label
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-secondary)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                style={{ display: 'none' }}
              />
              <Camera size={15} />
            </label>
          </div>

          <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
            {user?.name || 'Employee User'}
          </h2>
          <span className="badge badge-neutral" style={{ marginTop: '4px' }}>
            {user?.role || 'EMPLOYEE'}
          </span>
        </div>

        {/* Edit Info Form */}
        <form onSubmit={handleSaveProfile} className="bams-card" style={{ marginBottom: '16px' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '14px' }}>
            Personal Information
          </h3>

          {/* Editable Name */}
          <div className="form-group">
            <label className="form-label">
              <User size={14} />
              <span>{t('profile.name') || 'Full Name'}</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-input"
            />
          </div>

          {/* Editable Phone */}
          <div className="form-group">
            <label className="form-label">
              <Phone size={14} />
              <span>{t('profile.phone') || 'Phone Number'}</span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="form-input"
            />
          </div>

          {/* Readonly Email */}
          <div className="form-group">
            <label className="form-label">
              <Mail size={14} />
              <span>{t('profile.email') || 'Email Address'} (Read-only)</span>
            </label>
            <input
              type="email"
              value={user?.email || 'employee@company.com'}
              disabled
              className="form-input"
              style={{ backgroundColor: 'var(--bg-card-subtle)', color: 'var(--text-muted)' }}
            />
          </div>

          {/* Readonly Employee ID */}
          <div className="form-group">
            <label className="form-label">
              <Briefcase size={14} />
              <span>{t('profile.employee_id') || 'Employee ID'}</span>
            </label>
            <input
              type="text"
              value={user?.employeeId || `EMP-${user?.id?.slice(0, 6).toUpperCase() || '104'}`}
              disabled
              className="form-input"
              style={{ backgroundColor: 'var(--bg-card-subtle)', color: 'var(--text-muted)' }}
            />
          </div>

          {/* Readonly Business Name */}
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label">
              <Building size={14} />
              <span>{t('profile.business') || 'Business'}</span>
            </label>
            <input
              type="text"
              value={user?.business?.name || 'BAMS Corporate Accounts'}
              disabled
              className="form-input"
              style={{ backgroundColor: 'var(--bg-card-subtle)', color: 'var(--text-muted)' }}
            />
          </div>

          <button
            type="submit"
            disabled={isSavingProfile}
            className="btn btn-secondary btn-block"
          >
            {isSavingProfile ? <LoadingSpinner size="sm" /> : <Save size={16} />}
            <span>{t('profile.edit_profile') || 'Save Changes'}</span>
          </button>
        </form>

        {/* Preferences & Settings Card */}
        <div className="bams-card" style={{ marginBottom: '16px' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '14px' }}>
            App Preferences
          </h3>

          {/* Language Switcher */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 0',
              borderBottom: '1px solid var(--border-color)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Globe size={18} color="var(--color-secondary)" />
              <div>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, display: 'block' }}>
                  {t('profile.language') || 'Language'}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {language === 'en' ? 'English (US)' : 'ગુજરાતી'}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`btn btn-sm ${language === 'en' ? 'btn-primary' : 'btn-outline'}`}
                style={{ borderRadius: '16px' }}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage('gu')}
                className={`btn btn-sm ${language === 'gu' ? 'btn-primary' : 'btn-outline'}`}
                style={{ borderRadius: '16px' }}
              >
                ગુ
              </button>
            </div>
          </div>

          {/* Theme Switcher */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 0',
              borderBottom: '1px solid var(--border-color)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {theme === 'dark' ? (
                <Moon size={18} color="var(--color-secondary)" />
              ) : (
                <Sun size={18} color="var(--color-warning)" />
              )}
              <div>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, display: 'block' }}>
                  {t('profile.theme') || 'Theme'}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {theme === 'dark' ? t('profile.theme_dark') || 'Dark Mode' : t('profile.theme_light') || 'Light Mode'}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`btn btn-sm ${theme === 'light' ? 'btn-primary' : 'btn-outline'}`}
                style={{ borderRadius: '16px' }}
              >
                Light
              </button>
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`btn btn-sm ${theme === 'dark' ? 'btn-primary' : 'btn-outline'}`}
                style={{ borderRadius: '16px' }}
              >
                Dark
              </button>
            </div>
          </div>

          {/* Change Password Option */}
          <div
            onClick={() => setIsPasswordModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 0 4px',
              cursor: 'pointer',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Lock size={18} color="var(--color-secondary)" />
              <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                {t('profile.change_password') || 'Change Password'}
              </span>
            </div>
            <ChevronRight size={18} color="var(--text-subtle)" />
          </div>
        </div>

        {/* Logout Button */}
        <button
          type="button"
          onClick={() => setIsLogoutModalOpen(true)}
          className="btn btn-outline btn-block"
          style={{
            borderColor: 'var(--color-danger)',
            color: 'var(--color-danger)',
            marginBottom: '16px',
            backgroundColor: 'transparent',
          }}
        >
          <LogOut size={18} />
          <span>{t('profile.logout') || 'Log Out'}</span>
        </button>

        {/* App Version */}
        <div style={{ textAlign: 'center', padding: '8px 0' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
            {t('profile.app_version') || 'BAMS Mobile PWA v1.0.0'}
          </p>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        title="Sign Out"
      >
        <div style={{ textAlign: 'center', padding: '10px 0' }}>
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-danger-light)',
              color: 'var(--color-danger)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px',
            }}
          >
            <LogOut size={26} />
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px' }}>
            {t('profile.logout_confirm') || 'Are you sure you want to log out?'}
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
            You will need your password to log back into your employee account.
          </p>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={() => setIsLogoutModalOpen(false)}
              className="btn btn-outline"
              style={{ flex: 1 }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="btn btn-danger"
              style={{ flex: 1 }}
            >
              Log Out
            </button>
          </div>
        </div>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        title="Change Password"
      >
        <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="form-input"
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              placeholder="At least 6 characters"
              className="form-input"
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="form-input"
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button
              type="button"
              onClick={() => setIsPasswordModalOpen(false)}
              className="btn btn-outline"
              style={{ flex: 1 }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isChangingPassword}
              className="btn btn-primary"
              style={{ flex: 1 }}
            >
              {isChangingPassword ? <LoadingSpinner size="sm" /> : 'Update Password'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
