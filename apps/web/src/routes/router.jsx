import { createBrowserRouter, Navigate, Link, useRouteError } from 'react-router';
import Layout from '../components/CustomerLayout';
function ErrorPage() { const error = useRouteError(); return <main className="shell"><h1>Không mở được trang</h1><p role="alert">{error?.message || 'Trang không tồn tại hoặc đã xảy ra lỗi.'}</p><Link to="/movies">Về danh sách phim</Link></main>; }
export const router = createBrowserRouter([{ element: <Layout />, HydrateFallback: () => <main className="shell"><p role="status">Đang mở ứng dụng…</p></main>, errorElement: <ErrorPage />, children: [
  { index: true, element: <Navigate to="/movies" replace /> },
  { path: 'movies/:movieId', lazy: () => import('../pages/MovieDetailPage') },
  { path: 'schedule', lazy: () => import('../pages/SchedulePage') },
  { path: 'movies', lazy: () => import('../pages/CatalogPage') },
  { path: 'booking/:showtimeId/seats', lazy: () => import('../pages/SeatsPage') },
  { path: 'booking/:showtimeId/checkout', lazy: () => import('../pages/CheckoutPage') },
  { path: 'bookings/:bookingId/result', lazy: () => import('../pages/ResultPage') },
  { path: 'bookings/:bookingId/payment', lazy: () => import('../pages/PaymentPage') },
  { path: 'lookup', lazy: () => import('../pages/LookupPage') },
  ...['login', 'register', 'profile'].map((path) => ({ path, lazy: () => import('../pages/AccountPage') })),
  {path:'admin',lazy:()=>import('../pages/PlaceholderPage')},
  { path: '*', element: <section><h1>Không tìm thấy trang</h1><Link to="/movies">Về danh sách phim</Link></section> },
] }]);
