import { Play, Pause } from 'lucide-react';
import { useGlobe } from '../../hooks/useGlobe';

const GlobeControls = () => {
  const { isAutoRotating, pauseRotation, resumeRotation } = useGlobe();

  return (
    <div className="absolute top-4 right-4 z-20">
      <button
        onClick={isAutoRotating ? pauseRotation : resumeRotation}
        className="bg-bg-surface border border-border-glow rounded-lg p-2 text-text-secondary hover:bg-bg-elevated transition-colors"
      >
        {isAutoRotating ? <Pause size={20} /> : <Play size={20} />}
      </button>
    </div>
  );
};

export default GlobeControls;