// components/PhotoStrip.jsx
import { useNavigate } from 'react-router-dom';

export default function PhotoStrip({
  title,
  photos = [],
  ctaLabel,
  onCta,
  storeId,
  isMarket = false,
}) {
  const navigate = useNavigate();

  const handleViewMore = () => {
    if (storeId) {
      navigate(`/store/${storeId}/gallery`);
    }
  };

  return (
    <section className="pt-[3rem] px-[1.5rem]">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {!isMarket && onCta && (
          <button onClick={onCta} className="text-sm text-primary-1000">
            {ctaLabel}
          </button>
        )}
      </div>

      {photos.length === 0 ? (
        <div className="w-full h-[6.7rem] bg-gray-50 rounded-[1rem] flex flex-col items-center justify-center text-gray-400">
          {isMarket ? '사진이 없습니다' : '사진을 제보해주세요!'}
        </div>
      ) : (
        <div className="flex gap-3">
          {photos.slice(0, 4).map((p, idx) => (
            <div
              key={p.photo_id ?? idx}
              className="flex-1 rounded-lg overflow-hidden relative cursor-pointer"
              style={{ height: '6.6rem' }}
              onClick={!isMarket && idx === 3 ? handleViewMore : undefined}
            >
              <img
                src={p.photo_url}
                alt={`${title} ${idx + 1}`}
                className="w-full h-full object-cover"
              />
              {/* 가게 정보일 때만 4번째 사진에 더보기 오버레이 표시 */}
              {!isMarket && idx === 3 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-white gap-1">
                  <div className="text-lg font-semibold">+</div>
                  <div className="text-xs">더보기</div>
                </div>
              )}
            </div>
          ))}
          {/* 가게 정보일 때만 사진이 4개 미만하면 더보기 버튼 표시 */}
          {!isMarket && photos.length < 4 && (
            <button
              onClick={handleViewMore}
              className="flex-1 h-[6.6rem] border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-sm hover:border-gray-400 transition-colors"
            >
              + 더보기
            </button>
          )}
        </div>
      )}
    </section>
  );
}
