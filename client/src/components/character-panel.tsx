import { useState, useSyncExternalStore } from "react";
import type { CharacterData } from "@/lib/character-store";
import * as store from "@/lib/character-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Save, User, Crosshair } from "lucide-react";

interface CharacterPanelProps {
  selectedCharacterId: number | null;
  onSelectCharacter: (id: number | null) => void;
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
  { name: "Custom", damage: "1d10", magazine: 30, type: "smg" as const, malfunction: 96 },
];

export function CharacterPanel({ selectedCharacterId, onSelectCharacter }: CharacterPanelProps) {
  const { toast } = useToast();
  const [editForm, setEditForm] = useState<Partial<CharacterData>>({});
  const [isCreating, setIsCreating] = useState(false);

  // Subscribe to the local character store
  const characters = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);

  const selectedCharacter = characters.find((c) => c.id === selectedCharacterId);

  const handleNewCharacter = () => {
    setIsCreating(true);
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
            <CardTitle className="text-sm font-semibold tracking-wide uppercase text-muted-foreground flex items-center gap-2">
              <Crosshair className="w-4 h-4" />
              {isCreating ? "Nowa postać" : "Edytuj postać"}
            </CardTitle>
          </CardHeader>
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

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs text-muted-foreground">Broń maszynowa (SMG) %</Label>
                <Input
                  data-testid="input-skill-smg"
                  type="number"
                  min={1}
                  max={99}
                  value={editForm.firearmSkillSmg ?? 15}
                  onChange={(e) => setEditForm((p) => ({ ...p, firearmSkillSmg: Number(e.target.value) }))}
                  className="h-8 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Karabin maszynowy (MG) %</Label>
                <Input
                  data-testid="input-skill-mg"
                  type="number"
                  min={1}
                  max={99}
                  value={editForm.firearmSkillMg ?? 10}
                  onChange={(e) => setEditForm((p) => ({ ...p, firearmSkillMg: Number(e.target.value) }))}
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
                  type="number"
                  min={1}
                  value={editForm.weaponMagazine ?? 20}
                  onChange={(e) => setEditForm((p) => ({ ...p, weaponMagazine: Number(e.target.value) }))}
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
                  type="number"
                  min={1}
                  max={100}
                  value={editForm.weaponMalfunction ?? 96}
                  onChange={(e) => setEditForm((p) => ({ ...p, weaponMalfunction: Number(e.target.value) }))}
                  className="h-8 text-sm"
                />
              </div>
            </div>

            <div className="bg-muted/30 rounded-md p-2 text-xs text-muted-foreground">
              Aktywny skill: <span className="font-bold text-foreground">{activeSkill}%</span>
              {" · "}Salwa (volley): <span className="font-bold text-foreground">{volleySize} pocisków</span>
              {" · "}Hard: <span className="font-bold text-foreground">{Math.floor(activeSkill / 2)}</span>
              {" · "}Extreme: <span className="font-bold text-foreground">{Math.floor(activeSkill / 5)}</span>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleSave}
                disabled={!editForm.name}
                data-testid="button-save-character"
                className="flex-1"
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
        </Card>
      )}
    </div>
  );
}
