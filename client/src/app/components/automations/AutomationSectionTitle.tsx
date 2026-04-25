type AutomationSectionTitleProps = {
  eyebrow?: string;
  highlight: string;
  prefix: string;
  description?: string;
  center?: boolean;
};

export default function AutomationSectionTitle({
  eyebrow,
  highlight,
  prefix,
  description,
  center = false,
}: AutomationSectionTitleProps) {
  return (
    <div className={center ? "mx-auto max-w-[900px] text-center" : "max-w-[860px]"}>
      {eyebrow ? (
        <span className="inline-flex rounded-full bg-[#aaff01] px-4 py-1 text-xs font-black uppercase tracking-[0.18em] text-black">
          {eyebrow}
        </span>
      ) : null}
      <h2 className="mt-5 text-[34px] font-black leading-tight text-white md:text-[48px]">
        {prefix} <span className="inline-block -rotate-1 bg-[#aaff01] px-2 text-black">{highlight}</span>
      </h2>
      {description ? <p className="mt-6 text-base leading-8 text-white/68 md:text-lg">{description}</p> : null}
    </div>
  );
}
