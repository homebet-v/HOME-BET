"use client";

import { useLayoutEffect, type RefObject } from "react";

/** Reserve the measured title and controls, then fit the square reels in the rest. */
export function useSlotViewport(player: RefObject<HTMLDivElement | null>, ready: boolean, layout: string, sound: boolean, autoOpen: boolean, rulesOpen: boolean, aspect = 1) {
  useLayoutEffect(() => {
    const root = player.current;
    const main = root?.querySelector<HTMLElement>(".slot-play-area");
    const board = main?.querySelector<HTMLElement>(".slot-board-stage");
    if (!ready || !root || !main || !board) return;
    const header = root.querySelector(".slot-theme-header");
    const footer = root.querySelector("footer");
    const number = (value: string) => Number.parseFloat(value) || 0;
    let frame = 0;
    const measure = () => {
      const rootStyle = getComputedStyle(root);
      const viewportHeight = (root.closest("dialog")?.clientHeight ?? window.innerHeight) - number(rootStyle.borderTopWidth) - number(rootStyle.borderBottomWidth);
      const mainStyle = getComputedStyle(main);
      let reserved = (header?.getBoundingClientRect().height ?? 0) + (footer?.getBoundingClientRect().height ?? 0)
        + number(mainStyle.paddingTop) + number(mainStyle.paddingBottom);
      for (const child of main.children) {
        const style = getComputedStyle(child);
        if (style.display === "none" || style.position === "absolute") continue;
        reserved += number(style.marginTop) + number(style.marginBottom);
        if (child !== board) reserved += child.getBoundingClientRect().height;
      }
      const width = main.clientWidth - number(mainStyle.paddingLeft) - number(mainStyle.paddingRight);
      const size = `${Math.floor(Math.max(96, Math.min(460, width, (viewportHeight - reserved - 2) * aspect)))}px`;
      if (root.style.getPropertyValue("--slot-board-size") !== size) root.style.setProperty("--slot-board-size", size);
    };
    const schedule = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(measure); };
    measure();
    const observer = new ResizeObserver(schedule);
    observer.observe(main);
    for (const element of [header, footer, ...main.children]) if (element && element !== board) observer.observe(element);
    window.addEventListener("resize", schedule);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); window.removeEventListener("resize", schedule); };
  }, [player, ready, layout, sound, autoOpen, rulesOpen, aspect]);
}
