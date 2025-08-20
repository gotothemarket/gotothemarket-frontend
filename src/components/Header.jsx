import React from 'react';
import backIconLight from '../assets/left_arrow.svg';
import backIconDark from '../assets/left_arrow_white.svg';

const Header = ({ title, onBack, variant = 'light', className = '', backgroundColor }) => {
  const isDark = variant === 'dark';
  const containerColorClass = isDark
    ? 'bg-black text-white'
    : backgroundColor
      ? ''
      : 'bg-white text-black';
  const titleColorClass = isDark ? 'text-[#FEFEFE]' : 'text-black';
  const backIconSrc = isDark ? backIconDark : backIconLight;

  return (
    <div
      className={`sticky top-0 ${containerColorClass} px-[1.3rem] pt-[6.2rem] pb-[1.2rem] z-10 ${className}`}
      style={backgroundColor ? { backgroundColor } : {}}
    >
      <div className="flex items-center justify-center">
        {onBack && (
          <button onClick={onBack} className="absolute left-[1.2rem] p-2 cursor-pointer">
            <img src={backIconSrc} alt="뒤로가기" />
          </button>
        )}
        {title && (
          <h1
            className={`text-[1.7rem] font-medium ${titleColorClass} text-center font-['Pretendard_Variable'] leading-normal`}
          >
            {title}
          </h1>
        )}
      </div>
    </div>
  );
};

export default Header;
