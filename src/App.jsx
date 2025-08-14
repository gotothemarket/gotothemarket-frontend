import { Routes, Route, Link } from 'react-router-dom';
import { Home } from './pages/Home/home';
import Layout from './layout/layout';

export default function App() {
  return (
    <div>
      <nav>
        <Link to="/"></Link>
      </nav>

      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
        </Route>
      </Routes>
    </div>
  );
}
