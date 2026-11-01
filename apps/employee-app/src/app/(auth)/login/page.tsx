'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Sun, Moon, Globe, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useLanguageStore } from '@/store/language.store';
import { useTheme } from '@/providers';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(4, 'Password must be at least 4 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const { t, language, toggleLanguage } = useLanguageStore();
  const { theme, toggleTheme } = useTheme();

  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setErrorMessage(null);
      setIsSubmitting(true);
      await login(data.email, data.password);
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      const msg =
        error.response?.data?.message ||
        error.message ||
        'Invalid credentials. Please verify your email and password.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
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
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top action controls: Theme and Language switches */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 10,
        }}
      >
        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="btn btn-ghost"
          style={{
            color: '#FFFFFF',
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(8px)',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            padding: 0,
          }}
        >
          {theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
        </button>

        <button
          type="button"
          onClick={toggleLanguage}
          aria-label="Toggle language"
          className="btn btn-ghost"
          style={{
            color: '#FFFFFF',
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(8px)',
            borderRadius: '20px',
            padding: '6px 14px',
            fontSize: '0.825rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <Globe size={16} />
          <span>{language === 'en' ? 'ગુજરાતી' : 'English'}</span>
        </button>
      </div>

      {/* Main Container */}
      <div style={{ margin: 'auto 0', zIndex: 10 }}>
        {/* Animated Brand Splash Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: '28px' }}
        >
          <div
            style={{
              width: '76px',
              height: '76px',
              margin: '0 auto 14px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #2563EB 0%, #38BDF8 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 12px 24px rgba(37, 99, 235, 0.4)',
              border: '2px solid rgba(255, 255, 255, 0.3)',
            }}
          >
            <span style={{ fontSize: '1.9rem', fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
              B
            </span>
          </div>

          <h1
            style={{
              color: '#FFFFFF',
              fontSize: '2rem',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              marginBottom: '4px',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
            }}
          >
            {t('login.title') || 'BAMS'}
          </h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '0.95rem', fontWeight: 500 }}>
            {t('login.subtitle') || 'Employee Mobile Portal'}
          </p>
        </motion.div>

        {/* Form Glassmorphism Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="glass-card"
          style={{
            borderRadius: '24px',
            padding: '24px 20px',
            backgroundColor: 'var(--bg-card)',
          }}
        >
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '6px' }}>
              {t('login.welcome') || 'Welcome back!'}
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Sign in with your employee email credentials
            </p>
          </div>

          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
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
            </motion.div>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Email Field */}
            <div className="form-group">
              <label className="form-label">
                {t('login.email') || 'Email Address'}
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
                  placeholder={t('login.email_placeholder') || 'name@company.com'}
                  {...register('email')}
                  className={`form-input ${errors.email ? 'has-error' : ''}`}
                  style={{ paddingLeft: '42px' }}
                />
              </div>
              {errors.email && (
                <span className="form-error-text">{errors.email.message}</span>
              )}
            </div>

            {/* Password Field */}
            <div className="form-group" style={{ marginBottom: '8px' }}>
              <label className="form-label">
                {t('login.password') || 'Password'}
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
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t('login.password_placeholder') || '••••••••'}
                  {...register('password')}
                  className={`form-input ${errors.password ? 'has-error' : ''}`}
                  style={{ paddingLeft: '42px', paddingRight: '42px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-subtle)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '4px',
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <span className="form-error-text">{errors.password.message}</span>
              )}
            </div>

            {/* Forgot Password Link */}
            <div style={{ textAlign: 'right', marginBottom: '22px', marginTop: '6px' }}>
              <Link
                href="/forgot-password"
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: 'var(--color-secondary)',
                }}
              >
                {t('login.forgot_password') || 'Forgot Password?'}
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary btn-block btn-lg"
              style={{
                boxShadow: '0 4px 14px rgba(20, 43, 74, 0.35)',
              }}
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>{t('login.logging_in') || 'Signing in...'}</span>
                </>
              ) : (
                <>
                  <span>{t('login.login_button') || 'Sign In'}</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>

      {/* Footer Info */}
      <div style={{ textAlign: 'center', padding: '12px 0 4px', zIndex: 10 }}>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
          {t('profile.app_version') || 'BAMS Mobile PWA v1.0.0'} • Secure Financial Cloud
        </p>
      </div>
    </div>
  );
}
