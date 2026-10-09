// TIPO JSX DO PLAYER HYPERFRAMES
// The pinned player registers <hyperframes-player>; this declares the attributes the one-page preview uses.
import type { DetailedHTMLProps, HTMLAttributes } from "react";

type HyperframesPlayerProps = DetailedHTMLProps<
  HTMLAttributes<HTMLElement>,
  HTMLElement
> & {
  src?: string;
  width?: number;
  height?: number;
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
  "range-start"?: number;
  "range-end"?: number;
};

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "hyperframes-player": HyperframesPlayerProps;
    }
  }
}
