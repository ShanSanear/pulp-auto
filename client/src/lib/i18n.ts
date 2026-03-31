// i18n — lightweight translation system for Pulp Cthulhu Full Auto Calculator
// To add a new language:
//   1. Add its locale code to the `Locale` type
//   2. Add a full translation object to `translations` — TypeScript will error on missing keys
//   3. Add a display name to `LOCALE_NAMES`

import { useSyncExternalStore } from "react";

// ─── Locale type & names ──────────────────────────────────────────────────────

export type Locale = "pl" | "en";

export const LOCALE_NAMES: Record<Locale, string> = {
  pl: "PL",
  en: "EN",
};

// ─── Translation schema ───────────────────────────────────────────────────────
// Every key maps to a string (may contain {placeholder} tokens).
// TypeScript will enforce that every locale has every key.

export interface Translations {
  // character-panel
  charactersSectionTitle: string;
  newCharacterButton: string;
  noCharacters: string;
  editCardTitleNew: string;
  editCardTitleEdit: string;
  unsavedChangesBadge: string;
  collapseFormAriaLabel: string;
  expandFormAriaLabel: string;
  labelName: string;
  placeholderName: string;
  labelSkillSmg: string;
  labelSkillMg: string;
  labelWeaponPreset: string;
  customWeaponOption: string;
  labelDamage: string;
  labelMagazine: string;
  labelWeaponType: string;
  weaponTypeSmg: string;
  weaponTypeMg: string;
  labelMalfunction: string;
  infoActiveSkill: string;      // {value}
  infoVolleySize: string;       // {value}
  infoHard: string;             // {value}
  infoExtreme: string;          // {value}
  createButton: string;
  saveButton: string;
  toastCharacterCreatedTitle: string;
  toastCharacterCreatedDescription: string;  // {name}
  toastSavedTitle: string;
  toastDeletedTitle: string;
  defaultCharacterName: string;
  // volley-configurator — config
  volleyConfigTitle: string;
  labelDifficulty: string;
  difficultyNormal: string;
  difficultyHard: string;
  difficultyExtreme: string;
  checkboxIgnoreMalfunction: string;
  labelTargetDistance: string;
  defaultTargetName: string;    // {n}
  labelVolleys: string;
  labelBulletsPerVolley: string;
  labelArmor: string;
  bulletCountSummary: string;   // {volleys} {bpv} {total}
  addTargetButton: string;
  summaryBulletsForVolleys: string;
  summaryBulletsTraversal: string;
  summaryTotal: string;
  summaryAttackRolls: string;
  warningOverMagazine: string;
  fireButton: string;
  resultsTitle: string;
  clearResultsButton: string;
  summaryCardTitle: string;
  summaryHitsAndImpales: string;  // {hits} {impales}
  summaryImpalesPart: string;     // {n}
  summaryPoints: string;          // {value}
  summaryRaw: string;             // {value}
  // volley-configurator — result card
  volleyBadgeLabel: string;       // {n}
  bulletsSuffix: string;          // {n}
  penaltyDiceBadge: string;       // {n}
  difficultyLabelNormal: string;
  difficultyLabelHard: string;
  difficultyLabelExtreme: string;
  difficultyLabelCritical: string;
  difficultyLabelImpossible: string;
  thresholdLabel: string;         // {value}
  badgeMalfunction: string;
  badgeFumble: string;
  badgeCritical: string;
  badgeExtreme: string;
  badgeHit: string;
  badgeMiss: string;
  bulletsHitLine: string;         // {hit} {total}
  impalingNote: string;           // {n}
  totalDamageLine: string;        // {value}
  armorReductionLine: string;     // {reduction} {net}
  // home
  appTitle: string;
  appSubtitle: string;
  logoAriaLabel: string;
  unsavedBannerMessage: string;
  saveNowButton: string;
  emptyStatePlaceholder: string;
  rulesToggleLabel: string;
  rulesVolleyHeading: string;
  rulesVolleyBody: string;
  rulesHitRollsHeading: string;
  rulesHitRollsBody: string;
  rulesNormalSuccessHeading: string;
  rulesNormalSuccessBody: string;
  rulesExtremeSuccessHeading: string;
  rulesExtremeSuccessBody: string;
  rulesArmorHeading: string;
  rulesArmorBody: string;
  rulesImpaleHeading: string;
  rulesImpaleBody: string;
  rulesTargetChangeHeading: string;
  rulesTargetChangeBody: string;
  footerText: string;
}

