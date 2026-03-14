import { useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { useFilteredCrimes } from '../../hooks/useFilteredCrimes';

const HotspotLayer = () => {
  const { selectedCrime } = useAppStore();
  const filteredCrimes = useFilteredCrimes();

  useEffect(() => {
    // Animation logic for hotspots can be added here
  }, [selectedCrime, filteredCrimes]);

  return null; // This component handles animations, actual rendering is in GlobeCanvas
};

export default HotspotLayer;