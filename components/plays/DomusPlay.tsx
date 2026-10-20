// DOMUS: O CADASTRO QUE FALTA
// v2.2 (audit A05, M08, section 4; reference: the HyperFrames piece hub-draw-born). Four kinds of field the visitor drags
// (or taps) into the form of a new record: each one enters the form, its column is born in the list and the three
// records fill it in cascade, in the shape of its kind (a date, a thumbnail, a status pill, a note). "Novo registro"
// writes a row; "Pedir aprovação" lights the Magneto beside the list with a curved wire. The palette chip of a field in
// use stays checked (the "used" state of M08). States and timing: domus.module.css.
import { DragToCheck } from "@/components/template/DragToCheck";
import { Glyph, GLYPHS } from "@/components/scenes/icons";
import { DOMUS_PLAY as D } from "@/lib/content/plays";
import { productLogo } from "@/lib/products";
import d from "./domus.module.css";
import {
  at,
  Choice,
  Choices,
  DomusRecord,
  LogLine,
  PlayForm,
  PlayLog,
  RecordLine,
} from "./parts";

const KIND_GLYPH: Record<string, string> = {
  date: GLYPHS.calendar,
  photo: GLYPHS.image,
  status: GLYPHS.tag,
  text: GLYPHS.pen,
};

// The value of a field in one record, drawn in the shape of its kind
function Cell({ kind, value, i }: { kind: string; value: string; i: number }) {
  if (kind === "photo")
    return <span className={d.thumb} data-tint={i} aria-hidden="true" />;
  if (kind === "status")
    return (
      <span className={d.status} data-tint={i}>
        {value}
      </span>
    );
  return <span>{value}</span>;
}

export function DomusPlay() {
  const controls = (
    <>
      <Choices legend={D.palette}>
        {D.fields.map((f) => (
          // Dragging a chip onto the form checks it, the same as a tap (DragToCheck)
          <DragToCheck
            key={f.id}
            inputId={`dp-${f.id}`}
            targetId="dp-form"
            className={d.drag}
          >
            <Choice id={`dp-${f.id}`}>
              <Glyph d={KIND_GLYPH[f.id]} size={16} />
              {f.type}
            </Choice>
          </DragToCheck>
        ))}
      </Choices>
      <Choices legend={D.list}>
        <Choice id="dp-row">
          <Glyph d={GLYPHS.plus} size={16} />
          {D.newRow}
        </Choice>
        <Choice id="dp-approval">
          <Glyph d={GLYPHS.check} size={16} />
          {D.approval}
        </Choice>
      </Choices>
    </>
  );

  const stage = (
    <div className={d.screen}>
      <div id="dp-form" className={d.form}>
        <p className={d.paneTitle}>{D.form}</p>
        {D.base.map((name) => (
          <p key={name} className={d.field}>
            <span>{name}</span>
            <i className={d.input} />
          </p>
        ))}
        {D.fields.map((f) => (
          <p
            key={f.id}
            className={d.field}
            data-ev={f.id}
            data-kind={f.id}
            style={at(0)}
          >
            <span>{f.name}</span>
            <i className={d.input}>
              <Glyph d={KIND_GLYPH[f.id]} size={14} />
            </i>
          </p>
        ))}
      </div>
      <div className={d.list}>
        <p className={d.paneTitle}>{D.list}</p>
        <div className={d.tableWrap}>
          <table className={d.table}>
            <thead>
              <tr>
                {D.base.map((name) => (
                  <th key={name}>{name}</th>
                ))}
                {D.fields.map((f) => (
                  <th key={f.id} data-ev={f.id} style={at(1)}>
                    {f.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {D.rows.map((row, i) => (
                <tr key={row[0]}>
                  {row.map((cell) => (
                    <td key={cell}>{cell}</td>
                  ))}
                  {D.fields.map((f) => (
                    <td key={f.id} data-ev={f.id} style={at(2 + i * 0.6)}>
                      <Cell kind={f.id} value={f.cells[i]} i={i} />
                    </td>
                  ))}
                </tr>
              ))}
              <tr className={d.newRow} data-ev="row" style={at(0)}>
                {D.newRowCells.map((cell) => (
                  <td key={cell}>{cell}</td>
                ))}
                {D.fields.map((f) => (
                  <td key={f.id} data-ev={f.id} style={at(1)}>
                    <Cell kind={f.id} value={f.cells[0]} i={0} />
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        {/* The approval of an exchange runs on the Magneto, wired to the list */}
        <div className={d.flow} data-ev="approval" style={at(0)}>
          <svg viewBox="0 0 96 40" width="96" height="40" aria-hidden="true">
            <path d="M4 4 C4 30 40 36 92 36" />
          </svg>
          <span className={d.flowChip}>
            <img
              src={productLogo("magneto", "light", "row")}
              alt="Magneto"
              width={1005}
              height={550}
            />
            {D.approvalFlow}
          </span>
        </div>
      </div>
    </div>
  );

  const side = (
    <>
      <PlayLog>
        {D.fields.map((f, i) => (
          <LogLine key={f.id} ev={f.id} time={`09:0${i + 2}`} beat={3.6}>
            {f.log}
          </LogLine>
        ))}
        <LogLine ev="row" time="09:07" beat={2} tone="ok">
          {D.newRowLog}
        </LogLine>
        <LogLine ev="approval" time="09:08" beat={2.5} tone="wait">
          {D.approvalLog}
        </LogLine>
      </PlayLog>
      <DomusRecord title={D.list}>
        <RecordLine>{D.record.idle}</RecordLine>
        {D.fields.map((f) => (
          <RecordLine key={f.id} ev={f.id} beat={4.5}>
            {D.record.field(f.name)}
          </RecordLine>
        ))}
        <RecordLine ev="row" beat={4}>
          {D.record.row}
        </RecordLine>
        <RecordLine ev="approval" beat={4}>
          {D.record.approval}
        </RecordLine>
      </DomusRecord>
    </>
  );

  return (
    <PlayForm
      slug="domus"
      label={D.label}
      className={d.root}
      controls={controls}
      stage={stage}
      side={side}
    />
  );
}
