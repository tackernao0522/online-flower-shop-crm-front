'use client';

import OrderManagementTemplate from '@/components/templates/OrderManagementTemplate';
import { ProtectedPageTemplate } from '@/components/templates/ProtectedPageTemplate';

const OrdersPage = () => {
  return (
    <ProtectedPageTemplate>
      <OrderManagementTemplate />
    </ProtectedPageTemplate>
  );
};

export default OrdersPage;
