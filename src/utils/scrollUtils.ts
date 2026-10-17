// src/utils/scrollUtils.ts
// Helper scroll yang AMAN untuk HashRouter.
// Jangan pakai href="#id" tanpa preventDefault: hash akan berubah dan React
// Router (rute "#/") menganggapnya rute tak dikenal lalu me-redirect kembali
// ke "/" — akibatnya klik link terasa "stuck" (tidak scroll, halaman ke-reset).

export const scrollToSection = (elementId: string, offset = 88): void => {
  const el = document.getElementById(elementId);
  if (!el) return;
  const y = el.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top: Math.max(y, 0), behavior: 'smooth' });
};

export const scrollToTop = (): void => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};
