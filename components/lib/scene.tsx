"use client";
// FRONTEIRA DA LIB PARA O KIT DE CENAS
// The pieces of @imagineapps-team/react the scene kit (components/scene-kit) builds on: the detection hooks it reuses
// instead of its own observers, the master-detail layout and separator of a product window, and the motion effects of
// a scene (items arriving, "typing"). Same client boundary rule as ui.tsx; the effects come from their own entry.
export {
  Separator,
  SplitView,
  SplitViewDetail,
  SplitViewList,
  useInView,
  useReducedMotion,
} from "@imagineapps-team/react/ui";
export { AnimatedList, TypingDots } from "@imagineapps-team/react/ui/effects";
