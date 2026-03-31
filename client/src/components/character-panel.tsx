import { useState, useSyncExternalStore, useEffect } from "react";
import type { CharacterData } from "@/lib/character-store";
import * as store from "@/lib/character-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Save, User, Crosshair, ChevronDown } from "lucide-react";

interface CharacterPanelProps {
  selectedCharacterId: number | null;
  onSelectCharacter: (id: number | null) => void;
  onUnsavedChange?: (dirty: boolean, save: () => void) => void;
}

const PRESET_WEAPONS = [
  { name: "Thompson M1928", damage: "1d10+2", magazine: 20, type: "smg" as const, malfunction: 96 },
  { name: "Thompson M1928 (Drum)", damage: "1d10+2", magazine: 50, type: "smg" as const, malfunction: 96 },
  { name: "M3 Grease Gun", damage: "1d10+2", magazine: 30, type: "smg" as const, malfunction: 96 },
  { name: "MP40", damage: "1d10", magazine: 32, type: "smg" as const, malfunction: 96 },
  { name: "Sten Gun", damage: "1d10", magazine: 32, type: "smg" as const, malfunction: 91 },
  { name: "PPSh-41", damage: "1d10+2", magazine: 71, type: "smg" as const, malfunction: 96 },
  { name: "BAR M1918", damage: "2d6+4", magazine: 20, type: "mg" as const, malfunction: 96 },
  { name: "Bren Gun", damage: "2d6+4", magazine: 30, type: "mg" as const, malfunction: 96 },
  { name: "MG34", damage: "2d6+4", magazine: 50, type: "mg" as const, malfunction: 96 },
  { name: "Browning M1919", damage: "2d6+4", magazine: 250, type: "mg" as const, malfunction: 96 },
  { name: "Własna", damage: "1d10", magazine: 30, type: "smg" as const, malfunction: 96 },
];

