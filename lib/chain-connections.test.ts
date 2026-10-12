// TESTES DAS LIGAÇÕES DA CADEIA
// The fixture of connections follows the cuts of the montage: one entry per cut, and a connection only joins products the
// cut really shows.
import { describe, expect, it } from "vitest";
import { CHAIN_LIT } from "@/components/ring/RingStage";
import {
  AXIS_SLOT,
  BUS_SLOTS,
  CHAIN_CONNECTIONS,
  activeSpan,
  connectionSpan,
} from "./chain-connections";

describe("chain connections", () => {
  it("has one entry per cut", () => {
    expect(CHAIN_CONNECTIONS).toHaveLength(CHAIN_LIT.length);
  });
  it("joins only products lit in that cut", () => {
    CHAIN_CONNECTIONS.forEach((connection, i) => {
      if (!connection) return;
      expect(CHAIN_LIT[i]).toContain(connection.from);
      expect(CHAIN_LIT[i]).toContain(connection.to);
    });
  });
  it("fills the bus between the two slots, growing from the side of the origin", () => {
    expect(connectionSpan({ from: "tuner", to: "relloo" })).toEqual({
      lo: BUS_SLOTS.relloo,
      hi: BUS_SLOTS.tuner,
      origin: "right",
    });
    expect(connectionSpan({ from: "domus", to: "magneto" }).origin).toBe(
      "left",
    );
    expect(connectionSpan(null).hi - connectionSpan(null).lo).toBe(0);
  });
  it("runs the active product to the axis, where the thread goes down", () => {
    expect(activeSpan("magneto")).toMatchObject({
      lo: AXIS_SLOT,
      hi: AXIS_SLOT,
    });
    expect(activeSpan("domus")).toMatchObject({ lo: 0, hi: AXIS_SLOT });
  });
});
