// DICIONÁRIOS POR IDIOMA
// The three dictionaries behind one lookup, server-safe (plain objects). The page of a locale reads its dictionary here
// and hands it to the client through the provider (lib/i18n/provider.tsx), so only the active locale ships.
import type { Locale } from "../config";
import type { Messages } from "../types";
import { en } from "./en";
import { es } from "./es";
import { ptBR } from "./pt-BR";

const MESSAGES: Record<Locale, Messages> = { "pt-BR": ptBR, en, es };

export const getMessages = (locale: Locale): Messages => MESSAGES[locale];
