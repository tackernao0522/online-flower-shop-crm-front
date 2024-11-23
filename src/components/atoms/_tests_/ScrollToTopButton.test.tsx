import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ScrollToTopButton from '../ScrollToTopButton';

const scrollToMock = jest.fn();
Object.defineProperty(window, 'scrollTo', { value: scrollToMock });

Object.defineProperty(window, 'pageYOffset', {
  value: 400,
  writable: true,
});

describe('ScrollToTopButton', () => {
  beforeEach(() => {
    scrollToMock.mockClear();
  });

  it('スクロール位置が閾値を超えている場合、ボタンが表示される', () => {
    const { getByRole } = render(<ScrollToTopButton threshold={300} />);
    const button = getByRole('button', { name: 'トップに戻る' });
    expect(button).toBeInTheDocument();
  });

  it('クリック時にトップにスクロールする', () => {
    const { getByRole } = render(<ScrollToTopButton threshold={300} />);
    const button = getByRole('button', { name: 'トップに戻る' });

    fireEvent.click(button);
    expect(scrollToMock).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });

  it('ボタンのスタイルが正しく適用されている', () => {
    const { getByRole } = render(
      <ScrollToTopButton
        threshold={300}
        bottom="60px"
        right="60px"
        colorScheme="teal"
      />,
    );

    const button = getByRole('button', { name: 'トップに戻る' });
    expect(button).toHaveStyle({
      position: 'fixed',
      bottom: '60px',
      right: '60px',
    });
  });
});
