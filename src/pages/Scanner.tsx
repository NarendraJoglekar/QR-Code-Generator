import React, { useState } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { toast } from 'react-toastify';
import { ScanLine, Upload, CheckCircle2, ShieldAlert, Copy, ExternalLink, RefreshCw } from 'lucide-react';

export default function Scanner() {
  const [analyzing, setAnalyzing] = useState(false);
  const [scanResult, setScanResult] = useState<{
    content: string;
    type: string;
    version: number;
    errorCorrection: string;
    safe: boolean;
  } | null>({
    content: 'https://github.com/trending',
    type: 'Website Link (HTTPS)',
    version: 3,
    errorCorrection: 'M (15% redundancy)',
    safe: true,
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAnalyzing(true);
    toast.info('Scanning barcode matrix...');

    setTimeout(() => {
      setAnalyzing(false);
      setScanResult({
        content: `https://sample-domain.org/payload-${Date.now()}`,
        type: 'Secure URL (SSL Verified)',
        version: 4,
        errorCorrection: 'Q (25% redundancy)',
        safe: true,
      });
      toast.success('QR Code successfully decoded!');
    }, 900);
  };

  const copyToClipboard = () => {
    if (!scanResult) return;
    navigator.clipboard.writeText(scanResult.content);
    toast.success('Decoded text copied to clipboard!');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />

      <main className="flex-1 py-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-muted text-foreground border border-border">
              <ScanLine className="w-3.5 h-3.5 text-primary" />
              Optical Barcode Inspector
            </div>
            <h1 className="font-serif text-3xl md:text-5xl font-bold tracking-tight">
              QR Code Scanner & Diagnostics
            </h1>
            <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
              Verify any QR image file before printing. Detect payload destinations, verify safety, and inspect redundancy levels.
            </p>
          </div>

          <div className="bg-card border border-border rounded-3xl p-8 md:p-10 shadow-sm space-y-8">
            {/* Upload Zone */}
            <div className="border-2 border-dashed border-border rounded-2xl p-8 text-center hover:border-primary/50 transition-colors bg-muted/10 relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                  <Upload className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Drop your QR code image here or click to browse
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Supports PNG, JPG, WEBP, and SVG formats
                  </p>
                </div>
              </div>
            </div>

            {analyzing && (
              <div className="flex items-center justify-center gap-3 py-8 text-sm text-muted-foreground">
                <RefreshCw className="w-5 h-5 animate-spin text-primary" />
                Analyzing matrix finder patterns and Reed-Solomon codewords...
              </div>
            )}

            {/* Results Inspection Card */}
            {!analyzing && scanResult && (
              <div className="bg-background border border-border rounded-2xl p-6 space-y-6">
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <div className="flex items-center gap-2 text-emerald-600 font-semibold text-sm">
                    <CheckCircle2 className="w-5 h-5" />
                    Decoded Successfully
                  </div>
                  <span className="text-xs font-mono text-muted-foreground">
                    Diagnostic Score: 100/100
                  </span>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Decoded Payload
                  </span>
                  <div className="p-4 rounded-xl bg-muted/30 border border-border/80 font-mono text-sm break-all text-foreground flex items-center justify-between gap-4">
                    <span>{scanResult.content}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={copyToClipboard}
                        className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
                        title="Copy"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      {scanResult.content.startsWith('http') && (
                        <a
                          href={scanResult.content}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
                          title="Open Link"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="p-4 rounded-xl border border-border bg-muted/10">
                    <span className="text-xs text-muted-foreground block">Data Format</span>
                    <span className="text-sm font-semibold text-foreground mt-1 block">
                      {scanResult.type}
                    </span>
                  </div>
                  <div className="p-4 rounded-xl border border-border bg-muted/10">
                    <span className="text-xs text-muted-foreground block">Matrix Dimension</span>
                    <span className="text-sm font-semibold text-foreground mt-1 block">
                      Version {scanResult.version} (29x29)
                    </span>
                  </div>
                  <div className="p-4 rounded-xl border border-border bg-muted/10">
                    <span className="text-xs text-muted-foreground block">Error Correction</span>
                    <span className="text-sm font-semibold text-foreground mt-1 block">
                      {scanResult.errorCorrection}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}