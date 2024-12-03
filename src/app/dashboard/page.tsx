'use client';

import DashboardTemplate from '@/components/templates/DashboardTemplate';
import { ProtectedPageTemplate } from '@/components/templates/ProtectedPageTemplate';

const DashboardPage = () => {
  return (
    <ProtectedPageTemplate>
      <DashboardTemplate />
    </ProtectedPageTemplate>
  );
};

export default DashboardPage;
