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

// Emphasis -> the lib's axes, as its stories pair them (components-button--with-icon, components-buttongroup--icons).
// Secondary is the lib's `soft` as it ships: no edge, the label and the icon carry it; outline is the lib's neutral
// outline (ink at 30 % for the edge), the pattern of a toolbar and of the actions of a record
const EMPHASIS = {
  primary: { variant: "primary", appearance: "solid" },
  secondary: { variant: "neutral", appearance: "soft" },
  outline: { variant: "neutral", appearance: "outline" },
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
      {/* `contents`: the SVG itself is the flex item, centred on the label by the lib. No data-icon: the lib's own
          with-icon story keeps the full padding of its size (round 3, e2e/lib-parity.spec.ts) */}
      <span aria-hidden="true" className="contents">
        {icon}
      </span>
      {children}
    </Button>
  );
}

/** A labelled action that leads somewhere (a call to action): the same lib Button as ActionButton, rendered as the
 *  link itself (the lib's asChild), so it navigates as a link and reads as one */
export function LinkButton({
  icon,
  href,
  emphasis = "primary",
  size = "md",
  children,
  className,
}: {
  icon: ControlIcon;
  href: string;
  emphasis?: Emphasis;
  size?: "xs" | "sm" | "md";
  children: ReactNode;
  className?: string;
}) {
  return (
    <Button asChild size={size} {...EMPHASIS[emphasis]} className={className}>
      <a href={href}>
        <span aria-hidden="true" className="contents">
          {icon}
        </span>
        {children}
      </a>
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

/** A text field: a required leading icon (or, for a composer, a leading chip `lead` such as the channel it answers
 *  on), an optional trailing icon action or a labelled primary `submit` (icon + text, Welabs UI v3 "Enviar"), an
 *  optional label above (the lib's Field). `className` places or animates the text control itself; `groupClassName`
 *  the field box; `fieldClassName`/`fieldStyle` the labelled block. */
export function TextField({
  icon,
  lead,
  action,
  submit,
  label,
  size = "md",
  className,
  groupClassName,
  fieldClassName,
  fieldStyle,
  ...input
}: Omit<ComponentProps<"input">, "size"> & {
  action?: { icon: ControlIcon; label: string; onClick?: () => void; tabIndex?: number };
  submit?: { icon: ControlIcon; label: string; onClick?: () => void; tabIndex?: number };
  label?: string;
  size?: "sm" | "md";
  groupClassName?: string;
  fieldClassName?: string;
  fieldStyle?: CSSProperties;
} & ({ icon: ControlIcon; lead?: never } | { icon?: never; lead: ReactNode })) {
  const group = (
    <InputGroup
      className={[size === "sm" ? "min-h-control-sm" : "", groupClassName].filter(Boolean).join(" ") || undefined}
    >
      <InputGroupAddon align="inline-start" aria-hidden={lead ? undefined : "true"}>
        {/* A lead (a chip) is a piece of the field: a small control's height, as far from the side as from the top
            and the bottom (app/lib.css CONTROLES) */}
        {lead ? (
          <span data-field-piece="" className="inline-flex items-center">
            {lead}
          </span>
        ) : (
          icon
        )}
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
      {submit ? (
        <InputGroupAddon align="inline-end">
          <InputGroupButton size="sm" {...EMPHASIS.primary} tabIndex={submit.tabIndex} onClick={submit.onClick}>
            <span aria-hidden="true" className="contents">
              {submit.icon}
            </span>
            {submit.label}
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
