'use client';

import { ProtectedPageTemplate } from '@/components/templates/ProtectedPageTemplate';
import UserManagementTemplate from '@/components/templates/UserManagementTemplate';

const UserManagementPage: React.FC = () => {
  return (
    <ProtectedPageTemplate>
      <UserManagementTemplate />
    </ProtectedPageTemplate>
  );
};

export default UserManagementPage;
