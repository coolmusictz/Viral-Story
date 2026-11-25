"use client";

import { useRef, type KeyboardEvent, type ReactNode } from "react";

export type TabItem = { id: string; label: string; content: ReactNode };
type Props = { tabs: TabItem[]; label: string; defaultTab?: string };

export function Tabs({ tabs, label, defaultTab }: Props) {
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const active = tabs.some((tab) => tab.id === defaultTab) ? defaultTab! : tabs[0]?.id;
  const [selected, setSelected] = requireState(active);

  function requireState(initial: string | undefined) {
    // Kept as a hook helper to make the selected tab state explicit and typed.
    return useSelectedState(initial);
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
    else if (event.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = tabs.length - 1;
    else return;
    event.preventDefault();
    tabRefs.current[next]?.focus();
    setSelected(tabs[next]?.id);
  }

  const selectedTab = tabs.find((tab) => tab.id === selected) ?? tabs[0];
  return <div>
    <div aria-label={label} role="tablist" className="flex gap-1 overflow-x-auto border-b border-white/10">
      {tabs.map((tab, index) => <button key={tab.id} ref={(node) => { tabRefs.current[index] = node; }} id={`tab-${tab.id}`} aria-controls={`panel-${tab.id}`} aria-selected={selected === tab.id} role="tab" tabIndex={selected === tab.id ? 0 : -1} onClick={() => setSelected(tab.id)} onKeyDown={(event) => onKeyDown(event, index)} className={`shrink-0 border-b-2 px-4 py-3 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ember ${selected === tab.id ? "border-ember text-paper" : "border-transparent text-muted hover:text-paper"}`}>{tab.label}</button>)}
    </div>
    {selectedTab && <div id={`panel-${selectedTab.id}`} role="tabpanel" aria-labelledby={`tab-${selectedTab.id}`} tabIndex={0} className="pt-5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ember">{selectedTab.content}</div>}
  </div>;
}

import { useState as useSelectedState } from "react";
