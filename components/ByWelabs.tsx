// SELO EM TEXTO "BY WELABS"
// Brand 1.5.0: a product is a sub-brand of Welabs, so its first mention on a page reads "<Product> by Welabs".
// The name stays in the caller; this span only adds the endorsement, in a lighter weight so labels keep their rhythm.
export function ByWelabs() {
  return <span className="by-welabs"> by Welabs</span>;
}
