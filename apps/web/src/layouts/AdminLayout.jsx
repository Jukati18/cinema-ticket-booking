import { Link, NavLink, Outlet, useLocation } from 'react-router';
import { Clapperboard, Film, Tags, CalendarClock, ChartColumn } from 'lucide-react';
import { Brand } from '@/components/CustomerLayout';

const links = [
  { to: '/admin/movies', label: 'Phim', icon: Film },
];

const upcoming = [
  { label: 'Thể loại', icon: Tags },
  { label: 'Suất chiếu', icon: CalendarClock },
  { label: 'Báo cáo', icon: ChartColumn },
];

const titles = {
  '/admin/movies': 'Quản lý phim',
};

export default function AdminLayout() {
  const { pathname } = useLocation();
  const title = titles[pathname] || 'Khu vực quản trị';
  return (
    <div className="admin-app">
      <a className="skip-link" href="#content">Bỏ qua điều hướng</a>
      <aside className="admin-sidebar">
        <Link to="/admin/movies" aria-label="CineVibe quản trị"><Brand /></Link>
        <p className="eyebrow">Quản trị</p>
        <nav className="admin-nav" aria-label="Mục quản trị">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to}><Icon size={16} />{label}</NavLink>
          ))}
          {upcoming.map(({ label, icon: Icon }) => (
            <span key={label} aria-disabled="true"><Icon size={16} />{label}</span>
          ))}
        </nav>
        <Link className="admin-exit" to="/movies">Về trang khách</Link>
      </aside>
      <div className="admin-main">
        <header className="admin-header">
          <div>
            <p className="eyebrow">Admin demo</p>
            <h1>{title}</h1>
          </div>
          <span className="badge red"><Clapperboard size={14} />Movie</span>
        </header>
        <main id="content" tabIndex={-1}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
