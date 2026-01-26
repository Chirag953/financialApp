'use client';

import { useState, useEffect } from 'react';
import { useGetSettingsQuery, useUpdateSettingsMutation } from '@/store/services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Settings as SettingsIcon, Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function SettingsPage() {
  const t = useTranslations('Settings');
  const { data, isLoading } = useGetSettingsQuery();
  const [updateSettings, { isLoading: isUpdating }] = useUpdateSettingsMutation();

  const [formData, setFormData] = useState<Record<string, string>>({
    systemName: '',
    systemNameHn: '',
    fiscalYear: '',
    maintenanceMode: 'false'
  });

  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const fiscalYears = [
    '2023-24',
    '2024-25',
    '2025-26',
    '2026-27',
    '2027-28'
  ];

  useEffect(() => {
    if (data?.settings) {
      setFormData({
        systemName: data.settings.systemName || 'Scheme Mapping System',
        systemNameHn: data.settings.systemNameHn || 'योजना मानचित्रण प्रणाली',
        fiscalYear: data.settings.fiscalYear || '2025-26',
        maintenanceMode: data.settings.maintenanceMode || 'false'
      });
    }
  }, [data]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    try {
      await updateSettings({ settings: formData }).unwrap();
      setMessage({ type: 'success', text: t('success') });
    } catch (err) {
      setMessage({ type: 'error', text: t('error') });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Card>
          <CardHeader><Skeleton className="h-6 w-32" /></CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{t('title')}</h1>
        <p className="text-gray-500 dark:text-gray-400">{t('subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        {message && (
          <div className={`p-4 rounded-md flex items-center ${
            message.type === 'success' 
              ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800' 
              : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
          }`}>
            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 mr-2" /> : <AlertCircle className="w-5 h-5 mr-2" />}
            {message.text}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <SettingsIcon className="w-5 h-5 mr-2 text-primary" />
              {t('global')}
            </CardTitle>
            <CardDescription>
              General system-wide configuration parameters.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="systemName">{t('systemName')}</Label>
              <Input 
                id="systemName" 
                value={formData.systemName} 
                onChange={(e) => setFormData({ ...formData, systemName: e.target.value })} 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="systemNameHn">{t('systemNameHn')}</Label>
              <Input 
                id="systemNameHn" 
                value={formData.systemNameHn} 
                onChange={(e) => setFormData({ ...formData, systemNameHn: e.target.value })} 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="fiscalYear">{t('fiscalYear')}</Label>
              <Select 
                value={formData.fiscalYear} 
                onValueChange={(val) => setFormData({ ...formData, fiscalYear: val })}
              >
                <SelectTrigger id="fiscalYear">
                  <SelectValue placeholder="Select Fiscal Year" />
                </SelectTrigger>
                <SelectContent>
                  {fiscalYears.map((year) => (
                    <SelectItem key={year} value={year}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between pt-4">
              <div className="space-y-0.5">
                <Label htmlFor="maintenance">{t('maintenance')}</Label>
                <p className="text-sm text-gray-500">Temporarily disable public access to the system.</p>
              </div>
              <Switch 
                id="maintenance" 
                checked={formData.maintenanceMode === 'true'} 
                onCheckedChange={(checked: boolean) => setFormData({ ...formData, maintenanceMode: String(checked) })} 
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={isUpdating} className="w-full sm:w-auto">
            <Save className="w-4 h-4 mr-2" />
            {isUpdating ? t('saving') : t('save')}
          </Button>
        </div>
      </form>
    </div>
  );
}
