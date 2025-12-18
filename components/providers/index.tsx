import type { PropsWithChildren } from 'react';
import { ThemeProvider } from './theme-provider';

function Providers({ children }: PropsWithChildren) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  );
}

export { Providers };
