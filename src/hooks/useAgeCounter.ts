import { useMemo } from 'react';

export function useAgeCounter(): number {
  const age = useMemo(() => {
    const birthDate = new Date('2004-05-03');
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const dayDiff = today.getDate() - birthDate.getDate();

    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      age--;
    }

    return age;
  }, []);

  return age;
}
