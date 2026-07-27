const GRADIENTS = [
  ["#6366f1", "#8b5cf6"],
  ["#0ea5e9", "#22d3ee"],
  ["#f59e0b", "#f97316"],
  ["#10b981", "#14b8a6"],
  ["#ec4899", "#f43f5e"],
  ["#8b5cf6", "#d946ef"],
  ["#64748b", "#334155"],
];

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

export default function IconTile({
  name,
  icon,
  size = 44,
}: {
  name: string;
  icon?: string;
  size?: number;
}) {
  if (icon) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={icon}
        alt=""
        width={size}
        height={size}
        className="rounded-[11px] object-cover"
        style={{ width: size, height: size }}
      />
    );
  }

  const [from, to] = GRADIENTS[hashString(name) % GRADIENTS.length];

  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-[11px] font-semibold text-white/90"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.36,
        background: `linear-gradient(135deg, ${from}, ${to})`,
      }}
    >
      {getInitials(name)}
    </div>
  );
}
