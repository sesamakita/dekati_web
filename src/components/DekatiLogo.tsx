// src/components/DekatiLogo.tsx
import React, { useId } from 'react';

export type DekatiLogoVariant = 'brand' | 'original' | 'emerald' | 'white' | 'monochrome';

export interface DekatiLogoProps extends React.SVGProps<SVGSVGElement> {
  /**
   * Pilihan varian warna logo:
   * - 'brand' (rekomendasi): Huruf Dekat elegan slate-900 dengan titik 'i' aksen emerald cerah
   * - 'original': Tepat sesuai warna asli CorelDRAW (#373435)
   * - 'emerald': Gradien penuh hijau zamrud khas identitas Dekati
   * - 'white': Putih bersih untuk latar belakang gelap/header malam
   * - 'monochrome': Mengikuti warna font induk (currentColor)
   */
  variant?: DekatiLogoVariant;
  /** Efek pendaran halus (glow) pada titik huruf 'i' untuk tampilan modern */
  glowDot?: boolean;
}

const PATH_D =
  'M645.24,386.85 C645.24,507.29 605.94,610.44 527.35,696.49 C448.57,782.35 348.37,825.37 226.75,825.37 C169.18,825.37 93.74,823.02 0.02,818.5 C7.68,765.84 23.6,635.19 47.76,426.54 C62.3,286.85 70.56,167.59 72.52,68.96 L173.9,68.96 C189.62,68.96 213,68.57 243.84,67.39 C274.69,66.21 298.66,65.62 315.36,65.62 C425.19,65.62 507.7,96.07 562.72,156.78 C617.73,217.69 645.24,294.31 645.24,386.85 Z M493.95,404.73 C493.95,339.11 475.68,285.28 439.53,243.43 C403.18,201.58 348.37,180.75 274.69,180.75 C256.22,180.75 233.82,182.52 207.3,185.86 C204.94,221.22 197.87,301.39 185.88,426.54 C176.45,518.29 168.4,609.26 161.72,699.44 C185.1,704.35 209.46,706.9 234.81,706.9 C315.75,706.9 379.21,677.04 425.19,617.31 C470.97,557.59 493.95,486.85 493.95,404.73 Z';

const PATH_E =
  'M1196.19,390.78 C1196.19,505.13 1073.2,564.66 827.22,569.18 C827.22,619.87 836.65,657.79 855.51,682.94 C874.37,708.08 907.18,720.66 953.94,720.66 C1015.24,720.66 1081.06,700.81 1151.4,661.32 L1133.52,775.28 C1076.35,815.16 1003.85,835.2 916.02,835.2 C837.63,835.2 779.87,811.62 742.34,764.67 C705.01,717.71 686.35,655.43 686.35,577.82 C686.35,477.82 717.59,397.46 780.46,336.95 C843.13,276.63 917.4,246.37 1003.45,246.37 C1062.98,246.37 1109.55,258.56 1143.34,283.11 C1178.51,308.46 1196.19,344.41 1196.19,390.78 Z M1067.9,402.37 C1067.9,365.04 1039.21,346.57 982.04,346.57 C949.42,346.57 918.58,358.56 889.5,382.53 C860.23,406.5 841.36,440.88 832.52,485.87 C989.5,482.73 1067.9,454.83 1067.9,402.37 Z';

const PATH_K =
  'M1759.86,272.31 C1759.86,286.06 1736.87,320.05 1690.7,374.47 C1644.73,428.7 1605.63,468.19 1573.41,492.75 L1572.82,500.21 C1613.1,546.58 1648.26,605.13 1678.32,675.47 C1708.58,745.81 1723.51,793.55 1723.51,818.5 L1566.53,824.2 C1566.53,806.51 1556.9,772.72 1538.04,722.43 C1518.99,672.13 1496.78,629.89 1471.44,595.7 C1451.99,616.92 1434.9,638.73 1420.16,661.32 C1385.78,715.16 1366.72,767.42 1363.18,818.5 L1218.19,824.2 C1225.85,773.9 1243.34,629.49 1270.65,390.78 C1285.58,248.54 1293.04,121.22 1293.04,9.23 L1449.63,0 C1449.63,16.5 1443.93,64.24 1432.54,143.03 C1421.34,221.81 1403.66,368.58 1379.29,583.13 L1387.94,582.54 C1401.1,553.26 1441.38,495.5 1508.97,409.25 C1568.3,333.21 1598.16,285.47 1598.16,265.82 L1759.86,272.31 Z';

const PATH_A =
  'M2290.42,245.78 C2259.77,453.85 2244.44,597.47 2244.44,676.84 C2244.44,717.12 2247.58,762.5 2254.27,812.8 L2112.61,828.91 C2110.25,797.08 2109.07,759.95 2109.07,717.71 L2100.43,717.71 C2057.79,795.71 1994.53,834.61 1910.63,834.61 C1862.11,834.61 1825.76,816.54 1801.2,780.19 C1776.64,744.04 1764.26,694.33 1764.26,631.46 C1764.26,540.88 1795.89,459.15 1859.35,386.46 C1922.62,313.76 2021.05,275.65 2154.65,272.31 L2180,254.43 L2290.42,245.78 Z M2143.06,363.27 C2062.9,364.06 2003.96,387.44 1966.43,433.41 C1928.71,479.39 1910.05,541.67 1910.05,619.87 C1910.05,690.99 1932.25,726.35 1976.65,726.35 C2011.23,726.35 2043.06,701.21 2071.94,650.91 C2101.02,600.81 2119.29,552.67 2126.95,506.9 C2134.61,460.92 2140.11,413.18 2143.06,363.27 Z';

