import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function Layout() {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* 헤더가 h-16(=64px) 이므로, 본문 높이를 그만큼 보정 */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden">
        <Outlet />
      </main>
      <Navbar />
    </div>
  );
}
