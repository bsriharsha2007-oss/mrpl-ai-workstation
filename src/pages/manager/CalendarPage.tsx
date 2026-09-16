import { Badge2, StatusBadge } from "@/components/common/Badges";
import { GlassPanel, PanelHeading } from "@/components/common/GlassPanel";
import { PageHeader } from "@/components/common/PageHeader";
import { Calendar } from "@/components/ui/calendar";
import { useCalendar } from "@/hooks/use-queries";
import { format, parseISO } from "date-fns";
import { formatDate } from "@/utils/format";
import { CalendarDays, Clock, MapPin, UserRound } from "lucide-react";
import { useMemo, useState } from "react";

/** Calendar — shutdowns, audits, training drills and reviews. */
export default function CalendarPage() {
  const events = useCalendar();
  const [month, setMonth] = useState<Date>(new Date());
  const [selected, setSelected] = useState<Date | undefined>(new Date());

  const list = events.data ?? [];

  const eventDates = useMemo(
    () => list.map((event) => parseISO(event.date)),
    [list],
  );

  const selectedEvents = useMemo(
    () =>
      selected
        ? list.filter(
            (event) => format(parseISO(event.date), "yyyy-MM-dd") === format(selected, "yyyy-MM-dd"),
          )
        : [],
    [list, selected],
  );

  return (
    <div className="space-y-4">
      <PageHeader
        title="Department calendar"
        description="Inspections, shutdown windows, statutory audits, training drills and review meetings in one operating calendar."
        crumbs={[{ label: "Workflow" }, { label: "Calendar" }]}
        actions={
          <>
            <Badge2 tone="primary">{list.length} scheduled events</Badge2>
            <Badge2 tone="warning">
              {list.filter((event) => event.status === "tentative").length} tentative
            </Badge2>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[340px_minmax(0,1fr)]">
        <GlassPanel padded={false} className="p-4">
          <PanelHeading
            title="Operating calendar"
            description="Highlighted dates carry scheduled events."
            icon={<CalendarDays className="size-4" />}
          />
          <div className="mt-3 flex justify-center">
            <Calendar
              mode="single"
              month={month}
              onMonthChange={setMonth}
              selected={selected}
              onSelect={setSelected}
              modifiers={{ event: eventDates }}
              modifiersClassNames={{ event: "relative after:absolute after:bottom-1 after:left-1/2 after:size-1 after:-translate-x-1/2 after:rounded-full after:bg-primary" }}
              className="bg-transparent"
            />
          </div>
          <div className="mt-3 flex flex-wrap justify-center gap-1.5">
            <Badge2 tone="primary">Inspection</Badge2>
            <Badge2 tone="danger">Shutdown</Badge2>
            <Badge2 tone="warning">Audit</Badge2>
            <Badge2 tone="info">Training</Badge2>
          </div>
        </GlassPanel>

        <div className="space-y-4">
          <GlassPanel>
            <PanelHeading
              title={selected ? formatDate(selected.toISOString()) : "Select a date"}
              description={
                selectedEvents.length > 0
                  ? `${selectedEvents.length} event${selectedEvents.length > 1 ? "s" : ""} scheduled`
                  : "No events on this date."
              }
              icon={<Clock className="size-4" />}
            />
            <div className="mt-4 space-y-2">
              {selectedEvents.map((event) => (
                <div key={event.id} className="glass-inset rounded-lg p-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="text-xs font-semibold text-foreground">{event.title}</p>
                    <div className="flex items-center gap-2">
                      <Badge2 tone="info">{event.type}</Badge2>
                      <StatusBadge status={event.status} />
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="size-3" />
                      {event.time}
                    </span>
                    <span className="flex items-center gap-1">
                      <UserRound className="size-3" />
                      {event.owner}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="size-3" />
                      {event.area}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </GlassPanel>

          <GlassPanel>
            <PanelHeading
              title="Full schedule"
              description="Every committed event on the department calendar."
              icon={<CalendarDays className="size-4" />}
            />
            <ul className="mt-4 space-y-2">
              {list.map((event) => (
                <li key={event.id} className="glass-inset flex flex-wrap items-center justify-between gap-2 rounded-lg px-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-[11px] font-medium text-foreground">
                      {event.title}
                    </p>
                    <p className="truncate text-[10px] text-muted-foreground">
                      {formatDate(event.date)} · {event.time} · {event.owner} · {event.area}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge2 tone="info">{event.type}</Badge2>
                    <StatusBadge status={event.status} />
                  </div>
                </li>
              ))}
            </ul>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
}
