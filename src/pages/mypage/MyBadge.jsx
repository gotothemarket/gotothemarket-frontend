import Header from '../../components/Header';
import { useNavigate } from 'react-router-dom';
import badgesData from '../../mocks/badges_mocks.json';

const SectionTitle = ({ title, subtitle }) => (
  <div className="px-[2rem]">
    {subtitle && <div className="text-[#C8C8C8] text-[1.2rem] leading-[1.4rem]">{subtitle}</div>}
    <div className="text-white text-body-medium mt-[0.4rem]">{title}</div>
  </div>
);

const BadgeCard = ({ badge, isEquipped, isActive }) => (
  <div
    className={`flex flex-col items-center justify-center w-[15rem] h-[12.1rem] rounded-[1rem] ${
      isEquipped
        ? 'bg-[#181818] border border-[#FA0]'
        : isActive
          ? 'bg-[#181818]'
          : 'bg-[#131313] opacity-40'
    }`}
  >
    <img
      src={badge.badge_icon}
      alt={badge.badge_name}
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
  const { equipped_badge, badges } = badgesData.data;

  // equipped_badge.id 이하만 활성화
  const equippedId = equipped_badge?.badge_id ?? 0;

  return (
    <div className="bg-black min-h-screen pb-[8.3rem]">
      <Header title="내 뱃지" variant="dark" onBack={() => navigate(-1)} />

      {/* 현재 장착 중 */}
      <div className="mt-[1rem]">
        <div className="text-white text-[1.2rem] pl-[2rem]">
          현재 <span className="text-[#FFAA00]">{equipped_badge.badge_name}</span> 장착중
        </div>
        <div className="mt-[1.2rem] px-[2rem] grid grid-cols-2 gap-x-[1.6rem] place-items-center">
          <div className="w-[15rem] h-[12.1rem] rounded-[1rem] bg-[#181818] border border-[#FA0] p-[2.6rem]">
            <div className="w-full h-full rounded-[1rem] flex items-center justify-center">
              <img
                src={equipped_badge.badge_icon}
                alt={equipped_badge.badge_name}
                className="w-[8rem] h-[8rem] object-contain"
              />
            </div>
          </div>
          <div className="w-[15rem] h-[12.1rem]"></div>
        </div>
      </div>

      {/* 구분선 */}
      <div className="my-[1.6rem] h-[4px] bg-white/30" />

      {/* 내 뱃지 그리드 */}
      <SectionTitle title="내 뱃지" />
      <div className="mt-[1.2rem] px-[2rem] grid grid-cols-2 gap-x-[1.6rem] gap-y-[2rem]">
        {badges.map((badge) => {
          const isEquipped = badge.badge_id === equippedId;
          const isActive = badge.badge_id <= equippedId;
          return (
            <div key={badge.badge_id} className="flex flex-col items-center">
              <BadgeCard badge={badge} isEquipped={isEquipped} isActive={isActive} />
              <BadgeLabel acquired={badge.acquired} equipped={badge.equipped}>
                {badge.badge_name}
              </BadgeLabel>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyBadge;
