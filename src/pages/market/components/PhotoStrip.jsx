// components/PhotoStrip.jsx
export default function PhotoStrip({ title, photos = [], ctaLabel, onCta }) {
  return (
    <section className="pt-[3rem] px-[1.5rem]">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {onCta && (
          <button onClick={onCta} className="text-sm text-main-1000">
            {ctaLabel}
          </button>
        )}
      </div>

      {photos.length === 0 ? (
        <div className="w-full h-[6.7rem] bg-gray-50 rounded-[1rem] flex items-center justify-center text-gray-400">
          사진을 제보해주세요!
        </div>
      ) : (
        <div className="flex gap-3">
          {photos.slice(0, 4).map((p, idx) => (
            <div
              key={p.photo_id ?? idx}
              className="flex-1 rounded-lg overflow-hidden relative"
              style={{ height: '6.6rem' }}
            >
              <img
                src={p.photo_url}
                alt={`${title} ${idx + 1}`}
                className="w-full h-full object-cover"
              />
              {idx === 3 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-white gap-1">
                  <div className="text-lg font-semibold">+</div>
                  <div className="text-xs">더보기</div>
                </div>
              )}
            </div>
          ))}
          {photos.length < 4 && (
            <button
              onClick={onCta}
              className="flex-1 h-[6.6rem] border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-sm"
            >
              + 더보기
            </button>
          )}
        </div>
      )}
    </section>
  );
}
