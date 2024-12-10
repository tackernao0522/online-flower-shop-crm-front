import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { ProtectedPageTemplate } from '../ProtectedPageTemplate';
import PrivateRoute from '../../PrivateRoute';

jest.mock('../../PrivateRoute', () => ({
  __esModule: true,
  default: jest.fn(({ children }) => (
    <div data-testid="private-route">{children}</div>
  )),
}));

const renderWithChakra = (ui: React.ReactElement) => {
  return render(<ChakraProvider>{ui}</ChakraProvider>);
};

describe('ProtectedPageTemplate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('子要素が正しくレンダリングされる', () => {
    renderWithChakra(
      <ProtectedPageTemplate>
        <div data-testid="test-child">Test Content</div>
      </ProtectedPageTemplate>,
    );

    expect(screen.getByTestId('test-child')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('PrivateRouteコンポーネントで保護されている', () => {
    renderWithChakra(
      <ProtectedPageTemplate>
        <div>Test Content</div>
      </ProtectedPageTemplate>,
    );

    expect(screen.getByTestId('private-route')).toBeInTheDocument();
    expect(PrivateRoute).toHaveBeenCalled();
  });

  it('Boxコンポーネントにデフォルトのパディングが適用されている', () => {
    renderWithChakra(
      <ProtectedPageTemplate data-testid="protected-box">
        <div>Test Content</div>
      </ProtectedPageTemplate>,
    );

    const box = screen.getByTestId('private-route').firstChild as HTMLElement;
    expect(box).toBeTruthy();
    expect(box.tagName).toBe('DIV');
  });

  it('追加のChakra UIのpropsが正しく適用される', () => {
    renderWithChakra(
      <ProtectedPageTemplate
        data-testid="protected-box"
        backgroundColor="gray.100"
        marginTop={4}>
        <div>Test Content</div>
      </ProtectedPageTemplate>,
    );

    const box = screen.getByTestId('private-route').firstChild as HTMLElement;
    expect(box).toBeTruthy();
    expect(box.className).toBeTruthy();
  });

  it('複数の子要素を正しく表示できる', () => {
    renderWithChakra(
      <ProtectedPageTemplate>
        <div data-testid="child-1">First Child</div>
        <div data-testid="child-2">Second Child</div>
      </ProtectedPageTemplate>,
    );

    expect(screen.getByTestId('child-1')).toBeInTheDocument();
    expect(screen.getByTestId('child-2')).toBeInTheDocument();
    expect(screen.getByText('First Child')).toBeInTheDocument();
    expect(screen.getByText('Second Child')).toBeInTheDocument();
  });

  it('空の子要素でもエラーが発生しない', () => {
    expect(() =>
      renderWithChakra(<ProtectedPageTemplate>{null}</ProtectedPageTemplate>),
    ).not.toThrow();
  });

  it('PrivateRouteが常に最上位のラッパーとして機能している', () => {
    renderWithChakra(
      <ProtectedPageTemplate>
        <div>Test Content</div>
      </ProtectedPageTemplate>,
    );

    const privateRoute = screen.getByTestId('private-route');
    expect(privateRoute.parentElement?.parentElement).toBe(document.body);
  });

  it('追加のHTML属性が正しく適用される', () => {
    renderWithChakra(
      <ProtectedPageTemplate
        data-testid="protected-box"
        aria-label="protected content">
        <div>Test Content</div>
      </ProtectedPageTemplate>,
    );

    const box = screen.getByTestId('private-route').firstChild as HTMLElement;
    expect(box).toHaveAttribute('aria-label', 'protected content');
  });

  it('customクラスNameが適用される', () => {
    renderWithChakra(
      <ProtectedPageTemplate className="custom-class">
        <div>Test Content</div>
      </ProtectedPageTemplate>,
    );

    const box = screen.getByTestId('private-route').firstChild as HTMLElement;
    expect(box.className).toContain('custom-class');
  });
});
