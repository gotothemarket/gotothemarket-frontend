import React, { useState } from 'react';
import step1 from '../../assets/introduce1.svg';

const Introduce = () => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      number: '①',
      title: '발견하기',
      description: '전통시장 곳곳을 탐험하며 마음에 드는 가게를 발견하세요.',
      image: <img src={step1} alt="발견하기" className="max-w-[400px] w-full max-h-[100%]" />,
    },
    {
      number: '②',
      title: '기록하기',
      description: '리뷰와 사진으로 여러분의 발견을 남기세요.',
      image: (
        <div className="flex items-center justify-center space-x-8">
          {/* Photo stack */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="w-20 h-16 bg-white rounded shadow-md transform rotate-3"></div>
              <div className="w-20 h-16 bg-white rounded shadow-md absolute top-0 left-0 transform -rotate-2"></div>
              <div className="w-20 h-16 bg-white rounded shadow-md absolute top-0 left-0 transform rotate-1"></div>
            </div>
            <button className="mt-3 px-4 py-2 bg-orange-200 text-orange-800 rounded text-sm font-medium">
              사진 기록하기
            </button>
          </div>
          {/* Writing hand */}
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-orange-300 rounded-full flex items-center justify-center">
              <div className="w-8 h-8 bg-red-500 rounded-full"></div>
            </div>
            <button className="mt-3 px-4 py-2 bg-orange-200 text-orange-800 rounded text-sm font-medium">
              리뷰 쓰기
            </button>
          </div>
        </div>
      ),
    },
    {
      number: '③',
      title: '함께 나누기',
      description: '마지막으로, 다른 탐험가들의 보물을 지도에서 찾아보세요.',
      image: (
        <div className="relative w-64 h-40 bg-gray-200 rounded-lg overflow-hidden">
          <div className="absolute inset-0 bg-gray-100">
            {/* Map roads */}
            <div className="absolute top-4 left-4 w-16 h-1 bg-green-500 rounded"></div>
            <div className="absolute top-8 left-4 w-12 h-1 bg-green-500 rounded"></div>
            <div className="absolute top-12 left-8 w-8 h-1 bg-green-500 rounded"></div>
            {/* Buildings */}
            <div className="absolute top-2 left-2 w-3 h-3 bg-gray-400 rounded-sm"></div>
            <div className="absolute top-6 left-6 w-2 h-2 bg-gray-400 rounded-sm"></div>
            <div className="absolute top-10 left-12 w-3 h-2 bg-gray-400 rounded-sm"></div>
          </div>
          {/* Multiple map pins */}
          <div className="absolute top-6 left-8">
            <div className="w-4 h-4 bg-black rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
            </div>
            <div className="w-1 h-2 bg-black mx-auto"></div>
          </div>
          <div className="absolute top-10 left-16">
            <div className="w-4 h-4 bg-black rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
            </div>
            <div className="w-1 h-2 bg-black mx-auto"></div>
          </div>
          <div className="absolute top-8 left-24">
            <div className="w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
            <div className="w-1 h-2 bg-yellow-400 mx-auto"></div>
          </div>
          {/* Market name */}
          <div className="absolute bottom-2 left-2 text-xs text-gray-600 font-medium">
            삼성사계시장
          </div>
          {/* Binoculars character */}
          <div className="absolute -top-4 -right-4 w-12 h-12 bg-orange-300 rounded-full flex items-center justify-center">
            <div className="w-8 h-6 bg-black rounded-full flex items-center justify-center space-x-1">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleStart = () => {
    // TODO: Navigate to main app
    console.log('Start exploring!');
  };

  const currentStepData = steps[currentStep];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-main-800 p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-white text-xl font-semibold mb-2">서비스 소개</h1>
          <div className="text-orange-300 text-sm">{currentStep + 1}/3</div>
        </div>

        {/* Main Content */}
        <div>
          {/* Step Number and Title */}
          <div className="mb-6">
            <div className="text-white text-6xl font-bold mb-2">{currentStepData.number}</div>
            <h2 className="text-white text-2xl font-bold">{currentStepData.title}</h2>
          </div>

          {/* Description */}
          <p className="text-white text-base mb-8 leading-relaxed">{currentStepData.description}</p>

          {/* Illustration */}
          <div className="mb-8 flex justify-center">{currentStepData.image}</div>

          {/* Button */}
          <button
            onClick={currentStep === steps.length - 1 ? handleStart : handleNext}
            className="w-full bg-main-700 text-white font-semibold py-4 px-6 h-[4.8rem] rounded-[1rem] cursor-pointer   "
          >
            {currentStep === steps.length - 1 ? '탐험 떠나기' : '다음'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Introduce;
