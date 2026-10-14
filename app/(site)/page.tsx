import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Welabs",
  description: "Domus, Relloo, Magneto, Tuner e Knowly.",
  robots: { index: false, follow: false },
};

// HOME
// The home is the layout of the route group (app/(site)/layout.tsx): with no product open, the slot stays empty and the
// whole home shows
export default function Page() {
  return null;
}
