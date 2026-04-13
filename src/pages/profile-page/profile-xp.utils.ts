/** Соответствует `public.level_from_experience_points` в supabase/sql/shiba_academy.sql */
export function levelFromExperiencePoints(xp: number): number {
  if (xp == null || xp <= 0) return 0;
  let l = 1;
  let cum = 0;
  while (l <= 500) {
    const need = l * 50;
    if (xp < cum + need) return l;
    cum += need;
    l += 1;
  }
  return l;
}

/**
 * Сегмент прогресс-бара: текущий уровень, накоплено XP внутри шага, размер шага (L→L+1 = L*50).
 */
export function getXpBarSegment(totalXp: number): {
  level: number;
  xpInStep: number;
  xpStepSize: number;
  nextLevel: number;
} {
  const xp = Math.max(0, Number(totalXp) || 0);
  if (xp <= 0) {
    return {
      level: 0,
      xpInStep: 0,
      xpStepSize: 1,
      nextLevel: 1,
    };
  }
  let l = 1;
  let cum = 0;
  while (l <= 500) {
    const need = l * 50;
    if (xp < cum + need) {
      return {
        level: l,
        xpInStep: xp - cum,
        xpStepSize: need,
        nextLevel: l + 1,
      };
    }
    cum += need;
    l += 1;
  }
  const need = l * 50;
  return { level: l, xpInStep: 0, xpStepSize: need, nextLevel: l + 1 };
}
