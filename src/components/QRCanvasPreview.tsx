import React, { useMemo } from 'react';
import { generateQRMatrix, type ErrorCorrectionLevel } from './qrUtils';

export interface QRStyleConfig {
  fgColor: string;
  bgColor: string;
  dotStyle: 'square' | 'rounded' | 'dots' | 'diamond';
  eyeStyle: 'square' | 'rounded' | 'circle';
  eyeColor?: string;
  frameText: string;
  frameStyle: 'none' | 'bottom-bar' | 'card' | 'badge' | 'polaroid';
  logoIcon: string;
  ecLevel: ErrorCorrectionLevel;
  size: number;
}

interface QRCanvasPreviewProps {
  value: string;
  config: QRStyleConfig;
  svgRef?: React.RefObject<SVGSVGElement | null>;
}

export const QRCanvasPreview: React.FC<QRCanvasPreviewProps> = ({
  value,
  config,
  svgRef,
}) => {
  const safeText = value.trim() || 'https://meku.dev';

  const qrData = useMemo(() => {
    try {
      return generateQRMatrix(safeText, config.ecLevel);
    } catch {
      return generateQRMatrix('https://meku.dev', 'M');
    }
  }, [safeText, config.ecLevel]);

  const { modules, size } = qrData;
  const margin = 4;
  const viewBoxSize = size + margin * 2;

  // Determine if a module belongs to one of the 3 finder eyes
  const isFinderPattern = (r: number, c: number): boolean => {
    // Top-left
    if (r < 7 && c < 7) return true;
    // Top-right
    if (r < 7 && c >= size - 7) return true;
    // Bottom-left
    if (r >= size - 7 && c < 7) return true;
    return false;
  };

  // Determine if inside center area reserved for logo
  const isCenterLogoArea = (r: number, c: number): boolean => {
    if (config.logoIcon === 'none') return false;
    const center = Math.floor(size / 2);
    const radius = 2; // 5x5 center cutout
    return Math.abs(r - center) <= radius && Math.abs(c - center) <= radius;
  };

  const renderModule = (r: number, c: number) => {
    const isDark = modules[r][c];
    if (!isDark) return null;
    if (isFinderPattern(r, c)) return null; // rendered separately
    if (isCenterLogoArea(r, c)) return null; // space for logo

    const x = c + margin;
    const y = r + margin;

    switch (config.dotStyle) {
      case 'dots':
        return (
          <circle
            key={`${r}-${c}`}
            cx={x + 0.5}
            cy={y + 0.5}
            r={0.42}
            fill={config.fgColor}
          />
        );
      case 'rounded':
        return (
          <rect
            key={`${r}-${c}`}
            x={x + 0.08}
            y={y + 0.08}
            width={0.84}
            height={0.84}
            rx={0.3}
            ry={0.3}
            fill={config.fgColor}
          />
        );
      case 'diamond':
        return (
          <polygon
            key={`${r}-${c}`}
            points={`${x + 0.5},${y} ${x + 1},${y + 0.5} ${x + 0.5},${y + 1} ${x},${y + 0.5}`}
            fill={config.fgColor}
          />
        );
      case 'square':
      default:
        return (
          <rect
            key={`${r}-${c}`}
            x={x}
            y={y}
            width={1.01}
            height={1.01}
            fill={config.fgColor}
          />
        );
    }
  };

  // Render eye patterns with custom styles
  const renderEye = (startX: number, startY: number, key: string) => {
    const eyeColor = config.eyeColor || config.fgColor;
    const x = startX + margin;
    const y = startY + margin;

    if (config.eyeStyle === 'circle') {
      return (
        <g key={key}>
          {/* Outer circle frame */}
          <circle
            cx={x + 3.5}
            cy={y + 3.5}
            r={3}
            fill="none"
            stroke={eyeColor}
            strokeWidth={1}
          />
          {/* Inner pupil */}
          <circle cx={x + 3.5} cy={y + 3.5} r={1.5} fill={eyeColor} />
        </g>
      );
    }

    if (config.eyeStyle === 'rounded') {
      return (
        <g key={key}>
          {/* Outer box */}
          <rect
            x={x + 0.5}
            y={y + 0.5}
            width={6}
            height={6}
            rx={1.5}
            fill="none"
            stroke={eyeColor}
            strokeWidth={1}
          />
          {/* Inner pupil */}
          <rect
            x={x + 2}
            y={y + 2}
            width={3}
            height={3}
            rx={0.8}
            fill={eyeColor}
          />
        </g>
      );
    }

    // Square
    return (
      <g key={key}>
        <rect
          x={x + 0.5}
          y={y + 0.5}
          width={6}
          height={6}
          fill="none"
          stroke={eyeColor}
          strokeWidth={1}
        />
        <rect x={x + 2} y={y + 2} width={3} height={3} fill={eyeColor} />
      </g>
    );
  };

  // Preset logo icon rendering
  const renderCenterLogo = () => {
    if (config.logoIcon === 'none') return null;
    const center = Math.floor(size / 2) + margin;
    const boxSize = 5.2;
    const half = boxSize / 2;

    return (
      <g>
        {/* White background pill to protect scannability */}
        <rect
          x={center - half}
          y={center - half}
          width={boxSize}
          height={boxSize}
          rx={1.2}
          fill={config.bgColor}
          stroke={config.fgColor}
          strokeWidth={0.2}
        />
        {/* Embedded icon */}
        <text
          x={center}
          y={center + 1.1}
          fontSize="2.8"
          textAnchor="middle"
          dominantBaseline="middle"
          fill={config.fgColor}
        >
          {config.logoIcon === 'wifi' && '📶'}
          {config.logoIcon === 'link' && '🔗'}
          {config.logoIcon === 'user' && '👤'}
          {config.logoIcon === 'heart' && '❤️'}
          {config.logoIcon === 'star' && '⭐'}
          {config.logoIcon === 'mail' && '✉️'}
          {config.logoIcon === 'phone' && '📞'}
          {config.logoIcon === 'crypto' && '₿'}
          {config.logoIcon === 'cart' && '🛒'}
          {config.logoIcon === 'chat' && '💬'}
        </text>
      </g>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center w-full">
      {/* Frame wrapper based on chosen frame style */}
      <div
        className={`transition-all duration-300 relative ${
          config.frameStyle === 'card'
            ? 'p-6 rounded-2xl shadow-xl border-2 border-foreground/10 flex flex-col items-center'
            : config.frameStyle === 'bottom-bar'
            ? 'p-5 rounded-2xl bg-foreground text-background flex flex-col items-center shadow-lg'
            : config.frameStyle === 'badge'
            ? 'p-4 rounded-3xl bg-muted/70 border border-border flex flex-col items-center'
            : config.frameStyle === 'polaroid'
            ? 'p-6 pb-10 bg-white text-neutral-900 rounded-xl shadow-2xl border border-neutral-200 flex flex-col items-center'
            : 'p-3 flex flex-col items-center'
        }`}
        style={{
          backgroundColor:
            config.frameStyle === 'card'
              ? config.bgColor
              : config.frameStyle === 'bottom-bar'
              ? config.fgColor
              : undefined,
        }}
      >
        {/* Frame Top Header if Badge */}
        {config.frameStyle === 'badge' && config.frameText && (
          <div className="mb-3 px-4 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold uppercase tracking-wider">
            {config.frameText}
          </div>
        )}

        {/* SVG Barcode Canvas */}
        <div className="rounded-xl overflow-hidden p-2" style={{ backgroundColor: config.bgColor }}>
          <svg
            ref={svgRef}
            viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
            className="w-full max-w-[280px] sm:max-w-[340px] aspect-square transition-all duration-150 select-none"
            style={{ shapeRendering: 'geometricPrecision' }}
          >
            {/* Background Rect */}
            <rect width={viewBoxSize} height={viewBoxSize} fill={config.bgColor} />

            {/* Modules */}
            {modules.map((row, r) => row.map((_, c) => renderModule(r, c)))}

            {/* 3 Corner Finder Eyes */}
            {renderEye(0, 0, 'eye-tl')}
            {renderEye(size - 7, 0, 'eye-tr')}
            {renderEye(0, size - 7, 'eye-bl')}

            {/* Optional Logo Center */}
            {renderCenterLogo()}
          </svg>
        </div>

        {/* Frame Bottom Banner */}
        {config.frameStyle !== 'badge' && config.frameStyle !== 'none' && config.frameText && (
          <div
            className={`mt-4 text-center font-bold tracking-wider text-xs uppercase px-4 py-1.5 rounded-lg ${
              config.frameStyle === 'bottom-bar'
                ? 'bg-background text-foreground'
                : config.frameStyle === 'polaroid'
                ? 'font-serif text-sm tracking-normal capitalize text-neutral-800'
                : 'text-foreground'
            }`}
          >
            {config.frameText}
          </div>
        )}
      </div>
    </div>
  );
};