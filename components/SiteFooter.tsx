export function SiteFooter() {
  return (
    <footer className="bg-primary text-on-primary w-full py-12 px-6 sm:px-8 mt-auto border-t border-primary/20 shadow-inner no-print">
      <div className="max-w-[1200px] mx-auto w-full flex flex-col md:flex-row justify-between items-center gap-8 md:gap-0">
        {/* Left Side: Branding & Crest */}
        <div className="flex flex-col md:flex-row items-center gap-6">
          <img
            alt="Osmania University Logo"
            className="h-16 w-auto object-contain rounded-sm bg-white/10 p-2"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDcR9wjRE7ojMDjJr8z8umN-5aphfNUzDJLCFDSKnQUDhPJxWePch5mRN_zK7Ad45A3s6qspmcaA2DQlR085iMML4ZOglsYMNfddovoNCBfbINH5ALgfWjtLiJGSJw2L_NZjZi0LxmPE-2aLAV0xR2t160c8kOFcsv9j6W1yDu4b9cpEZRdSymCmiEgm_nE9s2m5OCE-7BmaVu2ztk4PuQT1XPN0n0vF2Hgfdu7U35uxLasOzXMRjlJiDNecgvK4zeo7V4ZnIWY5Wdu"
          />
          <div className="text-center md:text-left">
            <span className="font-headline text-2xl text-on-primary block font-bold tracking-tight">
              Osmania University
            </span>
            <span className="font-body text-sm text-on-primary/80 mt-0.5 block tracking-wide">
              Examination Branch Portal
            </span>
          </div>
        </div>

        {/* Right Side: Links & Copyright */}
        <div className="flex flex-col items-center md:items-end gap-4">
          <div className="flex flex-wrap justify-center md:justify-end gap-6 md:gap-8 mb-1">
            <a
              className="text-on-primary/80 hover:text-white font-body text-sm transition-colors duration-200"
              href="#"
            >
              Privacy Policy
            </a>
            <a
              className="text-on-primary/80 hover:text-white font-body text-sm transition-colors duration-200"
              href="#"
            >
              Terms of Service
            </a>
            <a
              className="text-on-primary/80 hover:text-white font-body text-sm transition-colors duration-200"
              href="#"
            >
              Helpdesk
            </a>
            <a
              className="text-on-primary/80 hover:text-white font-body text-sm transition-colors duration-200"
              href="#"
            >
              Official Portal
            </a>
          </div>

          {/* Trust Signals */}
          <div className="flex flex-wrap justify-center md:justify-end gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-success/30 bg-success/10 text-success text-[10px] font-bold uppercase tracking-wider font-label">
              <svg className="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              SSL Secured
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-success/30 bg-success/10 text-success text-[10px] font-bold uppercase tracking-wider font-label">
              <svg className="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/><circle cx="12" cy="10" r="3"/></svg>
              Data Protected
            </span>
          </div>
          <p className="inline-flex items-center gap-1.5 font-label text-[11px] text-success tracking-wide text-center md:text-right font-semibold">
            <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            This result is authenticated and final
          </p>
          <p className="font-body text-[12px] text-on-primary/60 tracking-wide text-center md:text-right">
            © 2026 Osmania University Examination Branch. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
