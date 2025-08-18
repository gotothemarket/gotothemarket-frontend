import { Routes, Route, Link } from 'react-router-dom';
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

export default function App() {
  return (
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
          <Route path="/mypage/favorite" element={<MyFavorite />} />
          <Route path="/mypage/review" element={<MyReview />} />
        </Route>
      </Routes>
    </div>
  );
}
