import React from 'react';
import { cn } from '@/lib/utils';

export const FastCSSBackground = ({ isDarkMode }: { isDarkMode: boolean }) => (
  <div
    aria-hidden="true"
    className={cn(
      'fixed inset-0 -z-50 overflow-hidden pointer-events-none',
      isDarkMode ? 'bg-[#171d18]' : 'bg-[#f4f2e9]'
    )}
  >
    <div
      className="absolute inset-0"
      style={{
        background: isDarkMode
          ? 'radial-gradient(ellipse at 18% 14%, rgba(128, 153, 86, .16), transparent 34%), radial-gradient(ellipse at 86% 72%, rgba(83, 121, 94, .12), transparent 38%)'
          : 'radial-gradient(ellipse at 18% 14%, rgba(212, 247, 90, .2), transparent 34%), radial-gradient(ellipse at 86% 72%, rgba(114, 167, 143, .13), transparent 38%)',
      }}
    />
    <div
      className={cn(
        'absolute inset-0 opacity-[0.025]',
        isDarkMode ? 'bg-[radial-gradient(#fff_1px,transparent_1px)]' : 'bg-[radial-gradient(#1b211b_1px,transparent_1px)]'
      )}
      style={{ backgroundSize: '28px 28px' }}
    />
  </div>
);

export default FastCSSBackground;
