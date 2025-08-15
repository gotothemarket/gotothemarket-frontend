// components/PageHeader.jsx
import backIcon from '../../../assets/left_arrow.svg';

export default function PageHeader({ onBack }) {
  return (
    <header className="sticky top-0 z-10 bg-white px-5 py-[1.5rem]">
      <button onClick={onBack} className="p-2 -ml-2">
        <img src={backIcon} alt="back" className="w-6 h-6" />
      </button>
    </header>
  );
}
