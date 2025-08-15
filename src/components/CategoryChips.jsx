import React from 'react';
import CategoryChip from './CategoryChip';
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

const CategoryChips = ({ value, onChange }) => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {CATEGORIES.map((category) => (
        <CategoryChip
          key={category.id}
          id={category.id}
          label={category.label}
          icon={category.icon}
          isSelected={value === category.id}
          onClick={onChange}
          className="flex-shrink-0"
        />
      ))}
    </div>
  );
};

export default CategoryChips;
