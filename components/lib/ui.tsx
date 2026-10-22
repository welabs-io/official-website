"use client";
// FRONTEIRA DE CLIENTE DA BIBLIOTECA
// @imagineapps-team/react ships its `ui` entry with no "use client" directive, and some of its modules call client-only
// APIs (createContext, react-hook-form's client build) at import time, so a Server Component cannot import it. This file
// is the one client boundary of the site: server markup imports the lib's components from here. The lib has no deeper
// subpath for these primitives (its exports map stops at `./ui`), so they come from the `ui` barrel.
export {
  Badge,
  Button,
  Card,
  CardContent,
  Field,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@imagineapps-team/react/ui";
