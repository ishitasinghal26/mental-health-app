import logoUrl from "../../assets/Logo.png";

/**
 * AppLogo — shared logo image with animated glow/shine effect.
 * Import this wherever the logo is shown.
 * @param height  pixel height of the logo (width is auto)
 * @param className  extra CSS classes if needed
 */
export default function AppLogo({
  height = 32,
  className = "",
}: {
  height?: number;
  className?: string;
}) {
  return (
    <img
      src={logoUrl}
      alt="logo"
      className={`app-logo-glow ${className}`}
      style={{
        height,
        width: "auto",
        objectFit: "contain",
        display: "block",
      }}
    />
  );
}
