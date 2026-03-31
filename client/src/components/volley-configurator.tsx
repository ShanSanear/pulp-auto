import { useState, useEffect } from "react";
import type { CharacterData } from "@/lib/character-store";
import type { VolleyTarget, FullAutoConfig, VolleyResult } from "@/lib/dice";
import { resolveFullAuto } from "@/lib/dice";
import { useTranslation } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Zap, Target, Plus, Minus, AlertTriangle, Skull, Shield, Crosshair, Flame, RotateCcw } from "lucide-react";

interface VolleyConfiguratorProps {
  character: CharacterData;
}

interface TargetConfig {
  name: string;
  volleyCount: number;
  bulletsPerVolley: number; // can be less than max volley size
  armor: number;
  distanceFromPrevious: number; // meters/yards to the previous target (only relevant for index > 0)
}

export function VolleyConfigurator({ character }: VolleyConfiguratorProps) {
  const { t } = useTranslation();
  const activeSkill = character.weaponType === "mg" ? character.firearmSkillMg : character.firearmSkillSmg;
  const maxVolleySize = Math.max(3, Math.floor(activeSkill / 10));

  const [targets, setTargets] = useState<TargetConfig[]>([
    { name: t("defaultTargetName", { n: 1 }), volleyCount: 1, bulletsPerVolley: maxVolleySize, armor: 0, distanceFromPrevious: 1 },
  ]);
  const [baseDifficulty, setBaseDifficulty] = useState<"Normal" | "Hard" | "Extreme">("Normal");
  const [results, setResults] = useState<VolleyResult[] | null>(null);
  const [ignoreMalfunction, setIgnoreMalfunction] = useState(false);

  useEffect(() => {
    setTargets([
      { name: t("defaultTargetName", { n: 1 }), volleyCount: 1, bulletsPerVolley: maxVolleySize, armor: 0, distanceFromPrevious: 1 },
    ]);
    setResults(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [character.id, maxVolleySize]);

  const addTarget = () => {
    setTargets((prev) => [
      ...prev,
      { name: t("defaultTargetName", { n: prev.length + 1 }), volleyCount: 1, bulletsPerVolley: maxVolleySize, armor: 0, distanceFromPrevious: 1 },
    ]);
  };

  const removeTarget = (index: number) => {
    setTargets((prev) => prev.filter((_, i) => i !== index));
  };

  const updateTarget = (index: number, updates: Partial<TargetConfig>) => {
    setTargets((prev) => prev.map((tgt, i) => (i === index ? { ...tgt, ...updates } : tgt)));
  };

  // Calculate total bullets needed
  const bulletsForVolleys = targets.reduce((sum, tgt) => sum + tgt.volleyCount * tgt.bulletsPerVolley, 0);
  const bulletsForTraversal = targets.slice(1).reduce((sum, tgt) => sum + tgt.distanceFromPrevious, 0);
  const totalBullets = bulletsForVolleys + bulletsForTraversal;
  const overMagazine = totalBullets > character.weaponMagazine;

  const handleFire = () => {
    // Build volley list
    const volleys: VolleyTarget[] = [];
    for (const tgt of targets) {
      for (let v = 0; v < tgt.volleyCount; v++) {
        volleys.push({
          targetName: tgt.name,
          bulletsInVolley: tgt.bulletsPerVolley,
        });
      }
    }

    // We resolve per-target armor in post-processing
    const config: FullAutoConfig = {
      skill: activeSkill,
      totalBullets,
      weaponDamage: character.weaponDamage,
      weaponMalfunction: character.weaponMalfunction,
      armor: 0, // We'll apply per-target armor
      baseDifficulty,
      volleys,
      ignoreMalfunction,
    };

    const rawResults = resolveFullAuto(config);

    // Apply per-target armor
    const finalResults = rawResults.map((r) => {
      const targetConfig = targets.find((tgt) => tgt.name === r.targetName);
      const armor = targetConfig?.armor ?? 0;
      const armorReduction = r.bulletsHit * armor;
      const netDamage = Math.max(0, r.totalDamage - armorReduction);
      return { ...r, armorReduction, netDamage };
    });

    setResults(finalResults);
  };

  const totalAttackRolls = targets.reduce((sum, tgt) => sum + tgt.volleyCount, 0);

  return (
    <div className="space-y-4">
      {/* Configuration */}
      <Card className="border-border/50 bg-card/80">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold tracking-wide uppercase text-muted-foreground flex items-center gap-2">
            <Target className="w-4 h-4" />
            {t("volleyConfigTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground">{t("labelDifficulty")}</Label>
              <Select
                value={baseDifficulty}
                onValueChange={(v) => setBaseDifficulty(v as "Normal" | "Hard" | "Extreme")}
              >
                <SelectTrigger className="h-8 text-sm" data-testid="select-difficulty">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Normal">{t("difficultyNormal")}</SelectItem>
                  <SelectItem value="Hard">{t("difficultyHard")}</SelectItem>
                  <SelectItem value="Extreme">{t("difficultyExtreme")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="ignore-malfunction"
              checked={ignoreMalfunction}
              onCheckedChange={(v) => setIgnoreMalfunction(v === true)}
              data-testid="checkbox-ignore-malfunction"
            />
            <Label htmlFor="ignore-malfunction" className="text-xs text-muted-foreground cursor-pointer select-none">
              {t("checkboxIgnoreMalfunction")}
            </Label>
          </div>

          <Separator />

          {/* Targets */}
          <div className="space-y-3">
            {targets.map((target, index) => (
              <div
                key={index}
                className="bg-muted/20 rounded-md p-3 space-y-2 border border-border/30"
              >
                <div className="flex items-center gap-2">
                  <Crosshair className="w-3 h-3 text-destructive" />
                  <Input
                    value={target.name}
                    onChange={(e) => updateTarget(index, { name: e.target.value })}
                    className="h-7 text-sm flex-1"
                    data-testid={`input-target-name-${index}`}
                  />
                  {targets.length > 1 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeTarget(index)}
                      className="h-7 w-7 p-0 text-destructive"
                      data-testid={`button-remove-target-${index}`}
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                  )}
                </div>

                {/* Distance from previous target (only for targets after the first) */}
                {index > 0 && (
                  <div className="flex items-center gap-2">
                    <Label className="text-xs text-muted-foreground flex-1">{t("labelTargetDistance")}</Label>
                    <Input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={target.distanceFromPrevious === 0 ? "" : target.distanceFromPrevious}
                      onChange={(e) =>
                        updateTarget(index, {
                          distanceFromPrevious: e.target.value === "" ? 0 : Number(e.target.value),
                        })
                      }
                      className="h-7 text-sm w-16"
                      data-testid={`input-target-distance-${index}`}
                    />
                  </div>
                )}

                <div className="grid grid-cols-3 gap-2">
                  <div className="flex flex-col">
                    <Label className="text-xs text-muted-foreground mb-1">{t("labelVolleys")}</Label>
                    <Input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={target.volleyCount === 0 ? "" : target.volleyCount}
                      onChange={(e) => updateTarget(index, { volleyCount: e.target.value === "" ? 0 : Math.max(1, Number(e.target.value)) })}
                      className="h-7 text-sm"
                      data-testid={`input-volley-count-${index}`}
                    />
                  </div>
                  <div className="flex flex-col">
                    <Label className="text-xs text-muted-foreground mb-1">{t("labelBulletsPerVolley")}</Label>
                    <Input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={target.bulletsPerVolley === 0 ? "" : Math.min(target.bulletsPerVolley, maxVolleySize)}
                      onChange={(e) =>
                        updateTarget(index, {
                          bulletsPerVolley: e.target.value === "" ? 0 : Math.min(Math.max(3, Number(e.target.value)), maxVolleySize),
                        })
                      }
                      className="h-7 text-sm"
                      data-testid={`input-bullets-per-volley-${index}`}
                    />
                  </div>
                  <div className="flex flex-col">
                    <Label className="text-xs text-muted-foreground mb-1">{t("labelArmor")}</Label>
                    <Input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={String(target.armor)}
                      onChange={(e) => updateTarget(index, { armor: e.target.value === "" ? 0 : Math.max(0, Number(e.target.value)) })}
                      className="h-7 text-sm"
                      data-testid={`input-target-armor-${index}`}
                    />
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {t("bulletCountSummary", { volleys: target.volleyCount, bpv: target.bulletsPerVolley, total: target.volleyCount * target.bulletsPerVolley })}
                </div>
              </div>
            ))}
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={addTarget}
            className="w-full h-8 text-xs"
            data-testid="button-add-target"
          >
            <Plus className="w-3 h-3 mr-1" /> {t("addTargetButton")}
          </Button>

          <Separator />

          {/* Summary */}
          <div className="bg-muted/30 rounded-md p-3 space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("summaryBulletsForVolleys")}</span>
              <span className="font-mono font-bold">{bulletsForVolleys}</span>
            </div>
            {bulletsForTraversal > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("summaryBulletsTraversal")}</span>
                <span className="font-mono font-bold">{bulletsForTraversal}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-border/30 pt-1">
              <span className="text-muted-foreground">{t("summaryTotal")}</span>
              <span className={`font-mono font-bold ${overMagazine ? "text-destructive" : ""}`}>
                {totalBullets} / {character.weaponMagazine}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("summaryAttackRolls")}</span>
              <span className="font-mono font-bold">{totalAttackRolls}</span>
            </div>
            {overMagazine && (
              <div className="flex items-center gap-1 text-destructive mt-1">
                <AlertTriangle className="w-3 h-3" />
                {t("warningOverMagazine")}
              </div>
            )}
          </div>

          <Button
            onClick={handleFire}
            disabled={overMagazine || !targets.length}
            className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            data-testid="button-fire"
          >
            <Flame className="w-4 h-4 mr-2" />
            {t("fireButton")}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {results && (
        <Card className="border-border/50 bg-card/80">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold tracking-wide uppercase text-muted-foreground flex items-center gap-2">
                <Zap className="w-4 h-4" />
                {t("resultsTitle")}
              </CardTitle>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setResults(null)}
                className="h-7 text-xs"
                data-testid="button-clear-results"
              >
                <RotateCcw className="w-3 h-3 mr-1" /> {t("clearResultsButton")}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {results.map((r, i) => (
              <VolleyResultCard key={i} result={r} skill={activeSkill} />
            ))}

            {/* Total summary */}
            <Separator />
            <div className="bg-muted/30 rounded-md p-3 space-y-1">
              <div className="text-sm font-semibold flex items-center gap-2">
                <Skull className="w-4 h-4 text-destructive" />
                {t("summaryCardTitle")}
              </div>
              {(() => {
                const byTarget = new Map<string, { hits: number; damage: number; net: number; impales: number }>();
                for (const r of results) {
                  const prev = byTarget.get(r.targetName) ?? { hits: 0, damage: 0, net: 0, impales: 0 };
                  byTarget.set(r.targetName, {
                    hits: prev.hits + r.bulletsHit,
                    damage: prev.damage + r.totalDamage,
                    net: prev.net + r.netDamage,
                    impales: prev.impales + r.impaling,
                  });
                }
                return Array.from(byTarget.entries()).map(([targetName, data]) => (
                  <div key={targetName} className="flex justify-between text-sm">
                    <span>
                      <span className="font-medium">{targetName}</span>
                      <span className="text-muted-foreground ml-1">
                        {t("summaryHitsAndImpales", {
                          hits: data.hits,
                          impales: data.impales > 0 ? t("summaryImpalesPart", { n: data.impales }) : "",
                        })}
                      </span>
                    </span>
                    <span className="font-mono font-bold text-destructive">
                      {t("summaryPoints", { value: data.net })}
                      {data.net !== data.damage && (
                        <span className="text-muted-foreground text-xs ml-1">
                          {t("summaryRaw", { value: data.damage })}
                        </span>
                      )}
                    </span>
                  </div>
                ));
              })()}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function VolleyResultCard({ result, skill }: { result: VolleyResult; skill: number }) {
  const { t } = useTranslation();
  const hardThreshold = Math.floor(skill / 2);
  const extremeThreshold = Math.floor(skill / 5);

  const difficultyLabel: Record<string, string> = {
    Normal: t("difficultyLabelNormal"),
    Hard: t("difficultyLabelHard"),
    Extreme: t("difficultyLabelExtreme"),
    Critical: t("difficultyLabelCritical"),
    Impossible: t("difficultyLabelImpossible"),
  };

  const threshold =
    result.difficultyLevel === "Normal" ? skill
    : result.difficultyLevel === "Hard" ? hardThreshold
    : result.difficultyLevel === "Extreme" ? extremeThreshold
    : result.difficultyLevel === "Critical" ? 1
    : 0;

  return (
    <div
      className={`rounded-md p-3 border text-sm space-y-2 ${
        result.malfunction
          ? "border-orange-500/50 bg-orange-500/5"
          : result.fumble
          ? "border-destructive/50 bg-destructive/5"
          : result.success
          ? result.extreme || result.critical
            ? "border-green-500/50 bg-green-500/5"
            : "border-primary/30 bg-primary/5"
          : "border-border/30 bg-muted/10"
      }`}
    >
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <div className="flex items-center gap-1 min-w-0 shrink">
          <Badge variant="outline" className="text-xs font-mono shrink-0">
            {t("volleyBadgeLabel", { n: result.volleyIndex })}
          </Badge>
          <span className="text-xs text-muted-foreground truncate">{result.targetName}</span>
          <span className="text-xs text-muted-foreground shrink-0">
            {t("bulletsSuffix", { n: result.bulletsInVolley })}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-1 ml-auto">
          {result.penaltyDice > 0 && (
            <Badge variant="secondary" className="text-xs shrink-0">
              {t("penaltyDiceBadge", { n: result.penaltyDice })}
            </Badge>
          )}
          {result.difficultyLevel !== "Normal" && (
            <Badge variant="secondary" className="text-xs shrink-0">
              {difficultyLabel[result.difficultyLevel] ?? result.difficultyLevel}
            </Badge>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-2xl font-mono font-bold">{result.roll}</span>
          {result.penaltyDice > 0 && (
            <span className="text-xs text-muted-foreground">
              [{result.allTens.map((t2) => t2 * 10).join(", ")} + {result.units}]
            </span>
          )}
        </div>

        <div className="text-xs text-muted-foreground shrink-0">
          {t("thresholdLabel", { value: threshold })}
        </div>

        <div className="flex flex-wrap gap-1 ml-auto">
          {result.malfunction && (
            <Badge className="bg-orange-600 text-white shrink-0">
              <AlertTriangle className="w-3 h-3 mr-1" /> {t("badgeMalfunction")}
            </Badge>
          )}
          {result.fumble && !result.malfunction && (
            <Badge className="bg-destructive text-destructive-foreground shrink-0">
              <Skull className="w-3 h-3 mr-1" /> {t("badgeFumble")}
            </Badge>
          )}
          {result.critical && (
            <Badge className="bg-green-600 text-white shrink-0">{t("badgeCritical")}</Badge>
          )}
          {result.extreme && !result.critical && (
            <Badge className="bg-green-600 text-white shrink-0">{t("badgeExtreme")}</Badge>
          )}
          {result.success && !result.extreme && !result.critical && (
            <Badge className="bg-primary text-primary-foreground shrink-0">{t("badgeHit")}</Badge>
          )}
          {!result.success && !result.fumble && !result.malfunction && (
            <Badge variant="secondary" className="shrink-0">{t("badgeMiss")}</Badge>
          )}
        </div>
      </div>

      {result.bulletsHit > 0 && (
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <Crosshair className="w-3 h-3" />
              <span>
                {t("bulletsHitLine", { hit: result.bulletsHit, total: result.bulletsInVolley })}
                {result.impaling > 0 && (
                  <span className="text-green-400 ml-1">
                    {t("impalingNote", { n: result.impaling })}
                  </span>
                )}
              </span>
            </div>
            <div className="space-y-0.5 pl-5">
              {result.damagePerBullet.map((d, i) => (
                <div key={i} className="flex items-baseline gap-1 text-xs text-muted-foreground font-mono">
                  <span className="text-foreground/50 w-3 shrink-0">•</span>
                  {d.impale ? (
                    <>
                      <span className="text-green-400">★</span>
                      <span className="font-bold text-foreground">{d.total}</span>
                      <span className="text-muted-foreground/70">
                        [max({d.maxDmg}) + {d.extraRolls!.join("+")}
                        {d.bonus > 0 ? `+${d.bonus}` : ""}]
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="font-bold text-foreground">{d.total}</span>
                      <span className="text-muted-foreground/70">
                        [{d.rolls.join("+")}
                        {d.bonus > 0 ? `+${d.bonus}` : ""}]
                      </span>
                    </>
                  )}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 pt-0.5">
              <Flame className="w-3 h-3 text-destructive" />
              <span>
                {t("totalDamageLine", { value: result.totalDamage })}
              </span>
            </div>
            {result.armorReduction > 0 && (
              <div className="flex items-center gap-2">
                <Shield className="w-3 h-3" />
                <span>
                  {t("armorReductionLine", { reduction: result.armorReduction, net: result.netDamage })}
                </span>
              </div>
            )}
          </div>
      )}
    </div>
  );
}
