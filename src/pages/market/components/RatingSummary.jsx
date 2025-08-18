import React from 'react';
import starIcon from '../../../assets/star.svg';

const Stars = ({ rating }) => {
  const filled = Math.round(rating);
  return (
    <div className="flex gap-1">
      {[...Array(5)].map((_, i) => (
        <img
          key={i}
          src={starIcon}
          alt={i < filled ? '채워진 별' : '빈 별'}
          className={`w-[2.5rem] h-[2.5rem] ${i < filled ? 'opacity-100' : 'opacity-40'}`}
        />
      ))}
    </div>
  );
};

export default function RatingSummary({ average, count }) {
  return (
    <>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">리뷰 {count}개</h3>
      <div className="bg-primary-400 flex items-center justify-center rounded-[1rem] p-4 mb-4">
        <div className="flex-col items-center justify-center text-center gap-3">
          <span className="text-2xl font-bold text-black">{average.toFixed(1)}점</span>
          <Stars rating={average} />
        </div>
      </div>
    </>
  );
}
