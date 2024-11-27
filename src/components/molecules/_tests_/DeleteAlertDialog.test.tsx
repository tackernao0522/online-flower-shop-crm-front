import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import DeleteAlertDialog from '../../molecules/DeleteAlertDialog';
import { ChakraProvider } from '@chakra-ui/react';

describe('DeleteAlertDialog', () => {
  const renderWithProvider = (ui: React.ReactElement) => {
    return render(<ChakraProvider>{ui}</ChakraProvider>);
  };

  it('ダイアログが表示されるとアイテム名が正しく表示される', () => {
    const { getByText } = renderWithProvider(
      <DeleteAlertDialog
        isOpen={true}
        onClose={() => {}}
        onConfirm={() => {}}
        itemName="山田 太郎"
        itemType="顧客"
      />,
    );

    expect(getByText('顧客を削除')).toBeInTheDocument();
    expect(
      getByText('本当に山田 太郎を削除しますか？この操作は取り消せません。'),
    ).toBeInTheDocument();
  });

  it('キャンセルボタンをクリックするとonCloseが呼び出される', () => {
    const mockOnClose = jest.fn();
    const { getByText } = renderWithProvider(
      <DeleteAlertDialog
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={() => {}}
        itemName="山田 太郎"
        itemType="顧客"
      />,
    );

    fireEvent.click(getByText('キャンセル'));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('削除ボタンをクリックするとonConfirmが呼び出される', () => {
    const mockOnConfirm = jest.fn();
    const { getByText } = renderWithProvider(
      <DeleteAlertDialog
        isOpen={true}
        onClose={() => {}}
        onConfirm={mockOnConfirm}
        itemName="山田 太郎"
        itemType="顧客"
      />,
    );

    fireEvent.click(getByText('削除'));
    expect(mockOnConfirm).toHaveBeenCalled();
  });

  it('ダイアログが閉じられると何も表示されない', () => {
    const { queryByText } = renderWithProvider(
      <DeleteAlertDialog
        isOpen={false}
        onClose={() => {}}
        onConfirm={() => {}}
        itemName="山田 太郎"
        itemType="顧客"
      />,
    );

    expect(queryByText('顧客を削除')).not.toBeInTheDocument();
  });
});
