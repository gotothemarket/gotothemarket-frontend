import Header from '../../components/Header';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { myBadgesOptions } from '../../apis/mypage/api';

const SectionTitle = ({ title, subtitle }) => (
  <div className="px-[2rem]">
    {subtitle && <div className="text-[#C8C8C8] text-[1.2rem] leading-[1.4rem]">{subtitle}</div>}
    <div className="text-white text-body-medium mt-[0.4rem]">{title}</div>
  </div>
);

const BadgeCard = ({ badge, isEquipped, acquired }) => (
  <div
    className={`flex flex-col items-center justify-center w-[15rem] h-[12.1rem] rounded-[1rem] ${
      isEquipped
        ? 'bg-[#181818] border border-[#FA0]'   // 장착: 테두리 강조 + 밝음
        : acquired
          ? 'bg-[#181818]'                      // 획득(미장착): 밝음
          : 'bg-[#131313] opacity-40'           // 미획득: 어둡게
    }`}
  >
    <img
      src={badge.badgeIcon}
      alt={badge.badgeName}
      className="w-[8rem] h-[8rem] object-contain"
    />
  </div>
);

const BadgeLabel = ({ children, acquired, equipped }) => (
  <div
    className={`mt-[0.8rem] w-[15rem] text-center rounded-[1rem] py-[0.7rem] text-[1.4rem] ${
      acquired && equipped
        ? 'bg-white text-[#F17F0C] font-semibold'
        : acquired && !equipped
          ? 'bg-black border border-white text-white'
          : 'bg-transparent border border-white/40 text-white opacity-40'
    }`}
  >
    {children}
  </div>
);

const MyBadge = () => {
  const navigate = useNavigate();

  // 내 뱃지 데이터 가져오기
  const { data: badgesData, isLoading, error } = useQuery(myBadgesOptions());

  // 디버깅을 위한 콘솔 로그
  console.log('뱃지 API 응답 전체 데이터:', badgesData);
  console.log('뱃지 API 응답 data:', badgesData?.data);
  console.log('뱃지 API 응답 equipped_badge:', badgesData?.data?.equipped_badge);
  console.log('뱃지 API 응답 badges:', badgesData?.data?.badges);
  console.log('로딩 상태:', isLoading);
  console.log('에러 상태:', error);

  // 로딩 상태 처리
  if (isLoading) {
    return (
      <div className="bg-black min-h-screen pb-[8.3rem] flex items-center justify-center">
        <div className="text-white text-[1.8rem]">로딩 중...</div>
      </div>
    );
  }

  // 에러 상태 처리
  if (error) {
    console.error('뱃지 API 에러 상세:', error);
    return (
      <div className="bg-black min-h-screen pb-[8.3rem] flex items-center justify-center">
        <div className="text-white text-[1.8rem]">데이터를 불러오는데 실패했습니다.</div>
      </div>
    );
  }

  // 데이터가 없을 경우 처리
  if (!badgesData || !Array.isArray(badgesData)) {
    console.log('뱃지 데이터가 없습니다. badgesData:', badgesData);
    return (
      <div className="bg-black min-h-screen pb-[8.3rem] flex items-center justify-center">
        <div className="text-white text-[1.8rem]">데이터가 없습니다.</div>
      </div>
    );
  }

  // API 응답이 배열로 직접 오므로 badges 배열 사용
  const badges = badgesData;

  // 장착된 뱃지는 acquired: true이고 equipped: true인 뱃지
  const equipped_badge = badges.find((badge) => badge.equipped) || null;

  console.log('파싱된 equipped_badge:', equipped_badge);
  console.log('파싱된 badges:', badges);
  console.log('equippedId:', equipped_badge?.badgeId || 0);

  // equipped_badge.id 이하만 활성화
  const equippedId = equipped_badge?.badgeId ?? 0;

  return (
    <div className="bg-black min-h-screen pb-[8.3rem]">
      <Header title="내 뱃지" variant="dark" onBack={() => navigate(-1)} />

      {/* 현재 장착 중 */}
      <div className="mt-[1rem]">
        <div className="text-white text-[1.2rem] pl-[2rem]">
          현재 <span className="text-[#FFAA00]">{equipped_badge?.badgeName || '뱃지 없음'}</span>{' '}
          장착중
        </div>
        <div className="mt-[1.2rem] px-[2rem] grid grid-cols-2 gap-x-[1.6rem] place-items-center">
          {equipped_badge ? (
            <div className="w-[15rem] h-[12.1rem] rounded-[1rem] bg-[#181818] border border-[#FA0] p-[2.6rem]">
              <div className="w-full h-full rounded-[1rem] flex items-center justify-center">
                <img
                  src={equipped_badge.badgeIcon}
                  alt={equipped_badge.badgeName}
                  className="w-[8rem] h-[8rem] object-contain"
                />
              </div>
            </div>
          ) : (
            <div className="w-[15rem] h-[12.1rem] rounded-[1rem] bg-[#131313] border border-white/40 flex items-center justify-center">
              <div className="text-white text-[1.4rem] opacity-40">장착된 뱃지 없음</div>
            </div>
          )}
          <div className="w-[15rem] h-[12.1rem]"></div>
        </div>
      </div>

      {/* 구분선 */}
      <div className="my-[1.6rem] h-[4px] bg-white/30" />

      {/* 내 뱃지 그리드 */}
      <SectionTitle title="내 뱃지" />
      <div className="mt-[1.2rem] px-[2rem] grid grid-cols-2 gap-x-[1.6rem] gap-y-[2rem]">
        {badges && badges.length > 0 ? (
          badges.map((badge) => {
            const isEquipped = !!badge.equipped; // 장착 여부
            const acquired = !!badge.acquired; // 획득 여부
            return (
              <div key={badge.badgeId} className="flex flex-col items-center">
                <BadgeCard badge={badge} isEquipped={isEquipped} acquired={acquired} />
                <BadgeLabel acquired={badge.acquired} equipped={badge.equipped}>
                  {badge.badgeName}
                </BadgeLabel>
              </div>
            );
          })
        ) : (
          <div className="col-span-2 text-center text-[#787878] text-[1.4rem] py-[3rem]">
            획득한 뱃지가 없습니다.
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBadge;
