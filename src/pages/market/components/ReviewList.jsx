import React from 'react';
import starIcon from '../../../assets/star.svg';

const Stars = ({ rating }) => {
  const filled = Math.round(rating);
  return (
    <div className="flex gap-1 mb-3 w-[1.155rem] h-[1.155rem]">
      {[...Array(5)].map((_, i) => (
        <img
          key={i}
          src={starIcon}
          alt={i < filled ? '채워진 별' : '빈 별'}
          className={`w-[1.155rem] h-[1.155rem] ${i < filled ? 'opacity-100' : 'opacity-40'}`}
        />
      ))}
    </div>
  );
};

export default function ReviewList({ reviews }) {
  if (!reviews?.length) {
    return (
      <div className="flex h-[6.7rem] justify-center items-center rounded-[1rem] bg-[#F8F8F8]">
        <div className="text-center text-gray-500">리뷰를 작성해주세요.</div>
      </div>
    );
  }

  return (
    <>
      {reviews.map((review) => (
        <div key={review.review_id} className="bg-gray-50 rounded-[1rem] p-4 mb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-900">{review.member_nickname}</span>
              {review.badges?.map((badge) => (
                <div
                  key={badge.badge_id}
                  className="flex items-center gap-1 rounded-[0.7rem] bg-[#FEFDF3] p-1"
                >
                  {badge.badge_icon && (
                    <img
                      src={badge.badge_icon}
                      alt={badge.badge_name}
                      className="w-[1.6rem] h-[1.6rem]"
                    />
                  )}
                  <span className="text-xs">{badge.badge_name}</span>
                </div>
              ))}
            </div>
            <span className="text-xs text-gray-500">
              {new Date(review.created_at).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
              }).replace(/\.$/, '')}
            </span>
          </div>

          <Stars rating={review.rating} />
          <p className="text-gray-900">{review.content}</p>
        </div>
      ))}
    </>
  );
}
