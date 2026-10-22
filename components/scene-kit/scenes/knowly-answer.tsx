"use client";
// CENA DO KNOWLY: A RESPOSTA COM A FONTE, DENTRO DO ACESSO
// Port of the Knowly play (components/plays/KnowlyPlay.tsx, content lib/content/plays.ts KNOWLY_PLAY) into the kit,
// with the "Dado pessoal barrado" of lib/content/products.ts (knowly.details). Under the board's profile the question
// about the goals of the year is answered sentence by sentence, each sentence with the number of its source and the
// line it came from lit on the source; the profile changes to finance and the same answer changes: the plan of the
// stores is out of its access, and its line closes behind a lock. A question about a personal data of the contact is
// answered without it: the data is barred. Built from the lib: Badge (source numbers, barred, seal), AnimatedList
// (sentences), Separator, the site's ActionButton (the profiles, the scene controls), lucide icons, and the kit's shared
// parts (components/scene-kit/parts.module.css). Amber marks only the sentence arriving and the line it cites; amber
// soft what was cited. The continuity is the kit's (components/scene-kit/Scene.tsx).
import {
  BookOpen,
  Check,
  EyeOff,
  FileText,
  Lock,
  ShieldCheck,
  UserCog,
  type LucideIcon,
} from "lucide-react";
import { ActionButton, Badge } from "@/components/lib/ui";
import { AnimatedList, Separator } from "@/components/lib/scene";
import { KNOWLY_PLAY as K } from "@/lib/content/plays";
import { Scene, type SceneApi, type SceneStep } from "../Scene";
import type { SceneTimeline } from "../timeline";
import p from "../parts.module.css";
import k from "./knowly-answer.module.css";

// ROTEIRO DA CENA
// ask: the board asks; s1, s2: the two sentences arrive with their source; profile: finance asks the same, the second
// sentence closes; personal: a question about a personal data, barred; done: the frame settles (1.6 s, ~1 s still)
export const KNOWLY_ANSWER_STEPS: readonly SceneStep[] = [
  { id: "ask", hold: 900 },
  { id: "s1", hold: 900 },
  { id: "s2", hold: 1000 },
  { id: "profile", hold: 1300 },
  { id: "personal", hold: 1300 },
  { id: "done", hold: 1600 },
];

// CONTEÚDO DA CENA
const BOARD = K.profiles[2];
const FINANCE = K.profiles[1];
const PLAN = K.sources.plan;

const COPY = {
  product: "Knowly",
  title: "Perguntas / Atendimento",
  label: "Knowly: cada frase da resposta com a sua fonte, a resposta muda com o perfil e o dado pessoal fica de fora",
  answer: "Resposta",
  sources: "Fontes",
  goals: K.questions[1].label,
  // A question about a personal data of the contact of the order, and what the answer says instead
  personal: "Qual é o telefone do contato do pedido 1234?",
  barredText: "Dado pessoal: fica fora da resposta.",
  barred: "Barrado",
  record: "Cadastro do pedido 1234",
  recordLine: "Telefone do contato",
  sourced: "Cada frase com a fonte",
};

type Sentence = { key: string; text: string; line: number | null; icon?: LucideIcon };

// The answer to the goals under a profile: the board reads the whole plan, finance only its first line
const goalsFor = (finance: boolean): Sentence[] =>
  (finance ? K.answers.goalsFinance : K.answers.goalsBoard).map((s, i) => ({
    key: `goals-${i}-${s.source ?? "blocked"}`,
    text: s.text,
    line: s.source ? s.line : null,
  }));

