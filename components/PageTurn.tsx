/**
 * The page turn: the next page's color comes in as a diagonal fold from the bottom right corner. ScrollRig
 * writes the two shapes; the flap is the turned-over part, one tone darker.
 */
export function PageTurn() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 noscript:hidden">
      <div className="absolute inset-0 bg-turn [clip-path:var(--turn-page,inset(100%))]" />
      <div className="absolute inset-0 bg-turn-flap [clip-path:var(--turn-flap,inset(100%))]" />
    </div>
  );
}
