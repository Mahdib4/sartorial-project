import { INTRO_EVENT, INTRO_STORAGE_KEY } from "@/lib/intro-constants";

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

  // The admin panel has no opening animation.
  if (location.pathname.indexOf("/admin") === 0) {
    setPhase("skip");
    return;
  }

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
  const modifiers = ["Shift", "Control", "Alt", "Meta", "CapsLock"];
  const onInput = (e: Event) => {
    if (!running()) return;
    if (e.type === "keydown") {
      const k = e as KeyboardEvent;
      // A lone modifier (or a browser shortcut) is not a wish to skip.
      if (k.metaKey || k.ctrlKey || k.altKey || modifiers.indexOf(k.key) > -1) return;
    }
    if (e.type === "wheel" || e.type === "touchmove" || (e.type === "keydown" && scrollKeys.indexOf((e as KeyboardEvent).key) > -1)) {
      e.preventDefault();
    }
    // Once the curtain is already lifting, let it finish rather than restarting the fade.
    if (e.type !== "touchmove" && phase() === "play" && !root.hasAttribute("data-intro-revealed")) setPhase("leave");
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

export const INTRO_SCRIPT = `(${conductor.toString()})(${JSON.stringify(INTRO_STORAGE_KEY)},${JSON.stringify(INTRO_EVENT)})`;
