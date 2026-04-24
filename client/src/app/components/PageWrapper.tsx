import { useEffect, useState } from "react";

const DESIGN_WIDTH = 1728;

export default function PageWrapper({ children }: { children: React.ReactNode }) {
  const [desktopZoom, setDesktopZoom] = useState(1);

  useEffect(() => {
    const updateDesktopZoom = () => {
      const nextZoom = window.innerWidth > DESIGN_WIDTH ? window.innerWidth / DESIGN_WIDTH : 1;
      setDesktopZoom(nextZoom);
    };

    updateDesktopZoom();
    window.addEventListener("resize", updateDesktopZoom);

    return () => {
      window.removeEventListener("resize", updateDesktopZoom);
    };
  }, []);

  const isZoomedDesktop = desktopZoom > 1;

  return (
    <div className="page-shell relative min-h-screen w-full overflow-x-hidden bg-[#050816] text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-14rem] top-[-10rem] h-[32rem] w-[32rem] rounded-full bg-[#8a38f5]/20 blur-[120px]" />
        <div className="absolute right-[-10rem] top-[12rem] h-[24rem] w-[24rem] rounded-full bg-[#aaff01]/12 blur-[120px]" />
        <div className="absolute bottom-[-12rem] left-1/2 h-[28rem] w-[38rem] -translate-x-1/2 rounded-full bg-[#00a2e5]/10 blur-[140px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.05),transparent_40%),linear-gradient(180deg,rgba(4,8,19,0.1),rgba(4,8,19,0.82))]" />
      </div>
      <div className="relative mx-auto flex min-h-screen w-full items-start justify-center">
        <div
          className={
            isZoomedDesktop
              ? "page-canvas w-[1728px] max-w-none origin-top"
              : "page-canvas w-full max-w-[1728px] origin-top scale-[0.7] sm:scale-[0.8] md:scale-[0.9] lg:scale-100"
          }
          style={isZoomedDesktop ? ({ zoom: desktopZoom } as React.CSSProperties) : undefined}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
