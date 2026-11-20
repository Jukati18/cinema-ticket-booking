export const initialBooking = { showtimeId: null, seatIds: [], comboItems: [], hold: null, contact: null, booking: null };
export function bookingReducer(state, action) {
  switch (action.type) {
    case 'COMBOS_SELECTED': return { ...state, comboItems: action.items, hold: null, booking: null };
    case 'SHOWTIME_SELECTED': return state.showtimeId === action.id ? state : { ...initialBooking, showtimeId: action.id };
    case 'SEATS_SELECTED': return { ...state, seatIds: action.ids, hold: null, booking: null };
    case 'HOLD_CREATED': return { ...state, hold: action.hold };
    case 'HOLD_EXPIRED': return { ...state, hold: null, seatIds: [], booking: null };
    case 'CONTACT_SAVED': return { ...state, contact: action.contact };
    case 'BOOKING_CREATED': return { ...state, booking: action.booking };
    case 'RESET': return { ...initialBooking };
    default: return state;
  }
}
