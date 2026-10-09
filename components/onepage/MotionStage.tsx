"use client";
// PALCO DE MOTION
// A stage is a box whose SVG/CSS motion runs only while the page controller marks it live (visible, page not paused,
// at most two live at once). Outside that the stage keeps no animation and shows its resolved still frame, which is
// also what the server renders, what reduced motion shows and what a paused page shows.
import { useEffect, useRef, useState } from "react";
import { getController } from "./motion-store";

export function MotionStage({
  id,
  className,
  children,
}: {
  id: string;
  className?: string;
  children: React.ReactNode;
}) {
  const box = useRef<HTMLDivElement>(null);
  const [live, setLive] = useState(false);
  // Register with the page controller; mount/unmount only flip the flag the CSS reads
  useEffect(() => {
    const element = box.current;
    if (!element) return;
    return getController().register({
      id,
      element,
      mount: () => setLive(true),
      unmount: () => setLive(false),
      play: () => {},
      pause: () => {},
    });
  }, [id]);
  return (
    <div
      ref={box}
      className={className}
      data-live={live ? "true" : "false"}
      data-stage={id}
      aria-hidden="true"
    >
      {children}
    </div>
  );
}
