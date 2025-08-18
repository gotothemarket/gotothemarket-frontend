import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/로고.png';
import title from '../../assets/시장에 가면.svg';

const Onboarding = () => {
  const navigate = useNavigate();
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const showTimer = setTimeout(() => {
      setIsExiting(true);
      const navTimer = setTimeout(() => {
        navigate('/onboarding/introduce', { replace: true });
      }, 400); // transition duration
      return () => clearTimeout(navTimer);
    }, 2000);

    return () => clearTimeout(showTimer);
  }, [navigate]);

  return (
    <div
      className={`flex flex-col items-center justify-center h-screen transition-all duration-500 ease-out transform ${
        isExiting
          ? 'bg-primary-900 opacity-0 -translate-y-2 scale-95'
          : 'bg-[#FA0] opacity-100 translate-y-0 scale-100'
      }`}
    >
      <img src={logo} alt="logo" className="w-[15.7286rem] h-[15.7286rem]" />
      <img src={title} alt="title" />
    </div>
  );
};

export default Onboarding;
