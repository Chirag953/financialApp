'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
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
  ExternalLink,
  Github,
  Mail,
  Phone,
  MapPin,
  AlertCircle
} from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { LanguageSwitcher } from '@/components/language-switcher';
import { ThemeToggle } from '@/components/theme-toggle';
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
  const t = useTranslations('Navigation');
  const tf = useTranslations('Footer');
  const td = useTranslations('Departments');

  const navigation = [
    { name: t('dashboard'), href: '/dashboard', icon: LayoutDashboard },
    { name: t('departments'), href: '/dashboard/departments', icon: Building2 },
    { name: t('schemes'), href: '/dashboard/schemes', icon: FileText },
    { name: t('categories'), href: '/dashboard/categories', icon: Tags },
    { name: t('mapping'), href: '/dashboard/mappings', icon: MapIcon },
    { name: t('auditLogs'), href: '/dashboard/audit-logs', icon: History },
    { name: t('users'), href: '/dashboard/users', icon: User },
    { name: t('settings'), href: '/dashboard/settings', icon: Settings },
  ];

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
              <AlertDialogTitle>{td('logoutConfirm')}</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="pt-2 text-base">
              {td('logoutMessage')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel>{td('cancel')}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600 text-white"
            >
              {t('logout')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-40 lg:hidden ${isSidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)}></div>
        <div className="fixed inset-y-0 left-0 flex flex-col w-64 bg-white dark:bg-slate-900 border-r dark:border-slate-800 shadow-xl">
          <div className="flex items-center justify-between h-16 px-6 border-b dark:border-slate-800 bg-gradient-to-br from-emerald-600 to-blue-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-white overflow-hidden flex items-center justify-center shadow-md">
                <Image 
                  src="/logo.jpeg" 
                  alt="Scheme Mapping System" 
                  width={40} 
                  height={40} 
                  className="object-contain"
                  priority
                />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">Scheme Mapping System</span>
            </div>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={() => setIsSidebarOpen(false)}>
              <X className="w-6 h-6" />
            </Button>
          </div>
          <ScrollArea className="flex-1 px-3 py-6">
            <nav className="space-y-1.5">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href as any}
                  className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group ${
                    pathname.includes(item.href)
                      ? 'bg-gradient-to-r from-emerald-600 to-blue-600 text-white shadow-md shadow-emerald-500/20'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-emerald-600 dark:hover:text-emerald-400'
                  }`}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <item.icon className={`w-5 h-5 mr-3 transition-colors ${
                    pathname.includes(item.href) ? 'text-white' : 'text-slate-400 group-hover:text-emerald-500'
                  }`} />
                  {item.name}
                </Link>
              ))}
            </nav>
          </ScrollArea>
          <div className="p-4 border-t dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <Button variant="ghost" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors" onClick={() => setIsLogoutDialogOpen(true)}>
              <LogOut className="w-5 h-5 mr-3" />
              {t('logout')}
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:shrink-0 lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-1 min-h-0 bg-white dark:bg-slate-900 border-r dark:border-slate-800 shadow-sm">
          <div className="flex items-center h-16 px-6 border-b dark:border-slate-800 bg-gradient-to-br from-emerald-600 to-blue-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-white overflow-hidden flex items-center justify-center shadow-md">
                <Image 
                  src="/logo.jpeg" 
                  alt="Scheme Mapping System" 
                  width={40} 
                  height={40} 
                  className="object-contain"
                />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">Scheme Mapping System</span>
            </div>
          </div>
          <ScrollArea className="flex-1 px-3 py-6">
            <nav className="space-y-1.5">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href as any}
                  className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group ${
                    pathname.includes(item.href)
                      ? 'bg-gradient-to-r from-emerald-600 to-blue-600 text-white shadow-md shadow-emerald-500/20'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-emerald-600 dark:hover:text-emerald-400'
                  }`}
                >
                  <item.icon className={`w-5 h-5 mr-3 transition-colors ${
                    pathname.includes(item.href) ? 'text-white' : 'text-slate-400 group-hover:text-emerald-500'
                  }`} />
                  {item.name}
                </Link>
              ))}
            </nav>
          </ScrollArea>
          <div className="p-4 border-t dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <Button variant="ghost" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors" onClick={() => setIsLogoutDialogOpen(true)}>
              <LogOut className="w-5 h-5 mr-3" />
              {t('logout')}
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="flex items-center justify-between h-16 px-4 md:px-6 bg-white dark:bg-slate-900 border-b dark:border-slate-800 shadow-sm sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="lg:hidden hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => setIsSidebarOpen(true)}>
              <Menu className="w-6 h-6" />
            </Button>
            <div className="lg:hidden flex items-center space-x-2">
              <div className="w-9 h-9 rounded-lg bg-white overflow-hidden flex items-center justify-center shadow-sm border dark:border-slate-800">
                <Image 
                  src="/logo.jpeg" 
                  alt="Scheme Mapping System" 
                  width={36} 
                  height={36} 
                  className="object-contain"
                />
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2 md:space-x-4">
            <div className="flex items-center space-x-1 md:space-x-2">
              <ThemeToggle />
              <LanguageSwitcher />
            </div>
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1 md:mx-2" />
            <div className="flex items-center gap-3 pl-1">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 leading-none">System Admin</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">Administrator</span>
              </div>
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center text-white text-xs md:text-sm font-bold shadow-sm ring-2 ring-white dark:ring-slate-800">
                SA
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-slate-50/50 dark:bg-slate-950/50 backdrop-blur-3xl min-h-[calc(100vh-4rem)] flex flex-col">
          <div className="flex-1">
            {children}
          </div>
          
          <footer className="mt-auto pt-8 md:pt-12 pb-6">
            <div className="rounded-2xl md:rounded-3xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl p-6 md:p-8 lg:p-10 transition-all duration-300 hover:bg-white/60 dark:hover:bg-slate-900/60">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 mb-12">
                <div className="space-y-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-xl bg-white overflow-hidden flex items-center justify-center shadow-lg border dark:border-slate-800">
                      <Image 
                        src="/logo.jpeg" 
                        alt="Scheme Mapping System" 
                        width={48} 
                        height={48} 
                        className="object-contain"
                      />
                    </div>
                    <span className="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-blue-600 dark:from-emerald-400 dark:to-blue-400">
                      {tf('systemName')}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    {tf('description')}
                  </p>
                  <div className="flex space-x-3">
                    <a href="#" className="w-9 h-9 rounded-full bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-slate-500 hover:bg-emerald-500 hover:text-white dark:hover:bg-emerald-600 transition-all duration-300">
                      <Github className="w-4 h-4" />
                    </a>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">{tf('quickLinks')}</h4>
                  <ul className="grid grid-cols-1 gap-3 text-sm text-slate-500 dark:text-slate-400">
                    {navigation.slice(0, 4).map((item) => (
                      <li key={item.name}>
                        <Link href={item.href as any} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center group">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 mr-2 group-hover:bg-emerald-500 transition-colors"></span>
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-6">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">{tf('support')}</h4>
                  <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400">
                    <li>
                      <a href="#" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center group">
                        <ExternalLink className="w-4 h-4 mr-2 opacity-50 group-hover:opacity-100" />
                        {tf('privacy')}
                      </a>
                    </li>
                    <li>
                      <a href="#" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center group">
                        <ExternalLink className="w-4 h-4 mr-2 opacity-50 group-hover:opacity-100" />
                        {tf('terms')}
                      </a>
                    </li>
                    <li className="pt-2">
                      <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                        {tf('version')}
                      </div>
                    </li>
                  </ul>
                </div>

                <div className="space-y-6">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">{tf('contact')}</h4>
                  <ul className="space-y-4 text-sm text-slate-500 dark:text-slate-400">
                    <li className="flex items-start">
                      <Mail className="w-4 h-4 mr-3 mt-0.5 text-emerald-500" />
                      <span className="break-all">{tf('email')}</span>
                    </li>
                    <li className="flex items-start">
                      <Phone className="w-4 h-4 mr-3 mt-0.5 text-emerald-500" />
                      <span>{tf('phone')}</span>
                    </li>
                    <li className="flex items-start">
                      <MapPin className="w-4 h-4 mr-3 mt-0.5 text-emerald-500" />
                      <span>{tf('address')}</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
                <p className="text-xs font-medium text-slate-400 dark:text-slate-500">
                  {tf('copyright')}
                </p>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800/50">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">System Live</span>
                  </div>
                </div>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
