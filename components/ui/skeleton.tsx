type Props = { className?: string; width?: string; height?: string; rounded?: boolean };

export function Skeleton({ className = "", width, height = "1rem", rounded = false }: Props) {
  return <span aria-hidden="true" className={`block animate-pulse bg-white/[0.08] ${rounded ? "rounded-pill" : "rounded-sm"} ${className}`} style={{ width, height }} />;
}