// ─── Polish translations (default) ───────────────────────────────────────────

const pl: Translations = {
  charactersSectionTitle: "Postacie",
  newCharacterButton: "Nowa",
  noCharacters: "Brak postaci. Utwórz nową.",
  editCardTitleNew: "Nowa postać",
  editCardTitleEdit: "Edytuj postać",
  unsavedChangesBadge: "Niezapisane zmiany",
  collapseFormAriaLabel: "Zwiń formularz",
  expandFormAriaLabel: "Rozwiń formularz",
  labelName: "Imię",
  placeholderName: "Imię badacza",
  labelSkillSmg: "SMG %",
  labelSkillMg: "KM (MG) %",
  labelWeaponPreset: "Broń (preset)",
  customWeaponOption: "Własna",
  labelDamage: "Obrażenia",
  labelMagazine: "Magazynek",
  labelWeaponType: "Typ broni",
  weaponTypeSmg: "SMG",
  weaponTypeMg: "MG",
  labelMalfunction: "Awaria (Malfunction)",
  infoActiveSkill: "Aktywny skill: {value}%",
  infoVolleySize: "Salwa (volley): {value} pocisków",
  infoHard: "Trudny: {value}",
  infoExtreme: "Ekstremalny: {value}",
  createButton: "Utwórz",
  saveButton: "Zapisz",
  toastCharacterCreatedTitle: "Postać utworzona",
  toastCharacterCreatedDescription: "{name} dołącza do drużyny.",
  toastSavedTitle: "Zapisano zmiany",
  toastDeletedTitle: "Postać usunięta",
  defaultCharacterName: "Nieznany badacz",
  volleyConfigTitle: "Konfiguracja salw",
  labelDifficulty: "Poziom trudności (zasięg)",
  difficultyNormal: "Normalny (zasięg bazowy)",
  difficultyHard: "Trudny (daleki zasięg)",
  difficultyExtreme: "Ekstremalny (bardzo daleki)",
  checkboxIgnoreMalfunction: "Ignoruj awarie (malfunction)",
  labelTargetDistance: "Dystans od poprzedniego (m/yd)",
  defaultTargetName: "Cel {n}",
  labelVolleys: "Salwy",
  labelBulletsPerVolley: "Poc./salwę",
  labelArmor: "Pancerz",
  bulletCountSummary: "{volleys} × {bpv} = {total} pocisków",
  addTargetButton: "Dodaj cel",
  summaryBulletsForVolleys: "Pociski na salwy:",
  summaryBulletsTraversal: "Pociski na przejście między celami:",
  summaryTotal: "Razem:",
  summaryAttackRolls: "Rzuty na atak:",
  warningOverMagazine: "Przekroczono pojemność magazynka!",
  fireButton: "OGNIA!",
  resultsTitle: "Wyniki",
  clearResultsButton: "Wyczyść",
  summaryCardTitle: "Podsumowanie",
  summaryHitsAndImpales: "({hits} trafień{impales})",
  summaryImpalesPart: ", {n} przebić",
  summaryPoints: "{value} pkt",
  summaryRaw: "(surowe: {value})",
  volleyBadgeLabel: "Salwa #{n}",
  bulletsSuffix: "({n} poc.)",
  penaltyDiceBadge: "{n}× kara",
  difficultyLabelNormal: "Normalny",
  difficultyLabelHard: "Trudny",
  difficultyLabelExtreme: "Ekstremalny",
  difficultyLabelCritical: "Krytyczny",
  difficultyLabelImpossible: "Niemożliwy",
  thresholdLabel: "próg: ≤{value}",
  badgeMalfunction: "AWARIA",
  badgeFumble: "FIASKO",
  badgeCritical: "KRYTYK",
  badgeExtreme: "EKSTREMALNY",
  badgeHit: "TRAFIENIE",
  badgeMiss: "PUDŁO",
  bulletsHitLine: "{hit} z {total} pocisków trafia",
  impalingNote: "({n} przebija)",
  totalDamageLine: "Razem: {value}",
  armorReductionLine: "Pancerz: -{reduction} → netto: {net}",
  appTitle: "Pulp Cthulhu",
  appSubtitle: "Kalkulator ognia automatycznego",
  logoAriaLabel: "Pulp Cthulhu Ogień Automatyczny",
  unsavedBannerMessage: "Postać ma niezapisane zmiany — zapisz przed obliczeniem salwy",
  saveNowButton: "Zapisz teraz",
  emptyStatePlaceholder:
    "Wybierz postać z panelu po lewej lub utwórz nową,\naby rozpocząć konfigurację ognia automatycznego.",
  rulesToggleLabel: "Zasady ognia automatycznego (CoC 7ed)",
  rulesVolleyHeading: "Salwa (Volley):",
  rulesVolleyBody:
    "Liczba pocisków w salwie = skill/10 (zaokr. w dół), minimum 3. Np. skill 47% → salwa = 4 pociski.",
  rulesHitRollsHeading: "Rzuty na trafienie:",
  rulesHitRollsBody:
    "Pierwszy rzut — normalny. Drugi — 1 kość kary. Trzeci — 2 kości kary. Czwarty — 2 kości kary + trudność o 1 wyżej. Itd.",
  rulesNormalSuccessHeading: "Zwykły sukces:",
  rulesNormalSuccessBody:
    "Połowa pocisków trafia (zaokr. w dół, min. 1). Rzuć obrażenia za każdy.",
  rulesExtremeSuccessHeading: "Sukces ekstremalny:",
  rulesExtremeSuccessBody:
    "Wszystkie pociski trafiają. Pierwsza połowa (min. 1) przebija (impale).",
  rulesArmorHeading: "Pancerz:",
  rulesArmorBody: "Odejmowany osobno od każdego pocisku.",
  rulesImpaleHeading: "Przebicie (Impale):",
  rulesImpaleBody: "Maksymalne obrażenia + dodatkowy rzut obrażeń.",
  rulesTargetChangeHeading: "Zmiana celu:",
  rulesTargetChangeBody: "1 pocisk tracony za każdy metr/yard dystansu między celami.",
  footerText:
    "Pulp Cthulhu Full Auto Calculator — mechaniki wg Call of Cthulhu 7th Edition / Pulp Cthulhu",
};

