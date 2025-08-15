import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';

const TRANSITION_MS = 300;
const CLOSE_THRESHOLD_PX = 120; // 아래로 120px 이상 드래그 시 닫기
const EXPAND_START_THRESHOLD = -30; // 위로 30px부터 확장 시작 (더 쉽게)
const NAVIGATE_THRESHOLD = 150; // 150px 이상 확장되면 네비게이트

export default function HomeBottomsheet({ open, onClose, children, onFullPage }) {
  const [visible, setVisible] = useState(open); // DOM 존재 여부
  const [internalOpen, setInternalOpen] = useState(open); // 애니메이션 트리거
  const [dragStart, setDragStart] = useState(null);
  const [dragY, setDragY] = useState(0);
  const [isExpanding, setIsExpanding] = useState(false); // 확장 모드 여부
  const [expandHeight, setExpandHeight] = useState(0); // 확장된 추가 높이
  const sheetRef = useRef(null);

  // body scroll lock
  useEffect(() => {
    document.body.style.overflow = visible ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [visible]);

  // open/close 애니메이션
  useEffect(() => {
    if (open) {
      setVisible(true);
      setInternalOpen(false);
      setIsExpanding(false);
      setExpandHeight(0);
      const id1 = requestAnimationFrame(() => {
        const id2 = requestAnimationFrame(() => setInternalOpen(true));
        return () => cancelAnimationFrame(id2);
      });
      return () => cancelAnimationFrame(id1);
    } else {
      setInternalOpen(false);
      setIsExpanding(false);
      setExpandHeight(0);
      const t = setTimeout(() => setVisible(false), TRANSITION_MS);
      return () => clearTimeout(t);
    }
  }, [open]);

  // 드래그
  const handleTouchStart = (e) => {
    setDragStart(e.touches[0].clientY);
    setDragY(0);
  };

  const handleTouchMove = (e) => {
    if (dragStart == null) return;
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - dragStart; // 위로 드래그하면 음수, 아래로 드래그하면 양수

    console.log('TouchMove - deltaY:', deltaY, 'expandHeight:', expandHeight); // 디버깅용

    // 위로 드래그할 때 확장 모드 활성화
    if (deltaY < EXPAND_START_THRESHOLD) {
      setIsExpanding(true);
      // 위로 드래그한 거리만큼 높이 증가
      const upwardDistance = Math.abs(deltaY); // 위로 드래그한 거리 (양수로 변환)
      const maxExpand = window.innerHeight - 300; // 기본 높이 제외
      const expandAmount = Math.min(upwardDistance * 2, maxExpand); // 2배로 확장 속도 증가
      setExpandHeight(expandAmount);
      setDragY(0); // 위로 드래그시에는 시트 이동 없음
    } else {
      setIsExpanding(false);
      setExpandHeight(0);
      // 아래로 당길 때만 따라오게
      setDragY(Math.max(0, deltaY));
    }
  };

  const handleTouchEnd = () => {
    if (dragStart == null) return;

    console.log('TouchEnd - isExpanding:', isExpanding, 'expandHeight:', expandHeight); // 디버깅용

    // 확장 모드에서 일정 높이 이상이면 전체 페이지로 이동
    if (isExpanding && expandHeight > NAVIGATE_THRESHOLD) {
      console.log('Navigating to full page!'); // 디버깅용
      onFullPage?.();
      return;
    }

    // 아래로 충분히 당김 → 닫기
    if (dragY >= CLOSE_THRESHOLD_PX) {
      onClose?.();
      return;
    }

    // 원래 상태로 복귀
    setDragStart(null);
    setDragY(0);
    setIsExpanding(false);
    setExpandHeight(0);
  };

  const handleMouseDown = (e) => {
    setDragStart(e.clientY);
    setDragY(0);
  };

  const handleMouseMove = (e) => {
    if (dragStart == null) return;
    const currentY = e.clientY;
    const deltaY = currentY - dragStart;

    console.log('MouseMove - deltaY:', deltaY, 'expandHeight:', expandHeight); // 디버깅용

    if (deltaY < EXPAND_START_THRESHOLD) {
      setIsExpanding(true);
      const upwardDistance = Math.abs(deltaY);
      const maxExpand = window.innerHeight - 300;
      const expandAmount = Math.min(upwardDistance * 2, maxExpand);
      setExpandHeight(expandAmount);
      setDragY(0);
    } else {
      setIsExpanding(false);
      setExpandHeight(0);
      setDragY(Math.max(0, deltaY));
    }
  };

  const handleMouseUp = () => {
    handleTouchEnd();
  };

  // 마우스 이벤트 전역 등록
  useEffect(() => {
    if (dragStart !== null) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragStart, expandHeight, isExpanding]);

  if (!visible) return null;

  // 기본 높이 + 확장 높이 계산
  const baseHeight = '40rem';
  const dynamicHeight = isExpanding ? `calc(${baseHeight} + ${expandHeight}px)` : baseHeight;

  // translateY: 열림 0%, 닫힘 100% + 드래그(px)
  const translateStyle = {
    transform: `translateY(calc(${internalOpen ? '0%' : '100%'} + ${dragY}px))`,
    height: dynamicHeight,
    transition:
      dragStart !== null
        ? 'none'
        : `transform ${TRANSITION_MS}ms ease-out, height ${TRANSITION_MS}ms ease-out`,
  };

  return createPortal(
    <div className="fixed inset-0 z-[1000]">
      {/* DIM */}
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
          internalOpen ? 'opacity-100' : 'opacity-0'
        } ${isExpanding ? 'bg-black/60' : ''}`}
        onClick={onClose}
      />

      {/* X축 중앙 래퍼 (반응형 너비 제어) */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-full max-w-[430px]">
        {/* SHEET: 반응형 높이/여백, Y축만 transform */}
        <div
          ref={sheetRef}
          className={`bg-white rounded-t-[2rem] shadow-xl will-change-transform touch-pan-y overscroll-contain pb-[env(safe-area-inset-bottom)] ${
            isExpanding ? 'shadow-2xl' : ''
          }`}
          style={translateStyle}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
        >
          {/* grabber */}
          <div className="flex justify-center pt-3">
            <div
              className={`h-1.5 w-16 rounded-full bg-gray-300 transition-all duration-200 ${
                isExpanding ? 'bg-gray-400 w-20' : ''
              }`}
            />
          </div>

          {/* expansion indicator */}
          {isExpanding && (
            <div className="text-center py-2">
              <div className="text-sm text-gray-500">
                {expandHeight >= NAVIGATE_THRESHOLD
                  ? '🚀 손을 놓으면 전체 화면으로 이동합니다!'
                  : `계속 위로 당기세요 (${Math.round(expandHeight)}/${NAVIGATE_THRESHOLD}px)`}
              </div>
            </div>
          )}

          {/* content */}
          <div
            className="flex-1 pt-[1rem] overflow-y-auto px-4"
            style={{
              maxHeight: isExpanding ? 'calc(100vh - 100px)' : '50rem',
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
