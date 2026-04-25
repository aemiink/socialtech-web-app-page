type HeroBackdropProps = {
  fadeColor?: string;
};

export default function HeroBackdrop({ fadeColor = "#111317" }: HeroBackdropProps) {
  return (
    <>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_30%,rgba(170,255,1,0.18),transparent_30%),radial-gradient(circle_at_16%_72%,rgba(138,56,245,0.16),transparent_28%),linear-gradient(135deg,#050607_0%,#111317_48%,#030405_100%)]" />
      <div className="hero-orb hero-orb-left absolute left-[-9rem] top-28 h-[28rem] w-[28rem] rounded-full border border-[#aaff01]/18" />
      <div className="hero-orb hero-orb-right absolute right-[-10rem] top-8 h-[34rem] w-[34rem] rounded-full border border-[#aaff01]/10" />
      <div className="hero-glow hero-glow-lime absolute right-[8%] top-[22%] h-[18rem] w-[18rem] rounded-full bg-[#aaff01]/10 blur-[110px]" />
      <div className="hero-glow hero-glow-violet absolute left-[10%] bottom-[8%] h-[16rem] w-[16rem] rounded-full bg-[#8a38f5]/12 blur-[120px]" />
      <div
        className="absolute inset-x-0 bottom-0 h-48"
        style={{ background: `linear-gradient(to top, ${fadeColor}, transparent)` }}
      />
    </>
  );
}
