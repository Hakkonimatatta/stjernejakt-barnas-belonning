import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, Download, Mail, Upload } from "lucide-react";
import { toast } from "sonner";
import { AppData } from "@/types";
import { saveData, mergeAppData } from "@/lib/storage";
import { translate, Language } from "@/lib/i18n";

interface SyncDevicesProps {
  appData: AppData;
  onImportData: (data: AppData) => void;
  language: Language;
}

const SyncDevices = ({ appData, onImportData, language }: SyncDevicesProps) => {
  const navigate = useNavigate();
  const [importText, setImportText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = (key: Parameters<typeof translate>[1], params?: Parameters<typeof translate>[2]) =>
    translate(language, key, params);

  const dataString = JSON.stringify(appData);
  const dataSize = new Blob([dataString]).size;
  const dataSizeKB = (dataSize / 1024).toFixed(1);

  const handleDownloadJson = () => {
    const blob = new Blob([dataString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "stjernejobb-data.json";
    a.click();
    URL.revokeObjectURL(url);
    toast.success(t("fileDownloaded"));
  };

  const handleShareViaEmail = () => {
    const subject = encodeURIComponent(t("shareDataSubject"));
    const body = encodeURIComponent(`${t("shareDataBody")}\n\n${dataString}`);
    try {
      window.location.href = `mailto:?subject=${subject}&body=${body}`;
      toast.success(t("openingEmailApp"));
    } catch {
      navigator.clipboard.writeText(dataString);
      toast.success(t("fileDownloaded"));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string) as AppData;
        if (!imported.children || !imported.settings) throw new Error("Invalid");
        const merged = mergeAppData(appData, imported);
        onImportData(merged);
        saveData(merged);
        toast.success(t("dataImported"));
      } catch {
        toast.error(t("invalidData"));
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleImportText = () => {
    try {
      const imported = JSON.parse(importText) as AppData;
      if (!imported.children || !imported.settings) throw new Error("Invalid");
      const merged = mergeAppData(appData, imported);
      onImportData(merged);
      saveData(merged);
      toast.success(t("dataImported"));
      setImportText("");
    } catch {
      toast.error(t("invalidData"));
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-primary/20 via-secondary/10 to-background">
      <div className="sticky top-0 z-30 bg-background/90 backdrop-blur border-b border-border shadow-sm">
        <div className="flex items-center gap-2 px-4 py-3 max-w-md mx-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/parent", { replace: true })}
            aria-label={t("back")}
            className="mr-2"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <span className="text-lg font-bold flex-1 text-center">{t("syncDevices")}</span>
        </div>
      </div>

      <div className="max-w-md mx-auto w-full space-y-6 pt-4 px-4 pb-10">

        {/* Eksport */}
        <Card className="p-6 bg-card border-4 border-primary/20 shadow-xl space-y-4">
          <div>
            <h2 className="text-xl font-bold text-card-foreground mb-1">
              📤 {t("downloadJson")}
            </h2>
            <p className="text-sm text-muted-foreground">{t("downloadJsonHint")}</p>
          </div>

          <Button onClick={handleDownloadJson} className="w-full h-12">
            <Download className="mr-2 h-5 w-5" />
            {t("downloadJson")}
          </Button>

          <Button onClick={handleShareViaEmail} variant="outline" className="w-full h-12">
            <Mail className="mr-2 h-4 w-4" />
            {t("shareViaEmail")}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            {t("dataSizeLabel", { size: dataSizeKB })}
          </p>
        </Card>

        {/* Import */}
        <Card className="p-6 bg-card border-4 border-primary/20 shadow-xl space-y-4">
          <div>
            <h2 className="text-xl font-bold text-card-foreground mb-1">
              📥 {t("importData")}
            </h2>
            <p className="text-sm text-muted-foreground">{t("importDataDescription")}</p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={handleFileUpload}
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            className="w-full h-12"
          >
            <Upload className="mr-2 h-5 w-5" />
            {t("uploadJson")}
          </Button>

          <div className="relative flex items-center gap-2">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">eller</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <Textarea
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder={t("pasteDataHere")}
            className="font-mono text-xs h-28"
          />
          <Button
            onClick={handleImportText}
            disabled={!importText.trim()}
            className="w-full h-12"
          >
            {t("importButton")}
          </Button>
        </Card>

        {/* Advarsel */}
        <Card className="p-5 bg-amber-50 border-2 border-amber-200 shadow-md">
          <div className="flex gap-3 items-start">
            <span className="text-2xl">⚠️</span>
            <div>
              <h3 className="font-bold text-amber-800 mb-1">{t("importantToKnow")}</h3>
              <p className="text-sm text-amber-700">{t("syncWarning")}</p>
            </div>
          </div>
        </Card>

      </div>
    </div>
  );
};

export default SyncDevices;
