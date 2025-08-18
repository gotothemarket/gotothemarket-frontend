import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import step1 from '../../assets/introduce1.svg';
import write_icon_orange from '../../assets/write_icon_orange.svg';
import introduce2_1 from '../../assets/introduce2-1.png';
import introduce2_2 from '../../assets/introduce2-2.png';
import introduce3 from '../../assets/introduce3.svg';
import introduce3_2 from '../../assets/introduce3-1.png';

const Introduce = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  const steps = [
    {
      number: '1',
      title: '발견하기',
      description: '전통시장 곳곳을 탐험하며\n마음에 드는 가게를 발견하세요.',
      image: <img src={step1} alt="발견하기" className="max-w-[400px] w-full max-h-[100%]" />,
    },
    {
      number: '2',
      title: '기록하기',
      description: '리뷰와 사진으로\n여러분의 발견을 남기세요.',
      image: (
        <div className="w-full">
          {/* Photo stack - Left side, positioned higher */}
          <div className="relative">
            <img
              src={introduce2_1}
              alt="introduce2"
              className="w-[17.7rem] absolute top-[-3rem] left-[-2rem]"
            />
            <div className="absolute left-[0rem] top-[14rem] px-4 py-2 bg-white opacity-70 text-black rounded-[1.6rem] text-body-medium w-[15.36rem] h-[3.52rem] flex items-center justify-center">
              사진 기록하기
            </div>
          </div>
          {/* Writing hand - Right side, positioned lower */}
          <div className="absolute right-[-4.5rem] top-[-5rem] flex flex-col items-center">
            <img src={introduce2_2} alt="introduce2" className="w-[28.7rem] h-auto" />
            <div className="absolute left-[6rem] top-[28rem] px-4 py-2 bg-white opacity-70 text-black rounded-[1.6rem] text-body-medium w-[15.36rem] h-[3.52rem] flex items-center justify-center">
              리뷰 쓰기
            </div>
          </div>
        </div>
      ),
    },
    {
      number: '3',
      title: '함께 나누기',
      description: '마지막으로,\n다른 탐험가들의 보물을\n지도에서 찾아보세요.',
      image: (
        <div className="flex justify-center relative">
          <img src={introduce3} alt="introduce3" className="z-10 w-[28.7rem] h-auto" />
          <img
            src={introduce3_2}
            alt="introduce3"
            className="w-[20.7rem] h-auto absolute right-[-8rem] top-[-18rem]"
          />
        </div>
      ),
    },
  ];

  const handleStart = () => {
    navigate('/', { replace: true });
  };

  // 터치/마우스 이벤트 핸들러
  const handleTouchStart = (e) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
    setCurrentX(e.touches[0].clientX);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    setCurrentX(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;

    const diff = startX - currentX;
    const threshold = 50; // 스와이프 감지 임계값

    if (Math.abs(diff) > threshold) {
      if (diff > 0 && currentStep < steps.length - 1) {
        // 왼쪽으로 스와이프 (다음 단계)
        setCurrentStep(currentStep + 1);
      } else if (diff < 0 && currentStep > 0) {
        // 오른쪽으로 스와이프 (이전 단계)
        setCurrentStep(currentStep - 1);
      }
    }

    setIsDragging(false);
  };

  // 마우스 이벤트 핸들러
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.clientX);
    setCurrentX(e.clientX);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setCurrentX(e.clientX);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;

    const diff = startX - currentX;
    const threshold = 50;

    if (Math.abs(diff) > threshold) {
      if (diff > 0 && currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else if (diff < 0 && currentStep > 0) {
        setCurrentStep(currentStep - 1);
      }
    }

    setIsDragging(false);
  };

  const currentStepData = steps[currentStep];

  return (
    <div className="flex w-full px-[3.4rem] pt-[14rem] flex-col  min-h-screen bg-[#FA0] p-4 overflow-hidden animate-[fadeIn_400ms_ease-out]">
      <div className="text-center absolute top-[4rem] left-[50%] translate-x-[-50%]">
        <div className="flex items-baseline justify-center">
          <span className="text-primary-700 text-accent-large">{currentStep + 1}</span>
          <span className="text-primary-800 text-accent-medium">/3</span>
        </div>
      </div>

      <div className="w-full">
        {/* Header */}

        {/* Main Content */}
        <div
          ref={containerRef}
          className="relative"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Step Number and Title */}
          <div className="mb-6 flex gap-[0.9rem]">
            <div className="bg-white rounded-full w-[3.2rem] text-primary-1000 text-main-title text-center justify-center items-center">
              {currentStepData.number}
            </div>
            <h2 className="text-black text-heading-large">{currentStepData.title}</h2>
          </div>

          {/* Description */}
          <p className="text-black text-heading-medium mb-8">
            {currentStepData.description.split('\n').map((line, index) => (
              <React.Fragment key={index}>
                {line}
                {index < currentStepData.description.split('\n').length - 1 && <br />}
              </React.Fragment>
            ))}
          </p>

          {/* Illustration */}
          <div className="mb-8 flex justify-center relative">
            {currentStepData.image}
            {currentStep === 0 && (
              <div className="absolute bottom-[2rem] left-1/2 -translate-x-1/2 z-10 flex flex-col items-center">
                <div className="text-body-bold flex items-center justify-center px-[1.8rem] h-[4.4rem] bg-white opacity-70 text-black rounded-full text-caption-bold whitespace-nowrap">
                  숨겨진 가게는 바로 여기!
                </div>
                <img
                  src={write_icon_orange}
                  alt="write_icon_orange"
                  className="absolute left-[100%] top-[0%] translate-x-[-50%] translate-y-[-50%]"
                />
              </div>
            )}
          </div>

          {/* Progress Dots */}
          <div className="fixed bottom-[15%] left-1/2 -translate-x-1/2 z-10 flex justify-center items-center space-x-5">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full ${index === currentStep ? 'bg-primary-800' : 'bg-white'}`}
              />
            ))}
          </div>

          {/* Start Button (마지막 단계에서만 표시) */}
          {currentStep === steps.length - 1 && (
            <button
              onClick={handleStart}
              className="max-w-[30rem] w-full fixed bottom-[5%] left-1/2 -translate-x-1/2 z-10 bg-primary-800 text-white text-heading-medium h-[4.8rem] rounded-[1rem] cursor-pointer"
            >
              탐험 떠나기
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Introduce;
