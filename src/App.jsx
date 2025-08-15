import { Routes, Route, Link } from 'react-router-dom';
import { Home } from './pages/Home/home';
import Layout from './layout/layout';
import StoreInfo from './pages/market/store_info';
import MarketInfo from './pages/market/market_info';

export default function App() {
  return (
    <div>
      <nav>
        <Link to="/"></Link>
      </nav>

      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="/stores/:id" element={<StoreInfo />} />
          <Route path="/markets/:id" element={<MarketInfo />} />
        </Route>
      </Routes>
    </div>
  );
}
