"use client";
// FRONTEIRA DA LIB PARA O KIT DE CENAS
// The pieces of @imagineapps-team/react the scene kit (components/scene-kit) builds on: the detection hooks it reuses
// instead of its own observers, the master-detail layout and separator of a product window, and the motion effects of
// a scene (items arriving, "typing"). Same client boundary rule as ui.tsx; the effects come from their own entry.
import type { ComponentProps } from "react";
import { Timeline as LibTimeline } from "@imagineapps-team/react/ui";

export {
  Avatar,
  AvatarFallback,
  TimelineItem,
  Separator,
  SplitView,
  SplitViewDetail,
  SplitViewList,
  useInView,
  useReducedMotion,
} from "@imagineapps-team/react/ui";
export { AnimatedList, TypingDots } from "@imagineapps-team/react/ui/effects";

// TIMELINE DA LIB COM GANCHO DE TEMA
// The lib's Timeline writes no data-slot, so app/lib.css (block TIMELINE E AVATAR) could not theme it without a
// call-site class; the boundary adds the slot once and passes everything else through
export function Timeline(props: ComponentProps<typeof LibTimeline>) {
  return <LibTimeline data-slot="timeline" {...props} />;
}
