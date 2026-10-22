"use client";
// FRONTEIRA DE CLIENTE DA BIBLIOTECA
// @imagineapps-team/react ships its `ui` entry with no "use client" directive, and some of its modules call client-only
// APIs (createContext, react-hook-form's client build) at import time, so a Server Component cannot import it. This file
// is the one client boundary of the site: server markup imports the lib's components from here. The lib has no deeper
// subpath for these primitives (its exports map stops at `./ui`), so they come from the `ui` barrel.
// The lib's Button, Input, InputGroup and Field are NOT re-exported: every button and field of the site goes through the
// control primitives below (components/lib/ui-boundary.test.ts fails on a raw one).
import type { ComponentProps, CSSProperties, ReactElement, ReactNode } from "react";
import {
  Button,
  Field,
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@imagineapps-team/react/ui";

export {
  Badge,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@imagineapps-team/react/ui";

// PRIMITIVAS DE CONTROLE DO SITE
// One point of change for every button and field (operator, 2026-10-22). The look is decided once: the emphasis maps
// to the lib's variant x appearance here, and the colours are tokens of app/lib.css (block CONTROLES). Every control
// carries an icon (a required prop): a rendered SVG element, so a Server Component can pass it across this boundary
// (a component reference cannot be serialized). lucide-react is the set; the drawn Glyph of components/scenes stays
// in the older scenes so one scene never mixes two icon families. The lib sizes and centres the icon (its icon reset
// and its inline-flex/items-center control), so call sites never size or paint it.

/** A rendered icon, e.g. `<RotateCcw />` from lucide-react */
export type ControlIcon = ReactElement;

// Emphasis -> the lib's axes. Secondary is the lib's `soft` as it ships: no edge, the label and the icon carry it
const EMPHASIS = {
  primary: { variant: "primary", appearance: "solid" },
  secondary: { variant: "neutral", appearance: "soft" },
  quiet: { variant: "neutral", appearance: "ghost" },
} as const;
type Emphasis = keyof typeof EMPHASIS;

type LibButtonProps = ComponentProps<typeof Button>;
type ButtonBase = Omit<LibButtonProps, "variant" | "appearance" | "asChild" | "children" | "size">;

/** A labelled action: icon + text, secondary (soft) unless said otherwise */
export function ActionButton({
  icon,
  emphasis = "secondary",
  size = "sm",
  type = "button",
  children,
  ...rest
}: ButtonBase & {
  icon: ControlIcon;
  emphasis?: Emphasis;
  size?: "xs" | "sm" | "md";
  children: ReactNode;
}) {
  return (
    <Button type={type} size={size} {...EMPHASIS[emphasis]} {...rest}>
      {/* `contents`: the SVG itself is the flex item, centred on the label by the lib; data-icon gives it the lib's
          tighter leading padding */}
      <span data-icon="inline-start" aria-hidden="true" className="contents">
        {icon}
      </span>
      {children}
    </Button>
  );
}

const ICON_SIZE = { xs: "icon-xs", sm: "icon-sm", md: "icon" } as const;

/** An action with no visible text: the icon, and the label as its accessible name */
export function IconButton({
  icon,
  label,
  emphasis = "secondary",
  size = "md",
  type = "button",
  ...rest
}: Omit<ButtonBase, "aria-label"> & {
  icon: ControlIcon;
  label: string;
  emphasis?: Emphasis;
  size?: keyof typeof ICON_SIZE;
}) {
  return (
    <Button type={type} size={ICON_SIZE[size]} aria-label={label} {...EMPHASIS[emphasis]} {...rest}>
      <span aria-hidden="true" className="contents">
        {icon}
      </span>
    </Button>
  );
}

/** A full-width list row (inbox, menu): the lib's quiet button laid out as a row, its icon inside a mark the caller
 *  paints by state (`markClassName`) */
export function RowButton({
  icon,
  markClassName,
  type = "button",
  children,
  ...rest
}: Omit<ButtonBase, "className"> & {
  icon: ControlIcon;
  markClassName?: string;
  children: ReactNode;
}) {
  return (
    <Button
      type={type}
      {...EMPHASIS.quiet}
      className="h-auto w-full justify-start whitespace-normal rounded-none px-4 py-3 text-left"
      {...rest}
    >
      <span className={markClassName} aria-hidden="true">
        {icon}
      </span>
      {children}
    </Button>
  );
}

/** A text field: a required leading icon, an optional trailing icon action, an optional label above (the lib's
 *  Field). `className` places or animates the text control itself; `fieldClassName`/`fieldStyle` the labelled block. */
export function TextField({
  icon,
  action,
  label,
  size = "md",
  className,
  fieldClassName,
  fieldStyle,
  ...input
}: Omit<ComponentProps<"input">, "size"> & {
  icon: ControlIcon;
  action?: { icon: ControlIcon; label: string; onClick?: () => void; tabIndex?: number };
  label?: string;
  size?: "sm" | "md";
  fieldClassName?: string;
  fieldStyle?: CSSProperties;
}) {
  const group = (
    <InputGroup className={size === "sm" ? "min-h-control-sm" : undefined}>
      <InputGroupAddon align="inline-start" aria-hidden="true">
        {icon}
      </InputGroupAddon>
      <InputGroupInput
        className={[size === "sm" ? "text-sm" : "", className].filter(Boolean).join(" ") || undefined}
        // The lib's Field links its label to its child (the group here), so the control is also named by the label
        aria-label={input["aria-label"] ?? label}
        {...input}
      />
      {action ? (
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            size="icon-xs"
            {...EMPHASIS.secondary}
            aria-label={action.label}
            tabIndex={action.tabIndex}
            onClick={action.onClick}
          >
            {action.icon}
          </InputGroupButton>
        </InputGroupAddon>
      ) : null}
    </InputGroup>
  );
  return label ? (
    <Field label={label} className={fieldClassName} style={fieldStyle}>
      {group}
    </Field>
  ) : (
    group
  );
}
