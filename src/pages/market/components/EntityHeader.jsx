// components/EntityHeader.jsx
import bookmarkIcon from '../../../assets/bookmark.svg';
import bookmarkFilledIcon from '../../../assets/bookmark_filled.svg';

export default function EntityHeader({ icon, title, subtitle, bookmark, onToggleBookmark }) {
  return (
    <section className="px-[1.5rem]">
      <div className="flex items-start gap-3">
        <div className="w-16 h-16 overflow-hidden flex items-center justify-center">
          <img src={icon} alt={title} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1">
          {subtitle && <p className="text-sm text-gray-500 mb-1">{subtitle}</p>}
          <h2 className="text-2xl font-bold text-gray-900 mb-3">{title}</h2>
        </div>
        {typeof bookmark === 'boolean' && (
          <button onClick={onToggleBookmark} className="p-2 rounded-full">
            <img
              src={bookmark ? bookmarkFilledIcon : bookmarkIcon}
              alt="bookmark"
              className="w-[2.4rem] h-[2.4rem]"
            />
          </button>
        )}
      </div>
    </section>
  );
}
