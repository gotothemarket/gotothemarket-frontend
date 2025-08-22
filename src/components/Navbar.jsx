import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import homeIcon from '../assets/home_active.svg';
import homeInactiveIcon from '../assets/home_default.svg';
import writeIcon from '../assets/write_active.svg';
import writeInactiveIcon from '../assets/write_default.svg';
import profileActiveIcon from '../assets/profile_active.svg';
import profileInactiveIcon from '../assets/profile_default.svg';
import { useMapContext } from '../contexts/MapContext';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { mapState } = useMapContext();

  // Navbar 표시 경로: 홈, 마이페이지
  const visiblePaths = ['/', '/mypage'];
  if (!visiblePaths.includes(location.pathname)) {
    return null;
  }

  const isMypage = location.pathname === '/mypage';

  const handleReportClick = () => {
    // MapContext에서 현재 지도 상태를 가져와서 전달
    navigate('/report/location', {
      state: {
        initialLocation: mapState.center,
        initialAddress: mapState.address,
      },
    });
  };

  return (
    <header
      className={`relative z-50 w-full pb-[4rem] pt-[1rem] ${isMypage ? 'bg-black border-t border-[#1a1a1a]' : 'bg-white border-t border-gray-200'}`}
    >
      <div className="mx-auto max-w-screen-xl h-full px-[5.3rem] flex items-center justify-between">
        {/* 내비게이션 */}
        <nav className="flex w-full items-center justify-between">
          <button
            onClick={handleReportClick}
            className="flex flex-col items-center gap-1 text-gray-600 hover:text-blue-600 transition-colors cursor-pointer"
          >
            <img
              src={
                location.pathname === '/report/location' || location.pathname === '/report/form'
                  ? writeIcon
                  : writeInactiveIcon
              }
              alt="가게"
              className="w-[2rem] h-[2rem]"
            />
            <span
              className={`text-xs ${location.pathname === '/report/location' || location.pathname === '/report/form' ? 'text-blue-600' : 'text-gray-600'}`}
            ></span>
          </button>
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
