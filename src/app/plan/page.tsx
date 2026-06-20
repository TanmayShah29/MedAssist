"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarClock, Download, FileText, Link2, Plus, RefreshCw, Stethoscope } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/ui/page-header";
import { ActionItem, CarePlanKind, CarePlanStatus } from "@/components/ui/action-item";
import { InsightCard } from "@/components/ui/insight-card";
import { TimelineItem } from "@/components/ui/timeline-item";
import { TrustCallout } from "@/components/ui/trust-callout";
import { cn } from "@/lib/utils";

type CarePlanItemRecord = {
  id: string;
  title: string;
  reason?: string;
  kind: CarePlanKind;
  status: CarePlanStatus;
  timeframe?: string;
  related_biomarkers?: string[];
  source?: string;
  created_at?: string;
};

type TimelineEvent = {
  id: string;
  title: string;
  detail?: string;
  date?: string;
  type: string;
};

const KIND_OPTIONS: { label: string; value: CarePlanKind }[] = [
  { label: "Ask doctor", value: "ask_doctor" },
  { label: "Monitor", value: "monitor" },
  { label: "Lifestyle experiment", value: "lifestyle" },
  { label: "Retest", value: "retest" },
];

function formatDate(date?: string) {
  if (!date) return undefined;
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function PlanPage() {
  const [items, setItems] = useState<CarePlanItemRecord[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [reason, setReason] = useState("");
  const [kind, setKind] = useState<CarePlanKind>("ask_doctor");

  const activeItems = useMemo(
    () => items.filter((item) => item.status !== "dismissed"),
    [items]
  );
  const doctorItems = activeItems.filter((item) => item.kind === "ask_doctor");
  const trackingItems = activeItems.filter((item) => item.kind !== "ask_doctor");

  const loadPlan = async () => {
    setLoading(true);
    try {
      const [planRes, timelineRes] = await Promise.all([
        fetch("/api/care-plan"),
        fetch("/api/timeline"),
      ]);
      const planData = await planRes.json();
      const timelineData = await timelineRes.json();
      if (!planRes.ok) throw new Error(planData.error || "Could not load plan");
      setItems(planData.carePlan || []);
      setTimeline(timelineData.timeline || []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load your plan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlan();
  }, []);

  const addItem = async () => {
    if (!title.trim()) {
      toast.error("Add a short action title first.");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/care-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, reason, kind }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not save action");
      setItems((prev) => [data.item, ...prev]);
      setTitle("");
      setReason("");
      setKind("ask_doctor");
      toast.success("Action added to your plan.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not add action");
    } finally {
      setSaving(false);
    }
  };

  const toggleSavedItem = async (item: CarePlanItemRecord) => {
    if (item.id.startsWith("generated-")) {
      toast.message("Generated suggestions can be added as saved actions in a later step.");
      return;
    }

    const nextStatus = item.status === "done" ? "not_started" : "done";
    setItems((prev) => prev.map((candidate) => candidate.id === item.id ? { ...candidate, status: nextStatus } : candidate));

    try {
      const response = await fetch(`/api/care-plan/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not update action");
    } catch (error) {
      setItems((prev) => prev.map((candidate) => candidate.id === item.id ? item : candidate));
      toast.error(error instanceof Error ? error.message : "Could not update action");
    }
  };

  const exportPrep = async () => {
    try {
      const response = await fetch("/api/doctor-prep/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ format: "json" }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not create export");
      toast.success("Doctor prep export created.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not create export");
    }
  };

  const createShareLink = async () => {
    try {
      const response = await fetch("/api/share-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Doctor prep pack", expiresInDays: 7 }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not create share link");
      toast.success(`Share link created: ${data.url}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not create share link");
    }
  };

  return (
    <div className="app-page">
      <div className="app-container">
        <PageHeader
          eyebrow="Longitudinal companion"
          title="Plan"
          description="Turn lab insights into doctor questions, monitoring tasks, retest reminders, and lightweight context logs."
          actions={
            <>
              <button onClick={loadPlan} disabled={loading} className="btn btn-secondary btn-sm disabled:opacity-50">
                <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                Refresh
              </button>
              <button onClick={exportPrep} className="btn btn-primary btn-sm">
                <Download className="h-4 w-4" />
                Export prep
              </button>
            </>
          }
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,0.9fr)]">
          <main className="flex min-w-0 flex-col gap-6">
            <section className="app-panel p-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#78716C]">Add action</p>
                  <h2 className="mt-1 text-xl font-bold text-[#1C1917]">What should this plan help you remember?</h2>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  className="input-base"
                  placeholder="Ask about glucose trend"
                />
                <select value={kind} onChange={(event) => setKind(event.target.value as CarePlanKind)} className="input-base">
                  {KIND_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                <textarea
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  className="input-base min-h-24 md:col-span-2"
                  placeholder="Why it matters, what context to bring, or when to revisit it."
                />
              </div>
              <button onClick={addItem} disabled={saving} className="mt-4 btn btn-primary disabled:opacity-60">
                <Plus className="h-4 w-4" />
                {saving ? "Adding..." : "Add to plan"}
              </button>
            </section>

            <section className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#78716C]">Doctor prep</p>
                  <h2 className="text-xl font-bold text-[#1C1917]">Questions and visit tasks</h2>
                </div>
                <span className="rounded-full border border-sky-100 bg-sky-50 px-3 py-1 text-xs font-bold text-sky-700">
                  {doctorItems.length} items
                </span>
              </div>
              {loading ? (
                <div className="app-panel p-5 text-sm text-[#57534E]">Loading your plan...</div>
              ) : doctorItems.length ? (
                doctorItems.map((item) => (
                  <ActionItem
                    key={item.id}
                    title={item.title}
                    reason={item.reason}
                    kind={item.kind}
                    status={item.status}
                    timeframe={item.timeframe}
                    related={item.related_biomarkers}
                    onToggle={() => toggleSavedItem(item)}
                  />
                ))
              ) : (
                <InsightCard title="No doctor tasks yet" description="Add a question above or upload a report to generate patient-safe suggestions." />
              )}
            </section>

            <section className="space-y-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#78716C]">Track next</p>
                <h2 className="text-xl font-bold text-[#1C1917]">Monitoring, lifestyle, and retest reminders</h2>
              </div>
              {trackingItems.length ? (
                trackingItems.map((item) => (
                  <ActionItem
                    key={item.id}
                    title={item.title}
                    reason={item.reason}
                    kind={item.kind}
                    status={item.status}
                    timeframe={item.timeframe}
                    related={item.related_biomarkers}
                    onToggle={() => toggleSavedItem(item)}
                  />
                ))
              ) : (
                <InsightCard
                  tone="info"
                  icon={<CalendarClock className="h-4 w-4" />}
                  title="Your next tracking tasks will appear here"
                  description="MedAssist will add retest and monitoring suggestions as you upload more reports."
                />
              )}
            </section>
          </main>

          <aside className="flex min-w-0 flex-col gap-5">
            <InsightCard
              tone="info"
              icon={<FileText className="h-4 w-4" />}
              title="Doctor prep pack"
              description="Create a focused summary with latest report context, top questions, active actions, and key labs."
              action="Create export"
              onClick={exportPrep}
            />
            <InsightCard
              tone="neutral"
              icon={<Link2 className="h-4 w-4" />}
              title="Share with a clinician"
              description="Create a revocable share link for selected prep sections. Links expire by default."
              action="Create link"
              onClick={createShareLink}
            />
            <section className="app-panel p-5">
              <div className="mb-4 flex items-center gap-2">
                <Stethoscope className="h-4 w-4 text-sky-500" />
                <h2 className="text-base font-bold text-[#1C1917]">Health timeline</h2>
              </div>
              {timeline.length ? (
                timeline.slice(0, 7).map((event) => (
                  <TimelineItem
                    key={event.id}
                    title={event.title}
                    detail={event.detail}
                    date={formatDate(event.date)}
                    icon={<FileText className="h-4 w-4" />}
                  />
                ))
              ) : (
                <p className="text-sm leading-relaxed text-[#57534E]">
                  Upload reports, add actions, and export prep packs to build your longitudinal record.
                </p>
              )}
            </section>
            <TrustCallout />
          </aside>
        </div>
      </div>
    </div>
  );
}
