// O POUCO DE SCRIPT DAS INTERAÇÕES
// v2.2: the plays are CSS over native controls; this module only adds what CSS cannot know. It rides on the chunk of
// the replays (components/scenes/replay.ts), fetched after hydration, so it costs nothing in the initial JS.
//  - Relloo: the events of the conversation and their lines on the record keep the order in which the visitor fired
//    them (`order`), the record shows the minute of each in that order, and the first event has no "channel switch"
//    divider (`data-first`).
//  - Magneto: choosing another value starts the flow over, so a decision taken on the other value is cleared.
//  - Any play: after the reset button the order is cleared too.
export function installPlays() {
  let seq = 0;

  const relloo = (form: HTMLElement, input: HTMLInputElement) => {
    const id = input.id.replace(/^rl-/, "");
    form
      .querySelectorAll<HTMLElement>(`[data-channel="${id}"]`)
      .forEach((el) => {
        el.style.order = input.checked ? String(++seq) : "";
      });
    // The checked channels, in the order they were fired
    const fired = [
      ...form.querySelectorAll<HTMLElement>("[data-thread] [data-channel]"),
    ]
      .filter((el) => el.style.order)
      .sort((a, b) => Number(a.style.order) - Number(b.style.order))
      .map((el) => el.dataset.channel);
    form.querySelectorAll<HTMLElement>("[data-channel]").forEach((el) => {
      const rank = fired.indexOf(el.dataset.channel);
      el.toggleAttribute("data-first", rank === 0);
      const time = el.querySelector("time");
      // One minute apart from 10:05, in the order they arrived
      if (time && rank >= 0) time.textContent = `10:0${5 + rank}`;
    });
  };

  const onChange = (event: Event) => {
    const input = event.target;
    if (!(input instanceof HTMLInputElement)) return;
    const form = input.closest<HTMLElement>("[data-play]");
    if (!form) return;
    if (form.dataset.play === "relloo") relloo(form, input);
    if (form.dataset.play === "magneto" && input.name === "mg-value")
      form
        .querySelectorAll<HTMLInputElement>('[name="mg-dec"]')
        .forEach((el) => {
          el.checked = false;
        });
  };

  const onReset = (event: Event) => {
    const form = event.target;
    if (!(form instanceof HTMLElement) || !form.matches("[data-play]")) return;
    form.querySelectorAll<HTMLElement>("[data-channel]").forEach((el) => {
      el.style.order = "";
      el.removeAttribute("data-first");
    });
  };

  document.addEventListener("change", onChange);
  document.addEventListener("reset", onReset, true);
  return () => {
    document.removeEventListener("change", onChange);
    document.removeEventListener("reset", onReset, true);
  };
}