function KnowlyAnswerView({ scene }: { scene: SceneApi }) {
  const finance = scene.reached("profile");
  const profile = finance ? FINANCE : BOARD;
  const done = scene.reached("done");
  // The sentences shown: one per step under the board; the whole answer under finance
  const goals = goalsFor(finance).filter((_, i) => finance || scene.reached(i === 0 ? "s1" : "s2"));
  const freshKey = scene.is("s1")
    ? goals[0]?.key
    : scene.is("s2")
      ? goals[1]?.key
      : scene.is("profile")
        ? goals[1]?.key
        : scene.is("personal")
          ? "personal"
          : undefined;
  // The line of the plan cited by the sentence arriving now, and the lines cited so far
  const cited = new Set(goals.flatMap((s) => (s.line === null ? [] : [s.line])));
  const freshLine = goals.find((s) => s.key === freshKey)?.line ?? null;
  const locked = finance ? K.answers.goalsFinance.flatMap((s) => (s.source === null ? [s.line] : [])) : [];
  const personal = scene.reached("personal");
  return (
    <div className={k.split}>
      {/* The question and its answer, under the profile of whoever asks */}
      <section className={k.answer} aria-label={COPY.answer}>
        <div className={`${p.ruleBottom} ${k.profiles}`}>
          <p className={p.paneHead}>{K.profileLabel}</p>
          <div className={`${p.choiceStates} ${k.chips}`}>
            {[BOARD, FINANCE].map((pr) => (
              <ActionButton
                key={pr.id}
                size="xs"
                icon={<UserCog strokeWidth={2} />}
                data-state={pr === profile ? "active" : "waiting"}
                onClick={() => scene.take(pr === BOARD ? "ask" : "profile")}
              >
                {pr.label}
              </ActionButton>
            ))}
          </div>
        </div>
        <div className={`${p.list} ${k.thread}`}>
          <p className={`${p.bubble} ${k.ask}`} data-kind="sent">
            {COPY.goals}
          </p>
          {/* Keyed by the profile: the answer of the new profile replaces the old one at once */}
          <AnimatedList key={`${scene.cycle}-${profile.id}`} className={`${p.list} ${p.listTight}`} distance={6} duration={0.28}>
            {goals.map((s) => (
              <div key={s.key} className={k.sentence} data-axis="sentence" data-fresh={!done && s.key === freshKey}>
                <span
                  className={`${p.mark} ${p.markSm} ${k.number}`}
                  data-tone={s.key === freshKey && !done ? "active" : s.line === null ? undefined : "done"}
                  aria-hidden="true"
                >
                  {s.line === null ? <Lock size={14} strokeWidth={2} /> : "1"}
                </span>
                <span className={k.sentenceText} data-blocked={s.line === null}>
                  {s.text}
                </span>
              </div>
            ))}
          </AnimatedList>
          {personal ? (
            <>
              <p className={`${p.bubble} ${k.ask}`} data-kind="sent">
                {COPY.personal}
              </p>
              <div className={k.sentence} data-axis="sentence" data-fresh={!done}>
                <span
                  className={`${p.mark} ${p.markSm}`}
                  data-tone={done ? undefined : "active"}
                  aria-hidden="true"
                >
                  <ShieldCheck size={14} strokeWidth={2} />
                </span>
                <span className={k.sentenceText}>{COPY.barredText}</span>
              </div>
            </>
          ) : null}
        </div>
      </section>

      {/* The sources: the line each sentence came from lights; a line out of the profile's access is closed */}
      <section className={k.sources} aria-label={COPY.sources}>
        <div className={k.head} data-axis="head">
          <span className={`${p.mark} ${p.markMd}`} data-tone="subject" aria-hidden="true">
            <BookOpen size={16} strokeWidth={2} />
          </span>
          <span className={k.headTitle}>{COPY.sources}</span>
          {done ? (
            <Badge variant="primary" appearance="soft" className={`${p.seal} ${k.seal}`}>
              <Check size={12} strokeWidth={2.5} aria-hidden="true" />
              {COPY.sourced}
            </Badge>
          ) : null}
        </div>
        <Separator />
        <div className={`${p.list} ${k.sourceList}`}>
          <div className={k.source}>
            <div className={k.sourceHead} data-axis="source">
              <span className={`${p.mark} ${p.markSm}`} data-tone="well" aria-hidden="true">
                <FileText size={14} strokeWidth={2} />
              </span>
              <b>{PLAN.title}</b>
              <Badge variant="secondary" appearance="solid">
                1
              </Badge>
            </div>
            <ol className={`${p.rowStates} ${k.lines}`}>
              {PLAN.lines.map((line, i) => {
                const isLocked = locked.includes(i);
                const state = isLocked ? "locked" : i === freshLine && !done ? "active" : cited.has(i) ? "done" : "idle";
                return (
                  <li key={line} className={k.line} data-state={state} data-axis="line">
                    <span className={k.lineIcon} aria-hidden="true">
                      {isLocked ? <Lock size={12} strokeWidth={2} /> : <span className={k.bullet} />}
                    </span>
                    <span>{isLocked ? K.blocked : line}</span>
                  </li>
                );
              })}
            </ol>
          </div>
          {/* The record of the order: the personal data is there, and stays out of the answer */}
          <div className={k.source}>
            <div className={k.sourceHead} data-axis="source">
              <span className={`${p.mark} ${p.markSm}`} data-tone="well" aria-hidden="true">
                <FileText size={14} strokeWidth={2} />
              </span>
              <b>{COPY.record}</b>
            </div>
            <ol className={`${p.rowStates} ${k.lines}`}>
              <li className={k.line} data-state={personal ? "locked" : "idle"} data-axis="line">
                <span className={k.lineIcon} aria-hidden="true">
                  <EyeOff size={12} strokeWidth={2} />
                </span>
                <span>{COPY.recordLine}</span>
                {personal ? (
                  <Badge variant="secondary" appearance="solid" className={k.barred}>
                    {COPY.barred}
                  </Badge>
                ) : null}
              </li>
            </ol>
          </div>
        </div>
      </section>
    </div>
  );
}

export function KnowlyAnswer({ timeline }: { timeline?: SceneTimeline }) {
  return (
    <Scene
      id="knowly-answer"
      label={COPY.label}
      product={COPY.product}
      title={COPY.title}
      steps={KNOWLY_ANSWER_STEPS}
      timeline={timeline}
    >
      {(scene) => <KnowlyAnswerView scene={scene} />}
    </Scene>
  );
}
