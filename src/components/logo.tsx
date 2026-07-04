import { Link } from "@tanstack/react-router";

interface Props {
  size?: number;
  withWordmark?: boolean;
  className?: string;
}

/**
 * Rota do Sim — trilha pontilhada terminando em círculo terracota com check.
 */
export function Logo({ size = 28, withWordmark = true, className = "" }: Props) {
  return (
    <Link to="/" className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg
        width={size * 2.2}
        height={size}
        viewBox="0 0 88 40"
        fill="none"
        aria-hidden
      >
        <circle cx="6" cy="20" r="3" fill="currentColor" opacity="0.35" />
        <circle cx="20" cy="20" r="3" fill="currentColor" opacity="0.5" />
        <circle cx="34" cy="20" r="3" fill="currentColor" opacity="0.7" />
        <circle cx="48" cy="20" r="3" fill="currentColor" opacity="0.85" />
        <circle cx="62" cy="20" r="3.5" fill="currentColor" />
        <circle cx="78" cy="20" r="10" className="fill-primary" />
        <path
          d="M73.5 20.2 L76.8 23.5 L82.5 17.5"
          stroke="white"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
      {withWordmark && (
        <span className="font-serif text-xl font-semibold tracking-tight text-graphite">
          Rota do <span className="text-primary">Sim</span>
        </span>
      )}
    </Link>
  );
}
