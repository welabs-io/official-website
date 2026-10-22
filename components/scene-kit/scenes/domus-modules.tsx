"use client";
// CENA DO DOMUS: A GESTÃO INTEIRA E O MÓDULO QUE NASCE
// The Domus is the whole management of the company: inside the ring of its logo sit the modules it ships with and the
// ones made to measure, each a Module card of Welabs UI v3 (the white surface of 52 px, a square neutral mark and the
// name; a technical tag such as NFS-e or PIX in the neutral chrome, never amber). "Novo módulo" (the record's black
// action) makes a module that is born as the lifted card: the amber mark (the one live piece), the black "Novo módulo"
// badge, and its three fields, the lib's fields at their own size with the light edge, filled one by one. Once saved the
// mark turns green and the screen's status goes back to "Publicado". The screen's header is the Domus DetailHeader
// (identity, title with its status minidot, one meta line, the actions), as the validated Relloo scene draws it. A
// phone shows six modules, not eighteen, and the new module's fields in 2 + 1. No connector: the new module's screen is
// the card itself, so there is no hand-off to trace. The continuity is the kit's (components/scene-kit/Scene.tsx).
import {
  BadgeCheck,
  Calendar,
  CalendarRange,
  Camera,
  ClipboardCheck,
  Coins,
  Factory,
  FileText,
  Headset,
  IdCard,
  Import,
  Landmark,
  LayoutGrid,
  ListTodo,
  MapPin,
  Package,
  PenLine,
  Plus,
  Scale,
  ShieldCheck,
  ShoppingBag,
  Stamp,
  Tag,
  Truck,
  type LucideIcon,
} from "lucide-react";
import { ActionButton, Badge, Card, TextField } from "@/components/lib/ui";
import { DOMUS_MODULES, HOME_DOMUS } from "@/lib/content/home";
import { Scene, type SceneApi, type SceneStep } from "../Scene";
import type { SceneTimeline } from "../timeline";
import p from "../parts.module.css";
import d from "./domus-modules.module.css";

// ROTEIRO DA CENA
// The ring waits with its dashed place, the module is born as the lifted card, its three fields fill one by one, and
// it is saved. The saved step lasts 1.6 s: the green mark and the status settle in about 0.5 s, then the frame holds.
export const DOMUS_MODULES_STEPS: readonly SceneStep[] = [
  { id: "start", hold: 1000 },
  { id: "born", hold: 900 },
  { id: "local", hold: 600 },
  { id: "date", hold: 600 },
  { id: "photo", hold: 600 },
  { id: "saved", hold: 1600 },
];

// CONTEÚDO DA CENA
// The icon of each module of lib/content/home.ts DOMUS_MODULES, by name (the names and tags are the content's); the
// glyphs follow the Domus where it has one (erpnext front app/module-icons.ts: Landmark for Bank, IdCard for Employee,
// FileText for a fiscal document, Headset for a team of tickets, ListTodo for a task, Truck for a supplier)
const ROOM_ICON: Record<string, LucideIcon> = {
  Vendas: Tag,
  Compras: ShoppingBag,
  Estoque: Package,
  Produção: Factory,
  Financeiro: Coins,
  Contratos: PenLine,
  Projetos: CalendarRange,
  Pessoas: IdCard,
  Ativos: Truck,
  Qualidade: BadgeCheck,
  Fiscal: FileText,
  Bancos: Landmark,
  Jurídico: Scale,
  Chamados: Headset,
  Demandas: ListTodo,
  Aprovações: Stamp,
  Privacidade: ShieldCheck,
  Importação: Import,
};

// The modules a phone keeps (four of the standard floor, the two with a tag on the floor made to measure): the whole
// management still reads, in a window about as tall as the Relloo's
const PHONE = new Set(["Vendas", "Estoque", "Financeiro", "Pessoas", "Fiscal", "Bancos"]);

// The fields of the new module, each filled at its step; the label is the field's placeholder until its value lands
const FIELDS = [
  { step: "local", icon: MapPin, ...HOME_DOMUS.bornFields[0] },
  { step: "date", icon: Calendar, ...HOME_DOMUS.bornFields[1] },
  { step: "photo", icon: Camera, ...HOME_DOMUS.bornFields[2] },
] as const;

const COPY = {
  product: "Domus",
  title: "Configurações",
  label: "Domus: a gestão inteira em módulos, e um módulo novo nasce com os seus campos",
  record: "Módulos",
  published: "Publicado",
  draft: "Rascunho",
};

type Room = { name: string; tag?: string };
type Tone = "active" | "done";

// RÓTULO DE STATUS (MINIDOT DO DOMUS)
// The status of the Domus DetailHeader, "a StatusLabel minidot, never a chip": the 8 px dot before the label, inline
// with the title, no fill. Live is the amber dot (an area), done the green one. Keyed by the caller, so a change lands
// with a pop of the dot.
function StatusLabel({ tone, label }: { tone: Tone; label: string }) {
  return (
    <span className={d.state} data-tone={tone} data-header="status" data-axis-pair="">
      <span className={d.dot} data-dot="" aria-hidden="true" />
      {label}
    </span>
  );
}

