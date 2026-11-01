'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, CheckCircle2 } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { useLanguageStore } from '@/store/language.store';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const t = useLanguageStore((state) => state.t);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      await api.auth.forgotPassword(email);
      setIsSubmitted(true);
      toast.success(t('auth.resetSent', 'Password reset instructions sent.'));
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to request reset. Please check your email.';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F2038] via-[#142B4A] to-[#2563EB] flex flex-col justify-between p-4 sm:p-6 text-white max-w-md mx-auto">
      <div>
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs text-blue-200 hover:text-white transition-colors py-2"
        >
          <ArrowLeft size={16} />
          <span>{t('auth.backToLogin', 'Back to Login')}</span>
        </Link>
      </div>

      <div className="w-full my-auto py-6">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight">
            {t('auth.forgotPasswordTitle', 'Reset Password')}
          </h1>
          <p className="mt-2 text-xs text-blue-100/80 max-w-xs mx-auto">
            {t(
              'auth.forgotPasswordSubtitle',
              'Enter your email address to receive password reset instructions'
            )}
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-3xl shadow-2xl">
          {isSubmitted ? (
            <div className="text-center py-4 space-y-4">
              <CheckCircle2 size={48} className="mx-auto text-emerald-400" />
              <p className="text-sm font-medium text-white">
                {t(
                  'auth.resetSent',
                  'Password reset instructions have been sent to your email.'
                )}
              </p>
              <Link
                href="/login"
                className="inline-block mt-4 px-6 py-2.5 bg-white text-[#142B4A] font-bold text-xs rounded-xl shadow-lg hover:bg-blue-50"
              >
                {t('auth.backToLogin', 'Back to Login')}
              </Link>
            </div>
          ) : (
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
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-200/50 text-sm focus:outline-none focus:ring-2 focus:ring-white/40"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 bg-white text-[#142B4A] hover:bg-blue-50 font-bold rounded-xl text-sm shadow-xl transition-all active:scale-[0.98] disabled:opacity-70"
              >
                {isLoading
                  ? t('auth.sendingLink', 'Sending...')
                  : t('auth.sendResetLink', 'Send Reset Link')}
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="text-center pb-2 text-xs text-blue-200/60">
        © {new Date().getFullYear()} BAMS Account Management System
      </div>
    </div>
  );
}
