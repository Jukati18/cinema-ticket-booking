import { Link, useLocation } from 'react-router';
const titles = { '/login': 'Đăng nhập', '/register': 'Đăng ký', '/profile': 'Hồ sơ và lịch sử', '/lookup': 'Tra cứu vé', '/admin': 'Khu vực quản trị' };
export function Component() { const { pathname } = useLocation(); return <section className="panel"><p className="eyebrow">Khung route · SCRUM-23</p><h1>{titles[pathname] || 'Trang chưa triển khai'}</h1><p>Trang này được dành cho sprint tiếp theo hoặc thành viên phụ trách. Luồng demo tuần đầu nằm ở phần chọn phim và đặt vé.</p><Link to="/movies">Đi tới danh sách phim</Link></section>; }
