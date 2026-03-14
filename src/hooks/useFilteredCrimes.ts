import { useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import type { CrimeEvent } from '../types';

export const useFilteredCrimes = (): CrimeEvent[] => {
  const { crimes, filters } = useAppStore();

  return useMemo(() => {
    return crimes.filter((crime) => {
      if (filters.era !== 'all' && crime.era !== filters.era) return false;
      if (!filters.categories.includes(crime.category)) return false;
      if (crime.severity < filters.severity) return false;
      if (crime.year < filters.yearFrom || crime.year > filters.yearTo) return false;
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return (
          crime.title.toLowerCase().includes(searchLower) ||
          crime.country.toLowerCase().includes(searchLower) ||
          crime.perpetrators.some(p => p.toLowerCase().includes(searchLower)) ||
          crime.detail.toLowerCase().includes(searchLower)
        );
      }
      return true;
    });
  }, [crimes, filters]);
};