const PATH_T =
  'M2710.57,276.83 L2694.85,391.37 C2640.82,389.01 2596.42,388.03 2562.03,388.03 C2545.92,492.36 2537.87,569.77 2537.87,620.46 C2537.87,658.77 2541.99,685.1 2550.44,699.44 C2558.89,713.59 2574.02,720.66 2596.02,720.66 C2629.62,720.66 2665.58,708.67 2703.49,684.9 L2684.04,789.62 C2649.46,816.93 2606.44,830.49 2554.96,830.68 C2500.54,830.49 2461.83,817.32 2438.84,790.6 C2415.86,763.88 2404.27,718.89 2404.27,655.63 C2404.27,608.86 2413.89,519.67 2432.95,388.03 C2414.68,388.03 2388.35,389.01 2354.17,391.37 L2370.28,278.01 C2399.55,280.36 2426.08,281.54 2450.24,281.54 C2454.17,254.63 2462.42,200.99 2475,120.83 L2602.9,104.13 C2596.22,140.67 2587.38,199.81 2575.79,281.54 C2606.44,281.54 2651.43,279.97 2710.57,276.83 Z';

const PATH_I_STEM =
  'M2967.36,260.13 C2967.75,270.54 2963.43,310.03 2954.2,378.4 C2944.96,446.97 2938.09,502.57 2933.57,545.01 C2925.12,624.97 2918.05,715.94 2912.15,818.5 L2765.39,824.2 C2773.05,774.29 2785.23,681.36 2801.73,545.01 C2809.4,472.12 2813.13,404.14 2813.13,340.68 C2813.13,314.94 2812.34,293.72 2810.97,276.83 L2967.36,260.13 Z';

const PATH_I_DOT =
  'M3011.76,86.84 C3011.76,116.9 3001.35,142.44 2980.72,163.66 C2959.9,185.07 2934.55,195.68 2904.1,195.68 C2880.72,195.68 2862.64,188.41 2850.07,174.07 C2837.3,159.73 2831.01,141.85 2831.01,120.24 C2831.01,89.98 2841.42,64.44 2862.05,43.81 C2882.88,22.98 2908.42,12.57 2938.68,12.57 C2987.4,12.57 3011.76,37.33 3011.76,86.84 Z';

export const DekatiLogo: React.FC<DekatiLogoProps> = ({
  variant = 'brand',
  glowDot = true,
  className = 'h-9 w-auto',
  ...props
}) => {
  const uniqueId = useId().replace(/:/g, '');
  const emeraldGradId = `dekati-emerald-grad-${uniqueId}`;
  const dotGradId = `dekati-dot-grad-${uniqueId}`;
  const glowFilterId = `dekati-glow-${uniqueId}`;

  // Warna badan teks & titik berdasarkan varian
  let bodyFill = '#0F172A';
  let dotFill = `url(#${dotGradId})`;

  switch (variant) {
    case 'original':
      bodyFill = '#373435';
      dotFill = '#373435';
      break;
    case 'emerald':
      bodyFill = `url(#${emeraldGradId})`;
      dotFill = `url(#${dotGradId})`;
      break;
    case 'white':
      bodyFill = '#FFFFFF';
      dotFill = '#34D399'; // Emerald-400 glowing dot on dark
      break;
    case 'monochrome':
      bodyFill = 'currentColor';
      dotFill = 'currentColor';
      break;
    case 'brand':
    default:
      bodyFill = '#0F172A';
      dotFill = `url(#${dotGradId})`;
      break;
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 3012 836"
      fill="none"
      className={className}
      aria-label="Logo Dekati"
      role="img"
      style={{ shapeRendering: 'geometricPrecision' }}
      {...props}
    >
      <defs>
        {/* Gradien Zamrud Dekati */}
        <linearGradient id={emeraldGradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#059669" />
          <stop offset="60%" stopColor="#047857" />
          <stop offset="100%" stopColor="#0f766e" />
        </linearGradient>

        {/* Gradien Aksen Titik 'i' - Vitalitas Digital & Pelayanan */}
        <linearGradient id={dotGradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="50%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>

        {/* Filter Glow Halus Titik 'i' */}
        {glowDot && variant !== 'original' && variant !== 'monochrome' && (
          <filter id={glowFilterId} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="14" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        )}
      </defs>

      {/* Huruf D, e, k, a, t, dan badan i */}
      <g fill={bodyFill} className="transition-colors duration-200">
        <path d={PATH_D} />
        <path d={PATH_E} />
        <path d={PATH_K} />
        <path d={PATH_A} />
        <path d={PATH_T} />
        <path d={PATH_I_STEM} />
      </g>

      {/* Titik 'i' dengan aksen khusus */}
      <g
        fill={dotFill}
        filter={glowDot && variant !== 'original' && variant !== 'monochrome' ? `url(#${glowFilterId})` : undefined}
        className="transition-all duration-300"
      >
        <path d={PATH_I_DOT} />
      </g>
    </svg>
  );
};

export default DekatiLogo;
