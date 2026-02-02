'use client';

import * as React from 'react';
import { ThemeProvider } from './theme-provider';
import { ReduxProvider } from '@/store/provider';
import { Toaster } from 'sonner';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <ReduxProvider>
        {children}
        <Toaster position="top-right" richColors />
      </ReduxProvider>
    </ThemeProvider>
  );
}
