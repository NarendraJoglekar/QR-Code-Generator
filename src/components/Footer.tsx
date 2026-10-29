import React from 'react';
import { Link } from 'react-router-dom';
import { QrCode, ShieldCheck, Heart, Sparkles, Globe, Download } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-border bg-muted/20">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
                <QrCode className="w-4 h-4" />
              </div>
              <span className="font-serif font-bold text-lg text-foreground">NJCode</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              High-resolution, privacy-first QR code generator with vector rendering, custom frames, dot styles, and zero expiry.
            </p>
            <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-background px-3 py-1 rounded-full border border-border">
              <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
              100% Client-Side Encoding
            </div>
          </div>

          {/* Column 1 */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">Capabilities</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/" className="hover:text-foreground transition-colors flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5" /> URL & Web Links
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-foreground transition-colors">Wi-Fi Instant Connect</Link>
              </li>
              <li>
                <Link to="/" className="hover:text-foreground transition-colors">vCard Digital Business Cards</Link>
              </li>
              <li>
                <Link to="/" className="hover:text-foreground transition-colors">Crypto & Payment Links</Link>
              </li>
            </ul>
          </div>

          {/* Column 2 */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">Features</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/templates" className="hover:text-foreground transition-colors flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Designer Templates
                </Link>
              </li>
              <li>
                <Link to="/batch" className="hover:text-foreground transition-colors flex items-center gap-1.5">
                  <Download className="w-3.5 h-3.5" /> Bulk QR Export
                </Link>
              </li>
              <li>
                <Link to="/scanner" className="hover:text-foreground transition-colors">QR Code Diagnostic Scanner</Link>
              </li>
              <li>
                <span className="text-muted-foreground/80">Vector SVG & 4K PNG Export</span>
              </li>
            </ul>
          </div>

          {/* Column 3 */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">Standards & Tech</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Generates standard ISO/IEC 18004 compliant 2D barcodes compatible with iOS Camera, Android Google Lens, and industrial laser scanners.
            </p>
            <div className="text-xs text-muted-foreground pt-2">
              All codes created stay active forever without redirection redirects.
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>@Narendra Joglekar.Crafted with precision for high-contrast scannability.</p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1">
              Made with <Heart className="w-3 h-3 text-red-500 fill-red-500" /> for creators
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};