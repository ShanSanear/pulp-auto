// Dice rolling utilities for CoC 7e / Pulp Cthulhu

export function rollD100(): number {
  return Math.floor(Math.random() * 100) + 1;
}

export function rollDie(sides: number): number {
  return Math.floor(Math.random() * sides) + 1;
}

// Parse damage string like "1d10+2", "2d6", "1k10+2", "1K8"
// Accepts d/D (English) and k/K (Polish "kość") as the dice separator
export function parseDamage(damageStr: string): { count: number; sides: number; bonus: number } {
  const match = damageStr.toLowerCase().match(/(\d+)[dk](\d+)(?:\+(\d+))?/);
  if (!match) return { count: 1, sides: 10, bonus: 0 };
  return {
    count: parseInt(match[1]),
    sides: parseInt(match[2]),
    bonus: match[3] ? parseInt(match[3]) : 0,
  };
}

export function rollDamage(damageStr: string): { total: number; rolls: number[]; bonus: number } {
  const { count, sides, bonus } = parseDamage(damageStr);
  const rolls: number[] = [];
  for (let i = 0; i < count; i++) {
    rolls.push(rollDie(sides));
  }
  const total = rolls.reduce((a, b) => a + b, 0) + bonus;
  return { total, rolls, bonus };
}

// Roll with penalty dice: roll extra tens digits and pick worst
export function rollWithPenalty(penaltyDice: number): { result: number; allTens: number[]; units: number } {
  const units = rollDie(10) - 1; // 0-9
  const tensCount = 1 + penaltyDice;
  const allTens: number[] = [];
  for (let i = 0; i < tensCount; i++) {
    allTens.push(Math.floor(Math.random() * 10)); // 0-9 representing 00-90
  }
  // Pick the worst (highest) tens digit; but 00 + 0 = 100, not 0
  // Special: if units=0 and one tens=0, that's 100 (worst possible)
  const maxTens = Math.max(...allTens);
  let result = maxTens * 10 + units;
  if (result === 0) result = 100;
  return { result, allTens, units };
}

export interface VolleyTarget {
  targetName: string;
  bulletsInVolley: number;
}

export interface VolleyResult {
  targetName: string;
  volleyIndex: number;
  bulletsInVolley: number;
  penaltyDice: number;
  difficultyLevel: string; // "Normal", "Hard", "Extreme", "Critical", "Impossible"
  roll: number;
  allTens: number[];
  units: number;
  success: boolean;
  extreme: boolean;
  critical: boolean;
  fumble: boolean;
  malfunction: boolean;
  bulletsHit: number;
  impaling: number;
  damagePerBullet: { total: number; rolls: number[]; bonus: number; impale?: boolean; maxDmg?: number; extraRolls?: number[] }[];
  totalDamage: number;
  armorReduction: number;
  netDamage: number;
}

export interface FullAutoConfig {
  skill: number;
  totalBullets: number;
  weaponDamage: string;
  weaponMalfunction: number;
  armor: number;
  baseDifficulty: "Normal" | "Hard" | "Extreme";
  volleys: VolleyTarget[];
  ignoreMalfunction?: boolean;
}

const DIFFICULTY_ORDER = ["Normal", "Hard", "Extreme", "Critical", "Impossible"];

function getEffectiveDifficulty(base: string, increments: number): string {
  const idx = DIFFICULTY_ORDER.indexOf(base);
  const newIdx = Math.min(idx + increments, DIFFICULTY_ORDER.length - 1);
  return DIFFICULTY_ORDER[newIdx];
}

function getThreshold(skill: number, difficulty: string): number {
  switch (difficulty) {
    case "Normal": return skill;
    case "Hard": return Math.floor(skill / 2);
    case "Extreme": return Math.floor(skill / 5);
    case "Critical": return 1;
    case "Impossible": return 0; // can never succeed
    default: return skill;
  }
}

export function resolveFullAuto(config: FullAutoConfig): VolleyResult[] {
  const results: VolleyResult[] = [];
  let attackRollIndex = 0;
  let malfunctioned = false;

  for (const volley of config.volleys) {
    if (malfunctioned && !config.ignoreMalfunction) break;

    // Calculate penalty dice: 0 for first attack roll, +1 for each subsequent
    let rawPenalty = attackRollIndex;
    let difficultyIncrements = 0;

    // If penalty would be 3+, cap at 2 and increase difficulty
    if (rawPenalty >= 3) {
      difficultyIncrements = rawPenalty - 2;
      rawPenalty = 2;
    }

    const effectiveDifficulty = getEffectiveDifficulty(config.baseDifficulty, difficultyIncrements);
    const threshold = getThreshold(config.skill, effectiveDifficulty);

    // Roll
    const { result: roll, allTens, units } = rollWithPenalty(rawPenalty);

    // Check malfunction
    const isMalfunction = !config.ignoreMalfunction && roll >= config.weaponMalfunction;

    // Check success
    const isCritical = roll === 1;
    const isFumble = roll === 100 || (config.skill < 50 && roll >= 96);
    const isExtreme = roll <= Math.floor(config.skill / 5);
    const isSuccess = !isMalfunction && !isFumble && roll <= threshold;

    let bulletsHit = 0;
    let impalingCount = 0;
    const damagePerBullet: { total: number; rolls: number[]; bonus: number }[] = [];

    if (isSuccess) {
      if (isCritical || (isExtreme && effectiveDifficulty !== "Extreme")) {
        // Extreme success: all bullets hit, first half impale
        bulletsHit = volley.bulletsInVolley;
        impalingCount = Math.max(1, Math.floor(volley.bulletsInVolley / 2));
      } else {
        // Regular success: half bullets hit
        bulletsHit = Math.max(1, Math.floor(volley.bulletsInVolley / 2));
        impalingCount = 0;
      }
    }

    let totalDamage = 0;
    for (let b = 0; b < bulletsHit; b++) {
      const dmg = rollDamage(config.weaponDamage);
      // Impaling bullets get max damage + extra roll
      if (b < impalingCount) {
        const { count, sides, bonus } = parseDamage(config.weaponDamage);
        const maxDmg = count * sides + bonus;
        const extraRoll = rollDamage(config.weaponDamage);
        const impaleDmg = {
          total: maxDmg + extraRoll.total,
          rolls: dmg.rolls,
          bonus,
          impale: true,
          maxDmg,
          extraRolls: extraRoll.rolls,
        };
        damagePerBullet.push(impaleDmg);
        totalDamage += impaleDmg.total;
      } else {
        damagePerBullet.push(dmg);
        totalDamage += dmg.total;
      }
    }

    const armorReduction = bulletsHit * config.armor;
    const netDamage = Math.max(0, totalDamage - armorReduction);

    results.push({
      targetName: volley.targetName,
      volleyIndex: attackRollIndex + 1,
      bulletsInVolley: volley.bulletsInVolley,
      penaltyDice: rawPenalty,
      difficultyLevel: effectiveDifficulty,
      roll,
      allTens,
      units,
      success: isSuccess,
      extreme: isExtreme && isSuccess,
      critical: isCritical,
      fumble: isFumble,
      malfunction: isMalfunction,
      bulletsHit,
      impaling: impalingCount,
      damagePerBullet,
      totalDamage,
      armorReduction,
      netDamage,
    });

    if (isMalfunction && !config.ignoreMalfunction) {
      malfunctioned = true;
    }

    attackRollIndex++;
  }

  return results;
}
