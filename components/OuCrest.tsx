import Image from "next/image";
import clsx from "clsx";

type OuCrestProps = {
  size?: "sm" | "md" | "lg" | "xl";
  showBg?: boolean;
  className?: string;
  priority?: boolean;
};

const sizeMap = {
  sm: { w: 48, h: 48, container: "h-10" },
  md: { w: 64, h: 64, container: "h-14" },
  lg: { w: 96, h: 96, container: "h-20" },
  xl: { w: 128, h: 128, container: "h-28" },
};

export default function OuCrest({
  size = "md",
  showBg = false,
  className,
  priority = false,
}: OuCrestProps) {
  const { w, h, container } = sizeMap[size];

  return (
    <div
      className={clsx(
        "flex items-center justify-center shrink-0",
        showBg && "bg-white/10 p-2 rounded-sm",
        container,
        className,
      )}
    >
      <Image
        src="/images/ou-logo.png"
        alt="Osmania University Logo"
        width={w}
        height={h}
        priority={priority}
        className="object-contain w-auto h-full"
      />
    </div>
  );
}
