import React from 'react';
import { render, screen } from '@testing-library/react';
import { LoadingSpinner } from '../LoadingSpinner';
import '@testing-library/jest-dom';

describe('LoadingSpinner コンポーネント', () => {
  test('hasMoreがfalseの場合、何も表示しない', () => {
    render(<LoadingSpinner hasMore={false} status="loading" />);
    const spinner = screen.queryByText('Loading...');
    expect(spinner).not.toBeInTheDocument();
  });

  test('statusがloading以外の場合、何も表示しない', () => {
    render(<LoadingSpinner hasMore={true} status="idle" />);
    const spinner = screen.queryByText('Loading...');
    expect(spinner).not.toBeInTheDocument();
  });

  test('hasMoreがtrueかつstatusがloadingの場合、Spinnerを表示する', () => {
    render(<LoadingSpinner hasMore={true} status="loading" />);
    const spinner = screen.getByText('Loading...');
    expect(spinner).toBeInTheDocument();
  });

  test('Spinnerが中央に表示される', () => {
    const { container } = render(
      <LoadingSpinner hasMore={true} status="loading" />,
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
