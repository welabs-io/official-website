// CENAS DE CAPACIDADE (COMPOSIÇÕES)
// The fifteen capability scenes of the product pages, three per product, each a product window drawn with the same tokens,
// pieces and motion as the chain (scenes.module.css, fx.css): one key element of 18 to 22 px (`data-key`), every other
// text 11 to 13 px, amber only as an area. The words come from lib/scenes/capabilities.ts, the times from its script
// (`actFor`). Server markup only; `phase` is the settled frame by default and the stage rewrites it on the client.
import type { ReactNode } from "react";
import { actFor } from "@/lib/scenes/act";
import {
  CAPABILITY_STORY as S,
  type CapabilityScript,
} from "@/lib/scenes/capabilities";
import type { Act } from "@/lib/scenes/types";
import { Glyph, GLYPHS, TICK_DOUBLE } from "./icons";
import { SceneWindow } from "./SceneWindow";
import c from "./capability.module.css";
import s from "./scenes.module.css";

// Head of a pane: a name in 13/600 and its context in 11 on the right
function Head({ title, meta }: { title: ReactNode; meta?: ReactNode }) {
  return (
    <div className={c.head}>
      <b>{title}</b>
      {meta ? <span>{meta}</span> : null}
    </div>
  );
}

// A state that changes in the scene: the old one fades out, the new one pops in at the same place
function Swap({
  act,
  action,
  from,
  to,
}: {
  act: Act;
  action: string;
  from: ReactNode;
  to: ReactNode;
}) {
  return (
    <span className={c.swap}>
      <span className={c.swapOld} {...act(action, "out")}>
        {from}
      </span>
      <span {...act(action, "pop")}>{to}</span>
    </span>
  );
}

const Check = ({ size = 12 }: { size?: number }) => (
  <span className={c.check} aria-hidden="true">
    <Glyph d={GLYPHS.check} size={size} />
  </span>
);

const Key = ({ children }: { children: ReactNode }) => (
  <b className={s.key} data-key="">
    {children}
  </b>
);

