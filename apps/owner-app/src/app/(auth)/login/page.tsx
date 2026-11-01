'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';
import { useLanguageStore } from '@/store/language.store';
import api from '@/lib/api';
import { UserRole } from '@/types';
import toast from 'react-hot-toast';
import { Lock, Mail, Eye, EyeOff, Building2, Globe, Moon, Sun } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const { language, toggleLanguage, theme, toggleTheme, t } = useLanguageStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    setErrorMessage('');

    try {
      const data = await api.auth.login({ email, password });

      // Ensure user has owner role
      if (
        data.user.role !== UserRole.BUSINESS_OWNER &&
        data.user.role !== UserRole.SUPER_ADMIN
      ) {
        throw new Error(
          t('auth.unauthorized', 'Only Business Owners can access this application.')
        );
      }

      setAuth(data.user, data.accessToken, data.refreshToken);
      toast.success(t('auth.loginSuccess', 'Welcome back!'));
      router.replace('/dashboard');
    } catch (error: any) {
      const msg =
        error.response?.data?.message ||
        error.message ||
        t('auth.invalidCredentials', 'Invalid email or password');
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F2038] via-[#142B4A] to-[#2563EB] flex flex-col justify-between p-4 sm:p-6 text-white max-w-md mx-auto">
      {/* Top Bar with Language and Theme Toggles */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-medium hover:bg-white/20 transition-colors"
        >
          <Globe size={14} />
          <span>{language === 'en' ? 'ગુજરાતી' : 'English'}</span>
        </button>

        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="p-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-colors"
        >
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>
      </div>

      {/* Main Card */}
      <div className="w-full my-auto py-6">
        {/* Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-lg border border-white/30 shadow-2xl mb-4">
            <Building2 size={32} className="text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {t('auth.title', 'BAMS Owner Portal')}
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-blue-100/80 max-w-xs mx-auto">
            {t('auth.subtitle', 'Sign in to manage your business operations & finances')}
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-3xl shadow-2xl">
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-blue-100 mb-1.5">
                {t('auth.email', 'Email Address')}
              </label>
              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-200/60"
                />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="owner@business.com"
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-200/50 text-sm focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-blue-100">
                  {t('auth.password', 'Password')}
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-blue-200 hover:text-white transition-colors"
                >
                  {t('auth.forgotPassword', 'Forgot Password?')}
                </Link>
              </div>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-200/60"
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-200/50 text-sm focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-blue-200/60 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3.5 px-4 bg-white text-[#142B4A] hover:bg-blue-50 font-bold rounded-xl text-sm shadow-xl transition-all duration-200 active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none"
            >
              {isLoading ? t('auth.loggingIn', 'Signing in...') : t('auth.login', 'Sign In')}
            </button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center pb-2 text-xs text-blue-200/60">
        © {new Date().getFullYear()} BAMS Account Management System
      </div>
    </div>
  );
}
