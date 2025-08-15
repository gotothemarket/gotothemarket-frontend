import { NavLink, useLocation } from 'react-router-dom';
import homeIcon from '../assets/home_active.svg';
import homeInactiveIcon from '../assets/home_default.svg';
import writeIcon from '../assets/write_active.svg';
import writeInactiveIcon from '../assets/write_default.svg';
import profileActiveIcon from '../assets/profile_active.svg';
import profileInactiveIcon from '../assets/profile_default.svg';

export default function Navbar() {
  const location = useLocation();

  // 홈 페이지('/')에서만 Navbar 표시
  if (location.pathname !== '/') {
    return null;
  }

  return (
    <header className="relative z-50 bg-white border-t border-gray-200 w-full pb-[4rem] pt-[1rem]">
      <div className="mx-auto max-w-screen-xl h-full px-[5.3rem] flex items-center justify-between">
        {/* 내비게이션 */}
        <nav className="flex w-full items-center justify-between">
          <NavLink
            to="/report/location"
            className="flex flex-col items-center gap-1 text-gray-600 hover:text-blue-600 transition-colors"
          >
            {({ isActive }) => (
              <>
                <img
                  src={isActive ? writeIcon : writeInactiveIcon}
                  alt="가게"
                  className="w-[2rem] h-[2rem]"
                />
                <span className={`text-xs ${isActive ? 'text-blue-600' : 'text-gray-600'}`}></span>
              </>
            )}
          </NavLink>
          <NavLink
            to="/"
            end
            className="flex flex-col items-center gap-1 text-gray-600 hover:text-blue-600 transition-colors"
          >
            {({ isActive }) => (
              <>
                <img
                  src={isActive ? homeIcon : homeInactiveIcon}
                  alt="홈"
                  className="w-[2rem] h-[2rem]"
                />
                <span className={`text-xs ${isActive ? 'text-blue-600' : 'text-gray-600'}`}></span>
              </>
            )}
          </NavLink>
          <NavLink
            to="/mypage"
            className="flex flex-col items-center gap-1 text-gray-600 hover:text-blue-600 transition-colors"
          >
            {({ isActive }) => (
              <>
                <img
                  src={isActive ? profileActiveIcon : profileInactiveIcon}
                  alt="마이페이지"
                  className="w-[2rem] h-[2rem]"
                />
                <span className={`text-xs ${isActive ? 'text-blue-600' : 'text-gray-600'}`}></span>
              </>
            )}
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
