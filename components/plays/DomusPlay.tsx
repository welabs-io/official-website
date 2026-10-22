// DOMUS: O CADASTRO QUE FALTA
// v2.2 (audit A05, M08, section 4; reference: the HyperFrames piece hub-draw-born). Four kinds of field the visitor drags
// (or taps) into the form of a new record: each one enters the form, its column is born in the list and the three
// records fill it in cascade, in the shape of its kind (a date, a thumbnail, a status pill, a note). "Novo registro"
// writes a row; "Pedir aprovação" lights the Magneto beside the list with a curved wire. The palette chip of a field in
// use stays checked (the "used" state of M08). States and timing: domus.module.css.
import {
  Badge,
  Card,
  Field,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/lib/ui";
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

// The status of a record: open (the amber of what is new), in review (sand) and done (success), the lib's Badge
const STATUS_TONE = [
  { variant: "primary", appearance: "soft" },
  { variant: "secondary", appearance: "solid" },
  { variant: "success", appearance: "soft" },
] as const;

// The value of a field in one record, drawn in the shape of its kind
function Cell({ kind, value, i }: { kind: string; value: string; i: number }) {
  if (kind === "photo")
    return <span className={d.thumb} data-tint={i} aria-hidden="true" />;
  if (kind === "status") return <Badge {...STATUS_TONE[i]}>{value}</Badge>;
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

  // v3 (F3): the screen of the new record is the lib's (Field and Input in the form, Table in the list, Badge for the
  // status, Card for the flow of the approval), under its welabs theme; the form is a drawing of a screen, its fields
  // read-only and out of the tab order (not inert: it is the drop target of the dragged kinds). Each part that belongs
  // to a state keeps its `data-ev` (the CSS state machine of domus.module.css shows it).
  const stage = (
    <div className={d.screen} data-theme="welabs">
      <div id="dp-form" className={d.form}>
        <p className={d.paneTitle}>{D.form}</p>
        {D.base.map((name) => (
          <div key={name} className={d.slot}>
            <Field label={name}>
              <Input readOnly tabIndex={-1} />
            </Field>
          </div>
        ))}
        {D.fields.map((f) => (
          <div
            key={f.id}
            className={d.slot}
            data-ev={f.id}
            data-kind={f.id}
            style={at(0)}
          >
            <Field label={f.name}>
              <InputGroup>
                <InputGroupInput readOnly tabIndex={-1} aria-label={f.name} />
                <InputGroupAddon align="inline-end">
                  <Glyph d={KIND_GLYPH[f.id]} size={14} />
                </InputGroupAddon>
              </InputGroup>
            </Field>
          </div>
        ))}
      </div>
      <div className={d.list}>
        <p className={d.paneTitle}>{D.list}</p>
        <Table className={d.table}>
          <TableHeader>
            <TableRow>
              {D.base.map((name) => (
                <TableHead key={name}>{name}</TableHead>
              ))}
              {D.fields.map((f) => (
                <TableHead key={f.id} data-ev={f.id} style={at(1)}>
                  {f.name}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {D.rows.map((row, i) => (
              <TableRow key={row[0]}>
                {row.map((cell) => (
                  <TableCell key={cell}>{cell}</TableCell>
                ))}
                {D.fields.map((f) => (
                  <TableCell key={f.id} data-ev={f.id} style={at(2 + i * 0.6)}>
                    <Cell kind={f.id} value={f.cells[i]} i={i} />
                  </TableCell>
                ))}
              </TableRow>
            ))}
            <TableRow className={d.newRow} data-ev="row" style={at(0)}>
              {D.newRowCells.map((cell) => (
                <TableCell key={cell}>{cell}</TableCell>
              ))}
              {D.fields.map((f) => (
                <TableCell key={f.id} data-ev={f.id} style={at(1)}>
                  <Cell kind={f.id} value={f.cells[0]} i={0} />
                </TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
        {/* The approval of an exchange runs on the Magneto, wired to the list */}
        <div className={d.flow} data-ev="approval" style={at(0)}>
          <svg viewBox="0 0 96 40" width="96" height="40" aria-hidden="true">
            <path d="M4 4 C4 30 40 36 92 36" />
          </svg>
          <Card size="sm" className={d.flowCard}>
            <img
              src={productLogo("magneto", "light", "row")}
              alt="Magneto"
              width={1005}
              height={550}
            />
            {D.approvalFlow}
          </Card>
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
      // v3 (F3): the demo creates two fields, records a row and asks for the approval
      demo={["dp-date", "dp-status", "dp-row", "dp-approval"]}
      controls={controls}
      stage={stage}
      side={side}
    />
  );
}