// MÓDULO
// The Module card: the square neutral mark and the name on one centre line, the technical tag at the end in the
// neutral chrome (the lib's soft neutral Badge)
function ModuleCard({ room }: { room: Room }) {
  const Icon = ROOM_ICON[room.name] ?? Package;
  return (
    <li className={d.room} data-axis="room" data-wide={!PHONE.has(room.name) || undefined}>
      <span className={`${p.mark} ${p.markSm} ${d.square}`} aria-hidden="true">
        <Icon />
      </span>
      <span className={d.text}>
        <span className={d.name}>{room.name}</span>
        {room.tag ? (
          <Badge variant="neutral" appearance="soft" className={d.tag}>
            {room.tag}
          </Badge>
        ) : null}
      </span>
    </li>
  );
}

function DomusModulesView({ scene }: { scene: SceneApi }) {
  const born = scene.reached("born");
  const saved = scene.reached("saved");
  // The new module: waiting (its dashed place), being born and filled (amber), saved (green)
  const state = saved ? "done" : born ? "active" : "waiting";
  const custom = DOMUS_MODULES.custom.length + (saved ? 1 : 0);
  return (
    <div className={d.root}>
      {/* The Domus DetailHeader (erpnext front ui-kit/components/detail-header.tsx), as the Relloo scene draws it:
            [identity]  H1 ● Status ................ [actions]
                        meta (values in ink, labels muted)
          the action is the screen's own: the black "Novo módulo" that plays the scene from the birth */}
      <div className={d.record}>
        <div className={d.recordMain} data-align="record">
          <span className={d.identity} data-header="identity" aria-hidden="true">
            <LayoutGrid />
          </span>
          <span className={d.recordText} data-header="block">
            <span className={d.recordTop}>
              <b data-header="title">{COPY.record}</b>
              <StatusLabel
                key={state === "active" ? "draft" : "published"}
                tone={state === "active" ? "active" : "done"}
                label={state === "active" ? COPY.draft : COPY.published}
              />
            </span>
            <span className={d.recordMeta} data-header="meta">
              {HOME_DOMUS.standard} <b>{DOMUS_MODULES.standard.length}</b>
              <span aria-hidden="true"> · </span>
              {HOME_DOMUS.custom}{" "}
              {/* The count of the floor made to measure rolls in when the new module is saved */}
              <b key={custom} className={d.roll}>
                {custom}
              </b>
            </span>
          </span>
        </div>
        <div className={d.actions} data-header="actions">
          <ActionButton icon={<Plus />} emphasis="primary" size="md" onClick={() => scene.take("born")}>
            {HOME_DOMUS.add}
          </ActionButton>
        </div>
      </div>

      <div className={d.body}>
        {/* The ring of the Domus logo: the whole management inside it */}
        <div className={d.ring}>
          <section className={d.floor} data-floor="standard" aria-label={HOME_DOMUS.standard}>
            <p className={p.paneHead}>{HOME_DOMUS.standard}</p>
            <ul className={d.rooms}>
              {DOMUS_MODULES.standard.map((room) => (
                <ModuleCard key={room.name} room={room} />
              ))}
            </ul>
          </section>

          <section className={d.floor} data-floor="custom" aria-label={HOME_DOMUS.custom}>
            <p className={p.paneHead}>{HOME_DOMUS.custom}</p>
            <ul className={d.rooms}>
              {DOMUS_MODULES.custom.map((room) => (
                <ModuleCard key={room.name} room={room} />
              ))}
              {/* The place of the new module: dashed while empty and as large as the card, so the ring never moves;
                  the card is born in it, lifted, and keeps the place once saved */}
              <li className={d.slot} data-state={state}>
                <Card size="sm" className={d.born} data-born="" data-state={state} aria-hidden={!born || undefined}>
                  <div className={d.bornHead} data-born-head="" data-axis="born">
                    <span className={`${p.mark} ${p.markSm} ${d.square}`} data-tone={born ? state : undefined} aria-hidden="true">
                      <ClipboardCheck />
                    </span>
                    <span className={d.text}>
                      <b className={d.name}>{HOME_DOMUS.born}</b>
                      {/* The black badge of what is new (the lib's solid primary, black in Welabs UI v3) */}
                      <Badge variant="primary" appearance="solid" className={d.tag}>
                        {HOME_DOMUS.bornTag}
                      </Badge>
                    </span>
                  </div>
                  {/* The new module's fields: the lib's field at its md size (40 px, 14 px radius, 14 px text) with
                      the light edge; read-only and out of the tab order, a drawing of a screen and not a form */}
                  <div className={d.fields} data-born-fields="" inert>
                    {FIELDS.map((f) => {
                      const Icon = f.icon;
                      const filled = scene.reached(f.step);
                      return (
                        <TextField
                          key={f.step}
                          icon={<Icon />}
                          groupClassName={d.field}
                          data-filled={filled}
                          readOnly
                          tabIndex={-1}
                          placeholder={f.label}
                          aria-label={f.label}
                          value={filled ? f.value : ""}
                        />
                      );
                    })}
                  </div>
                </Card>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

export function DomusModules({ timeline }: { timeline?: SceneTimeline }) {
  return (
    <Scene
      id="domus-modules"
      label={COPY.label}
      product={COPY.product}
      title={COPY.title}
      steps={DOMUS_MODULES_STEPS}
      timeline={timeline}
    >
      {(scene) => <DomusModulesView scene={scene} />}
    </Scene>
  );
}
