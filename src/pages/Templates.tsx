import React from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { QRCanvasPreview, type QRStyleConfig } from '../components/QRCanvasPreview';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Check } from 'lucide-react';

interface PresetCard {
  id: string;
  name: string;
  category: string;
  description: string;
  config: QRStyleConfig;
  defaultPayload: string;
}

const TEMPLATES: PresetCard[] = [
  {
    id: 'cyber-noir',
    name: 'Cyber Noir',
    category: 'Minimal & Tech',
    description: 'High-contrast midnight slate with circular eyes for tech events and developer portals.',
    defaultPayload: 'https://github.com/trending',
    config: {
      fgColor: '#0f172a',
      bgColor: '#ffffff',
      dotStyle: 'rounded',
      eyeStyle: 'circle',
      eyeColor: '#0f172a',
      frameText: 'SCAN CODE',
      frameStyle: 'card',
      logoIcon: 'link',
      ecLevel: 'M',
      size: 320,
    },
  },
  {
    id: 'emerald-eco',
    name: 'Emerald Botanic',
    category: 'Retail & Wellness',
    description: 'Organic deep emerald with soft dots and plant vibe. Perfect for cafes and packaging.',
    defaultPayload: 'https://wholefoodsmarket.com',
    config: {
      fgColor: '#064e3b',
      bgColor: '#f0fdf4',
      dotStyle: 'dots',
      eyeStyle: 'rounded',
      eyeColor: '#047857',
      frameText: 'FRESH MENU',
      frameStyle: 'card',
      logoIcon: 'heart',
      ecLevel: 'H',
      size: 320,
    },
  },
  {
    id: 'sunset-burst',
    name: 'Sunset Terracotta',
    category: 'Restaurant & Social',
    description: 'Warm terracotta tones with inviting bottom call-out banner.',
    defaultPayload: 'https://instagram.com/coffeeroasters',
    config: {
      fgColor: '#7c2d12',
      bgColor: '#fff7ed',
      dotStyle: 'rounded',
      eyeStyle: 'rounded',
      eyeColor: '#ea580c',
      frameText: 'FOLLOW US',
      frameStyle: 'bottom-bar',
      logoIcon: 'star',
      ecLevel: 'M',
      size: 320,
    },
  },
  {
    id: 'wifi-guest',
    name: 'Airport Wi-Fi Card',
    category: 'Hospitality',
    description: 'Polaroid-styled quick-connect card designed for guest lounges and hotels.',
    defaultPayload: 'WIFI:T:WPA;S:Lounge_HighSpeed_Guest;P:welcome2026;H:false;;',
    config: {
      fgColor: '#1e3a8a',
      bgColor: '#ffffff',
      dotStyle: 'square',
      eyeStyle: 'rounded',
      eyeColor: '#2563eb',
      frameText: 'TAP & CONNECT',
      frameStyle: 'polaroid',
      logoIcon: 'wifi',
      ecLevel: 'H',
      size: 320,
    },
  },
  {
    id: 'crypto-vault',
    name: 'Crypto Vault',
    category: 'Finance',
    description: 'Electric indigo pattern with prominent diamond modules for payment addresses.',
    defaultPayload: 'bitcoin:1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa?amount=0.01',
    config: {
      fgColor: '#312e81',
      bgColor: '#eef2ff',
      dotStyle: 'diamond',
      eyeStyle: 'square',
      eyeColor: '#4338ca',
      frameText: 'PAY WITH BITCOIN',
      frameStyle: 'card',
      logoIcon: 'crypto',
      ecLevel: 'Q',
      size: 320,
    },
  },
  {
    id: 'executive-card',
    name: 'Executive vCard',
    category: 'Business',
    description: 'Prestigious charcoal badge format designed for conferences and name tags.',
    defaultPayload: 'BEGIN:VCARD\nVERSION:3.0\nN:Alexander Vance\nFN:Alexander Vance\nTITLE:Partner\nEND:VCARD',
    config: {
      fgColor: '#18181b',
      bgColor: '#fafafa',
      dotStyle: 'rounded',
      eyeStyle: 'circle',
      eyeColor: '#27272a',
      frameText: 'DIGITAL CARD',
      frameStyle: 'badge',
      logoIcon: 'user',
      ecLevel: 'H',
      size: 320,
    },
  },
];

export default function Templates() {
  const navigate = useNavigate();

  const handleUseTemplate = (tmpl: PresetCard) => {
    // Navigate to studio with state or query
    navigate('/', { state: { templateConfig: tmpl.config, payload: tmpl.defaultPayload } });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />

      <main className="flex-1 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mb-12 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-muted text-foreground border border-border">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Pre-Tuned Aesthetics
            </div>
            <h1 className="font-serif text-3xl md:text-5xl font-bold tracking-tight">
              Curated Designer Templates
            </h1>
            <p className="text-muted-foreground text-base leading-relaxed">
              Tested for exceptional optical readability under varying ambient lighting conditions. Select any template to open directly in the editor.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {TEMPLATES.map((tmpl) => (
              <div
                key={tmpl.id}
                className="bg-card border border-border rounded-3xl p-6 shadow-xs hover:shadow-lg transition-all hover:-translate-y-1 flex flex-col justify-between"
              >
                <div>
                  <div className="w-full flex items-center justify-center p-6 bg-muted/20 rounded-2xl mb-6">
                    <QRCanvasPreview
                      value={tmpl.defaultPayload}
                      config={tmpl.config}
                    />
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                      {tmpl.category}
                    </span>
                    <h3 className="font-serif font-bold text-xl text-foreground">
                      {tmpl.name}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed pt-1">
                      {tmpl.description}
                    </p>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-border flex items-center justify-between">
                  <span className="text-xs font-mono text-muted-foreground">
                    Level {tmpl.config.ecLevel} ECC
                  </span>
                  <button
                    onClick={() => handleUseTemplate(tmpl)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-all hover:scale-105"
                  >
                    Customize
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}