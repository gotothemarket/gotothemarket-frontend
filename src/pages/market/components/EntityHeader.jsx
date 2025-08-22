// components/EntityHeader.jsx
import bookmarkIcon from '../../../assets/bookmark.svg';
import bookmarkFilledIcon from '../../../assets/bookmark_filled.svg';
import marketStampIcon from '../../../assets/marketstamp.svg';

export default function EntityHeader({
  icon,
  title,
  subtitle,
  bookmark,
  onToggleBookmark,
  isMarket = false,
  openingYears,
}) {
  return (
    <section className="px-[1.5rem] py-[1.5rem]">
      <div className="flex items-start gap-3">
        <div className="w-16 h-16 overflow-hidden flex items-center justify-center relative">
          <img src={icon} alt={title} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1">
          {subtitle && (
            <p
              className="mb-1"
              style={{
                color: '#B5B5B5',
                fontFamily: 'Pretendard Variable',
                fontSize: '1.4rem',
                fontStyle: 'normal',
                fontWeight: 500,
                lineHeight: 'normal',
              }}
            >
              {subtitle}
            </p>
          )}
          <div className="flex items-center gap-2 mb-3">
            <h2
              style={{
                color: '#0A0A0A',
                fontFamily: 'Pretendard Variable',
                fontSize: '2.3rem',
                fontStyle: 'normal',
                fontWeight: 600,
                lineHeight: 'normal',
              }}
            >
              {title}
            </h2>
          </div>
          <div className="relative">
            {isMarket && (
              <img
                src={marketStampIcon}
                alt="시장 스탬프"
                className="absolute top-[-5.5rem] right-[1rem] w-[6.8rem] h-[6.8rem]"
              />
            )}

            {isMarket && openingYears && (
              <div
                className="absolute top-[-3.4rem] right-[2.8rem] z-10 rounded-br-lg px-2 py-1 text-center"
                style={{
                  color: '#FEFEFE',
                  fontFamily: 'Pretendard Variable',
                  fontSize: '1rem',
                  fontStyle: 'normal',
                  fontWeight: 600,
                  lineHeight: '1.1rem',
                }}
              >
                {openingYears}년<br />
                전통
              </div>
            )}
          </div>
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
