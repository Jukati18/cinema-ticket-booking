export function toggleSeats(selected, seat, seats) {
  const group = seat.coupleGroupId ? seats.filter((item) => item.coupleGroupId === seat.coupleGroupId) : [seat];
  if (group.some((item) => item.status !== 'available')) return selected;
  const ids = group.map((item) => item.id);
  return ids.every((id) => selected.includes(id)) ? selected.filter((id) => !ids.includes(id)) : [...new Set([...selected, ...ids])];
}
