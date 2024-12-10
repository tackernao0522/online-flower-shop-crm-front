import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { OrderCountDisplay } from '../OrderCountDisplay';

describe('OrderCountDisplay', () => {
  it('総注文リスト数のみを表示する場合に正しいテキストが表示される', () => {
    render(
      <OrderCountDisplay
        totalCount={12345}
        currentCount={0}
        showTotalCountOnly={true}
      />,
    );
    expect(screen.getByText('総注文リスト数: 12,345')).toBeInTheDocument();
  });

  it('現在の注文数が総注文数より少ない場合に正しいテキストが表示される', () => {
    render(<OrderCountDisplay totalCount={12345} currentCount={5678} />);
    expect(
      screen.getByText('5,678 件を表示中 (全 12,345 件)'),
    ).toBeInTheDocument();
  });

  it('現在の注文数が総注文数以上の場合に正しいテキストが表示される', () => {
    render(<OrderCountDisplay totalCount={12345} currentCount={12345} />);
    expect(screen.getByText('全 12,345 件を表示中')).toBeInTheDocument();
  });

  it('現在の注文数が総注文数を超える場合にも正しいテキストが表示される', () => {
    render(<OrderCountDisplay totalCount={12345} currentCount={15000} />);
    expect(screen.getByText('全 12,345 件を表示中')).toBeInTheDocument();
  });
});
