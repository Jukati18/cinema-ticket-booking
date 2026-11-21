import { it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SeatMap from './SeatMap';
import { getRoomLayout } from '../mocks/room-layouts';
import { mockApi } from '../mocks/cinema';
it('prevents selecting sold seats and exposes selection to assistive tech', async () => {
  const onChange = vi.fn();
  render(<SeatMap seats={[{ id: 'A1', row: 'A', status: 'available', type: 'standard' }, { id: 'A2', row: 'A', status: 'sold', type: 'standard' }]} selected={['A1']} onChange={onChange} />);
  expect(screen.getByRole('button', { name: /Ghế A2/ })).toBeDisabled();
  expect(screen.getByRole('button', { name: /Ghế A1/ })).toHaveAttribute('aria-pressed', 'true');
  await userEvent.click(screen.getByRole('button', { name: /Ghế A1/ })); expect(onChange).toHaveBeenCalledWith([]);
});
it('renders a couple as one wide button and selects both seat IDs', async () => {
 const data = await mockApi.getSeats('show-1-1'); const onChange = vi.fn();
 render(<SeatMap seats={data.seats} layout={data.layout} selected={[]} onChange={onChange} />);
 const pair = screen.getByRole('button', { name: /Ghế G1–G2, ghế đôi/ });
 await userEvent.click(pair); expect(onChange).toHaveBeenCalledWith(['G1', 'G2']);
 expect(screen.queryByRole('button', { name: /^Ghế G2,/ })).not.toBeInTheDocument();
 expect(screen.getByRole('button', { name: /^Ghế A12,/ })).toHaveTextContent('A12');
 expect(screen.getByText('Lối vào')).toBeVisible(); expect(screen.getByText('Lối ra')).toBeVisible();
});
it('locks a whole couple if either partner is held', async () => {
 const data = await mockApi.getSeats('show-1-1'); data.seats.find((s) => s.id === 'G2').status = 'held';
 render(<SeatMap seats={data.seats} layout={data.layout} selected={[]} onChange={vi.fn()} />);
 expect(screen.getByRole('button', { name: /Ghế G1–G2, ghế đôi/ })).toBeDisabled();
});
it('keeps every room cell in bounds and never overlays seats on aisles', () => {
 for (const id of ['show-1-1', 'show-2-1', 'show-3-1']) {
  const layout = getRoomLayout(id); const occupied = new Set();
  for (const c of layout.cells) for (let r=c.row; r<c.row+(c.rowSpan || 1); r++) for (let col=c.column; col<c.column+(c.columnSpan || 1); col++) {
   expect(r).toBeLessThan(layout.rows); expect(col).toBeLessThan(layout.columns); expect(col).toBeGreaterThanOrEqual(0);
   expect(occupied.has(`${r}:${col}`)).toBe(false); occupied.add(`${r}:${col}`);
  }
 }
 expect(getRoomLayout('show-1-1')).not.toEqual(getRoomLayout('show-2-1'));
});
