import React from 'react';
import logo from '../../assets/로고.png';
import title from '../../assets/시장에 가면.svg';

const Onboarding = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-main-800">
      <img src={logo} alt="logo" className="w-[15.7286rem] h-[15.7286rem]" />
      <img src={title} alt="title" />
    </div>
  );
};

export default Onboarding;
