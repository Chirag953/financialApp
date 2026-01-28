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

export default function LoginPage() {
  const router = useRouter();
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
      <div className="absolute top-0 left-0 w-full h-1 bg-primary/10" />
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      
      <Card className="w-full max-w-md shadow-[var(--depth-shadow-lg)] border-none relative z-10 overflow-hidden bg-white/90 dark:bg-slate-900/90 backdrop-blur-md transition-all duration-500">
        <CardHeader className="space-y-4 pb-8 border-none">
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
              Login
            </CardTitle>
            <CardDescription className="text-center text-gray-500 dark:text-gray-400">
              Enter your credentials to access the Scheme Mapping System
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="border-none">
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="p-3 text-sm font-medium text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center">
                <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Username 
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input 
                  id="username" 
                  type="text" 
                  placeholder="Name" 
                  className="pl-10 h-10 border-gray-200 dark:border-slate-700 dark:bg-slate-900 focus:border-primary focus:ring-primary/20 transition-all shadow-sm"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required 
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="dark:text-gray-300">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input 
                  id="password" 
                  type="password"
                  placeholder="••••••••"
                  className="pl-10 h-10 border-gray-200 dark:border-slate-700 dark:bg-slate-900 focus:border-primary focus:ring-primary/20 transition-all shadow-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>
            </div> 
            <Button type="submit" className="w-full h-11 text-base font-semibold transition-all hover:shadow-lg active:scale-[0.98] mt-2" disabled={loading}>
              {loading ? (
                <span className="flex items-center">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Signing in...
                </span>
              ) : 'Sign In'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 pt-4 pb-8 border-none bg-slate-50/80 dark:bg-slate-800/50 rounded-b-xl">
          <div className="text-xs text-center text-gray-500 dark:text-gray-400 font-medium">
            <span className="bg-white dark:bg-slate-800 px-2 py-1 rounded border border-gray-100 dark:border-slate-700 shadow-sm mr-2">
              Default Access
            </span>
            <code className="text-primary font-bold">admin / admin123</code>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
