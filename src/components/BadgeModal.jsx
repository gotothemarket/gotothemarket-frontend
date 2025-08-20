import React from 'react';
import firstFootprintBadge from '../assets/뱃지_첫발자국.svg';

const BadgeModal = ({ isOpen, onClose, badgeInfo }) => {
  if (!isOpen) return null;

  // API에서 받은 뱃지 정보가 있으면 사용, 없으면 기본값 사용
  const badgeName = badgeInfo?.badge_name || '용감한 첫 발자국';
  const badgeIcon = badgeInfo?.badge_icon || firstFootprintBadge;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
      <div 
        className="bg-[#1A1A1A] rounded-3xl text-white text-center flex justify-center items-center flex-col"
        style={{
          width: '28.7rem',
          padding: '4rem 4.9911rem 3.9rem 5rem'
        }}
      >
        {/* 제목 */}
        <h2 className="text-2xl font-bold mb-8 text-white">새로운 뱃지 획득!</h2>
        
        {/* 뱃지 영역 */}
        <div className="border border-[#FFAA00] rounded-[1rem] p-[0.5rem] w-[15.6rem] mb-6">
          {/* 뱃지 이미지 */}
          <div className="flex justify-center mb-4">
            <img 
              src={badgeIcon} 
              alt={badgeName} 
              className="w-[8.8rem] h-[8.8rem]"
            />
          </div>
          
          {/* 뱃지 이름 */}
          <div className="bg-[#4A4A4A] w-[13.6rem] text-[#FFAA00] px-6 py-[0.3rem] rounded-[1rem] text-lg font-medium inline-block">
            {badgeName}
          </div>
        </div>
        
        {/* 확인 버튼 */}
        <button 
          onClick={onClose}
          className="bg-[#2E2E2E] text-white px-8 py-4 rounded-[1.5rem] text-lg font-medium w-full hover:bg-[#272423] transition-colors"
        >
          확인
        </button>
      </div>
    </div>
  );
};

export default BadgeModal;
