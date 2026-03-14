import StarField from './StarField';

interface SpaceBackdropProps {
  desktopCount?: number;
  mobileCount?: number;
}

const SpaceBackdrop = ({ desktopCount = 1400, mobileCount = 760 }: SpaceBackdropProps) => {
  return (
    <>
      <div className="space-base" />
      <div className="nebula nebula-1" />
      <div className="nebula nebula-2" />
      <div className="nebula nebula-3" />
      <StarField desktopCount={desktopCount} mobileCount={mobileCount} />
      <div className="grain-overlay" />
    </>
  );
};

export default SpaceBackdrop;