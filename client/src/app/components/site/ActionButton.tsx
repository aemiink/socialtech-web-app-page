import { ArrowRight } from "lucide-react";
import { cloneElement, isValidElement, type ReactNode } from "react";
import { Link } from "react-router";

type ActionButtonProps = {
  label: string;
  accent: "lime" | "violet" | "cyan";
  icon?: ReactNode;
  to?: string;
  href?: string;
  filled?: boolean;
  className?: string;
};

export default function ActionButton({
  label,
  accent,
  icon,
  to,
  href,
  filled = false,
  className = "",
}: ActionButtonProps) {
  const palette = {
    lime: {
      border: "border-[#b5ff15]/70",
      text: filled ? "text-[#0e1405]" : "text-[#b5ff15]",
      hoverText: "group-hover:text-[#0e1405]",
      bar: "bg-[#b5ff15]",
      glow: "shadow-[0_0_30px_rgba(181,255,21,0.18)]",
      surface: filled
        ? "bg-[#b5ff15]"
        : "bg-[linear-gradient(135deg,rgba(15,19,24,0.96),rgba(33,39,52,0.9))]",
    },
    violet: {
      border: "border-[#8a38f5]/70",
      text: filled ? "text-white" : "text-[#c699ff]",
      hoverText: "group-hover:text-white",
      bar: "bg-[#8a38f5]",
      glow: "shadow-[0_0_30px_rgba(138,56,245,0.18)]",
      surface: filled
        ? "bg-[#8a38f5]"
        : "bg-[linear-gradient(135deg,rgba(15,19,24,0.96),rgba(33,39,52,0.9))]",
    },
    cyan: {
      border: "border-[#00a2e5]/70",
      text: filled ? "text-[#07141c]" : "text-[#7bdcff]",
      hoverText: "group-hover:text-[#07141c]",
      bar: "bg-[#00a2e5]",
      glow: "shadow-[0_0_30px_rgba(0,162,229,0.18)]",
      surface: filled
        ? "bg-[#00a2e5]"
        : "bg-[linear-gradient(135deg,rgba(15,19,24,0.96),rgba(33,39,52,0.9))]",
    },
  }[accent];

  const buttonTextClass = `${palette.text} ${palette.hoverText} transition-colors duration-300`;
  const resolvedIcon =
    icon && isValidElement<{ className?: string }>(icon)
      ? cloneElement(icon, {
          className: [icon.props.className, "shrink-0", buttonTextClass].filter(Boolean).join(" "),
        })
      : icon ? <span className={`shrink-0 ${buttonTextClass}`}>{icon}</span> : null;

  const content = (
    <>
      <span
        aria-hidden="true"
        className={`absolute inset-y-0 left-0 ${filled ? "w-full opacity-100" : "w-1.5"} ${palette.bar} transition-all duration-300 group-hover:w-full`}
      />
      <span className="relative flex items-center justify-center gap-3 px-5 py-3">
        {resolvedIcon}
        <span className={`text-sm font-semibold md:text-[15px] ${buttonTextClass}`}>{label}</span>
        <ArrowRight className={`h-4 w-4 ${buttonTextClass}`} />
      </span>
    </>
  );

  const classes = `group relative inline-flex overflow-hidden rounded-[10px] border ${palette.border} ${palette.surface} ${palette.glow} transition duration-300 hover:-translate-y-1`;

  if (to) {
    return (
      <Link className={`${classes} ${className}`} to={to}>
        {content}
      </Link>
    );
  }

  if (href) {
    return (
      <a className={`${classes} ${className}`} href={href}>
        {content}
      </a>
    );
  }

  return (
    <button className={`${classes} ${className}`} type="button">
      {content}
    </button>
  );
}
