import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Home } from './pages/Home/home';
import Layout from './layout/layout';
import StoreInfo from './pages/market/store_info';
import MarketInfo from './pages/market/market_info';
import StoreGallery from './pages/market/StoreGallery';
import ReportLocation from './pages/report/ReportLocation';
import MapDebugTest from './pages/market/components/MapDebugTest';
import ReportForm from './pages/report/ReportForm';
import Onboarding from './pages/onboarding/Onboarding';
import Introduce from './pages/onboarding/Introduce';
import Mypage from './pages/mypage/Mypage';
import MyBadge from './pages/mypage/MyBadge';
import MyFavorite from './pages/mypage/MyFavorite';
import MyReview from './pages/mypage/MyReview';
import Ai from './pages/ai/Ai';
import AiResult from './pages/ai/AiResult';
import { MapProvider } from './contexts/MapContext';

// 첫 방문자 감지 및 리다이렉트 컴포넌트
const FirstVisitRedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // 온보딩 페이지에서는 리다이렉트하지 않음
    if (location.pathname.startsWith('/onboarding')) {
      return;
    }

    // 로컬스토리지에서 첫 방문 여부 확인
    const hasVisited = localStorage.getItem('hasVisitedBefore');

    if (!hasVisited) {
      // 첫 방문자라면 온보딩 페이지로 리다이렉트
      localStorage.setItem('hasVisitedBefore', 'true');
      navigate('/onboarding');
    }
  }, [navigate, location.pathname]);

  return null;
};

export default function App() {
  return (
    <MapProvider>
      <div>
        <nav>
          <Link to="/"></Link>
        </nav>

        <Routes>
          <Route path="/" element={<Layout />}>
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/onboarding/introduce" element={<Introduce />} />
            <Route index element={<Home />} />
            <Route path="/stores/:id" element={<StoreInfo />} />
            <Route path="/store/:storeId/gallery" element={<StoreGallery />} />
            <Route path="/markets/:id" element={<MarketInfo />} />
            <Route path="/report/location" element={<ReportLocation />} />
            <Route path="/report/form" element={<ReportForm />} />
            <Route path="/debug" element={<MapDebugTest />} />
            <Route path="/mypage" element={<Mypage />} />
            <Route path="/mypage/badge" element={<MyBadge />} />
            <Route path="/mypage/review" element={<MyReview />} />
            <Route path="/ai" element={<Ai />} />
            <Route path="/ai/result" element={<AiResult />} />
          </Route>
        </Routes>

        {/* 첫 방문자 감지 및 리다이렉트 */}
        <FirstVisitRedirect />
      </div>
    </MapProvider>
  );
}
