import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

const TRANSITION_MS = 300;

export default function HomeBottomsheet({ open, onClose, children }) {
  const [visible, setVisible] = useState(open); // DOM 마운트 제어
  const [internalOpen, setInternalOpen] = useState(open); // 실제 애니메이션 트리거

  // 스크롤 락: 시트가 DOM에 있을 때만 잠금
  useEffect(() => {
    document.body.style.overflow = visible ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [visible]);

  useEffect(() => {
    if (open) {
      // 1) DOM 먼저 붙임(translate-y-full 상태)
      setVisible(true);
      setInternalOpen(false);
      // 2) 다음-다다음 프레임에 translate-y-0로 전환 → 슬라이드 업
      const id1 = requestAnimationFrame(() => {
        const id2 = requestAnimationFrame(() => setInternalOpen(true));
        return () => cancelAnimationFrame(id2);
      });
      return () => cancelAnimationFrame(id1);
    } else {
      // 슬라이드 다운 후 언마운트
      setInternalOpen(false);
      const t = setTimeout(() => setVisible(false), TRANSITION_MS);
      return () => clearTimeout(t);
    }
  }, [open]);

  if (!visible) return null;

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex flex-col justify-end">
      {/* dim */}
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
          internalOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />

      {/* sheet */}
      <div
        className={`absolute left-1/2 -translate-x-1/2 bottom-0 w-[min(430px,100vw)] h-[426px]
                    bg-white rounded-t-[2rem] shadow-xl transform transition-transform duration-300
                    ${internalOpen ? 'translate-y-0' : 'translate-y-full'}`}
      >
        {/* grabber */}
        <div className="flex justify-center pt-[1rem]">
          <div className="h-[0.7rem] w-[8.5rem] rounded-full bg-gray-300" />
        </div>
        <div className="h-[calc(100%-1rem)] pt-[4.6rem] overflow-y-auto p-4">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
