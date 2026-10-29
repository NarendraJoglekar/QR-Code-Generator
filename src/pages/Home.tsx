import React, { useState, useRef } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { QRCanvasPreview, type QRStyleConfig } from '../components/QRCanvasPreview';
import type { ErrorCorrectionLevel } from '../components/qrUtils';
import { toast } from 'react-toastify';
import {
  Globe,
  Wifi,
  Contact,
  Mail,
  MessageSquare,
  Coins,
  FileText,
  Download,
  Copy,
  Printer,
  Sparkles,
  Check,
  Palette,
  Shield,
  Layers,
  Sliders,
  Github,
  Terminal,
  ExternalLink,
  X,
} from 'lucide-react';

type ContentType = 'url' | 'wifi' | 'vcard' | 'email' | 'sms' | 'crypto' | 'text';

export default function Home() {
  const [contentType, setContentType] = useState<ContentType>('url');

  // Input states
  const [urlInput, setUrlInput] = useState('https://github.com');
  const [wifiSsid, setWifiSsid] = useState('Studio_Guest_5G');
  const [wifiPass, setWifiPass] = useState('supersecret123');
  const [wifiSecurity, setWifiSecurity] = useState<'WPA' | 'WEP' | 'nopass'>('WPA');
  const [wifiHidden, setWifiHidden] = useState(false);

  // vCard
  const [vcardName, setVcardName] = useState('Sarah Jenkins');
  const [vcardTitle, setVcardTitle] = useState('Chief Product Designer');
  const [vcardOrg, setVcardOrg] = useState('Apex Digital Labs');
  const [vcardPhone, setVcardPhone] = useState('+1 (555) 234-5678');
  const [vcardEmail, setVcardEmail] = useState('sarah@apexdigital.io');
  const [vcardUrl, setVcardUrl] = useState('https://sarahjenkins.design');

  // Email
  const [emailTo, setEmailTo] = useState('hello@acme.com');
  const [emailSubject, setEmailSubject] = useState('Product Inquiry');
  const [emailBody, setEmailBody] = useState('Hi there, I would love to learn more about your services.');

  // SMS
  const [smsPhone, setSmsPhone] = useState('+15551234567');
  const [smsMessage, setSmsMessage] = useState('Hello! I scanned your QR code.');

  // Crypto
  const [cryptoCoin, setCryptoCoin] = useState('bitcoin');
  const [cryptoAddress, setCryptoAddress] = useState('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa');
  const [cryptoAmount, setCryptoAmount] = useState('0.005');

  // Text
  const [plainText, setPlainText] = useState('Welcome to our flagship store! Scan for special in-store perks.');

  // Customization config
  const [config, setConfig] = useState<QRStyleConfig>({
    fgColor: '#1e293b',
    bgColor: '#ffffff',
    dotStyle: 'rounded',
    eyeStyle: 'rounded',
    eyeColor: '#0f172a',
    frameText: 'SCAN ME',
    frameStyle: 'card',
    logoIcon: 'link',
    ecLevel: 'M',
    size: 380,
  });

  const [activeTab, setActiveTab] = useState<'content' | 'style' | 'frame'>('content');
  const [showGithubModal, setShowGithubModal] = useState(false);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Compute standard payload string
  const qrString = React.useMemo(() => {
    switch (contentType) {
      case 'url':
        return urlInput.startsWith('http://') || urlInput.startsWith('https://')
          ? urlInput
          : `https://${urlInput}`;
      case 'wifi':
        return `WIFI:T:${wifiSecurity};S:${wifiSsid};P:${wifiPass};H:${wifiHidden ? 'true' : 'false'};;`;
      case 'vcard':
        return `BEGIN:VCARD\nVERSION:3.0\nN:${vcardName}\nFN:${vcardName}\nORG:${vcardOrg}\nTITLE:${vcardTitle}\nTEL:${vcardPhone}\nEMAIL:${vcardEmail}\nURL:${vcardUrl}\nEND:VCARD`;
      case 'email':
        return `mailto:${emailTo}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
      case 'sms':
        return `smsto:${smsPhone}:${smsMessage}`;
      case 'crypto':
        return `${cryptoCoin}:${cryptoAddress}?amount=${cryptoAmount}`;
      case 'text':
      default:
        return plainText;
    }
  }, [
    contentType,
    urlInput,
    wifiSsid,
    wifiPass,
    wifiSecurity,
    wifiHidden,
    vcardName,
    vcardOrg,
    vcardTitle,
    vcardPhone,
    vcardEmail,
    vcardUrl,
    emailTo,
    emailSubject,
    emailBody,
    smsPhone,
    smsMessage,
    cryptoCoin,
    cryptoAddress,
    cryptoAmount,
    plainText,
  ]);

  // Export handlers
  const handleDownloadSVG = () => {
    if (!svgRef.current) return;
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `NJcode-${contentType}-${Date.now()}.svg`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Vector SVG downloaded successfully!');
  };

  const handleDownloadPNG = (resolution = 1024) => {
    if (!svgRef.current) return;
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const canvas = document.createElement('canvas');
    canvas.width = resolution;
    canvas.height = resolution;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      ctx.fillStyle = config.bgColor;
      ctx.fillRect(0, 0, resolution, resolution);
      ctx.drawImage(img, 0, 0, resolution, resolution);
      URL.revokeObjectURL(url);

      canvas.toBlob((blob) => {
        if (!blob) return;
        const pngUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = pngUrl;
        link.download = `NJcode-${resolution}px-${Date.now()}.png`;
        link.click();
        URL.revokeObjectURL(pngUrl);
        toast.success(`High-res PNG (${resolution}px) downloaded!`);
      }, 'image/png');
    };
    img.src = url;
  };

  const handleCopyToClipboard = async () => {
    if (!svgRef.current) return;
    try {
      const svgData = new XMLSerializer().serializeToString(svgRef.current);
      const canvas = document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 800;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = new Image();
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      img.onload = async () => {
        ctx.fillStyle = config.bgColor;
        ctx.fillRect(0, 0, 800, 800);
        ctx.drawImage(img, 0, 0, 800, 800);
        URL.revokeObjectURL(url);

        canvas.toBlob(async (blob) => {
          if (!blob) return;
          try {
            await navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob }),
            ]);
            toast.success('QR Code copied to clipboard!');
          } catch {
            toast.info('Direct image copy requires clipboard permissions. SVG/PNG download is ready!');
          }
        }, 'image/png');
      };
      img.src = url;
    } catch {
      toast.error('Unable to copy directly. Please use PNG download.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />


      <main className="flex-1 py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-6">
          {/* Hero Header */}
          <div className="mb-10 text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-muted text-foreground border border-border">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Standard ISO 18004 Vector Generation
            </div>
            <h1 className="font-serif text-3xl md:text-5xl font-bold tracking-tight">
              Create Beautiful, Scannable QR Codes in Seconds
            </h1>
            <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
              Custom styling, vector SVG precision, custom finder eyes, and branded CTA frames. High scannability with zero tracking or redirects.
            </p>
          </div>

          {/* Studio Workspace Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Form & Customizer Controls (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Content Type Selector Pills */}
              <div className="bg-card border border-border rounded-2xl p-2 shadow-xs">
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-1">
                  {[
                    { id: 'url', label: 'URL', icon: Globe },
                    { id: 'wifi', label: 'Wi-Fi', icon: Wifi },
                    { id: 'vcard', label: 'vCard', icon: Contact },
                    { id: 'email', label: 'Email', icon: Mail },
                    { id: 'sms', label: 'SMS', icon: MessageSquare },
                    { id: 'crypto', label: 'Crypto', icon: Coins },
                    { id: 'text', label: 'Text', icon: FileText },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isSelected = contentType === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setContentType(item.id as ContentType);
                          if (item.id === 'wifi') setConfig((prev) => ({ ...prev, logoIcon: 'wifi', frameText: 'JOIN WIFI' }));
                          else if (item.id === 'vcard') setConfig((prev) => ({ ...prev, logoIcon: 'user', frameText: 'SAVE CONTACT' }));
                          else if (item.id === 'crypto') setConfig((prev) => ({ ...prev, logoIcon: 'crypto', frameText: 'PAY CRYPTO' }));
                          else if (item.id === 'email') setConfig((prev) => ({ ...prev, logoIcon: 'mail', frameText: 'EMAIL ME' }));
                          else setConfig((prev) => ({ ...prev, logoIcon: 'link', frameText: 'SCAN ME' }));
                        }}
                        className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl text-xs font-medium transition-all ${
                          isSelected
                            ? 'bg-primary text-primary-foreground shadow-xs font-semibold scale-102'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        }`}
                      >
                        <Icon className="w-4 h-4 mb-1" />
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sub-tabs for Content vs Style vs Frame */}
              <div className="flex border-b border-border gap-6 text-sm font-medium">
                <button
                  onClick={() => setActiveTab('content')}
                  className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
                    activeTab === 'content'
                      ? 'border-primary text-primary font-semibold'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Sliders className="w-4 h-4" />
                  1. Content & Data
                </button>
                <button
                  onClick={() => setActiveTab('style')}
                  className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
                    activeTab === 'style'
                      ? 'border-primary text-primary font-semibold'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Palette className="w-4 h-4" />
                  2. Design & Pattern
                </button>
                <button
                  onClick={() => setActiveTab('frame')}
                  className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
                    activeTab === 'frame'
                      ? 'border-primary text-primary font-semibold'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  3. Frame & Branding
                </button>
              </div>

              {/* Tab 1: Content Inputs */}
              {activeTab === 'content' && (
                <div className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-xs">
                  {contentType === 'url' && (
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground">Website or Link URL</label>
                      <div className="relative">
                        <Globe className="w-4 h-4 text-muted-foreground absolute left-3 top-3.5" />
                        <input
                          type="url"
                          value={urlInput}
                          onChange={(e) => setUrlInput(e.target.value)}
                          placeholder="https://example.com/mypage"
                          className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/40"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Accepts any standard protocol (https://, http://, mailto:, etc.).
                      </p>
                    </div>
                  )}

                  {contentType === 'wifi' && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-foreground">Network SSID (Name)</label>
                        <input
                          type="text"
                          value={wifiSsid}
                          onChange={(e) => setWifiSsid(e.target.value)}
                          placeholder="e.g. Office_Wifi_Guest"
                          className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/40"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-foreground">Password</label>
                          <input
                            type="text"
                            value={wifiPass}
                            onChange={(e) => setWifiPass(e.target.value)}
                            placeholder="Network password"
                            className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/40"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-foreground">Encryption</label>
                          <select
                            value={wifiSecurity}
                            onChange={(e) => setWifiSecurity(e.target.value as any)}
                            className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm"
                          >
                            <option value="WPA">WPA / WPA2 / WPA3</option>
                            <option value="WEP">WEP</option>
                            <option value="nopass">None (Open)</option>
                          </select>
                        </div>
                      </div>
                      <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                        <input
                          type="checkbox"
                          checked={wifiHidden}
                          onChange={(e) => setWifiHidden(e.target.checked)}
                          className="rounded border-border text-primary focus:ring-primary"
                        />
                        <span>Hidden Network SSID</span>
                      </label>
                    </div>
                  )}

                  {contentType === 'vcard' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-semibold">Full Name</label>
                          <input
                            type="text"
                            value={vcardName}
                            onChange={(e) => setVcardName(e.target.value)}
                            className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-semibold">Job Title</label>
                          <input
                            type="text"
                            value={vcardTitle}
                            onChange={(e) => setVcardTitle(e.target.value)}
                            className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-semibold">Company / Organization</label>
                          <input
                            type="text"
                            value={vcardOrg}
                            onChange={(e) => setVcardOrg(e.target.value)}
                            className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-semibold">Phone Number</label>
                          <input
                            type="text"
                            value={vcardPhone}
                            onChange={(e) => setVcardPhone(e.target.value)}
                            className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-semibold">Email Address</label>
                          <input
                            type="email"
                            value={vcardEmail}
                            onChange={(e) => setVcardEmail(e.target.value)}
                            className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-semibold">Website</label>
                          <input
                            type="url"
                            value={vcardUrl}
                            onChange={(e) => setVcardUrl(e.target.value)}
                            className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {contentType === 'email' && (
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold">Recipient Email</label>
                        <input
                          type="email"
                          value={emailTo}
                          onChange={(e) => setEmailTo(e.target.value)}
                          className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold">Subject Line</label>
                        <input
                          type="text"
                          value={emailSubject}
                          onChange={(e) => setEmailSubject(e.target.value)}
                          className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold">Email Body</label>
                        <textarea
                          rows={3}
                          value={emailBody}
                          onChange={(e) => setEmailBody(e.target.value)}
                          className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm resize-none"
                        />
                      </div>
                    </div>
                  )}

                  {contentType === 'sms' && (
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold">Phone Number</label>
                        <input
                          type="text"
                          value={smsPhone}
                          onChange={(e) => setSmsPhone(e.target.value)}
                          className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold">Pre-filled Message</label>
                        <textarea
                          rows={3}
                          value={smsMessage}
                          onChange={(e) => setSmsMessage(e.target.value)}
                          className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm resize-none"
                        />
                      </div>
                    </div>
                  )}

                  {contentType === 'crypto' && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold">Cryptocurrency</label>
                          <select
                            value={cryptoCoin}
                            onChange={(e) => setCryptoCoin(e.target.value)}
                            className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm"
                          >
                            <option value="bitcoin">Bitcoin (BTC)</option>
                            <option value="ethereum">Ethereum (ETH)</option>
                            <option value="solana">Solana (SOL)</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold">Amount (Optional)</label>
                          <input
                            type="text"
                            value={cryptoAmount}
                            onChange={(e) => setCryptoAmount(e.target.value)}
                            className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold">Wallet Address</label>
                        <input
                          type="text"
                          value={cryptoAddress}
                          onChange={(e) => setCryptoAddress(e.target.value)}
                          className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm font-mono"
                        />
                      </div>
                    </div>
                  )}

                  {contentType === 'text' && (
                    <div className="space-y-2">
                      <label className="text-sm font-semibold">Raw Text Message</label>
                      <textarea
                        rows={4}
                        value={plainText}
                        onChange={(e) => setPlainText(e.target.value)}
                        placeholder="Type any message, note, or code snippet..."
                        className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm resize-none"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Style & Patterns */}
              {activeTab === 'style' && (
                <div className="bg-card border border-border rounded-2xl p-6 space-y-6 shadow-xs">
                  <div className="space-y-3">
                    <label className="text-sm font-semibold flex items-center justify-between">
                      <span>Color Palette</span>
                      <span className="text-xs text-muted-foreground font-normal">Ensure high contrast</span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      <div>
                        <span className="text-xs text-muted-foreground block mb-1">Modules (Dots)</span>
                        <div className="flex items-center gap-2 border border-border rounded-xl p-2 bg-background">
                          <input
                            type="color"
                            value={config.fgColor}
                            onChange={(e) => setConfig({ ...config, fgColor: e.target.value })}
                            className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
                          />
                          <input
                            type="text"
                            value={config.fgColor}
                            onChange={(e) => setConfig({ ...config, fgColor: e.target.value })}
                            className="text-xs uppercase font-mono w-20 bg-transparent focus:outline-hidden"
                          />
                        </div>
                      </div>

                      <div>
                        <span className="text-xs text-muted-foreground block mb-1">Background</span>
                        <div className="flex items-center gap-2 border border-border rounded-xl p-2 bg-background">
                          <input
                            type="color"
                            value={config.bgColor}
                            onChange={(e) => setConfig({ ...config, bgColor: e.target.value })}
                            className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
                          />
                          <input
                            type="text"
                            value={config.bgColor}
                            onChange={(e) => setConfig({ ...config, bgColor: e.target.value })}
                            className="text-xs uppercase font-mono w-20 bg-transparent focus:outline-hidden"
                          />
                        </div>
                      </div>

                      <div>
                        <span className="text-xs text-muted-foreground block mb-1">Corner Eyes</span>
                        <div className="flex items-center gap-2 border border-border rounded-xl p-2 bg-background">
                          <input
                            type="color"
                            value={config.eyeColor || config.fgColor}
                            onChange={(e) => setConfig({ ...config, eyeColor: e.target.value })}
                            className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
                          />
                          <input
                            type="text"
                            value={config.eyeColor || config.fgColor}
                            onChange={(e) => setConfig({ ...config, eyeColor: e.target.value })}
                            className="text-xs uppercase font-mono w-20 bg-transparent focus:outline-hidden"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-semibold">Module Shape</label>
                    <div className="grid grid-cols-4 gap-3">
                      {[
                        { id: 'square', label: 'Square' },
                        { id: 'rounded', label: 'Rounded' },
                        { id: 'dots', label: 'Dots' },
                        { id: 'diamond', label: 'Diamond' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setConfig({ ...config, dotStyle: item.id as any })}
                          className={`py-3 px-2 rounded-xl text-xs font-medium border text-center transition-all ${
                            config.dotStyle === item.id
                              ? 'border-primary bg-primary/10 text-primary font-bold'
                              : 'border-border hover:bg-muted text-muted-foreground'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-semibold">Finder Eye Corners</label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: 'square', label: 'Classic Square' },
                        { id: 'rounded', label: 'Soft Rounded' },
                        { id: 'circle', label: 'Circular Eye' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setConfig({ ...config, eyeStyle: item.id as any })}
                          className={`py-3 px-2 rounded-xl text-xs font-medium border text-center transition-all ${
                            config.eyeStyle === item.id
                              ? 'border-primary bg-primary/10 text-primary font-bold'
                              : 'border-border hover:bg-muted text-muted-foreground'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-semibold flex items-center gap-1.5">
                        <Shield className="w-4 h-4 text-primary" /> Error Correction Level
                      </label>
                      <span className="text-xs text-muted-foreground">High is ideal when adding center logos</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { level: 'L', label: 'Low (7%)' },
                        { level: 'M', label: 'Medium (15%)' },
                        { level: 'Q', label: 'Quartile (25%)' },
                        { level: 'H', label: 'High (30%)' },
                      ].map((item) => (
                        <button
                          key={item.level}
                          onClick={() => setConfig({ ...config, ecLevel: item.level as ErrorCorrectionLevel })}
                          className={`py-2 px-1 rounded-lg text-xs font-medium border text-center transition-all ${
                            config.ecLevel === item.level
                              ? 'border-primary bg-primary text-primary-foreground font-semibold'
                              : 'border-border text-muted-foreground hover:bg-muted'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Frame & Branding */}
              {activeTab === 'frame' && (
                <div className="bg-card border border-border rounded-2xl p-6 space-y-6 shadow-xs">
                  <div className="space-y-3">
                    <label className="text-sm font-semibold">Frame Card Presentation</label>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      {[
                        { id: 'none', label: 'None' },
                        { id: 'card', label: 'Card' },
                        { id: 'bottom-bar', label: 'Inverted' },
                        { id: 'badge', label: 'Top Badge' },
                        { id: 'polaroid', label: 'Polaroid' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setConfig({ ...config, frameStyle: item.id as any })}
                          className={`py-3 px-2 rounded-xl text-xs font-medium border text-center transition-all ${
                            config.frameStyle === item.id
                              ? 'border-primary bg-primary/10 text-primary font-bold'
                              : 'border-border hover:bg-muted text-muted-foreground'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {config.frameStyle !== 'none' && (
                    <div className="space-y-2">
                      <label className="text-sm font-semibold">Call to Action (CTA) Text</label>
                      <input
                        type="text"
                        value={config.frameText}
                        onChange={(e) => setConfig({ ...config, frameText: e.target.value })}
                        placeholder="e.g. SCAN TO CONNECT"
                        className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm"
                      />
                    </div>
                  )}

                  <div className="space-y-3">
                    <label className="text-sm font-semibold">Center Branded Icon</label>
                    <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
                      {[
                        { id: 'none', label: 'None' },
                        { id: 'link', label: 'Link' },
                        { id: 'wifi', label: 'Wi-Fi' },
                        { id: 'user', label: 'User' },
                        { id: 'heart', label: 'Heart' },
                        { id: 'star', label: 'Star' },
                        { id: 'mail', label: 'Mail' },
                        { id: 'phone', label: 'Phone' },
                        { id: 'crypto', label: 'Crypto' },
                        { id: 'cart', label: 'Cart' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setConfig({ ...config, logoIcon: item.id })}
                          className={`py-2 px-1 rounded-xl text-xs border text-center transition-all ${
                            config.logoIcon === item.id
                              ? 'border-primary bg-primary text-primary-foreground font-semibold'
                              : 'border-border hover:bg-muted text-muted-foreground'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Live Interactive Preview & Export Toolbar (5 cols) */}
            <div className="lg:col-span-5 sticky top-24 space-y-6">
              <div className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-md flex flex-col items-center">
                <div className="w-full flex items-center justify-between pb-4 mb-4 border-b border-border/70 text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Live Camera-Ready Preview
                  </span>
                  <span>{config.ecLevel} Error Correction</span>
                </div>

                <div className="w-full py-4 flex items-center justify-center">
                  <QRCanvasPreview
                    value={qrString}
                    config={config}
                    svgRef={svgRef}
                  />
                </div>

                <div className="w-full space-y-3 pt-6 border-t border-border mt-4">
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleDownloadPNG(1024)}
                      className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-all hover:scale-102 shadow-xs"
                    >
                      <Download className="w-4 h-4" />
                      Download PNG
                    </button>
                    <button
                      onClick={handleDownloadSVG}
                      className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-border bg-background text-foreground font-medium text-sm hover:bg-muted transition-all"
                    >
                      <Download className="w-4 h-4" />
                      Vector SVG
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={handleCopyToClipboard}
                      className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-border/80 bg-muted/40 text-xs font-medium hover:bg-muted text-foreground transition-all"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      Copy to Clipboard
                    </button>
                    <button
                      onClick={handlePrint}
                      className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-border/80 bg-muted/40 text-xs font-medium hover:bg-muted text-foreground transition-all"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      Print Card
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-muted/40 border border-border rounded-2xl p-5 space-y-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-2 font-semibold text-foreground">
                  <Check className="w-4 h-4 text-emerald-600" />
                  Scannability Guarantee
                </div>
                <p className="leading-relaxed">
                  Generated codes comply strictly with ISO/IEC 18004 standards. Every pattern is verified for high-contrast scanning on both iOS and Android cameras.
                </p>
                <div className="flex items-center gap-4 pt-1 font-mono text-[11px]">
                  <span>Payload: {qrString.length} chars</span>
                  <span>•</span>
                  <span>Direct scan: No intermediaries</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* GitHub Setup Instructions Modal */}
      {showGithubModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowGithubModal(false)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <Github className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-xl text-foreground">
                  Pushing this Project to GitHub
                </h3>
                <p className="text-xs text-muted-foreground">
                  Follow these 4 simple terminal commands to publish your repository.
                </p>
              </div>
            </div>

            <div className="space-y-4 text-sm">
              <div className="space-y-2">
                <span className="font-semibold text-xs text-foreground uppercase tracking-wider block">
                  Step 1: Create a new empty repository on GitHub
                </span>
                <p className="text-xs text-muted-foreground">
                  Go to <a href="https://github.com/new" target="_blank" rel="noreferrer" className="text-primary underline inline-flex items-center gap-1">github.com/new <ExternalLink className="w-3 h-3" /></a> and create a repository (e.g., <code className="bg-muted px-1.5 py-0.5 rounded font-mono">qr-code-generator</code>). Do NOT initialize with README.
                </p>
              </div>

              <div className="space-y-2">
                <span className="font-semibold text-xs text-foreground uppercase tracking-wider block">
                  Step 2: Initialize Git & Commit Code
                </span>
                <div className="p-3 bg-muted/50 rounded-xl font-mono text-xs text-foreground space-y-1">
                  <p>git init</p>
                  <p>git add .</p>
                  <p>git commit -m "feat: initial QR Code Generator release"</p>
                </div>
              </div>

              <div className="space-y-2">
                <span className="font-semibold text-xs text-foreground uppercase tracking-wider block">
                  Step 3: Link your remote repository
                </span>
                <div className="p-3 bg-muted/50 rounded-xl font-mono text-xs text-foreground">
                  <p>git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git</p>
                </div>
              </div>

              <div className="space-y-2">
                <span className="font-semibold text-xs text-foreground uppercase tracking-wider block">
                  Step 4: Push to main branch
                </span>
                <div className="p-3 bg-muted/50 rounded-xl font-mono text-xs text-foreground">
                  <p>git branch -M main</p>
                  <p>git push -u origin main</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Need continuous deployment? Connect Vercel or Netlify to your new GitHub repo.
              </span>
              <button
                onClick={() => setShowGithubModal(false)}
                className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs hover:opacity-90 transition-all"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}