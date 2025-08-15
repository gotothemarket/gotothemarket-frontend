import React, { useEffect, useState } from 'react';
import starIcon from '../assets/star.svg';
import starBlankIcon from '../assets/star_blank.svg';
import reviewWriteIcon from '../assets/review_write.svg';

const ReviewModal = ({ isOpen, onClose, onSubmit }) => {
  const [mounted, setMounted] = useState(false); // DOM 부착 여부
  const [openPhase, setOpenPhase] = useState(false); // 슬라이드 상태
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');

  // 모달 열고/닫을 때 애니메이션 상태 전이
  useEffect(() => {
    if (isOpen) {
      setMounted(true); // 1) 먼저 DOM에 붙임
      // 2) 다음-다다음 프레임에 open으로 전환(브라우저가 초기 스타일을 먼저 페인트하도록)
      const id1 = requestAnimationFrame(() => {
        const id2 = requestAnimationFrame(() => setOpenPhase(true));
        return () => cancelAnimationFrame(id2);
      });
      return () => cancelAnimationFrame(id1);
    } else {
      setOpenPhase(false); // 닫힘 애니메이션 시작
      const t = setTimeout(() => setMounted(false), 300); // duration-300과 동일
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  // (선택) 배경 스크롤 잠금
  useEffect(() => {
    if (!mounted) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mounted]);

  const handleStarClick = (i) => setRating(i + 1);

  const handleSubmit = () => {
    if (!rating) return alert('별점을 선택해주세요.');
    if (!reviewText.trim()) return alert('리뷰 내용을 작성해주세요.');
    onSubmit({ rating, content: reviewText });
    setRating(0);
    setReviewText('');
    onClose();
  };

  const handleClose = () => {
    setRating(0);
    setReviewText('');
    onClose();
  };

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* 오버레이 */}
      <div
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          openPhase ? 'opacity-50' : 'opacity-0'
        }`}
        onClick={handleClose}
      />

      {/* 바텀시트(한 요소에서 X/Y 둘 다 제어) */}
      <div className="absolute inset-0 flex items-end justify-center pb-4 pointer-events-none">
        <div
          className="bg-white rounded-t-3xl p-6 shadow-xl transition-transform duration-300 ease-out transform-gpu will-change-transform pointer-events-auto  w-[100%] max-w-[430px]  "
          // translateX(-50%) + translateY(0/100%)를 '한 번에' 지정 (Tailwind 변환클래스 충돌 회피)
          style={{
            position: 'fixed',
            left: '50%',
            bottom: 0,
            transform: openPhase
              ? 'translate(-50%, 0)' // 열림(위치)
              : 'translate(-50%, 100%)', // 닫힘(화면 아래)
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* 헤더 */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">시장 속 보물을 찾으셨나요?</h2>
            <button onClick={handleClose} className="p-2 text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* 별점 */}
          <div className="mb-6 flex gap-2">
            {[...Array(5)].map((_, i) => (
              <button key={i} onClick={() => handleStarClick(i)} className="p-1">
                <img
                  src={i < rating ? starIcon : starBlankIcon}
                  alt={`별 ${i + 1}`}
                  className="w-8 h-8 cursor-pointer"
                />
              </button>
            ))}
          </div>

          {/* 입력 */}
          <div className="mb-6 relative rounded-[1rem] bg-gray-50">
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="리뷰를 작성해주세요"
              className="w-full h-32 p-4 pr-12 bg-gray-50 rounded-[1rem] "
              maxLength={300}
            />
            {!reviewText && (
              <div className="absolute top-5 left-40">
                <img src={reviewWriteIcon} alt="작성 아이콘" className="w-4 h-4" />
              </div>
            )}
            <div className="absolute bottom-2 right-2 text-xs flex p-1 ">
              <span className="text-black">{reviewText.length}</span>
              <span className="text-gray-400">/300</span>
            </div>
          </div>

          {/* 제출 */}
          <button
            onClick={handleSubmit}
            className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-colors duration-200 ${
              rating && reviewText.trim()
                ? 'bg-main-1000 text-white'
                : 'bg-gray-300 text-gray-600 cursor-not-allowed'
            }`}
            disabled={!rating || !reviewText.trim()}
          >
            리뷰 남기기
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;
