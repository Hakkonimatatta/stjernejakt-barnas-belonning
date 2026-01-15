import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Smartphone, RefreshCw, Wifi, Users, QrCode, Camera, Mail } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Html5Qrcode } from "html5-qrcode";
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
  const [showQR, setShowQR] = useState(false);
  const [importText, setImportText] = useState("");
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const t = (key: Parameters<typeof translate>[1], params?: Parameters<typeof translate>[2]) => 
    translate(language, key, params);

  const handleExportData = () => {
    setShowQR(true);
    toast.success(t("qrCodeGenerated"));
  };

  const handleShareViaEmail = () => {
    // Send data as text in email body (more reliable than URL encoding)
    const subject = encodeURIComponent(t("shareDataSubject"));
    const emailBody = `${t("shareDataBody")}\n\n${dataString}`;
    const body = encodeURIComponent(emailBody);
    
    try {
      window.location.href = `mailto:?subject=${subject}&body=${body}`;
      toast.success(t("openingEmailApp"));
    } catch (err) {
      console.error("Email failed:", err);
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(`${t("shareDataSubject")}\n\n${dataString}`);
      toast.success("Data kopiert til clipboard - lim inn i e-posten");
    }
  };

  const handleImportText = () => {
    try {
      const importedData = JSON.parse(importText) as AppData;
      
      if (!importedData.children || !importedData.settings) {
        throw new Error("Invalid data");
      }

      const mergedData = mergeAppData(appData, importedData);
      onImportData(mergedData);
      saveData(mergedData);
      toast.success(t("dataImported"));
      setImportText("");
    } catch (err) {
      console.error("Import error:", err);
      toast.error(t("invalidData"));
    }
  };

  const handleStartScan = async () => {
    setScanning(true);
    try {
      // Request camera permission on mobile
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: "environment" } 
        });
        // Close the stream after we get permission
        stream.getTracks().forEach(track => track.stop());
      } catch (permError) {
        console.error("Camera permission denied:", permError);
        toast.error(t("cameraPermissionDenied"));
        setScanning(false);
        return;
      }

      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          handleScanSuccess(decodedText);
        },
        () => {
          // Ignore scan errors
        }
      );
    } catch (err) {
      console.error("Error starting scanner:", err);
      toast.error(t("cameraError"));
      setScanning(false);
    }
  };

  const handleScanSuccess = async (decodedText: string) => {
    try {
      // Stop scanner immediately to prevent multiple scans
      if (scannerRef.current) {
        try {
          await scannerRef.current.stop();
          scannerRef.current.clear();
          scannerRef.current = null;
        } catch (stopErr) {
          console.error("Error stopping scanner:", stopErr);
        }
      }

      const importedData = JSON.parse(decodedText) as AppData;
      
      // Validate basic structure
      if (!importedData.children || !importedData.settings) {
        throw new Error("Invalid data");
      }

      // Merge the data - combines points and syncs tasks
      const mergedData = mergeAppData(appData, importedData);
      onImportData(mergedData);
      saveData(mergedData);
      toast.success(t("dataImported"));
      setScanning(false);
    } catch (err) {
      console.error("Import error:", err);
      toast.error(t("invalidQRCode"));
      setScanning(false);
    }
  };

  const handleStopScan = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
        scannerRef.current = null;
      } catch (err) {
        console.error("Error stopping scanner:", err);
      }
    }
    setScanning(false);
  };

  const dataString = JSON.stringify(appData);
  const dataSize = new Blob([dataString]).size;
  const dataSizeKB = (dataSize / 1024).toFixed(1);

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/20 via-secondary/10 to-background p-4">
      <div className="max-w-md mx-auto space-y-6 pt-4">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="hover:bg-white/50"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("back")}
        </Button>

        <Card className="p-8 bg-card border-4 border-primary/20 shadow-xl text-center overflow-hidden relative">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-secondary/10 rounded-full translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center">
                  <Smartphone className="h-10 w-10 text-primary" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-secondary rounded-full flex items-center justify-center border-2 border-card">
                  <RefreshCw className="h-4 w-4 text-secondary-foreground" />
                </div>
              </div>
            </div>
            
            <h1 className="text-2xl font-bold text-card-foreground mb-2">
              {t("syncDevices")}
            </h1>
            
            <p className="text-muted-foreground mb-8 max-w-xs mx-auto">
              {t("syncDescription")}
            </p>

            <div className="bg-gradient-to-br from-white to-muted/30 p-6 rounded-2xl shadow-inner mb-6">
              {!showQR && !scanning && (
                <div className="w-44 h-44 mx-auto bg-white rounded-xl flex items-center justify-center border border-muted shadow-sm">
                  <div className="text-center">
                    <div className="text-5xl mb-3">📱</div>
                    <p className="text-sm font-medium text-muted-foreground">{t("exportImport")}</p>
                    <p className="text-xs text-muted-foreground/70 mt-1">{t("selectMethodBelow")}</p>
                  </div>
                </div>
              )}

              {showQR && !scanning && (
                <div className="w-56 h-56 mx-auto bg-white rounded-xl flex items-center justify-center p-3 border border-muted shadow-sm">
                  <QRCodeSVG
                    value={dataString}
                    size={200}
                    level="M"
                    includeMargin={true}
                  />
                </div>
              )}

              {scanning && (
                <div className="w-56 h-56 mx-auto bg-black rounded-xl overflow-hidden">
                  <div id="qr-reader" className="w-full h-full"></div>
                </div>
              )}
            </div>

            {!scanning && (
              <>
                <div className="space-y-3 mb-4">
                  <Button
                    onClick={handleExportData}
                    className="w-full h-12"
                    disabled={dataSize > 2900}
                  >
                    <QrCode className="mr-2 h-5 w-5" />
                    {t("showQRCode")} ({dataSizeKB} KB)
                  </Button>
                  
                  <Button
                    onClick={handleStartScan}
                    variant="outline"
                    className="w-full h-12"
                  >
                    <Camera className="mr-2 h-5 w-5" />
                    {t("scanQRCode")}
                  </Button>

                  <Button
                    onClick={handleShareViaEmail}
                    variant="outline"
                    className="w-full h-12"
                    disabled={dataSize > 50000}
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    {t("shareViaEmail")}
                  </Button>
                </div>
                
                {dataSize > 2900 && (
                  <p className="text-xs text-destructive mb-4">
                    ⚠️ {t("tooMuchData", { size: dataSizeKB })}
                  </p>
                )}

                {dataSize > 1000 && dataSize <= 2900 && (
                  <p className="text-xs text-amber-600 mb-4">
                    ⚠️ {t("smsNotAvailable")}
                  </p>
                )}
              </>
            )}

            {scanning && (
              <Button
                onClick={handleStopScan}
                variant="destructive"
                className="w-full h-12 mb-4"
              >
                {t("stopScanning")}
              </Button>
            )}

            <p className="text-sm text-muted-foreground">
              {t("scanToSync")}
            </p>
          </div>
        </Card>

        {/* Import data card */}
        <Card className="p-6 bg-card border-4 border-primary/20 shadow-xl">
          <h2 className="text-xl font-bold text-card-foreground mb-4">
            📥 {t("importData")}
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            {t("importDataDescription")}
          </p>
          
          <Textarea
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder={t("pasteDataHere")}
            className="font-mono text-xs h-32 mb-4"
          />
          
          <Button
            onClick={handleImportText}
            disabled={!importText.trim()}
            className="w-full h-12"
          >
            {t("importButton")}
          </Button>
        </Card>

        {/* Warning card */}
        <Card className="p-5 bg-amber-50 border-2 border-amber-200 shadow-md">
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                <RefreshCw className="h-5 w-5 text-amber-600" />
              </div>
            </div>
            <div>
              <h3 className="font-bold text-amber-800 mb-1">{t("importantToKnow")}</h3>
              <p className="text-sm text-amber-700">
                {t("syncWarning")}
              </p>
            </div>
          </div>
        </Card>

        {/* Info cards */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4 bg-card border-2 border-border text-center">
            <Wifi className="h-6 w-6 text-primary mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">{t("noInternet")}</p>
          </Card>
          <Card className="p-4 bg-card border-2 border-border text-center">
            <Users className="h-6 w-6 text-primary mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">{t("sameDataEverywhere")}</p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SyncDevices;
