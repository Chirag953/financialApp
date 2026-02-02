'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useRouter } from 'next/navigation';
import { Lock, User, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { ThemeToggle } from '@/components/theme-toggle';
import { useGetSettingsQuery } from '@/store/services/api';

export default function LoginPage() {
  const router = useRouter();
  const { data: settingsData } = useGetSettingsQuery();
  const appName = settingsData?.settings?.app_name || "Scheme Mapping System";
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Map 'admin' username to the internal email address if needed
      const loginIdentifier = username.toLowerCase() === 'admin' ? 'admin@example.com' : username;

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginIdentifier, password }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push('/dashboard');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 relative overflow-hidden transition-colors duration-500">
      {/* Theme Toggle Button */}
      <div className="absolute top-6 right-6 z-50">
        <div className="rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-[var(--depth-shadow)] hover:bg-white dark:hover:bg-slate-800 transition-all duration-300">
          <ThemeToggle />
        </div>
      </div>

      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500/10" />
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
      
      <Card className="w-full max-w-md shadow-xl border border-slate-200 dark:border-slate-800 relative z-10 overflow-hidden bg-white/90 dark:bg-slate-900/90 backdrop-blur-md transition-all duration-500">
        <CardHeader className="space-y-4 pb-8">
          <div className="flex justify-center">
            <div className="relative w-28 h-28 overflow-hidden flex items-center justify-center bg-white/10 dark:bg-slate-800/50 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
              <Image 
                src="/logo.jpeg" 
                alt={appName} 
                fill
                className="object-cover scale-110"
                priority
              />
            </div>
          </div>
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center tracking-tight text-slate-900 dark:text-white">
              Sign In
            </CardTitle>
            <CardDescription className="text-center text-slate-500 dark:text-slate-400">
              Access the {appName} dashboard
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="p-3 text-sm font-medium text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center animate-in fade-in slide-in-from-top-1">
                <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Username 
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input 
                  id="username" 
                  type="text" 
                  placeholder="Enter your username" 
                  className="pl-10 h-11 border-slate-200 dark:border-slate-700 dark:bg-slate-900 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all shadow-sm"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required 
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input 
                  id="password" 
                  type="password"
                  placeholder="••••••••"
                  className="pl-10 h-11 border-slate-200 dark:border-slate-700 dark:bg-slate-900 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all shadow-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>
            </div> 
            <Button 
              type="submit" 
              className="w-full h-11 text-base font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-emerald-500/20 transition-all active:scale-[0.98] mt-2" 
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Signing in...
                </span>
              ) : 'Sign In'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 pt-6 pb-8 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
          <div className="text-xs text-center text-slate-500 dark:text-slate-400 font-medium">
            <span className="opacity-70 mr-2">Quick Access:</span>
            <code className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 px-2 py-1 rounded font-bold border border-emerald-100 dark:border-emerald-800/50">
              admin / admin123
            </code>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
