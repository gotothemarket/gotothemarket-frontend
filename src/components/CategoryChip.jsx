import React from 'react';

const CategoryChip = ({ id, label, icon, emoji, isSelected = false, onClick, className = '' }) => {
  const baseClasses = `
    flex items-center justify-center gap-[0.4rem]
    px-[1.2rem] py-[1rem]
    rounded-[1rem] text-center
    text-[1.2rem] font-medium leading-normal
    transition-all duration-200
    ${className}
  `;

  const selectedClasses = isSelected
    ? 'border-[0.8px] border-[#FFEC74] bg-[#FFF8C8]'
    : 'border-[0.8px] border-[#D4D4D4] bg-[#FEFEFE] text-[#0A0A0A]';

  const handleClick = () => {
    if (onClick) {
      onClick(id);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`${baseClasses} ${selectedClasses}`}
      style={{ fontFamily: 'Pretendard Variable' }}
    >
      {icon && <img src={icon} alt={label} className="w-5 h-5" />}
      {!icon && <span className="text-lg">🏪</span>}
      {emoji && <span className="text-lg">{emoji}</span>}
      <span>{label}</span>
    </button>
  );
};

export default CategoryChip;
