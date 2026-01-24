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
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { LanguageSwitcher } from '@/components/language-switcher';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();
  const t = useTranslations('Navigation');

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
    <div className="flex h-screen bg-slate-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-40 lg:hidden ${isSidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setIsSidebarOpen(false)}></div>
        <div className="fixed inset-y-0 left-0 flex flex-col w-64 bg-white border-r">
          <div className="flex items-center justify-between h-16 px-4 border-b">
            <span className="text-xl font-bold text-primary">Grant-001</span>
            <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)}>
              <X className="w-6 h-6" />
            </Button>
          </div>
          <ScrollArea className="flex-1 px-2 py-4">
            <nav className="space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href as any}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md group ${
                    pathname.includes(item.href)
                      ? 'bg-primary text-white'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              ))}
            </nav>
          </ScrollArea>
          <div className="p-4 border-t">
            <Button variant="ghost" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50" onClick={handleLogout}>
              <LogOut className="w-5 h-5 mr-3" />
              {t('logout')}
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:shrink-0 lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-1 min-h-0 bg-white border-r">
          <div className="flex items-center h-16 px-4 border-b">
            <span className="text-xl font-bold text-primary">Grant-001</span>
          </div>
          <ScrollArea className="flex-1 px-2 py-4">
            <nav className="space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href as any}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md group ${
                    pathname.includes(item.href)
                      ? 'bg-primary text-white'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              ))}
            </nav>
          </ScrollArea>
          <div className="p-4 border-t">
            <Button variant="ghost" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50" onClick={handleLogout}>
              <LogOut className="w-5 h-5 mr-3" />
              {t('logout')}
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="flex items-center justify-between h-16 px-4 bg-white border-b lg:px-8">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setIsSidebarOpen(true)}>
            <Menu className="w-6 h-6" />
          </Button>
          <div className="flex items-center space-x-4 ml-auto">
            <LanguageSwitcher />
            <div className="h-6 w-px bg-gray-200 mx-2" />
            <span className="text-sm font-medium text-gray-700">System Admin</span>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
              SA
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-8 bg-slate-50">
          {children}
        </main>
      </div>
    </div>
  );
}
