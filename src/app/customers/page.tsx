'use client';

import CustomerManagementTemplate from '@/components/templates/CustomerManagementTemplate';
import { ProtectedPageTemplate } from '@/components/templates/ProtectedPageTemplate';

const CustomerManagementPage = () => {
  return (
    <ProtectedPageTemplate>
      <CustomerManagementTemplate />
    </ProtectedPageTemplate>
  );
};

export default CustomerManagementPage;
