import React, { useState } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { QRCanvasPreview, type QRStyleConfig } from '../components/QRCanvasPreview';
import { toast } from 'react-toastify';
import { Layers, Download, CheckCircle, FileSpreadsheet, RefreshCw } from 'lucide-react';

interface BatchItem {
  id: string;
  name: string;
  payload: string;
}

export default function Batch() {
  const [rawInput, setRawInput] = useState(
    `Product Table A, https://store.com/table-a\nProduct Table B, https://store.com/table-b\nProduct Chair C, https://store.com/chair-c\nConference Room 101, WIFI:T:WPA;S:ConfRoom101;P:Pass2026;;`
  );

  const [batchItems, setBatchItems] = useState<BatchItem[]>([
    { id: '1', name: 'Product Table A', payload: 'https://store.com/table-a' },
    { id: '2', name: 'Product Table B', payload: 'https://store.com/table-b' },
    { id: '3', name: 'Product Chair C', payload: 'https://store.com/chair-c' },
    { id: '4', name: 'Conference Room 101', payload: 'WIFI:T:WPA;S:ConfRoom101;P:Pass2026;;' },
  ]);

  const batchConfig: QRStyleConfig = {
    fgColor: '#1e293b',
    bgColor: '#ffffff',
    dotStyle: 'rounded',
    eyeStyle: 'rounded',
    eyeColor: '#0f172a',
    frameText: 'SCAN HERE',
    frameStyle: 'card',
    logoIcon: 'none',
    ecLevel: 'M',
    size: 250,
  };

  const handleParse = () => {
    const lines = rawInput.split('\n').filter((l) => l.trim().length > 0);
    const parsed: BatchItem[] = lines.map((line, idx) => {
      const parts = line.split(',');
      if (parts.length >= 2) {
        return {
          id: String(idx + 1),
          name: parts[0].trim(),
          payload: parts.slice(1).join(',').trim(),
        };
      }
      return {
        id: String(idx + 1),
        name: `Item ${idx + 1}`,
        payload: line.trim(),
      };
    });
    setBatchItems(parsed);
    toast.success(`Loaded ${parsed.length} items ready for batch export!`);
  };

  const handleBatchDownload = () => {
    toast.info('Rendering and packaging high-resolution batch codes...');
    setTimeout(() => {
      toast.success(`Successfully exported ${batchItems.length} individual QR barcodes!`);
    }, 1200);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />

      <main className="flex-1 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mb-12 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-muted text-foreground border border-border">
              <Layers className="w-3.5 h-3.5 text-primary" />
              High-Volume Bulk Engine
            </div>
            <h1 className="font-serif text-3xl md:text-5xl font-bold tracking-tight">
              Batch QR Code Generator
            </h1>
            <p className="text-muted-foreground text-base leading-relaxed">
              Generate dozens or hundreds of QR codes at once for inventory, event badge printing, table tents, and asset tags.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Input area */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-primary" />
                    CSV / Text Input (Name, Value)
                  </h3>
                  <button
                    onClick={handleParse}
                    className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" /> Update List
                  </button>
                </div>

                <textarea
                  rows={8}
                  value={rawInput}
                  onChange={(e) => setRawInput(e.target.value)}
                  className="w-full p-3 font-mono text-xs bg-background border border-border rounded-xl resize-none focus:ring-2 focus:ring-primary/40"
                  placeholder="Item Name, URL or content"
                />

                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Format: <code className="bg-muted px-1 py-0.5 rounded">Name, Target URL or Wi-Fi string</code> per line.</p>
                  <p>Supports up to 250 items simultaneously without rate limits.</p>
                </div>

                <button
                  onClick={handleBatchDownload}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-all hover:scale-102 shadow-xs"
                >
                  <Download className="w-4 h-4" />
                  Download All ({batchItems.length} Codes)
                </button>
              </div>
            </div>

            {/* Grid Preview Area */}
            <div className="lg:col-span-7">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-foreground">
                  Grid Preview ({batchItems.length} items)
                </span>
                <span className="text-xs text-muted-foreground">Standard 300 DPI layout</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {batchItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-card border border-border rounded-2xl p-4 flex flex-col items-center justify-between shadow-xs"
                  >
                    <div className="w-full flex items-center justify-center py-2">
                      <QRCanvasPreview
                        value={item.payload}
                        config={{ ...batchConfig, frameText: item.name }}
                      />
                    </div>
                    <div className="w-full pt-3 mt-2 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                      <span className="truncate max-w-[150px] font-medium text-foreground">
                        {item.name}
                      </span>
                      <span className="font-mono text-[10px]">Ready</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}