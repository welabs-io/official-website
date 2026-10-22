"use client";
// CENA DO DOMUS: A GESTÃO INTEIRA E O MÓDULO QUE NASCE
// Port of the Domus house pilot (components/template/Home.tsx DomusHouse, components/template/house.module.css) into
// the kit: the modules of the company sit inside the rounded ring of the Domus logo, on two floors (the standard ones
// and the ones made to measure), and "Novo módulo" makes a module that is born in the dashed slot with its own screen,
// whose fields fill one by one. The Domus is the whole management of the company: the floors name every area, never
// one tax module. Built from the lib: Card (the screen), Badge (tags and seal), AnimatedList (what is born), the site's
// ActionButton (the scene control) and TextField (the fields of the new screen), lucide icons. Amber marks only what
// is being born; once saved it settles into amber soft. The continuity is the kit's (components/scene-kit/Scene.tsx).
import {
  BadgeCheck,
  Calendar,
  CalendarRange,
  Camera,
  Coins,
  Factory,
  FileText,
  Headset,
  IdCard,
  Import,
  ClipboardCheck,
  Landmark,
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
  Check,
  type LucideIcon,
} from "lucide-react";
import { ActionButton, Badge, Card, TextField } from "@/components/lib/ui";
import { AnimatedList } from "@/components/lib/scene";
import { DOMUS_MODULES, HOME_DOMUS } from "@/lib/content/home";
import { Scene, type SceneApi, type SceneStep } from "../Scene";
import type { SceneTimeline } from "../timeline";
import d from "./domus-modules.module.css";

// ROTEIRO DA CENA
// The slot waits, the module is born, its screen opens, its three fields fill one by one, and the module settles with
// its seal. The saved step lasts 1.6 s: the seal and the soft marks settle in about 0.4 s, then the frame holds ~1 s.
export const DOMUS_MODULES_STEPS: readonly SceneStep[] = [
  { id: "start", hold: 1000 },
  { id: "born", hold: 900 },
  { id: "screen", hold: 700 },
  { id: "local", hold: 600 },
  { id: "date", hold: 600 },
  { id: "photo", hold: 600 },
  { id: "saved", hold: 1600 },
];

// CONTEÚDO DA CENA
// The icon of each module of lib/content/home.ts DOMUS_MODULES, by name (the names and tags are the content's)
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

// The fields of the new module's screen, each filled at its step
const FIELDS = [
  { step: "local", icon: MapPin, ...HOME_DOMUS.bornFields[0] },
  { step: "date", icon: Calendar, ...HOME_DOMUS.bornFields[1] },
  { step: "photo", icon: Camera, ...HOME_DOMUS.bornFields[2] },
] as const;

const COPY = {
  product: "Domus",
  title: "Configurações / Módulos",
  label: "Domus: a gestão inteira em módulos, e um módulo novo nasce com a sua tela e os seus campos",
  screen: "Nova vistoria",
};

type Room = { name: string; tag?: string };

// One module: its mark and its name (with its tag) on one centre line
function RoomTile({ room }: { room: Room }) {
  const Icon = ROOM_ICON[room.name] ?? Package;
  return (
    <li className={d.room} data-axis="room">
      <span className={d.mark} aria-hidden="true">
        <Icon size={16} strokeWidth={2} />
      </span>
      <span className={d.text}>
        <span className={d.name}>{room.name}</span>
        {room.tag ? (
          <Badge variant="secondary" appearance="solid" className={d.tag}>
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
  // The new module is amber while it is being born and filled, amber soft once saved
  const state = saved ? "done" : "active";
  return (
    <div className={d.root}>
      {/* The ring of the Domus logo: the whole management inside it */}
      <div className={d.ring}>
        <section className={d.floor} aria-label={HOME_DOMUS.standard}>
          <div className={d.floorHead}>
            <p className={d.floorName}>{HOME_DOMUS.standard}</p>
          </div>
          <ul className={d.rooms}>
            {DOMUS_MODULES.standard.map((room) => (
              <RoomTile key={room.name} room={room} />
            ))}
          </ul>
        </section>

        <section className={d.floor} aria-label={HOME_DOMUS.custom}>
          <div className={d.floorHead}>
            <p className={d.floorName}>{HOME_DOMUS.custom}</p>
            <ActionButton icon={<Plus />} size="xs" onClick={() => scene.take("born")}>
              {HOME_DOMUS.add}
            </ActionButton>
          </div>
          <ul className={d.rooms}>
            {DOMUS_MODULES.custom.map((room) => (
              <RoomTile key={room.name} room={room} />
            ))}
            {/* The slot of the new module: dashed while empty, the module born in it after the click */}
            <li className={d.slot}>
              <AnimatedList className={d.slotStack} distance={6} duration={0.32}>
                {born ? (
                  <div key="born" className={d.born} data-state={state} data-axis="born">
                    <span className={d.seed} aria-hidden="true">
                      <ClipboardCheck size={16} strokeWidth={2} />
                    </span>
                    <span className={d.text}>
                      <span className={d.name}>{HOME_DOMUS.born}</span>
                      {saved ? (
                        <Badge variant="primary" appearance="soft" className={d.seal}>
                          <Check size={12} strokeWidth={2.5} aria-hidden="true" />
                          {HOME_DOMUS.bornTag}
                        </Badge>
                      ) : null}
                    </span>
                  </div>
                ) : (
                  <div key="empty" className={d.empty} aria-hidden="true" />
                )}
              </AnimatedList>
            </li>
          </ul>
        </section>

        {/* The screen the new module gets: read-only fields out of the tab order (a drawing of a screen, not a form) */}
        <AnimatedList className={d.screenStack} distance={10} duration={0.32}>
          {scene.reached("screen") ? (
            <Card key="screen" size="sm" className={d.screen} data-state={state}>
              <div className={d.screenHead} data-axis="screen">
                <span className={d.seed} aria-hidden="true">
                  <ClipboardCheck size={16} strokeWidth={2} />
                </span>
                <span className={d.screenTitle}>
                  <b>{HOME_DOMUS.born}</b>
                  <span>{COPY.screen}</span>
                </span>
              </div>
              <div className={d.fields} inert>
                {FIELDS.map((f) => {
                  const Icon = f.icon;
                  return (
                    <TextField
                      key={f.step}
                      label={f.label}
                      icon={<Icon />}
                      size="sm"
                      fieldClassName={d.field}
                      readOnly
                      tabIndex={-1}
                      value={scene.reached(f.step) ? f.value : ""}
                    />
                  );
                })}
              </div>
            </Card>
          ) : null}
        </AnimatedList>
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
