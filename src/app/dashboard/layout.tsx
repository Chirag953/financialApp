'use client';

import { useState } from 'react';
import { 
  LayoutDashboard, 
  Building2, 
  FileText, 
  Tags, 
  Map as MapIcon, 
  LogOut, 
  Menu, 
  X,
  History,
  User,
  Settings,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/theme-toggle';
import { useGetMeQuery, useGetSettingsQuery } from '@/store/services/api';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const pathname = usePathname();
  const { data: userData } = useGetMeQuery();
  const { data: settingsData } = useGetSettingsQuery();
  const user = userData?.user;
  const appName = settingsData?.settings?.app_name || "Scheme Mapping System";

  const navigation = [
    { name: "Dashboard", href: '/dashboard', icon: LayoutDashboard },
    { name: "Departments", href: '/dashboard/departments', icon: Building2 },
    { name: "Schemes", href: '/dashboard/schemes', icon: FileText },
    { name: "Categories", href: '/dashboard/categories', icon: Tags },
    { name: "Mapping", href: '/dashboard/mappings', icon: MapIcon, role: 'ADMIN' },
    { name: "Audit Logs", href: '/dashboard/audit-logs', icon: History, role: 'ADMIN' },
    { name: "Users", href: '/dashboard/users', icon: User, role: 'ADMIN' },
    { name: "Settings", href: '/dashboard/settings', icon: Settings, role: 'ADMIN' },
  ].filter(item => !item.role || user?.role === item.role);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/';
  };

  return (
    <div className="flex h-screen bg-emerald-50/30 dark:bg-slate-950">
      <AlertDialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <AlertDialogTitle>Logout Confirmation</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="pt-2 text-base">
              Are you sure you want to logout from the system?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600 text-white"
            >
              Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-40 lg:hidden ${isSidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)}></div>
        <div className="fixed inset-y-0 left-0 flex flex-col w-64 bg-white dark:bg-slate-900 border-r dark:border-slate-800 shadow-xl">
          <div className="flex items-center justify-between h-16 px-6 border-b dark:border-slate-800 bg-gradient-to-br from-emerald-600 to-blue-700">
            <div className="flex items-center gap-3">
              <div className="relative w-9 h-9 flex items-center justify-center overflow-hidden rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
                <Image 
                  src="/logo.jpeg" 
                  alt="Logo" 
                  fill
                  className="object-cover scale-110" 
                />
              </div>
              <span className="text-white font-bold tracking-tight">{appName}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)} className="text-white hover:bg-white/20">
              <X className="w-5 h-5" />
            </Button>
          </div>
          <ScrollArea className="flex-1 px-4 py-4">
            <nav className="space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                    pathname === item.href
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
                      : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50'
                  }`}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              ))}
            </nav>
          </ScrollArea>
          
          <div className="p-4 border-t dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex items-center gap-3 p-3 mb-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-md border-2 border-white dark:border-slate-700">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user?.name || 'User'}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate capitalize">{user?.role?.toLowerCase() || 'Member'}</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="default" 
              onClick={() => {
                setIsSidebarOpen(false);
                setIsLogoutDialogOpen(true);
              }}
              className="w-full gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 border-red-100 dark:border-red-900/30"
            >
              <LogOut className="w-4 h-4" />
              Logout from System
            </Button>
          </div>
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white dark:bg-slate-900 shadow-[var(--depth-shadow)]">
        <div className="flex items-center h-16 px-6 bg-gradient-to-br from-emerald-600 to-blue-700">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 flex items-center justify-center overflow-hidden rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
              <Image 
                src="/logo.jpeg" 
                alt="Logo" 
                fill
                className="object-cover scale-110" 
              />
            </div>
            <span className="text-white font-bold tracking-tight text-lg">{appName}</span>
          </div>
        </div>
        <ScrollArea className="flex-1 px-4 py-6">
          <nav className="space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 group ${
                  pathname === item.href
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 shadow-sm border border-emerald-100/50 dark:border-emerald-800/50'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-200'
                }`}
              >
                <item.icon className={`w-5 h-5 transition-colors ${pathname === item.href ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
                {item.name}
              </Link>
            ))}
          </nav>
        </ScrollArea>
        <div className="p-4 border-t dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30">
          <div className="flex items-center gap-3 px-3 py-3 mb-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-md border-2 border-white dark:border-slate-700">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user?.name || 'User'}</p>
              <div className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate capitalize">{user?.role?.toLowerCase() || 'Member'}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between gap-2">
            <ThemeToggle />
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsLogoutDialogOpen(true)}
              className="flex-1 gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 shadow-[var(--depth-shadow)]"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 lg:pl-64 min-h-0 overflow-hidden">
        <header className="flex items-center justify-between h-16 px-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md sticky top-0 z-30 border-b dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-4 lg:hidden">
            <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)} className="hover:bg-slate-100 dark:hover:bg-slate-800">
              <Menu className="w-6 h-6" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="relative w-8 h-8 flex items-center justify-center overflow-hidden rounded-lg bg-emerald-600/10 dark:bg-emerald-400/10 border border-emerald-600/20 dark:border-emerald-400/20 shadow-sm">
                <Image 
                  src="/logo.jpeg" 
                  alt="Logo" 
                  fill
                  className="object-cover scale-110" 
                />
              </div>
              <span className="font-bold text-slate-900 dark:text-white tracking-tight">{appName}</span>
            </div>
          </div>
          <div className="hidden lg:flex items-center gap-2 text-sm">
            <Link href="/dashboard" className="text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 transition-colors">
              Dashboard
            </Link>
            {pathname !== '/dashboard' && (
              <>
                <span className="text-slate-300 dark:text-slate-700 mx-1">/</span>
                <span className="text-slate-900 dark:text-white font-semibold capitalize">
                  {pathname.split('/').pop()?.replace(/-/g, ' ')}
                </span>
              </>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end mr-2">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Last Updated</p>
              <p className="text-xs font-bold text-slate-900 dark:text-white">{new Date().toLocaleDateString()}</p>
            </div>
            <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-800 mx-2 hidden sm:block"></div>
            <ThemeToggle />
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsLogoutDialogOpen(true)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50/50 dark:bg-slate-950/50">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
