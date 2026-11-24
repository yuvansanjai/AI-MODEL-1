import React, { ReactNode } from 'react';
import { useApp } from '../contexts/AppContext';
import { ChildrenLayout } from '../themes/children/ChildrenLayout';
import { TeenagerLayout } from '../themes/teenagers/TeenagerLayout';
import { AdultLayout } from '../themes/adults/AdultLayout';

export const ThemeLayout: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { ageGroup } = useApp();

  if (ageGroup === 'children') {
    return <ChildrenLayout>{children}</ChildrenLayout>;
  }

  if (ageGroup === 'teenagers') {
    return <TeenagerLayout>{children}</TeenagerLayout>;
  }

  return <AdultLayout>{children}</AdultLayout>;
};
