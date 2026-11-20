import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router/dom';
import { BookingProvider } from './features/booking/context';
import { router } from './routes/router';
const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 30000, retry: 1 } } });
export default function App() {
  return <QueryClientProvider client={queryClient}><BookingProvider><RouterProvider router={router} /></BookingProvider></QueryClientProvider>;
}
