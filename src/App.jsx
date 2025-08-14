import { Routes, Route, Link } from 'react-router-dom';
import { Home } from './pages/Home/home';

export default function App() {
  return (
    <div>
      <nav>
        <Link to="/">홈</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </div>
  );
}
