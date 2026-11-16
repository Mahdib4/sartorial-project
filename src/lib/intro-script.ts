/**
 * The opening animation's conductor, inlined into <head> so it runs before the
 * first paint (see components/layout/Preloader.tsx and preloader.css).
 *
 * It decides whether the opening plays: once per visit (per browser tab session),
 * or again whenever the address carries `?intro`. While it plays, the page beneath
 * is held still: a scroll, tap, click or key press is taken as a wish to skip, and
 * the ivory dissolves at once. It announces the moment the curtain starts to lift
 * (`data-intro-revealed` on <html>, plus a `sartorial:intro` event) so the home
 * page can time its own entrance to it, and tidies up when the dissolve ends.
 *
 * Plain ES2017 and self-contained: it is serialised with Function#toString.
 */
function conductor(storageKey: string, eventName: string) {
  const root = document.documentElement;
  const phase = () => root.getAttribute("data-intro");
  const setPhase = (next: string) => root.setAttribute("data-intro", next);

  try {
    const replay = /[?&]intro(=|&|$)/.test(location.search);
    if (!replay && sessionStorage.getItem(storageKey)) {
      setPhase("skip");
      return;
    }
    sessionStorage.setItem(storageKey, "1");
  } catch {
    // Storage unavailable (private modes, blocked cookies): play it.
  }

  const announce = () => window.dispatchEvent(new Event(eventName));
  const running = () => {
    const p = phase();
    return p === "wait" || p === "play" || p === "leave";
  };

  let safety = 0;
  const start = () => {
    setPhase("play");
    // If the animation never reports back (styles blocked, say), never trap the page.
    window.clearTimeout(safety);
    safety = window.setTimeout(finish, 9000);
  };

  const reveal = () => {
    if (root.hasAttribute("data-intro-revealed")) return;
    root.setAttribute("data-intro-revealed", "");
    announce();
  };

  const scrollKeys = [" ", "PageDown", "PageUp", "ArrowDown", "ArrowUp", "Home", "End"];
  const onInput = (e: Event) => {
    if (!running()) return;
    if (e.type === "wheel" || e.type === "touchmove" || (e.type === "keydown" && scrollKeys.indexOf((e as KeyboardEvent).key) > -1)) {
      e.preventDefault();
    }
    if (e.type !== "touchmove" && phase() === "play") setPhase("leave");
  };

  const onAnimation = (e: Event) => {
    const name = (e as AnimationEvent).animationName;
    if (name !== "pl-veil-out" && name !== "pl-veil-skip") return;
    if (e.type === "animationstart") reveal();
    else finish();
  };

  const onVisibility = () => {
    if (document.visibilityState === "visible" && phase() === "wait") start();
  };

  const inputs = ["wheel", "touchstart", "touchmove", "pointerdown", "keydown"];
  const options: AddEventListenerOptions = { capture: true, passive: false };

  function finish() {
    if (!running()) return;
    window.clearTimeout(safety);
    reveal();
    setPhase("done");
    inputs.forEach((type) => window.removeEventListener(type, onInput, options));
    document.removeEventListener("animationstart", onAnimation, true);
    document.removeEventListener("animationend", onAnimation, true);
    document.removeEventListener("visibilitychange", onVisibility);
    announce();
  }

  inputs.forEach((type) => window.addEventListener(type, onInput, options));
  document.addEventListener("animationstart", onAnimation, true);
  document.addEventListener("animationend", onAnimation, true);
  document.addEventListener("visibilitychange", onVisibility);

  // A tab opened in the background keeps the opening until it is looked at.
  if (document.visibilityState === "hidden") setPhase("wait");
  else start();
}

export const INTRO_STORAGE_KEY = "sartorial:intro";
export const INTRO_EVENT = "sartorial:intro";

export const INTRO_SCRIPT = `(${conductor.toString()})(${JSON.stringify(INTRO_STORAGE_KEY)},${JSON.stringify(INTRO_EVENT)})`;
