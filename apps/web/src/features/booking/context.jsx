import { createContext, useContext, useReducer, useState } from 'react';
import { initialBooking, bookingReducer } from './reducer';
const BookingContext = createContext(null);
export function BookingProvider({ children }) {
  const [promoCode,setPromoCode]=useState('');
  const [state, dispatch] = useReducer(bookingReducer, initialBooking);
  return <BookingContext.Provider value={{ state, dispatch, promoCode, setPromoCode }}>{children}</BookingContext.Provider>;
}
export function useBooking() { return useContext(BookingContext); }
