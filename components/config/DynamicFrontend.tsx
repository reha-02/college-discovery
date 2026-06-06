"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { AppConfig, ComponentConfig, FieldConfig, MetricConfig, TableColumnConfig, TableRowConfig } from "@/lib/frontend-config";
import { cn } from "@/lib/utils";

const toneStyles = {
  blue: "border-sky-200 bg-sky-50 text-sky-700",
  green: "border-emerald-200 bg-emerald-50 text-emerald-700",
  amber: "border-amber-200 bg-amber-50 text-amber-700",
  rose: "border-rose-200 bg-rose-50 text-rose-700",
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function SafeBoundary({ config, children }: { config: ComponentConfig; children: React.ReactNode }) {
  if (!isRecord(config) || typeof config.id !== "string" || typeof config.type !== "string") {
    return <InvalidConfig title="Invalid block" detail="Missing required id or type." />;
  }

  return <>{children}</>;
}

function InvalidConfig({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-900">
      <p className="text-sm font-bold">{title}</p>
      <p className="mt-1 text-xs leading-relaxed text-amber-800">{detail}</p>
    </div>
  );
}

function Shell({ config }: { config: AppConfig }) {
  return (
    <div className="border-b border-white/10 bg-[#09111f]/95 text-white backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-cyan-300 text-sm font-black text-slate-950">CF</div>
          <div>
            <p className="text-sm font-bold">{config.shell.productName}</p>
            <p className="text-xs text-cyan-100/70">{config.shell.environment}</p>
          </div>
        </div>
        <nav className="hidden items-center gap-1 md:flex">
          {config.shell.nav.map((item) => (
            <a key={item} href="#renderer" className="rounded-lg px-3 py-2 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white">
              {item}
            </a>
          ))}
        </nav>
        <div className="rounded-full border border-emerald-300/30 bg-emerald-300/10 px-3 py-1 text-xs font-bold text-emerald-200">
          Resilient
        </div>
      </div>
    </div>
  );
}

function HeroBlock({ config }: { config: Extract<ComponentConfig, { type: "hero" }> }) {
  return (
    <section className="relative overflow-hidden border-b border-white/10 bg-[#09111f] text-white">
      <div className="absolute inset-0 opacity-40" style={{ backgroundImage: "linear-gradient(#1f334d 1px, transparent 1px), linear-gradient(90deg, #1f334d 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
      <div className="relative mx-auto grid min-h-[560px] max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_440px] lg:px-8">
        <div>
          <div className="inline-flex rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-xs font-bold uppercase text-cyan-200">
            {config.eyebrow ?? "Config renderer"}
          </div>
          <h1 className="mt-6 max-w-4xl text-5xl font-black leading-[0.95] text-white md:text-7xl">
            {config.title ?? "Composable frontend system"}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">{config.description}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {(config.actions ?? []).map((action) =>
              action.href.startsWith("/") ? (
                <Link key={action.label} href={action.href} className={cn("inline-flex justify-center rounded-lg px-5 py-3 text-sm font-bold transition", action.intent === "secondary" ? "border border-white/15 bg-white/5 text-white hover:bg-white/10" : "bg-cyan-300 text-slate-950 hover:bg-cyan-200")}>
                  {action.label}
                </Link>
              ) : (
                <a key={action.label} href={action.href} className={cn("inline-flex justify-center rounded-lg px-5 py-3 text-sm font-bold transition", action.intent === "secondary" ? "border border-white/15 bg-white/5 text-white hover:bg-white/10" : "bg-cyan-300 text-slate-950 hover:bg-cyan-200")}>
                  {action.label}
                </a>
              )
            )}
          </div>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/[0.06] p-4 shadow-2xl backdrop-blur">
          <div className="rounded-lg border border-cyan-300/20 bg-slate-950 p-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <p className="text-sm font-bold text-cyan-100">Renderer registry</p>
              <span className="rounded-full bg-emerald-300/15 px-2 py-1 text-xs font-bold text-emerald-200">online</span>
            </div>
            {["hero", "metrics", "table", "form", "workflow", "fallback"].map((item, index) => (
              <div key={item} className="flex items-center justify-between border-b border-white/5 py-3 last:border-0">
                <div className="flex items-center gap-3">
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-white/10 text-xs text-cyan-200">{index + 1}</span>
                  <span className="font-mono text-sm text-slate-200">{item}</span>
                </div>
                <span className="text-xs text-slate-500">mounted</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Sparkline({ values = [] }: { values?: number[] }) {
  const points = values.length ? values : [20, 32, 28, 45, 50, 58, 66];
  const max = Math.max(...points);
  const min = Math.min(...points);
  const d = points
    .map((value, index) => {
      const x = (index / Math.max(1, points.length - 1)) * 100;
      const y = 34 - ((value - min) / Math.max(1, max - min)) * 28;
      return `${index === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg viewBox="0 0 100 36" className="h-10 w-28" aria-hidden="true">
      <path d={d} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function MetricsBlock({ config }: { config: Extract<ComponentConfig, { type: "metrics" }> }) {
  const items = Array.isArray(config.items) ? config.items : [];

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-4 flex items-end justify-between">
        <h2 className="text-xl font-black text-slate-950">{config.title ?? "Metrics"}</h2>
        <p className="text-xs font-bold uppercase text-slate-400">from config</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {items.map((item: MetricConfig, index) => {
          const tone = item.tone && toneStyles[item.tone] ? item.tone : "blue";
          return (
            <div key={`${item.label}-${index}`} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-500">{item.label ?? "Metric"}</p>
                  <p className="mt-2 text-3xl font-black text-slate-950">{item.value ?? "--"}</p>
                </div>
                <div className={cn("rounded-lg border p-2", toneStyles[tone])}>
                  <Sparkline values={item.spark} />
                </div>
              </div>
              <p className="mt-4 text-xs font-bold text-slate-500">{item.delta ?? "stable"}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function DataTable({ config }: { config: Extract<ComponentConfig, { type: "table" }> }) {
  const [query, setQuery] = useState("");
  const columns = Array.isArray(config.columns) ? config.columns.filter((column) => column.key && column.label) : [];
  const rows = Array.isArray(config.rows) ? config.rows : [];
  const visibleRows = useMemo(() => {
    const q = query.toLowerCase();
    return rows.filter((row) => Object.values(row).join(" ").toLowerCase().includes(q));
  }, [query, rows]);

  if (config.status === "loading") {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="h-5 w-40 rounded bg-slate-200" />
        <div className="mt-5 space-y-3">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="h-12 rounded-lg bg-slate-100" />
          ))}
        </div>
      </div>
    );
  }

  if (config.status === "error") {
    return <InvalidConfig title={config.title ?? "Table error"} detail={config.errorMessage ?? "The table failed to load."} />;
  }

  if (!columns.length) {
    return <InvalidConfig title="Broken table config" detail="At least one valid column is required." />;
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-200 p-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-lg font-black text-slate-950">{config.title ?? "Table"}</h3>
          <p className="mt-1 text-sm text-slate-500">{config.description}</p>
        </div>
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search rows" className="h-10 rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200" />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead>
            <tr className="bg-slate-50">
              {columns.map((column: TableColumnConfig) => (
                <th key={column.key} className={cn("px-5 py-3 text-left text-xs font-black uppercase text-slate-500", column.align === "right" && "text-right")}>
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {visibleRows.map((row: TableRowConfig, index) => (
              <tr key={index} className="transition hover:bg-cyan-50/50">
                {columns.map((column) => (
                  <td key={`${index}-${column.key}`} className={cn("px-5 py-4 text-sm text-slate-700", column.align === "right" && "text-right font-black text-slate-950")}>
                    {String(row[column.key ?? ""] ?? "-")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DynamicField({ field }: { field: FieldConfig }) {
  if (!field.id || !field.label || !field.type) {
    return <InvalidConfig title="Invalid field" detail="A field needs id, label, and type." />;
  }

  const base = "mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200";

  if (field.type === "text" || field.type === "email" || field.type === "number") {
    return (
      <label className="block">
        <span className="text-sm font-bold text-slate-700">{field.label}</span>
        <input type={field.type} required={field.required} placeholder={field.placeholder} className={base} />
      </label>
    );
  }

  if (field.type === "textarea") {
    return (
      <label className="block">
        <span className="text-sm font-bold text-slate-700">{field.label}</span>
        <textarea rows={4} placeholder={field.placeholder} className={base} />
      </label>
    );
  }

  if (field.type === "select") {
    return (
      <label className="block">
        <span className="text-sm font-bold text-slate-700">{field.label}</span>
        <select className={base} defaultValue="">
          <option value="" disabled>Choose one</option>
          {(field.options ?? []).map((option) => <option key={option}>{option}</option>)}
        </select>
      </label>
    );
  }

  if (field.type === "switch") {
    return (
      <label className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-3">
        <span className="text-sm font-bold text-slate-700">{field.label}</span>
        <input type="checkbox" className="h-5 w-5 accent-cyan-500" />
      </label>
    );
  }

  return <InvalidConfig title="Unsupported field" detail={`The field "${field.label}" uses an unknown type.`} />;
}

function DynamicForm({ config }: { config: Extract<ComponentConfig, { type: "form" }> }) {
  const fields = Array.isArray(config.fields) ? config.fields : [];
  const [submitted, setSubmitted] = useState(false);

  return (
    <form
      className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(true);
      }}
    >
      <h3 className="text-lg font-black text-slate-950">{config.title ?? "Form"}</h3>
      <p className="mt-1 text-sm text-slate-500">{config.description}</p>
      <div className="mt-5 grid gap-4">
        {fields.map((field, index) => <DynamicField key={field.id ?? index} field={field} />)}
      </div>
      {submitted && (
        <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700">
          Configuration accepted. No runtime crash.
        </div>
      )}
      <button className="mt-5 w-full rounded-lg bg-slate-950 px-4 py-3 text-sm font-black text-white transition hover:bg-slate-800">
        {config.submitLabel ?? "Submit"}
      </button>
    </form>
  );
}

function WorkflowBlock({ config }: { config: Extract<ComponentConfig, { type: "workflow" }> }) {
  const items = Array.isArray(config.items) ? config.items : [];
  const colors = {
    complete: "bg-emerald-500",
    running: "bg-cyan-500",
    waiting: "bg-amber-500",
    error: "bg-rose-500",
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-black text-slate-950">{config.title ?? "Workflow"}</h3>
        <div className="mt-5 grid gap-3 md:grid-cols-4">
          {items.map((item, index) => (
            <div key={`${item.label}-${index}`} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className={cn("h-2 w-12 rounded-full", colors[item.status ?? "waiting"])} />
              <p className="mt-4 text-sm font-bold text-slate-800">{item.label ?? "Step"}</p>
              <p className="mt-1 text-xs uppercase text-slate-400">{item.status ?? "waiting"}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SplitBlock({ config }: { config: Extract<ComponentConfig, { type: "split" }> }) {
  const columns = Array.isArray(config.columns) ? config.columns : [];
  return (
    <section id="renderer" className="mx-auto grid max-w-7xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-2 lg:px-8">
      {columns.map((column) => <ConfigBlock key={column.id} config={column} />)}
    </section>
  );
}

function UnknownBlock({ config }: { config: ComponentConfig }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
      <InvalidConfig title="Unknown component" detail={`No renderer is registered for "${config.type}". This block was skipped safely.`} />
    </section>
  );
}

function ConfigBlock({ config }: { config: ComponentConfig }) {
  const type = config.type;

  return (
    <SafeBoundary config={config}>
      {type === "hero" && <HeroBlock config={config as Extract<ComponentConfig, { type: "hero" }>} />}
      {type === "metrics" && <MetricsBlock config={config as Extract<ComponentConfig, { type: "metrics" }>} />}
      {type === "table" && <DataTable config={config as Extract<ComponentConfig, { type: "table" }>} />}
      {type === "form" && <DynamicForm config={config as Extract<ComponentConfig, { type: "form" }>} />}
      {type === "workflow" && <WorkflowBlock config={config as Extract<ComponentConfig, { type: "workflow" }>} />}
      {type === "split" && <SplitBlock config={config as Extract<ComponentConfig, { type: "split" }>} />}
      {!["hero", "metrics", "table", "form", "workflow", "split"].includes(type) && <UnknownBlock config={config} />}
    </SafeBoundary>
  );
}

export function DynamicFrontend({ config }: { config: AppConfig }) {
  return (
    <div className="min-h-screen bg-slate-100">
      <Shell config={config} />
      {config.components.map((component) => <ConfigBlock key={component.id} config={component} />)}
    </div>
  );
}
