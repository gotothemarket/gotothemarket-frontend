import React from 'react';
import produceIcon from '../assets/과일야채.svg';
import seafoodIcon from '../assets/수산.svg';
import restaurantIcon from '../assets/요리.svg';
import clothingIcon from '../assets/의류.svg';
import miscIcon from '../assets/잡화.svg';
import meatIcon from '../assets/축산.svg';
import streetIcon from '../assets/길거리.svg';
import bakeryIcon from '../assets/빵떡.svg';

const CATEGORIES = [
  { id: 'produce', label: '과일·야채', icon: produceIcon },
  { id: 'seafood', label: '수산', icon: seafoodIcon },
  { id: 'restaurant', label: '식당', icon: restaurantIcon },
  { id: 'clothing', label: '의류', icon: clothingIcon },
  { id: 'misc', label: '잡화', icon: miscIcon },
  { id: 'meat', label: '축산', icon: meatIcon },
  { id: 'street', label: '길거리음식', icon: streetIcon },
  { id: 'bakery', label: '빵/떡', icon: bakeryIcon },
];

export default function CategoryChips({ value, onChange }) {
  return (
    <div className="w-full">
      {/* 가로 스크롤 영역 */}
      <div
        className="flex gap-3 px-4 py-2 overflow-x-auto scrollbar-hidden"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitScrollbar: { display: 'none' },
        }}
      >
        {CATEGORIES.map((c) => {
          const selected = value === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onChange?.(selected ? null : c.id)}
              className={[
                'shrink-0 inline-flex items-center gap-2 rounded-[10px] px-4 py-2.5 text-sm shadow-sm transition-colors',
                selected
                  ? 'bg-[#FFF8C8] ring-[0.8px] ring-[#FFEC74]'
                  : 'bg-white hover:bg-gray-50 ring-[0.8px] ring-gray-400',
              ].join(' ')}
            >
              <img src={c.icon} alt={c.label} className="w-[1.4rem] h-[1.4rem]" />
              <span className="whitespace-nowrap">{c.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