// DOMUS: O CADASTRO QUE VIRA TELA
function DomusForm({ act }: { act: Act }) {
  const t = S["domus-form"];
  return (
    <SceneWindow product="domus" place={t.where} meta={t.meta}>
      <div className={c.duo} data-split="form">
        <div className={`${c.pane} ${c.soft} ${c.design}`}>
          <Head title={t.design} meta={t.designMeta} />
          <ul className={c.fields}>
            {t.fields.map((f, i) => (
              <li
                key={f.name}
                className={c.field}
                {...act("fields", "in", { index: i, count: t.fields.length })}
              >
                <span className={c.grip} aria-hidden="true" />
                <b>{f.name}</b>
                <em className={c.tag}>{f.kind}</em>
              </li>
            ))}
            <li className={c.fieldAdd}>
              <Glyph d={GLYPHS.plus} size={12} />
              {t.add}
            </li>
          </ul>
        </div>
        <div className={c.pane} {...act("screen", "wipe")}>
          <div className={c.screenHead}>
            <Key>{t.screen}</Key>
            <span className={s.pillOk} {...act("ready", "pop")}>
              <Glyph d={GLYPHS.check} size={11} />
              {t.ready}
            </span>
            <span className={c.ghostButton}>{t.button}</span>
          </div>
          <table className={c.table}>
            <thead>
              <tr>
                {t.columns.map((col) => (
                  <th key={col}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {t.rows.map((row) => (
                <tr key={row[0]}>
                  {row.map((cell, i) => (
                    <td key={i}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </SceneWindow>
  );
}

// DOMUS: FINANCEIRO E BANCOS
function DomusCash({ act }: { act: Act }) {
  const t = S["domus-cash"];
  const { invoice } = t;
  return (
    <SceneWindow product="domus" place={t.where} meta={t.meta}>
      <div className={c.duo} data-split="even">
        <div className={c.pane}>
          <Head title={t.receivable} meta={`${t.others.length + 1} faturas`} />
          <div className={`${c.invoice} ${c.lit}`} {...act("match", "light")}>
            <div className={c.invoiceTop}>
              <span className={s.who}>
                <b>{invoice.title}</b>
                <span>{invoice.who}</span>
              </span>
              <Swap
                act={act}
                action="paid"
                from={<span className={c.pill}>{invoice.open}</span>}
                to={
                  <span className={s.pillOk}>
                    <Glyph d={GLYPHS.check} size={11} />
                    {invoice.paid}
                  </span>
                }
              />
            </div>
            <Key>{invoice.amount}</Key>
            <dl className={c.pairs}>
              {invoice.rows.map((row) => (
                <div key={row.label}>
                  <dt>{row.label}</dt>
                  <dd>{row.value}</dd>
                </div>
              ))}
            </dl>
            <span className={c.note} {...act("paid", "in")}>
              <Glyph d={GLYPHS.bolt} size={12} />
              {invoice.settled}
            </span>
          </div>
          <ul className={`${c.rows} ${c.side}`}>
            {t.others.map((o) => (
              <li key={o.title} className={c.row}>
                <span className={s.who}>
                  <b>{o.title}</b>
                  <span>{o.who}</span>
                </span>
                <span className={c.amount}>{o.amount}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className={`${c.pane} ${c.soft}`}>
          <Head
            title={
              <span className={c.headIcon}>
                <Glyph d={GLYPHS.bank} size={14} />
                {t.bank}
              </span>
            }
            meta={t.bankMeta}
          />
          <ul className={`${c.rows} ${c.bankRows}`}>
            {t.lines.map((line, i) => {
              const fresh = i === t.lines.length - 1;
              return (
                <li
                  key={line.time}
                  className={`${c.row} ${fresh ? c.lit : ""}`}
                  /* The PIX flies into the statement (ludic pass) */
                  {...(fresh ? act("pix", "fly") : {})}
                >
                  <span className={s.iconBox}>
                    <Glyph d={fresh ? GLYPHS.bolt : GLYPHS.bank} size={14} />
                  </span>
                  <span className={s.who}>
                    <b>{line.kind}</b>
                    <span>
                      {line.who}, {line.time}
                    </span>
                  </span>
                  <span className={c.end}>
                    <span className={c.amount}>{line.amount}</span>
                    {fresh ? (
                      <span className={c.matched} {...act("match", "in")}>
                        <Check size={10} />
                        {t.matched}
                      </span>
                    ) : (
                      <span className={c.matched}>
                        <Check size={10} />
                        {t.matched}
                      </span>
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </SceneWindow>
  );
}

// DOMUS: CONTRATOS E ASSINATURAS
function DomusContract({ act }: { act: Act }) {
  const t = S["domus-contract"];
  return (
    <SceneWindow product="domus" place={t.where} meta={t.meta}>
      <div className={c.duo} data-split="wide">
        <div className={c.pane}>
          <div className={c.docHead}>
            <span className={c.docIcon} aria-hidden="true">
              <Glyph d={GLYPHS.doc} size={16} />
            </span>
            <span className={c.docTitle}>
              <Key>{t.title}</Key>
              <span>{t.meta}</span>
            </span>
            <Swap
              act={act}
              action="signed"
              from={<span className={c.pill}>{t.waiting}</span>}
              to={
                <span className={s.pillOk}>
                  <Glyph d={GLYPHS.check} size={11} />
                  {t.signed}
                </span>
              }
            />
          </div>
          <dl className={`${c.pairs} ${c.pairsRow}`}>
            {t.rows.map((row) => (
              <div key={row.label}>
                <dt>{row.label}</dt>
                <dd>{row.value}</dd>
              </div>
            ))}
          </dl>
          <div className={c.signers}>
            <p className={c.label}>{t.signers}</p>
            <ul>
              {t.people.map((p, i) => {
                const last = i === t.people.length - 1;
                return (
                  <li
                    key={p.name}
                    className={`${c.signer} ${last ? c.lit : ""}`}
                    {...(last ? act("sign", "light") : {})}
                  >
                    <span className={s.avatarSm}>{p.initials}</span>
                    <span className={s.who}>
                      <b>{p.name}</b>
                      <span>{p.role}</span>
                    </span>
                    <span
                      className={c.signed}
                      {...(last ? act("sign", "pop") : {})}
                    >
                      <Glyph d={GLYPHS.pen} size={12} />
                      {t.signedAt} {p.time}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
        <div className={`${c.pane} ${c.soft} ${c.side} ${c.top}`}>
          <Head title={t.same} />
          <ul className={c.rows}>
            {t.links.map((link, i) => (
              <li
                key={link.area}
                className={c.row}
                {...act("links", "in", { index: i, count: t.links.length })}
              >
                <span className={s.iconBox}>
                  <Glyph
                    d={[GLYPHS.bank, GLYPHS.user, GLYPHS.doc][i] ?? GLYPHS.doc}
                    size={14}
                  />
                </span>
                <span className={s.who}>
                  <b>{link.area}</b>
                  <span>{link.value}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </SceneWindow>
  );
}

// RELLOO: HISTÓRICO DE CADA PESSOA
function RellooPerson({ act }: { act: Act }) {
  const t = S["relloo-person"];
  const icons = [GLYPHS.chat, GLYPHS.phone, GLYPHS.bag];
  return (
    <SceneWindow product="relloo" place={t.where} meta={t.meta}>
      <div className={c.duo} data-split="person">
        <div className={`${c.pane} ${c.soft} ${c.top}`}>
          <div className={c.profile}>
            <span className={c.avatarLg} aria-hidden="true">
              M
            </span>
            <span className={c.profileText}>
              <Key>{t.name}</Key>
              <span>{t.since}</span>
            </span>
          </div>
          <ul className={c.chips}>
            {t.channels.map((ch, i) => (
              <li key={ch}>
                <Glyph d={i === 0 ? GLYPHS.chat : GLYPHS.phone} size={12} />
                {ch}
              </li>
            ))}
          </ul>
          <div className={`${c.cardMini} ${c.lit}`} {...act("card", "light")}>
            <b>{t.card.title}</b>
            <span className={c.cardMiniMeta}>
              <span>{t.card.order}</span>
              <span>
                {t.owner.label}: {t.owner.value}
              </span>
              <span>
                {t.deadline.label}: {t.deadline.value}
              </span>
            </span>
          </div>
        </div>
        <div className={c.pane}>
          <Head title={t.history} meta={`${t.items.length} registros`} />
          <ul className={c.timeline}>
            {t.items.map((item, i) => (
              <li
                key={item.kind}
                {...act("history", "in", { index: i, count: t.items.length })}
              >
                <span className={s.iconBox}>
                  <Glyph d={icons[i]} size={14} />
                </span>
                <span className={c.tlText}>
                  <span className={c.tlMeta}>
                    <b>{item.kind}</b>
                    <time>{item.time}</time>
                  </span>
                  <span>{item.text}</span>
                </span>
              </li>
            ))}
          </ul>
          {/* What the Domus keeps flies in beside the history (ludic pass) */}
          <div className={`${c.from} ${c.side}`} {...act("domus", "fly")}>
            <p className={c.label}>{t.domus}</p>
            <dl className={c.pairs}>
              {t.domusRows.map((row) => (
                <div key={row.label}>
                  <dt>{row.label}</dt>
                  <dd>{row.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </SceneWindow>
  );
}

// RELLOO: CAMPANHA E CUPOM NO WHATSAPP
function RellooCampaign({ act }: { act: Act }) {
  const t = S["relloo-campaign"];
  return (
    <SceneWindow product="relloo" place={t.where} meta={t.meta}>
      <div className={c.duo} data-split="even">
        <div className={`${c.pane} ${c.side} ${c.top}`}>
          <Head title={t.title} meta={`${t.steps.length} etapas`} />
          <ol className={c.journey}>
            {t.steps.map((step, i) => (
              <li
                key={step.name}
                className={c.lit}
                {...act("steps", "light", { index: i, count: t.steps.length })}
              >
                <span className={c.journeyDot} aria-hidden="true" />
                <span className={s.who}>
                  <b>{step.name}</b>
                  <span>{step.value}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
        <div className={s.phone} data-edge="">
          <div className={s.phoneHead}>
            <span className={s.avatarSm} data-tone="contact" aria-hidden="true">
              <Glyph d={GLYPHS.bag} size={14} />
            </span>
            <span className={s.who}>
              <b>{t.contact}</b>
              <span>
                <i className={s.dot} data-tone="ok" />
                {t.channel}
              </span>
            </span>
          </div>
          <div className={s.chat}>
            <div className={`${s.slot} ${s.slotIn}`}>
              <p className={`${s.bubble} ${s.bubbleIn}`}>
                <span>{t.form}</span>
                <span className={s.stamp}>
                  <time>{t.times.form}</time>
                </span>
              </p>
            </div>
            <div className={`${s.slot} ${s.slotOut}`} {...act("coupon", "pop")}>
              <div className={`${s.bubble} ${s.bubbleOut} ${c.coupon}`}>
                <span>{t.hello}</span>
                <span className={c.code}>
                  <Glyph d={GLYPHS.tag} size={14} />
                  <Key>{t.code}</Key>
                </span>
                <span className={c.codeMeta}>{t.codeMeta}</span>
                <span className={s.stamp}>
                  <time>{t.times.hello}</time>
                  <span className={s.ticks} aria-hidden="true">
                    <Glyph d={TICK_DOUBLE} size={14} />
                  </span>
                </span>
              </div>
            </div>
            <p className={s.sysLine} {...act("cash", "in")}>
              <Glyph d={GLYPHS.bag} size={12} />
              <span>{t.sale}</span>
              <time>{t.times.sale}</time>
            </p>
            <div
              className={c.cashback}
              {...act("cash", "pop", { offset: 0.1 })}
            >
              <Check />
              {t.cashback}
            </div>
          </div>
        </div>
      </div>
    </SceneWindow>
  );
}

// RELLOO: AGENTE QUE PASSA A VEZ
function RellooAgent({ act }: { act: Act }) {
  const t = S["relloo-agent"];
  return (
    <SceneWindow product="relloo" place={t.where} meta={t.meta}>
      <div className={c.duo} data-split="agent">
        <div className={`${c.pane} ${c.soft} ${c.side} ${c.top}`}>
          <div className={c.agent}>
            <span className={c.botFace} aria-hidden="true">
              <Glyph d={GLYPHS.bot} size={20} />
            </span>
            <span className={s.who}>
              <b>{t.agent}</b>
              <span>{t.agentRole}</span>
            </span>
          </div>
          <dl className={`${c.pairs} ${c.pairsStack}`}>
            <div>
              <dt>{t.knows}</dt>
              <dd>{t.source}</dd>
            </div>
            <div>
              <dt>{t.passes}</dt>
              <dd>{t.passesWhen}</dd>
            </div>
          </dl>
        </div>
        <div className={`${c.pane} ${c.convo}`}>
          <Head title={t.contact} meta={t.meta} />
          <div className={c.convoBody}>
            <p className={`${c.msg} ${c.msgIn}`}>{t.ask}</p>
            <div className={c.msgOutWrap} {...act("answer", "pop")}>
              <p className={`${c.msg} ${c.msgOut}`}>
                <span className={c.msgBy}>
                  <Glyph d={GLYPHS.bot} size={12} />
                  {t.agent}
                </span>
                {t.answer}
              </p>
              <span className={c.source}>
                <Glyph d={GLYPHS.doc} size={12} />
                {t.from}
              </span>
            </div>
            <p className={`${c.msg} ${c.msgIn}`} {...act("ask", "pop")}>
              {t.human}
            </p>
            <div className={c.handoff} {...act("handoff", "pop")}>
              <span className={s.avatarSm}>A</span>
              <span className={c.handoffText}>
                <Key>{t.handoff}</Key>
                <span>{t.handoffMeta}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </SceneWindow>
  );
}

// Block of a flow: a tonal box with the icon, the name and its kind
function FlowBlock({
  name,
  kind,
  icon,
  done,
  lit,
  props,
  doneProps,
}: {
  name: string;
  kind: string;
  icon: string;
  done?: boolean;
  lit?: boolean;
  props?: object;
  doneProps?: object;
}) {
  return (
    <div className={`${c.block} ${lit ? c.lit : ""}`} {...props}>
      <span className={s.iconBox}>
        <Glyph d={icon} size={14} />
      </span>
      <span className={s.who}>
        <b>{name}</b>
        <span>{kind}</span>
      </span>
      {done ? (
        <span className={c.blockDone} {...doneProps}>
          <Glyph d={GLYPHS.check} size={11} />
        </span>
      ) : null}
    </div>
  );
}

const FLOW_ICONS = [GLYPHS.doc, GLYPHS.user, GLYPHS.bell];

// MAGNETO: O PROCESSO DESCRITO EM FRASE
function MagnetoSentence({ act }: { act: Act }) {
  const t = S["magneto-sentence"];
  return (
    <SceneWindow product="magneto" place={t.where} meta={t.meta}>
      <div className={c.column}>
        <div className={c.prompt}>
          <span className={c.label}>
            <Glyph d={GLYPHS.spark} size={12} />
            {t.prompt}
          </span>
          <Key>{t.sentence}</Key>
        </div>
        <div className={`${c.pane} ${c.soft} ${c.canvas}`}>
          <Head
            title={t.review}
            meta={
              <span className={c.toggleWrap} {...act("active", "in")}>
                <span className={c.toggle} aria-hidden="true">
                  <i />
                </span>
                {t.active}
              </span>
            }
          />
          <div className={c.chainRow}>
            {t.blocks.map((b, i) => (
              <div key={b.name} className={c.chainItem}>
                {i > 0 ? (
                  <span
                    className={c.arrow}
                    aria-hidden="true"
                    {...act("links", "wipe", { index: i - 1, count: 2 })}
                  />
                ) : null}
                <FlowBlock
                  name={b.name}
                  kind={b.kind}
                  icon={FLOW_ICONS[i]}
                  props={act("blocks", "pop", { index: i, count: 3 })}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </SceneWindow>
  );
}

// MAGNETO: O FLUXO DESENHADO EM BLOCOS
function MagnetoCanvas({ act }: { act: Act }) {
  const t = S["magneto-canvas"];
  const run = (index: number) => act("run", "pop", { index, count: 3 });
  return (
    <SceneWindow product="magneto" place={t.where} meta={t.meta}>
      <div className={`${c.pane} ${c.soft} ${c.board}`}>
        <div className={c.boardHead}>
          <Key>{t.title}</Key>
          <span className={c.orderTag}>
            <Glyph d={GLYPHS.doc} size={12} />
            {t.order}
          </span>
          <span className={s.pillOk} {...act("done", "pop")}>
            <Glyph d={GLYPHS.check} size={11} />
            {t.done}
          </span>
        </div>
        <div className={c.graph}>
          <FlowBlock
            name={t.blocks.start}
            kind={t.kinds.start}
            icon={GLYPHS.doc}
            done
            doneProps={run(0)}
          />
          <span className={c.arrow} aria-hidden="true" />
          <FlowBlock
            name={t.blocks.approve}
            kind={t.kinds.approve}
            icon={GLYPHS.user}
            done
            doneProps={run(1)}
          />
          <span className={c.arrow} aria-hidden="true" />
          <FlowBlock
            name={t.blocks.notify}
            kind={t.kinds.notify}
            icon={GLYPHS.bell}
            done
            lit
            props={act("done", "light")}
            doneProps={run(2)}
          />
          <div className={c.branch}>
            <span className={c.branchLine} aria-hidden="true" />
            <span className={c.branchLabel}>{t.limit}</span>
            <FlowBlock
              name={t.blocks.above}
              kind={t.kinds.above}
              icon={GLYPHS.user}
              done
              doneProps={act("branch", "pop")}
            />
          </div>
        </div>
        <div className={c.runLog}>
          <span className={c.label}>{t.run}</span>
          <ol>
            {t.steps.map((step, i) => (
              <li
                key={step.text}
                {...(i >= 2
                  ? act(i === 2 ? "branch" : "done", "in")
                  : act("run", "in", { index: i, count: 3 }))}
              >
                <time>{step.time}</time>
                {step.text}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </SceneWindow>
  );
}

// MAGNETO: VERSÃO TESTADA AO LADO
function MagnetoVersions({ act }: { act: Act }) {
  const t = S["magneto-versions"];
  return (
    <SceneWindow product="magneto" place={t.where} meta={t.meta}>
      <div className={c.versions}>
        <div className={`${c.pane} ${c.soft} ${c.version} ${c.side}`}>
          <div className={c.versionHead}>
            <span className={s.who}>
              <b>{t.v1}</b>
              <span>{t.v1Meta}</span>
            </span>
            <Swap
              act={act}
              action="activate"
              from={<span className={s.pillOk}>{t.active}</span>}
              to={<span className={c.pill}>{t.saved}</span>}
            />
          </div>
          <ol className={c.vSteps}>
            {t.steps.slice(0, 2).map((step, i) => (
              <li key={step}>
                <span className={c.vNum}>{i + 1}</span>
                {step}
              </li>
            ))}
          </ol>
          <span className={c.ghostButton}>{t.back}</span>
        </div>
        <div
          className={`${c.pane} ${c.version} ${c.lit}`}
          {...act("activate", "light")}
        >
          <div className={c.versionHead}>
            <span className={c.versionKey}>
              <Key>{t.v2}</Key>
              <span>{t.v2Meta}</span>
            </span>
            <Swap
              act={act}
              action="activate"
              from={<span className={c.pill}>{t.tested}</span>}
              to={<span className={s.pillOk}>{t.active}</span>}
            />
          </div>
          <ol className={c.vSteps}>
            {t.steps.map((step, i) => (
              <li key={step}>
                <span className={c.vNum}>{i + 1}</span>
                {step}
                <span
                  className={c.vCheck}
                  {...act("test", "pop", { index: i, count: t.steps.length })}
                >
                  <Glyph d={GLYPHS.check} size={11} />
                </span>
              </li>
            ))}
          </ol>
          <p className={c.testRow} {...act("test", "in", { offset: 0.2 })}>
            <span className={c.label}>{t.test}</span>
            <span className={c.matched}>
              <Check size={10} />
              {t.passed}
            </span>
          </p>
        </div>
        <div className={c.log}>
          <p className={c.label}>{t.log}</p>
          <ul>
            {t.entries.map((e, i) => (
              <li
                key={e.text}
                {...(i === t.entries.length - 1 ? act("log", "in") : {})}
              >
                <span className={s.avatarXs}>{e.initials}</span>
                <span>{e.text}</span>
                <time>{e.time}</time>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </SceneWindow>
  );
}

const CHANNEL_ICONS: Record<string, string> = {
  "Chat do site": GLYPHS.globe,
  WhatsApp: GLYPHS.chat,
  Voz: GLYPHS.phone,
};

// TUNER: CHAT NO SITE
function TunerSite({ act }: { act: Act }) {
  const t = S["tuner-site"];
  return (
    <SceneWindow product="tuner" place={t.where} meta={t.meta}>
      <div className={c.duo} data-split="site">
        <div className={`${c.pane} ${c.soft} ${c.browser} ${c.side}`}>
          <div className={c.url}>
            <Glyph d={GLYPHS.globe} size={12} />
            {t.site}
          </div>
          <div className={c.page} aria-hidden="true">
            <i />
            <i />
            <i />
            <span className={c.goods}>
              <b />
              <b />
              <b />
            </span>
          </div>
          <div className={c.widget}>
            <p className={c.widgetHead}>
              <Glyph d={GLYPHS.chat} size={12} />
              {t.widget}
            </p>
            <p className={`${c.msg} ${c.msgOut}`} {...act("type", "pop")}>
              {t.question}
            </p>
            <span className={c.widgetInput}>
              {t.send}
              <Glyph d={GLYPHS.send} size={12} />
            </span>
          </div>
        </div>
        <div className={`${c.pane} ${c.inbox}`}>
          <div className={c.screenHead}>
            <Key>{t.inbox}</Key>
            <span className={c.count}>{t.inboxMeta}</span>
          </div>
          <ul className={c.rows}>
            {t.items.map((item, i) => {
              const fresh = i === 0;
              return (
                <li
                  key={item.name}
                  className={`${c.row} ${c.rowTall} ${fresh ? c.lit : ""}`}
                  /* The question of the site flies into the inbox (ludic pass) */
                  {...(fresh ? act("arrive", "fly") : {})}
                >
                  <span className={s.avatarSm}>{item.name[0]}</span>
                  <span className={c.entry}>
                    <span className={c.tlMeta}>
                      <b>{item.name}</b>
                      <time>{item.time}</time>
                    </span>
                    <span>{item.text}</span>
                  </span>
                  <span className={c.channel}>
                    <Glyph d={CHANNEL_ICONS[item.channel]} size={12} />
                    {item.channel}
                  </span>
                </li>
              );
            })}
          </ul>
          <span className={c.replyLine} {...act("reply", "in")}>
            {t.reply}
            <Glyph d={GLYPHS.send} size={12} />
          </span>
        </div>
      </div>
    </SceneWindow>
  );
}

// TUNER: LIGAÇÃO PARA A EQUIPE CERTA
function TunerCall({ act }: { act: Act }) {
  const t = S["tuner-call"];
  return (
    <SceneWindow product="tuner" place={t.where} meta={t.meta}>
      <div className={c.duo} data-split="call">
        <div className={`${c.pane} ${c.soft} ${c.side} ${c.top}`}>
          <div className={c.caller}>
            <span className={c.avatarLg} aria-hidden="true">
              RL
            </span>
            <span className={s.who}>
              <b>{t.caller}</b>
              <span>
                <Glyph d={GLYPHS.phone} size={11} />
                {t.callerMeta}
              </span>
            </span>
          </div>
          <div className={c.waveRow}>
            <div className={s.wave} aria-hidden="true">
              {Array.from({ length: 24 }, (_, i) => (
                <i key={i} style={{ height: `${30 + ((i * 37) % 70)}%` }} />
              ))}
            </div>
          </div>
          <dl className={`${c.pairs} ${c.pairsStack}`}>
            <div>
              <dt>{t.menu}</dt>
              <dd>{t.option}</dd>
            </div>
          </dl>
          <ol className={c.callSteps}>
            {t.steps.map((step, i) => (
              <li
                key={step.text}
                {...(i === t.steps.length - 1 ? act("take", "in") : {})}
              >
                <time>{step.time}</time>
                {step.text}
              </li>
            ))}
          </ol>
        </div>
        <div className={`${c.pane} ${c.top}`}>
          <Head title={t.teams} meta={`${t.list.length} equipes`} />
          <ul className={c.rows}>
            {t.list.map((team, i) => {
              const right = i === 1;
              return (
                <li
                  key={team.name}
                  className={`${c.row} ${right ? c.lit : ""}`}
                  {...(right ? act("route", "light") : {})}
                >
                  <span className={s.iconBox}>
                    <Glyph d={GLYPHS.team} size={14} />
                  </span>
                  <span className={s.who}>
                    {right ? <Key>{team.name}</Key> : <b>{team.name}</b>}
                    <span>{team.people}</span>
                  </span>
                  {right ? (
                    <span className={s.pillOk} {...act("take", "pop")}>
                      <Glyph d={GLYPHS.phone} size={11} />
                      {t.taken}
                    </span>
                  ) : null}
                </li>
              );
            })}
          </ul>
          <div className={c.noteCard} {...act("note", "in")}>
            <span className={s.avatarSm}>D</span>
            <span className={s.who}>
              <b>{t.note}</b>
              <span>{t.noteMeta}</span>
            </span>
          </div>
        </div>
      </div>
    </SceneWindow>
  );
}

// TUNER: NÚMERO OFICIAL, FOTO E LOCALIZAÇÃO
function TunerOfficial({ act }: { act: Act }) {
  const t = S["tuner-official"];
  return (
    <SceneWindow product="tuner" place={t.where} meta={t.meta}>
      <div className={c.duo} data-split="official">
        <div className={s.phone} data-edge="">
          <div className={s.phoneHead}>
            <span className={s.avatarSm} data-tone="contact" aria-hidden="true">
              <Glyph d={GLYPHS.bag} size={14} />
            </span>
            <span className={s.who}>
              <b>{t.contact}</b>
              <span>
                <i className={s.dot} data-tone="ok" />
                {t.official}
              </span>
            </span>
          </div>
          <div className={`${s.chat} ${c.officialChat}`}>
            <div
              className={`${s.slot} ${s.slotIn}`}
              {...act("media", "pop", { index: 0, count: 2 })}
            >
              <div className={`${s.bubble} ${s.bubbleIn} ${c.media}`}>
                <span className={c.mediaBox} aria-hidden="true">
                  <Glyph d={GLYPHS.image} size={18} />
                </span>
                <span>{t.photo}</span>
                <span className={s.stamp}>
                  <time>{t.times.photo}</time>
                </span>
              </div>
            </div>
            <div
              className={`${s.slot} ${s.slotIn}`}
              {...act("media", "pop", { index: 1, count: 2 })}
            >
              <div className={`${s.bubble} ${s.bubbleIn} ${c.media}`}>
                <span className={c.mediaBox} data-map="" aria-hidden="true">
                  <Glyph d={GLYPHS.pin} size={18} />
                </span>
                <span>{t.place}</span>
                <span className={s.stamp}>
                  <time>{t.times.place}</time>
                </span>
              </div>
            </div>
            <p className={s.day} {...act("later", "in")}>
              {t.later}
            </p>
            <div
              className={`${s.slot} ${s.slotOut}`}
              {...act("later", "pop", { offset: 0.1 })}
            >
              <p className={`${s.bubble} ${s.bubbleOut}`}>
                <span>{t.resume}</span>
                <span className={s.stamp}>
                  <time>{t.times.resume}</time>
                  <span className={s.ticks} aria-hidden="true">
                    <Glyph d={TICK_DOUBLE} size={14} />
                  </span>
                </span>
              </p>
            </div>
            <div
              className={`${s.slot} ${s.slotIn}`}
              {...act("checks", "pop", { length: 0.25 })}
            >
              <p className={`${s.bubble} ${s.bubbleIn}`}>
                <span>{t.yes}</span>
                <span className={s.stamp}>
                  <time>{t.times.yes}</time>
                </span>
              </p>
            </div>
          </div>
        </div>
        <div className={`${c.pane} ${c.soft} ${c.record}`}>
          <div className={c.recordHead}>
            <Key>{t.record}</Key>
            <span>{t.recordMeta}</span>
          </div>
          <ul className={c.checks}>
            {t.checks.map((item, i) => (
              <li key={item}>
                <span
                  className={c.blockDone}
                  {...act("checks", "pop", {
                    index: i,
                    count: t.checks.length,
                  })}
                >
                  <Glyph d={GLYPHS.check} size={11} />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </SceneWindow>
  );
}

// KNOWLY: RESPOSTA COM A FONTE
function KnowlyAnswer({ act }: { act: Act }) {
  const t = S["knowly-answer"];
  return (
    <SceneWindow product="knowly" place={t.where} meta={t.meta}>
      <div className={c.column}>
        <div className={s.query}>
          <Glyph d={GLYPHS.search} size={14} />
          <span>{t.question}</span>
        </div>
        <div className={`${c.pane} ${c.answerPane}`}>
          <p className={s.answerLabel}>
            <Glyph d={GLYPHS.spark} size={12} />
            {t.label}
          </p>
          <p
            className={c.sentence}
            {...act("answer", "in", { index: 0, count: 2 })}
          >
            <Key>{t.answer}</Key>
            <sup className={c.ref}>1</sup>
          </p>
          <p
            className={c.sentence}
            {...act("answer", "in", { index: 1, count: 2 })}
          >
            <span>{t.detail}</span>
            <sup className={c.ref}>2</sup>
          </p>
          <div className={c.sourceList}>
            <p className={c.label}>{t.sourcesTitle}</p>
            <ul>
              {t.sources.map((src, i) => (
                <li
                  key={src.n}
                  {...act("sources", "in", {
                    index: i,
                    count: t.sources.length,
                  })}
                >
                  <span className={c.ref}>{src.n}</span>
                  <Glyph d={GLYPHS.doc} size={12} />
                  {src.name}
                </li>
              ))}
            </ul>
          </div>
          <p className={c.missing} {...act("missing", "in")}>
            <i className={s.dot} data-tone="warn" />
            {t.missing}
          </p>
          <div className={`${s.related} ${c.relatedLow}`}>
            <p>{t.related}</p>
            <ul>
              {t.questions.map((q) => (
                <li key={q}>{q}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </SceneWindow>
  );
}

// KNOWLY: FONTES NUM LUGAR SÓ
function KnowlySources({ act }: { act: Act }) {
  const t = S["knowly-sources"];
  const icons = [GLYPHS.doc, GLYPHS.chat, GLYPHS.mic];
  return (
    <SceneWindow product="knowly" place={t.where} meta={t.meta}>
      <div className={c.column}>
        <div className={c.search} {...act("search", "in")}>
          <Glyph d={GLYPHS.search} size={16} />
          <Key>{t.query}</Key>
        </div>
        <div className={c.groups}>
          {t.groups.map((group, g) => (
            <div key={group.name} className={`${c.pane} ${c.soft} ${c.group}`}>
              <p className={c.groupHead}>
                <Glyph d={icons[g]} size={13} />
                {group.name}
              </p>
              <ul>
                {group.items.map((item, i) => {
                  const hit = t.hits[g] === i;
                  return (
                    <li
                      key={item}
                      className={hit ? c.lit : c.quiet}
                      {...(hit
                        ? act("found", "light", {
                            index: g,
                            count: t.groups.length,
                          })
                        : {})}
                    >
                      <span>{item}</span>
                      {hit ? (
                        <span className={c.fresh} {...act("fresh", "in")}>
                          <Glyph d={GLYPHS.refresh} size={11} />
                          {t.freshTimes[g]}
                        </span>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
        <div className={`${c.pane} ${c.excerpt} ${c.side}`}>
          <p className={c.label}>
            <Glyph d={GLYPHS.doc} size={12} />
            {t.excerpt.from}
          </p>
          <p className={c.quote}>{t.excerpt.text}</p>
          <p className={c.footNote} {...act("fresh", "in")}>
            <Glyph d={GLYPHS.refresh} size={12} />
            {t.fresh}: {t.excerpt.meta}
          </p>
        </div>
      </div>
    </SceneWindow>
  );
}

// KNOWLY: ACESSO POR PESSOA
function KnowlyAccess({ act }: { act: Act }) {
  const t = S["knowly-access"];
  return (
    <SceneWindow product="knowly" place={t.where} meta={t.meta}>
      <div className={c.access}>
        <div className={c.spaces}>
          {t.spaces.map((space, i) => {
            const open = i === t.open;
            return (
              <div
                key={space.name}
                className={`${c.pane} ${c.space} ${open ? c.lit : c.locked}`}
                {...(open ? act("open", "light") : {})}
              >
                <p className={c.spaceHead}>
                  {open ? <Key>{space.name}</Key> : <b>{space.name}</b>}
                  {open ? null : (
                    <span className={c.lock}>
                      <Glyph d={GLYPHS.lock} size={12} />
                      {t.locked}
                    </span>
                  )}
                </p>
                {open ? (
                  <ul>
                    {space.docs.map((doc) => (
                      <li key={doc}>
                        <Glyph d={GLYPHS.doc} size={12} />
                        {doc}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className={c.spaceMeta}>
                    {space.docs.length} documentos
                  </span>
                )}
              </div>
            );
          })}
        </div>
        <div className={`${c.pane} ${c.soft} ${c.askPane}`}>
          <div className={c.askWho}>
            <span className={s.avatarSm}>B</span>
            <span className={s.who}>
              <b>{t.person}</b>
              <span>{t.team}</span>
            </span>
          </div>
          <div className={c.askChat}>
            <p className={`${c.msg} ${c.msgOut} ${c.side}`}>{t.before}</p>
            <div className={`${c.msgInWrap} ${c.side}`}>
              <p className={`${c.msg} ${c.msgIn}`}>{t.beforeReply}</p>
              <span className={c.source}>
                <Glyph d={GLYPHS.doc} size={12} />
                {t.beforeSource}
              </span>
            </div>
            <p className={`${c.msg} ${c.msgOut}`} {...act("ask", "pop")}>
              {t.ask}
            </p>
            <p
              className={`${c.msg} ${c.msgIn} ${c.msgLock}`}
              {...act("reply", "pop")}
            >
              <Glyph d={GLYPHS.lock} size={12} />
              {t.reply}
            </p>
          </div>
        </div>
      </div>
    </SceneWindow>
  );
}

const BODIES = {
  "domus-form": DomusForm,
  "domus-cash": DomusCash,
  "domus-contract": DomusContract,
  "relloo-person": RellooPerson,
  "relloo-campaign": RellooCampaign,
  "relloo-agent": RellooAgent,
  "magneto-sentence": MagnetoSentence,
  "magneto-canvas": MagnetoCanvas,
  "magneto-versions": MagnetoVersions,
  "tuner-site": TunerSite,
  "tuner-call": TunerCall,
  "tuner-official": TunerOfficial,
  "knowly-answer": KnowlyAnswer,
  "knowly-sources": KnowlySources,
  "knowly-access": KnowlyAccess,
} as const;

export function CapabilityBody({
  scene,
  phase = "end",
}: {
  scene: CapabilityScript;
  phase?: "start" | "play" | "end";
}) {
  const Body = BODIES[scene.id];
  return (
    <div className={`scn ${s.scene}`} data-scene={scene.id} data-phase={phase}>
      <Body act={actFor(scene)} />
    </div>
  );
}