// ─── English translations ─────────────────────────────────────────────────────

const en: Translations = {
  charactersSectionTitle: "Characters",
  newCharacterButton: "New",
  noCharacters: "No characters. Create a new one.",
  editCardTitleNew: "New character",
  editCardTitleEdit: "Edit character",
  unsavedChangesBadge: "Unsaved changes",
  collapseFormAriaLabel: "Collapse form",
  expandFormAriaLabel: "Expand form",
  labelName: "Name",
  placeholderName: "Investigator name",
  labelSkillSmg: "SMG %",
  labelSkillMg: "HMG (MG) %",
  labelWeaponPreset: "Weapon (preset)",
  customWeaponOption: "Custom",
  labelDamage: "Damage",
  labelMagazine: "Magazine",
  labelWeaponType: "Weapon type",
  weaponTypeSmg: "SMG",
  weaponTypeMg: "MG",
  labelMalfunction: "Malfunction",
  infoActiveSkill: "Active skill: {value}%",
  infoVolleySize: "Volley: {value} bullets",
  infoHard: "Hard: {value}",
  infoExtreme: "Extreme: {value}",
  createButton: "Create",
  saveButton: "Save",
  toastCharacterCreatedTitle: "Character created",
  toastCharacterCreatedDescription: "{name} joins the team.",
  toastSavedTitle: "Changes saved",
  toastDeletedTitle: "Character deleted",
  defaultCharacterName: "Unknown investigator",
  volleyConfigTitle: "Volley configuration",
  labelDifficulty: "Difficulty (range)",
  difficultyNormal: "Normal (base range)",
  difficultyHard: "Hard (long range)",
  difficultyExtreme: "Extreme (very long range)",
  checkboxIgnoreMalfunction: "Ignore malfunctions",
  labelTargetDistance: "Distance from previous target (m/yd)",
  defaultTargetName: "Target {n}",
  labelVolleys: "Volleys",
  labelBulletsPerVolley: "Bul./volley",
  labelArmor: "Armor",
  bulletCountSummary: "{volleys} × {bpv} = {total} bullets",
  addTargetButton: "Add target",
  summaryBulletsForVolleys: "Bullets for volleys:",
  summaryBulletsTraversal: "Bullets for traversal between targets:",
  summaryTotal: "Total:",
  summaryAttackRolls: "Attack rolls:",
  warningOverMagazine: "Magazine capacity exceeded!",
  fireButton: "FIRE!",
  resultsTitle: "Results",
  clearResultsButton: "Clear",
  summaryCardTitle: "Summary",
  summaryHitsAndImpales: "({hits} hits{impales})",
  summaryImpalesPart: ", {n} impaling",
  summaryPoints: "{value} pts",
  summaryRaw: "(raw: {value})",
  volleyBadgeLabel: "Volley #{n}",
  bulletsSuffix: "({n} bul.)",
  penaltyDiceBadge: "{n}× penalty",
  difficultyLabelNormal: "Normal",
  difficultyLabelHard: "Hard",
  difficultyLabelExtreme: "Extreme",
  difficultyLabelCritical: "Critical",
  difficultyLabelImpossible: "Impossible",
  thresholdLabel: "threshold: ≤{value}",
  badgeMalfunction: "MALFUNCTION",
  badgeFumble: "FUMBLE",
  badgeCritical: "CRITICAL",
  badgeExtreme: "EXTREME",
  badgeHit: "HIT",
  badgeMiss: "MISS",
  bulletsHitLine: "{hit} of {total} bullets hit",
  impalingNote: "({n} impaling)",
  totalDamageLine: "Total: {value}",
  armorReductionLine: "Armor: -{reduction} → net: {net}",
  appTitle: "Pulp Cthulhu",
  appSubtitle: "Full Auto Calculator",
  logoAriaLabel: "Pulp Cthulhu Full Auto",
  unsavedBannerMessage: "Character has unsaved changes — save before calculating the volley",
  saveNowButton: "Save now",
  emptyStatePlaceholder:
    "Select a character from the left panel or create a new one\nto start configuring automatic fire.",
  rulesToggleLabel: "Full auto rules (CoC 7th ed)",
  rulesVolleyHeading: "Volley:",
  rulesVolleyBody:
    "Bullets per volley = skill/10 (round down), minimum 3. E.g. skill 47% → volley = 4 bullets.",
  rulesHitRollsHeading: "Hit rolls:",
  rulesHitRollsBody:
    "First roll — normal. Second — 1 penalty die. Third — 2 penalty dice. Fourth — 2 penalty dice + difficulty one step higher. Etc.",
  rulesNormalSuccessHeading: "Regular success:",
  rulesNormalSuccessBody:
    "Half of the bullets hit (round down, min. 1). Roll damage for each.",
  rulesExtremeSuccessHeading: "Extreme success:",
  rulesExtremeSuccessBody: "All bullets hit. The first half (min. 1) impale.",
  rulesArmorHeading: "Armor:",
  rulesArmorBody: "Subtracted separately from each bullet.",
  rulesImpaleHeading: "Impale:",
  rulesImpaleBody: "Maximum damage + one additional damage roll.",
  rulesTargetChangeHeading: "Target change:",
  rulesTargetChangeBody: "1 bullet lost per meter/yard of distance between targets.",
  footerText:
    "Pulp Cthulhu Full Auto Calculator — mechanics per Call of Cthulhu 7th Edition / Pulp Cthulhu",
};

// ─── Translation registry ─────────────────────────────────────────────────────

const translations: Record<Locale, Translations> = { pl, en };

// ─── Locale store (localStorage-backed, useSyncExternalStore pattern) ─────────

const STORAGE_KEY = "pulp-auto-locale";
const DEFAULT_LOCALE: Locale = "pl";

function loadLocale(): Locale {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && stored in translations) return stored as Locale;
  } catch {
    // ignore
  }
  return DEFAULT_LOCALE;
}

let currentLocale: Locale = loadLocale();
const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach((l) => l());
}

export function getLocale(): Locale {
  return currentLocale;
}

export function setLocale(locale: Locale): void {
  if (locale === currentLocale) return;
  currentLocale = locale;
  try {
    localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    // ignore
  }
  notifyListeners();
}

export function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

type Vars = Record<string, string | number>;

function interpolate(template: string, vars?: Vars): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, key) =>
    key in vars ? String(vars[key]) : `{${key}}`
  );
}

export function useTranslation() {
  const locale = useSyncExternalStore(subscribe, getLocale, getLocale);
  const dict = translations[locale];

  function t(key: keyof Translations, vars?: Vars): string {
    return interpolate(dict[key], vars);
  }

  return { t, locale, setLocale };
}