export function CharacterPanel({ selectedCharacterId, onSelectCharacter, onUnsavedChange }: CharacterPanelProps) {
  const { toast } = useToast();
  const [editForm, setEditForm] = useState<Partial<CharacterData>>({});
  const [isCreating, setIsCreating] = useState(false);
  const [isEditExpanded, setIsEditExpanded] = useState(true);

  // Subscribe to the local character store
  const characters = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);

  const selectedCharacter = characters.find((c) => c.id === selectedCharacterId);

  const handleNewCharacter = () => {
    setIsCreating(true);
    setIsEditExpanded(true);
    setEditForm({
      name: "",
      firearmSkillSmg: 15,
      firearmSkillMg: 10,
      weaponName: "Thompson M1928",
      weaponDamage: "1d10+2",
      weaponMagazine: 20,
      weaponType: "smg",
      weaponMalfunction: 96,
    });
  };

  const handleSave = () => {
    if (isCreating) {
      const newChar = store.createCharacter({
        name: editForm.name ?? "Nieznany badacz",
        firearmSkillSmg: editForm.firearmSkillSmg ?? 15,
        firearmSkillMg: editForm.firearmSkillMg ?? 10,
        weaponName: editForm.weaponName ?? "Thompson M1928",
        weaponDamage: editForm.weaponDamage ?? "1d10+2",
        weaponMagazine: editForm.weaponMagazine ?? 20,
        weaponType: editForm.weaponType ?? "smg",
        weaponMalfunction: editForm.weaponMalfunction ?? 96,
      });
      onSelectCharacter(newChar.id);
      setIsCreating(false);
      toast({ title: "Postać utworzona", description: `${newChar.name} dołącza do drużyny.` });
    } else if (selectedCharacterId) {
      const updated = store.updateCharacter(selectedCharacterId, editForm);
      if (updated) {
        toast({ title: "Zapisano zmiany" });
      }
    }
  };

  const handleDelete = (id: number) => {
    store.deleteCharacter(id);
    onSelectCharacter(null);
    setIsCreating(false);
    toast({ title: "Postać usunięta" });
  };

  const handleSelectPreset = (weaponName: string) => {
    const preset = PRESET_WEAPONS.find((w) => w.name === weaponName);
    if (preset) {
      setEditForm((prev) => ({
        ...prev,
        weaponName: preset.name,
        weaponDamage: preset.damage,
        weaponMagazine: preset.magazine,
        weaponType: preset.type,
        weaponMalfunction: preset.malfunction,
      }));
    }
  };

  const handleCharacterClick = (char: CharacterData) => {
    onSelectCharacter(char.id);
    setIsCreating(false);
    setEditForm({
      name: char.name,
      firearmSkillSmg: char.firearmSkillSmg,
      firearmSkillMg: char.firearmSkillMg,
      weaponName: char.weaponName,
      weaponDamage: char.weaponDamage,
      weaponMagazine: char.weaponMagazine,
      weaponType: char.weaponType,
      weaponMalfunction: char.weaponMalfunction,
    });
  };

  const activeSkill = (editForm.weaponType === "mg" ? editForm.firearmSkillMg : editForm.firearmSkillSmg) ?? 15;
  const volleySize = Math.max(3, Math.floor(activeSkill / 10));

  // Detect unsaved changes: compare editForm against the saved character (or always dirty when creating)
  const hasUnsavedChanges = isCreating
    ? Object.keys(editForm).length > 0
    : selectedCharacter != null && (
        editForm.name !== selectedCharacter.name ||
        editForm.firearmSkillSmg !== selectedCharacter.firearmSkillSmg ||
        editForm.firearmSkillMg !== selectedCharacter.firearmSkillMg ||
        editForm.weaponName !== selectedCharacter.weaponName ||
        editForm.weaponDamage !== selectedCharacter.weaponDamage ||
        editForm.weaponMagazine !== selectedCharacter.weaponMagazine ||
        editForm.weaponType !== selectedCharacter.weaponType ||
        editForm.weaponMalfunction !== selectedCharacter.weaponMalfunction
      );

  // Notify parent of unsaved state so it can show a sticky banner
  useEffect(() => {
    onUnsavedChange?.(hasUnsavedChanges, handleSave);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasUnsavedChanges]);

  return (
    <div className="space-y-4">
      {/* Character list */}
      <Card className="border-border/50 bg-card/80">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold tracking-wide uppercase text-muted-foreground flex items-center gap-2">
              <User className="w-4 h-4" />
              Postacie
            </CardTitle>
            <Button
              size="sm"
              variant="outline"
              onClick={handleNewCharacter}
              data-testid="button-new-character"
              className="h-7 text-xs"
            >
              <Plus className="w-3 h-3 mr-1" /> Nowa
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-1">
          {characters.map((char) => (
            <button
              key={char.id}
              onClick={() => handleCharacterClick(char)}
              data-testid={`button-character-${char.id}`}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                selectedCharacterId === char.id
                  ? "bg-primary/10 text-primary border border-primary/30"
                  : "hover:bg-muted/50 text-foreground"
              }`}
            >
              <div className="font-medium">{char.name}</div>
              <div className="text-xs text-muted-foreground">
                {char.weaponName} — SMG: {char.firearmSkillSmg}% / MG: {char.firearmSkillMg}%
              </div>
            </button>
          ))}
          {characters.length === 0 && (
            <p className="text-muted-foreground text-xs text-center py-2">Brak postaci. Utwórz nową.</p>
          )}
        </CardContent>
      </Card>

      {/* Edit form */}
      {(selectedCharacter || isCreating) && (
        <Card className="border-border/50 bg-card/80">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold tracking-wide uppercase text-muted-foreground flex items-center gap-2">
                <Crosshair className="w-4 h-4" />
                {isCreating ? "Nowa postać" : "Edytuj postać"}
                {hasUnsavedChanges && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-500/15 text-amber-500 border border-amber-500/30 normal-case tracking-normal">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    Niezapisane zmiany
                  </span>
                )}
              </CardTitle>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsEditExpanded((v) => !v)}
                className="h-7 w-7 p-0 text-muted-foreground"
                aria-label={isEditExpanded ? "Zwiń formularz" : "Rozwiń formularz"}
              >
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${isEditExpanded ? "rotate-180" : ""}`}
                />
              </Button>
            </div>
          </CardHeader>
          {isEditExpanded && (
          <CardContent className="space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground">Imię</Label>
              <Input
                data-testid="input-character-name"
                value={editForm.name ?? ""}
                onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="Imię badacza"
                className="h-8 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 items-end">
              <div className="flex flex-col">
                <Label className="text-xs text-muted-foreground mb-1">SMG %</Label>
                <Input
                  data-testid="input-skill-smg"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={editForm.firearmSkillSmg ?? ""}
                  onChange={(e) => setEditForm((p) => ({ ...p, firearmSkillSmg: e.target.value === "" ? undefined : Number(e.target.value) }))}
                  className="h-8 text-sm"
                />
              </div>
              <div className="flex flex-col">
                <Label className="text-xs text-muted-foreground mb-1">KM (MG) %</Label>
                <Input
                  data-testid="input-skill-mg"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={editForm.firearmSkillMg ?? ""}
                  onChange={(e) => setEditForm((p) => ({ ...p, firearmSkillMg: e.target.value === "" ? undefined : Number(e.target.value) }))}
                  className="h-8 text-sm"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground">Broń (preset)</Label>
              <Select
                value={editForm.weaponName ?? "Thompson M1928"}
                onValueChange={handleSelectPreset}
              >
                <SelectTrigger className="h-8 text-sm" data-testid="select-weapon-preset">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRESET_WEAPONS.map((w) => (
                    <SelectItem key={w.name} value={w.name}>{w.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs text-muted-foreground">Obrażenia</Label>
                <Input
                  data-testid="input-weapon-damage"
                  value={editForm.weaponDamage ?? "1d10+2"}
                  onChange={(e) => setEditForm((p) => ({ ...p, weaponDamage: e.target.value }))}
                  className="h-8 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Magazynek</Label>
                <Input
                  data-testid="input-weapon-magazine"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={editForm.weaponMagazine ?? ""}
                  onChange={(e) => setEditForm((p) => ({ ...p, weaponMagazine: e.target.value === "" ? undefined : Number(e.target.value) }))}
                  className="h-8 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs text-muted-foreground">Typ broni</Label>
                <Select
                  value={editForm.weaponType ?? "smg"}
                  onValueChange={(v) => setEditForm((p) => ({ ...p, weaponType: v }))}
                >
                  <SelectTrigger className="h-8 text-sm" data-testid="select-weapon-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="smg">SMG</SelectItem>
                    <SelectItem value="mg">MG</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Awaria (Malfunction)</Label>
                <Input
                  data-testid="input-malfunction"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={editForm.weaponMalfunction ?? ""}
                  onChange={(e) => setEditForm((p) => ({ ...p, weaponMalfunction: e.target.value === "" ? undefined : Number(e.target.value) }))}
                  className="h-8 text-sm"
                />
              </div>
            </div>

            <div className="bg-muted/30 rounded-md p-2 text-xs text-muted-foreground">
              Aktywny skill: <span className="font-bold text-foreground">{activeSkill}%</span>
              {" · "}Salwa (volley): <span className="font-bold text-foreground">{volleySize} pocisków</span>
              {" · "}Trudny: <span className="font-bold text-foreground">{Math.floor(activeSkill / 2)}</span>
              {" · "}Ekstremalny: <span className="font-bold text-foreground">{Math.floor(activeSkill / 5)}</span>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleSave}
                disabled={!editForm.name}
                data-testid="button-save-character"
                className={`flex-1 ${hasUnsavedChanges ? "bg-amber-500 hover:bg-amber-600 text-white border-amber-500" : ""}`}
              >
                <Save className="w-3 h-3 mr-1" />
                {isCreating ? "Utwórz" : "Zapisz"}
              </Button>
              {!isCreating && selectedCharacterId && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(selectedCharacterId)}
                  data-testid="button-delete-character"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              )}
            </div>
          </CardContent>
          )}
        </Card>
      )}
    </div>
  );
}
