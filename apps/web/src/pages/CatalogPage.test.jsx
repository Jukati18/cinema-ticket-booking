import { vi, it, expect } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { createMemoryRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Component as Catalog } from './CatalogPage';
import { cinemaApi } from '../lib/cinema-api';
vi.mock('../lib/cinema-api', () => ({ cinemaApi: { getCinemas: vi.fn().mockResolvedValue([]), getMovies: vi.fn(), getShowtimes: vi.fn() } }));
it('waits safely when movies resolve before the showtime list', async () => {
 let resolveShows;
 cinemaApi.getMovies.mockResolvedValue([{ id: 'm1', title: 'Phim thử', durationMinutes: 90, genres: ['Tâm lý'], posterUrl: '/stitch/mai.jpg', synopsis: 'Nội dung minh họa' }]);
 cinemaApi.getShowtimes.mockReturnValue(new Promise((resolve) => { resolveShows = resolve; }));
 const router = createMemoryRouter([{ path: '/', element: <Catalog /> }]);
 render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}><RouterProvider router={router} /></QueryClientProvider>);
 expect(await screen.findByRole('status')).toHaveTextContent('Đang tải');
 // Let the movie query settle while the independent showtime query is still pending.
 await act(async () => { await new Promise((r) => setTimeout(r, 50)); });
 expect(screen.queryByText('Unexpected Application Error!')).not.toBeInTheDocument();
 await act(async () => { resolveShows([]); });
 expect(await screen.findByRole('heading', { name: 'Phim thử', level: 1 })).toBeVisible();
 expect(screen.getByRole('button', { name: 'Chọn ghế', exact: true })).toBeDisabled();
});
