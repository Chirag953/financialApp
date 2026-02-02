'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { 
  Settings as SettingsIcon, 
  Save, 
  Globe, 
  Calendar,
  ShieldCheck,
  Bell
} from 'lucide-react';
import { useGetSettingsQuery, useUpdateSettingsMutation } from '@/store/services/api';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function SettingsPage() {
  const { data, isLoading } = useGetSettingsQuery();
  const [updateSettings, { isLoading: isUpdating }] = useUpdateSettingsMutation();
  const [settings, setSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    if (data?.settings) {
      setSettings(data.settings);
    }
  }, [data]);

  const handleChange = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSettings({ settings }).unwrap();
      toast.success('Settings updated successfully');
    } catch (error) {
      toast.error('Failed to update settings');
    }
  };

  const getFinancialYears = () => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    
    // Financial year in India usually starts in April
    const startYear = currentMonth >= 3 ? currentYear : currentYear - 1;
    
    const years = [];
    for (let i = 0; i < 6; i++) {
      const year = startYear - i;
      const nextYear = (year + 1).toString().slice(-2);
      years.push(`${year}-${nextYear}`);
    }
    return years;
  };

  const financialYears = getFinancialYears();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="grid gap-6">
          <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <SettingsIcon className="w-6 h-6 text-emerald-600" />
            System Settings
          </h1>
          <p className="text-slate-500 dark:text-slate-400">Manage your application preferences and global configurations.</p>
        </div>
        <Button 
          onClick={handleSubmit} 
          disabled={isUpdating}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm h-11 px-6 active:scale-[0.98] transition-all w-full sm:w-auto"
        >
          {isUpdating ? (
            'Saving...'
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-6">
        <Card className="shadow-sm border-slate-200 dark:border-slate-800 overflow-hidden">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-800 dark:text-slate-200">
              <Globe className="w-5 h-5 text-blue-500" />
              Application Details
            </CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400">Basic information about the system.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div className="grid gap-2.5">
              <Label htmlFor="app_name" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Application Name</Label>
              <Input 
                id="app_name" 
                value={settings.app_name || ''} 
                onChange={(e) => handleChange('app_name', e.target.value)}
                placeholder="Scheme Mapping System"
                className="h-11 border-slate-200 dark:border-slate-800 focus-visible:ring-emerald-500 bg-white dark:bg-slate-900"
              />
            </div>
            <div className="grid gap-2.5">
              <Label htmlFor="financial_year" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Financial Year</Label>
              <Select 
                value={settings.financial_year} 
                onValueChange={(value) => handleChange('financial_year', value)}
              >
                <SelectTrigger id="financial_year" className="w-full h-11 border-slate-200 dark:border-slate-800 focus:ring-emerald-500 bg-white dark:bg-slate-900">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2.5 text-slate-400" />
                    <SelectValue placeholder="Select financial year" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {financialYears.map((year) => (
                    <SelectItem key={year} value={year} className="py-3">
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[11px] text-slate-400 ml-1">This will be used as the default period for all calculations.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200 dark:border-slate-800 overflow-hidden">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-800 dark:text-slate-200">
              <Bell className="w-5 h-5 text-orange-500" />
              System Security
            </CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400">Configure how the system handles security and logging.</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 transition-colors">
              <div className="space-y-1">
                <Label className="text-base font-bold text-slate-900 dark:text-slate-100">Audit Logging</Label>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">Track all administrative actions for security purposes. This cannot be disabled for security compliance.</p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full text-[10px] font-bold uppercase tracking-widest border border-emerald-200 dark:border-emerald-800 shadow-sm whitespace-nowrap">
                <ShieldCheck className="w-3.5 h-3.5" />
                Always On
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
