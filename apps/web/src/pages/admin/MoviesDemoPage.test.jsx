import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';

import { Component as MoviesDemoPage } from './MoviesDemoPage';

describe('MoviesDemoPage (Task 1 Deliverable)', () => {
  function renderPage() {
    const router = createMemoryRouter([
      {
        path: '/admin/movies',
        element: <MoviesDemoPage />,
      },
    ], { initialEntries: ['/admin/movies'] });
    return render(<RouterProvider router={router} />);
  }

  it('renders the initial movie list in DataTable', () => {
    renderPage();
    expect(screen.getAllByText('Ngày Con Còn Mẹ').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Trại Giam Hạnh Phúc').length).toBeGreaterThan(0);
  });

  it('allows adding a new movie via Form + Zod validation', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: 'Thêm phim' }));

    const formPanel = screen.getByRole('heading', { name: 'Thêm phim' }).closest('section');
    expect(formPanel).toBeInTheDocument();

    // Trigger validation by clicking submit button inside the form panel
    const submitBtn = within(formPanel).getByRole('button', { name: 'Thêm phim' });
    await user.click(submitBtn);
    expect(await screen.findByText('Nhập tên phim')).toBeInTheDocument();

    // Fill valid data
    await user.type(screen.getByLabelText('Tên phim'), 'Phim Thử Nghiệm');
    await user.type(screen.getByLabelText('Tên gốc'), 'Test Movie');
    await user.type(screen.getByLabelText('Mô tả'), 'Mô tả ngắn gọn về bộ phim thử nghiệm.');
    await user.clear(screen.getByLabelText('Thời lượng (phút)'));
    await user.type(screen.getByLabelText('Thời lượng (phút)'), '120');
    await user.type(screen.getByLabelText('Ngày khởi chiếu'), '2026-12-01');
    await user.type(screen.getByLabelText('Đạo diễn'), 'Đạo Diễn A');
    await user.type(screen.getByLabelText('Diễn viên'), 'Diễn Viên B, Diễn Viên C');
    await user.type(screen.getByLabelText('Poster'), '/movies/test.jpg');
    await user.type(screen.getByLabelText('Trailer'), 'https://www.youtube.com/watch?v=test');
    await user.click(screen.getByLabelText('Hành Động'));

    await user.click(submitBtn);

    expect(await screen.findByText('Đã thêm “Phim Thử Nghiệm” vào danh sách.')).toBeInTheDocument();
    expect(screen.getByText('Phim Thử Nghiệm')).toBeInTheDocument();
  });

  it('blocks deleting a movie with active showtimes and provides business warning', async () => {
    const user = userEvent.setup();
    renderPage();

    // Find the row for movie-1 which has active showtimes
    const deleteButtons = screen.getAllByRole('button', { name: 'Xóa' });
    await user.click(deleteButtons[0]); // First row: Ngày Con Còn Mẹ (movie-1)

    expect(
      screen.getByText(/Không xóa “Ngày Con Còn Mẹ” vì còn suất chiếu đang lịch. Hãy chuyển trạng thái sang Đã kết thúc./),
    ).toBeInTheDocument();
  });
});
