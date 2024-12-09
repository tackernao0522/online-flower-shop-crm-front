import { render, screen } from '@testing-library/react';
import OrdersPage from '../page';
import OrderManagementTemplate from '@/components/templates/OrderManagementTemplate';
import { ProtectedPageTemplate } from '@/components/templates/ProtectedPageTemplate';

jest.mock('@/components/templates/OrderManagementTemplate', () => ({
  __esModule: true,
  default: jest.fn(() => (
    <div data-testid="order-management-template">Order Management Template</div>
  )),
}));

jest.mock('@/components/templates/ProtectedPageTemplate', () => ({
  ProtectedPageTemplate: jest.fn(({ children }) => (
    <div data-testid="protected-page-template">{children}</div>
  )),
}));

describe('OrdersPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('注文管理ページが正しくレンダリングされる', () => {
    render(<OrdersPage />);

    expect(screen.getByTestId('protected-page-template')).toBeInTheDocument();
    expect(screen.getByTestId('order-management-template')).toBeInTheDocument();
    expect(screen.getByText('Order Management Template')).toBeInTheDocument();
  });

  it('ProtectedPageTemplateが子コンポーネントをラップしている', () => {
    render(<OrdersPage />);

    const protectedTemplate = screen.getByTestId('protected-page-template');
    const orderManagementTemplate = screen.getByTestId(
      'order-management-template',
    );

    expect(protectedTemplate).toContainElement(orderManagementTemplate);
  });

  it('OrderManagementTemplateが正しく表示される', () => {
    render(<OrdersPage />);

    expect(OrderManagementTemplate).toHaveBeenCalled();
  });

  it('ProtectedPageTemplateが正しく表示される', () => {
    render(<OrdersPage />);

    expect(ProtectedPageTemplate).toHaveBeenCalled();
  });

  it('コンポーネントが正しい順序で入れ子になっている', () => {
    const { container } = render(<OrdersPage />);

    const protectedTemplate = screen.getByTestId('protected-page-template');
    const orderManagementTemplate = screen.getByTestId(
      'order-management-template',
    );

    expect(protectedTemplate.contains(orderManagementTemplate)).toBe(true);
    expect(container.firstChild).toBe(protectedTemplate);
  });
});
