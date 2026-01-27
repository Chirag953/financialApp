'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { Lock, Mail, AlertCircle } from 'lucide-react';
import Image from 'next/image';

export default function LoginPage() {
  const t = useTranslations('Login');
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const tf = useTranslations('Footer');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push('/dashboard');
      } else {
        setError(data.error || t('loginFailed'));
      }
    } catch (err) {
      setError(t('error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-primary/10" />
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      
      <Card className="w-full max-w-md shadow-xl border-t-4 border-t-primary dark:border-slate-800 relative z-10">
        <CardHeader className="space-y-4 pb-8">
          <div className="flex justify-center">
            <div className="overflow-hidden flex items-center justify-center">
              <Image 
                src="/logo.jpeg" 
                alt="Scheme Mapping System" 
                width={120} 
                height={120} 
                className="object-contain"
                priority
              />
            </div>
          </div>
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center tracking-tight dark:text-white">
              {t('title')}
            </CardTitle>
            <CardDescription className="text-center text-gray-500 dark:text-gray-400">
              {t('subtitle')}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="p-3 text-sm font-medium text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center">
                <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {t('email')}
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="admin@example.com" 
                  className="pl-10 h-10 border-gray-200 dark:border-slate-700 dark:bg-slate-900 focus:border-primary focus:ring-primary/20"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="dark:text-gray-300">{t('password')}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input 
                  id="password" 
                  type="password"
                  className="pl-10 h-10 border-gray-200 dark:border-slate-700 dark:bg-slate-900 focus:border-primary focus:ring-primary/20"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>
            </div> 
            <Button type="submit" className="w-full h-11 text-base font-semibold transition-all hover:shadow-lg active:scale-[0.98]" disabled={loading}>
              {loading ? (
                <span className="flex items-center">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  {t('signingIn')}
                </span>
              ) : t('signIn')}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 pt-2 pb-8 border-t border-gray-50 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50 rounded-b-xl">
          <div className="text-xs text-center text-gray-500 dark:text-gray-400 font-medium">
            <span className="bg-white dark:bg-slate-800 px-2 py-1 rounded border border-gray-100 dark:border-slate-700 shadow-sm mr-2">
              {t('defaultAdmin')}
            </span>
            <code className="text-primary font-bold">admin@example.com / admin123</code>
          </div>
        </CardFooter>
      </Card>

      <footer className="absolute bottom-6 w-full px-4">
        <div className="flex flex-col md:flex-row justify-center items-center gap-4 text-center">
          <p className="text-xs font-medium text-slate-400 dark:text-slate-500">
            {tf('copyright')}
          </p>
          <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800/50">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">System Live</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
