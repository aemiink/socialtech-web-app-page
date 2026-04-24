import darkLogo from "../../../assets/package-feature-logo-dark.png";
import whiteLogo from "../../../assets/package-feature-logo-white.png";

type PackageFeatureBulletProps = {
  className?: string;
  tone?: "dark" | "light";
};

export default function PackageFeatureBullet({ className = "", tone = "light" }: PackageFeatureBulletProps) {
  return (
    <img
      alt=""
      aria-hidden="true"
      className={`object-contain ${className}`}
      src={tone === "dark" ? darkLogo : whiteLogo}
    />
  );
}
