'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Lock, Mail, Globe, ArrowRight, AlertCircle, Building2 } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useLanguageStore } from '@/store/language.store';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading, error: authError, setError } = useAuthStore();
  const { language, toggleLanguage, t } = useLanguageStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formErrors, setFormErrors] = useState<{ email?: string; password?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const errors: { email?: string; password?: string } = {};
    if (!email.trim()) errors.email = t('auth.emailRequired', 'Email is required');
    if (!password.trim()) errors.password = t('auth.passwordRequired', 'Password is required');

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    setSubmitting(true);

    try {
      const success = await login({ email, password });
      if (success) {
        toast.success(t('auth.loginSuccess', 'Authenticated as Super Admin'));
        router.push('/dashboard');
      } else {
        toast.error(authError || t('auth.invalidCredentials', 'Authentication failed'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-[#0F2137] via-[#142B4A] to-[#0A0F1E] relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 -left-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -right-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Language Toggle in Top-Right */}
      <div className="absolute top-6 right-6 z-20">
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/10 transition"
        >
          <Globe className="w-3.5 h-3.5 text-blue-300" />
          <span>{language === 'EN' ? 'ગુજરાતી' : 'English'}</span>
        </button>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-8 z-10 animate-fade-in">
        {/* Branding */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-[#142B4A] text-white flex items-center justify-center shadow-lg mb-3">
            <Shield className="w-7 h-7 text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t('auth.title', 'BAMS Super Admin')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t('auth.subtitle', 'Central System Administration & Governance')}
          </p>
        </div>

        {/* Security Notice */}
        <div className="mb-6 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-300">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
          <p className="leading-relaxed">
            {t(
              'auth.securityNotice',
              'Restricted Access: Super Admin authorization required. All administrative actions are recorded.'
            )}
          </p>
        </div>

        {/* Global Error Banner */}
        {authError && (
          <div className="mb-5 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
            {authError}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={t('auth.email', 'Admin Email')}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="superadmin@bams.internal"
            leftIcon={<Mail className="w-4 h-4" />}
            error={formErrors.email}
            autoComplete="email"
            required
          />

          <Input
            label={t('auth.password', 'Password')}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            leftIcon={<Lock className="w-4 h-4" />}
            error={formErrors.password}
            autoComplete="current-password"
            required
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={submitting || isLoading}
            rightIcon={<ArrowRight className="w-4 h-4" />}
            className="mt-2 bg-[#142B4A] hover:bg-[#0F2137] text-white"
          >
            {submitting ? t('auth.loggingIn', 'Authenticating...') : t('auth.login', 'Sign In')}
          </Button>
        </form>

        {/* Footer info */}
        <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            Business Account Management System v1.0.0
          </p>
        </div>
      </div>
    </div>
  );
}
