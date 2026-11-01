'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, KeyRound, Lock, ArrowLeft, CheckCircle2, ArrowRight } from 'lucide-react';
import { api } from '@/lib/api';
import { useLanguageStore } from '@/store/language.store';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { t } = useLanguageStore();

  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address');
      return;
    }
    setErrorMessage(null);
    setIsLoading(true);

    try {
      await api.auth.forgotPassword(email);
      toast.success('Verification code sent to your email!');
      setStep(2);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to send OTP. Please try again.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 4) {
      setErrorMessage('Please enter a valid OTP code');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);

    try {
      await api.auth.resetPassword({ email, otp, password });
      toast.success(t('login.password_reset_success') || 'Password reset successfully!');
      router.push('/login');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to reset password. Please check your OTP.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '24px 20px',
        background: 'linear-gradient(180deg, #142B4A 0%, #1E3A66 40%, var(--bg-app) 100%)',
      }}
    >
      {/* Top Bar Back Link */}
      <div style={{ zIndex: 10 }}>
        <Link
          href="/login"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            color: '#FFFFFF',
            textDecoration: 'none',
            fontSize: '0.9rem',
            fontWeight: 600,
            padding: '8px 12px',
            borderRadius: '12px',
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <ArrowLeft size={18} />
          <span>{t('login.back_to_login') || 'Back to Login'}</span>
        </Link>
      </div>

      {/* Main Container */}
      <div style={{ margin: 'auto 0', zIndex: 10 }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', marginBottom: '24px' }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              margin: '0 auto 12px',
              borderRadius: '18px',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              border: '1px solid rgba(255, 255, 255, 0.25)',
            }}
          >
            <KeyRound size={32} />
          </div>
          <h1
            style={{
              color: '#FFFFFF',
              fontSize: '1.75rem',
              fontWeight: 800,
              letterSpacing: '-0.02em',
            }}
          >
            {t('login.reset_password') || 'Reset Password'}
          </h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.875rem', marginTop: '4px' }}>
            {step === 1
              ? 'Enter your email to receive a password reset OTP'
              : 'Enter the code and set your new password'}
          </p>
        </motion.div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card"
          style={{
            borderRadius: '24px',
            padding: '24px 20px',
            backgroundColor: 'var(--bg-card)',
          }}
        >
          {errorMessage && (
            <div
              style={{
                backgroundColor: 'var(--color-danger-light)',
                color: 'var(--color-danger-dark)',
                borderRadius: '10px',
                padding: '10px 14px',
                fontSize: '0.85rem',
                marginBottom: '16px',
                border: '1px solid rgba(220, 38, 38, 0.25)',
              }}
            >
              {errorMessage}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleSendOtp}>
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label">
                  {t('login.email') || 'Work Email'}
                  <span className="required">*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail
                    size={18}
                    style={{
                      position: 'absolute',
                      left: '14px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-subtle)',
                    }}
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('login.email_placeholder') || 'name@company.com'}
                    required
                    className="form-input"
                    style={{ paddingLeft: '42px' }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary btn-block btn-lg"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span>{t('login.sending_otp') || 'Sending OTP...'}</span>
                  </>
                ) : (
                  <>
                    <span>{t('login.send_otp') || 'Send Verification Code'}</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword}>
              <div className="form-group">
                <label className="form-label">
                  {t('login.otp') || 'Enter 6-digit OTP'}
                  <span className="required">*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <KeyRound
                    size={18}
                    style={{
                      position: 'absolute',
                      left: '14px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-subtle)',
                    }}
                  />
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.trim())}
                    placeholder="123456"
                    required
                    className="form-input"
                    style={{
                      paddingLeft: '42px',
                      letterSpacing: '0.25em',
                      fontWeight: 700,
                      fontSize: '1.1rem',
                    }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  {t('login.new_password') || 'New Password'}
                  <span className="required">*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock
                    size={18}
                    style={{
                      position: 'absolute',
                      left: '14px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-subtle)',
                    }}
                  />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('login.new_password_placeholder') || 'At least 6 characters'}
                    required
                    className="form-input"
                    style={{ paddingLeft: '42px' }}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '22px' }}>
                <label className="form-label">
                  {t('login.confirm_password') || 'Confirm Password'}
                  <span className="required">*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock
                    size={18}
                    style={{
                      position: 'absolute',
                      left: '14px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-subtle)',
                    }}
                  />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={t('login.confirm_password_placeholder') || 'Repeat new password'}
                    required
                    className="form-input"
                    style={{ paddingLeft: '42px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn btn-outline"
                  style={{ flex: 1 }}
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn btn-primary btn-lg"
                  style={{ flex: 2 }}
                >
                  {isLoading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <>
                      <CheckCircle2 size={18} />
                      <span>{t('login.reset_password') || 'Confirm Reset'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>

      <div style={{ textAlign: 'center', padding: '12px 0 4px', zIndex: 10 }}>
        <Link
          href="/login"
          style={{
            fontSize: '0.85rem',
            color: 'rgba(255, 255, 255, 0.8)',
            textDecoration: 'none',
          }}
        >
          Remember your password? <strong>Sign In</strong>
        </Link>
      </div>
    </div>
  );
}
