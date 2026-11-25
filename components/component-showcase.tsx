"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Modal } from "@/components/ui/modal";
import { Tabs } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Toast } from "@/components/ui/toast";

export function ComponentShowcase() {
  const [modalOpen, setModalOpen] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  return <main className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
    <header className="mb-10 border-b border-white/10 pb-7"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-ember">VIRALSTORY AI · UI foundation</p><h1 className="mt-3 text-4xl font-semibold tracking-tight text-paper sm:text-5xl">Component showcase</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-muted">Development-only reference for the editorial dark design system. Controls below are local examples and do not call an API.</p></header>
    <div className="space-y-12">
      <section aria-labelledby="buttons-heading"><h2 id="buttons-heading" className="mb-4 text-lg font-semibold">Buttons &amp; badges</h2><div className="flex flex-wrap items-center gap-3"><Button>Primary action</Button><Button variant="secondary">Secondary</Button><Button variant="ghost">Ghost</Button><Button variant="danger">Destructive</Button><Button size="sm">Small</Button><Button loading>Loading</Button><IconButton label="More options">⋯</IconButton></div><div className="mt-5 flex flex-wrap gap-2"><Badge>Draft</Badge><Badge variant="accent">AI draft</Badge><Badge variant="success">Approved</Badge><Badge variant="warning">Needs review</Badge><Badge variant="danger">Failed</Badge></div></section>
      <section aria-labelledby="cards-heading"><h2 id="cards-heading" className="mb-4 text-lg font-semibold">Cards &amp; loading</h2><div className="grid gap-4 md:grid-cols-2"><Card><Badge variant="accent">KISWAHILI</Badge><h3 className="mt-4 text-lg font-semibold">The last matatu to Kariakoo</h3><p className="mt-2 text-sm leading-6 text-muted">A mock story card with clear hierarchy, quiet borders and editorial spacing.</p></Card><Card><div className="flex gap-4"><Skeleton width="3rem" height="3rem" rounded /><div className="flex-1 space-y-3"><Skeleton width="45%" height="1rem"/><Skeleton width="80%" height="0.75rem"/><Skeleton width="60%" height="0.75rem"/></div></div></Card></div></section>
      <section aria-labelledby="states-heading"><h2 id="states-heading" className="mb-4 text-lg font-semibold">Empty &amp; error states</h2><div className="grid gap-4 md:grid-cols-2"><EmptyState title="No stories yet" description="Your next story idea will show up here when you create a draft." action={<Button size="sm">Start a draft</Button>}/><ErrorState title="Could not load preview" description="This example error state is local and does not indicate a real service issue." action={<Button variant="secondary" size="sm">Try again</Button>}/></div></section>
      <section aria-labelledby="forms-heading"><h2 id="forms-heading" className="mb-4 text-lg font-semibold">Form controls</h2><Card><div className="grid gap-5 md:grid-cols-2"><Input label="Story title" name="story-title" placeholder="A voice note from tomorrow" hint="Keep it short and memorable."/><Input label="Email" name="email" type="email" required errorMessage="This is an example validation message."/><Select label="Language" name="language" options={[{ value: "sw", label: "Kiswahili" }, { value: "en", label: "English" }]} hint="Choose the language for your draft."/></div></Card></section>
      <section aria-labelledby="tabs-heading"><h2 id="tabs-heading" className="mb-4 text-lg font-semibold">Keyboard-accessible tabs</h2><Card><Tabs label="Showcase examples" tabs={[{ id: "concept", label: "Concept", content: <p className="text-sm leading-6 text-muted">A narrative hook, mood and premise belong here. Use arrow keys to move across tabs.</p> }, { id: "script", label: "Script", content: <p className="text-sm leading-6 text-muted">A short script draft would be presented in this panel.</p> }, { id: "sources", label: "Sources", content: <p className="text-sm leading-6 text-muted">For factual stories, source links and verification status must be recorded.</p> }]} /></Card></section>
      <section aria-labelledby="overlays-heading"><h2 id="overlays-heading" className="mb-4 text-lg font-semibold">Overlays &amp; notifications</h2><div className="flex flex-wrap gap-3"><Button onClick={() => setModalOpen(true)}>Open modal</Button><Button variant="secondary" onClick={() => setToastVisible(true)}>Show toast</Button></div><Modal open={modalOpen} title="Preview dialog" description="Native dialog semantics support Escape, focus management and modal keyboard behavior." onClose={() => setModalOpen(false)}><p className="text-sm leading-6 text-muted">This is a local component preview. No data will be saved.</p><div className="mt-5 flex justify-end"><Button variant="secondary" onClick={() => setModalOpen(false)}>Close</Button></div></Modal>{toastVisible && <Toast message="This is a local preview notification." onDismiss={() => setToastVisible(false)} />}</section>
    </div>
  </main>;
}
