import { useState, useEffect, useCallback, useSyncExternalStore } from "react";
import * as store from "@/lib/character-store";
import type { CharacterData } from "@/lib/character-store";
import { useTranslation } from "@/lib/i18n";
import { LOCALE_NAMES } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import { CharacterPanel } from "@/components/character-panel";
import { VolleyConfigurator } from "@/components/volley-configurator";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Save } from "lucide-react";

export default function Home() {
  const { t, locale, setLocale } = useTranslation();
  const [selectedCharacterId, setSelectedCharacterId] = useState<number | null>(null);
  const [isDark, setIsDark] = useState(() => window.matchMedia("(prefers-color-scheme: dark)").matches);
  const [unsavedDirty, setUnsavedDirty] = useState(false);
  const [pendingSave, setPendingSave] = useState<(() => void) | null>(null);

  const handleUnsavedChange = useCallback((dirty: boolean, save: () => void) => {
    setUnsavedDirty(dirty);
    setPendingSave(dirty ? () => save : null);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  const characters = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
  const selectedCharacter = characters.find((c) => c.id === selectedCharacterId);

  // Cycle through available locales
  const localeKeys = Object.keys(LOCALE_NAMES) as Locale[];
  const nextLocale = localeKeys[(localeKeys.indexOf(locale) + 1) % localeKeys.length];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <PulpLogo t={t} />
            <div>
              <h1 className="text-base font-bold tracking-tight leading-none">
                {t("appTitle")}
              </h1>
              <p className="text-xs text-muted-foreground">
                {t("appSubtitle")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setLocale(nextLocale)}
              className="h-8 px-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
              aria-label="Switch language"
              title="Switch language"
            >
              {LOCALE_NAMES[locale]}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsDark(!isDark)}
              className="w-8 h-8 p-0"
              data-testid="button-toggle-theme"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Unsaved changes banner — sticky just below header */}
      {unsavedDirty && (
        <div className="sticky top-[53px] z-40 w-full bg-amber-500/95 backdrop-blur-sm border-b border-amber-600/50 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-medium text-amber-950 dark:text-amber-950">
              <span className="w-2 h-2 rounded-full bg-amber-900/60 animate-pulse shrink-0" />
              {t("unsavedBannerMessage")}
            </div>
            <Button
              size="sm"
              onClick={() => pendingSave?.()}
              className="h-7 text-xs bg-amber-900/20 hover:bg-amber-900/30 text-amber-950 border border-amber-900/30 shrink-0"
              variant="outline"
            >
              <Save className="w-3 h-3 mr-1" />
              {t("saveNowButton")}
            </Button>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left column: Character management */}
          <div className="lg:col-span-4">
            <CharacterPanel
              selectedCharacterId={selectedCharacterId}
              onSelectCharacter={setSelectedCharacterId}
              onUnsavedChange={handleUnsavedChange}
            />
          </div>

          {/* Right column: Volley configuration & results */}
          <div className="lg:col-span-8">
            {selectedCharacter ? (
              <VolleyConfigurator character={selectedCharacter as any} />
            ) : (
              <Card className="border-border/50 bg-card/80">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 text-muted-foreground">
                      <path d="M12 2L2 7l10 5 10-5-10-5z" />
                      <path d="M2 17l10 5 10-5" />
                      <path d="M2 12l10 5 10-5" />
                    </svg>
                  </div>
                  <p className="text-muted-foreground text-sm whitespace-pre-line">
                    {t("emptyStatePlaceholder")}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Rules reference */}
            <Card className="border-border/50 bg-card/80 mt-6">
              <CardContent className="py-4">
                <details>
                  <summary className="text-xs font-semibold tracking-wide uppercase text-muted-foreground cursor-pointer select-none" data-testid="text-rules-toggle">
                    {t("rulesToggleLabel")}
                  </summary>
                  <div className="mt-3 space-y-2 text-xs text-muted-foreground leading-relaxed">
                    <p>
                      <span className="font-semibold text-foreground">{t("rulesVolleyHeading")}</span>{" "}
                      {t("rulesVolleyBody")}
                    </p>
                    <p>
                      <span className="font-semibold text-foreground">{t("rulesHitRollsHeading")}</span>{" "}
                      {t("rulesHitRollsBody")}
                    </p>
                    <p>
                      <span className="font-semibold text-foreground">{t("rulesNormalSuccessHeading")}</span>{" "}
                      {t("rulesNormalSuccessBody")}
                    </p>
                    <p>
                      <span className="font-semibold text-foreground">{t("rulesExtremeSuccessHeading")}</span>{" "}
                      {t("rulesExtremeSuccessBody")}
                    </p>
                    <p>
                      <span className="font-semibold text-foreground">{t("rulesArmorHeading")}</span>{" "}
                      {t("rulesArmorBody")}
                    </p>
                    <p>
                      <span className="font-semibold text-foreground">{t("rulesImpaleHeading")}</span>{" "}
                      {t("rulesImpaleBody")}
                    </p>
                    <p>
                      <span className="font-semibold text-foreground">{t("rulesTargetChangeHeading")}</span>{" "}
                      {t("rulesTargetChangeBody")}
                    </p>
                  </div>
                </details>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <footer className="border-t border-border/50 mt-12">
        <div className="max-w-6xl mx-auto px-4 py-4 text-center text-xs text-muted-foreground">
          {t("footerText")}
        </div>
      </footer>
    </div>
  );
}

function PulpLogo({ t }: { t: (key: any) => string }) {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label={t("logoAriaLabel")}
    >
      <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="16" cy="16" r="10" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      <circle cx="16" cy="16" r="6" stroke="currentColor" strokeWidth="1" opacity="0.3" />
      <circle cx="16" cy="16" r="2" fill="currentColor" opacity="0.8" />
      <line x1="16" y1="2" x2="16" y2="8" stroke="currentColor" strokeWidth="1.5" />
      <line x1="16" y1="24" x2="16" y2="30" stroke="currentColor" strokeWidth="1.5" />
      <line x1="2" y1="16" x2="8" y2="16" stroke="currentColor" strokeWidth="1.5" />
      <line x1="24" y1="16" x2="30" y2="16" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
