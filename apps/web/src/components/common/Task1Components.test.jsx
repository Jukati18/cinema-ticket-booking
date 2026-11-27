import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { z } from 'zod';

import AdminLayout from '../../layouts/AdminLayout';
import { DataTable } from './DataTable';
import { Form, TextField, SelectField, CheckboxGroup, useZodForm } from './Form';

describe('AdminLayout', () => {
  it('renders branding, sidebar navigation and outlet content', async () => {
    const router = createMemoryRouter([
      {
        path: '/admin',
        element: <AdminLayout />,
        children: [{ path: 'movies', element: <div>Nội dung quản lý phim</div> }],
      },
    ], { initialEntries: ['/admin/movies'] });

    render(<RouterProvider router={router} />);

    expect(screen.getByRole('link', { name: 'CineVibe quản trị' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Quản lý phim' })).toBeInTheDocument();
    expect(screen.getByText('Nội dung quản lý phim')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Về trang khách' })).toHaveAttribute('href', '/movies');
  });
});

describe('DataTable', () => {
  const columns = [
    { id: 'title', header: 'Tên phim', cell: (row) => row.title },
    { id: 'director', header: 'Đạo diễn', cell: (row) => row.director },
  ];
  const rows = [
    { id: '1', title: 'Ngày Con Còn Mẹ', director: 'Vũ Ngọc Đãng' },
    { id: '2', title: 'Trại Giam Hạnh Phúc', director: 'Trung Lùn' },
    { id: '3', title: 'Godzilla Trừ Không', director: 'Takashi Yamazaki' },
  ];

  it('filters rows based on search input and resets page to 1', async () => {
    const user = userEvent.setup();
    render(
      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(row) => row.id}
        getSearchText={(row) => `${row.title} ${row.director}`}
        pageSize={2}
        searchPlaceholder="Tìm kiếm phim..."
      />,
    );

    expect(screen.getByText('Ngày Con Còn Mẹ')).toBeInTheDocument();
    expect(screen.getByText('Trại Giam Hạnh Phúc')).toBeInTheDocument();
    expect(screen.queryByText('Godzilla Trừ Không')).not.toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText('Tìm kiếm phim...');
    await user.type(searchInput, 'Godzilla');

    expect(screen.getByText('Godzilla Trừ Không')).toBeInTheDocument();
    expect(screen.queryByText('Ngày Con Còn Mẹ')).not.toBeInTheDocument();
    expect(screen.getByText('1–1 / 1')).toBeInTheDocument();
  });

  it('paginates correctly when clicking next and previous buttons', async () => {
    const user = userEvent.setup();
    render(
      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(row) => row.id}
        getSearchText={(row) => row.title}
        pageSize={2}
      />,
    );

    expect(screen.getByText('Trang 1/2')).toBeInTheDocument();
    const nextBtn = screen.getByRole('button', { name: 'Sau' });
    await user.click(nextBtn);

    expect(screen.getByText('Godzilla Trừ Không')).toBeInTheDocument();
    expect(screen.getByText('Trang 2/2')).toBeInTheDocument();

    const prevBtn = screen.getByRole('button', { name: 'Trước' });
    await user.click(prevBtn);

    expect(screen.getByText('Trang 1/2')).toBeInTheDocument();
  });
});

const testSchema = z.object({
  title: z.string().min(1, 'Tiêu đề không được để trống'),
  status: z.string().min(1, 'Vui lòng chọn trạng thái'),
  genres: z.array(z.string()).min(1, 'Chọn ít nhất 1 thể loại'),
});

function TestFormWrapper({ onSubmit }) {
  const methods = useZodForm(testSchema, {
    defaultValues: { title: '', status: '', genres: [] },
  });
  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <TextField name="title" label="Tiêu đề" />
      <SelectField
        name="status"
        label="Trạng thái"
        placeholder="Chọn trạng thái"
        options={[{ value: 'active', label: 'Hoạt động' }]}
      />
      <CheckboxGroup
        name="genres"
        label="Thể loại"
        options={[{ value: 'action', label: 'Hành động' }, { value: 'drama', label: 'Tâm lý' }]}
      />
      <button type="submit">Gửi</button>
    </Form>
  );
}

describe('Form components', () => {
  it('validates fields with Zod and displays field-level error messages', async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();
    render(<TestFormWrapper onSubmit={handleSubmit} />);

    await user.click(screen.getByRole('button', { name: 'Gửi' }));

    screen.debug();

    // Use findAllByText and check length to be more robust
    expect(await screen.findAllByText('Tiêu đề không được để trống')).toHaveLength(1);
    expect(await screen.findAllByText('Vui lòng chọn trạng thái')).toHaveLength(1);
    expect(await screen.findAllByText('Chọn ít nhất 1 thể loại')).toHaveLength(1);
    expect(handleSubmit).not.toHaveBeenCalled();

    await user.type(screen.getByLabelText('Tiêu đề'), 'Phim Mới');
    await user.selectOptions(screen.getByLabelText('Trạng thái'), 'active');
    await user.click(screen.getByLabelText('Hành động'));

    await user.click(screen.getByRole('button', { name: 'Gửi' }));

    expect(handleSubmit).toHaveBeenCalledWith(
      {
        title: 'Phim Mới',
        status: 'active',
        genres: ['action'],
      },
      expect.anything(),
    );
  });
});

