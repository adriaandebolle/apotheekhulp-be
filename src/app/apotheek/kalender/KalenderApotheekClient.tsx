"use client";

import { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin, { type DateClickArg } from "@fullcalendar/interaction";
import type { EventClickArg, EventInput } from "@fullcalendar/core";
import nlLocale from "@fullcalendar/core/locales/nl";
import { Button } from "@/components/ui/Button";
import type {
  ShiftData,
  Assistent,
  LocationOption,
  UnavailabilityEntry,
  BookedSlot,
} from "./page";
import ShiftAddModal from "./ShiftAddModal";

const STATUS_COLOR: Record<
  string,
  { bg: string; border: string; text: string }
> = {
  approved:          { bg: "#28a745", border: "#28a745", text: "#fff" },
  pending_apotheek:  { bg: "#fd7e14", border: "#fd7e14", text: "#fff" },
  pending_assistant: { bg: "#6c757d", border: "#6c757d", text: "#fff" },
  denied:            { bg: "#f8d7da", border: "#dc3545", text: "#444" },
};

const STATUS_LABEL: Record<string, string> = {
  approved:          "Bevestigd",
  pending_apotheek:  "Wacht op goedkeuring",
  pending_assistant: "Wacht op assistent",
  denied:            "Geweigerd",
};

type PopoverInfo = {
  shift: ShiftData;
  x: number;
  y: number;
};

export default function KalenderApotheekClient({
  shifts,
  assistants,
  locations,
  unavailability,
  bookedSlots,
}: {
  shifts: ShiftData[];
  assistants: Assistent[];
  locations: LocationOption[];
  unavailability: UnavailabilityEntry[];
  bookedSlots: BookedSlot[];
}) {
  const [addDate, setAddDate]   = useState<string | null>(null);
  const [popover, setPopover]   = useState<PopoverInfo | null>(null);

  const events: EventInput[] = shifts.map((s) => {
    const c = STATUS_COLOR[s.status] ?? STATUS_COLOR.pending_assistant;
    return {
      id:              s.id,
      title:           s.assistantName,
      start:           `${s.date}T${s.startTime}`,
      end:             `${s.date}T${s.endTime}`,
      backgroundColor: c.bg,
      borderColor:     c.border,
      textColor:       c.text,
      extendedProps:   { shift: s },
    };
  });

  function handleDateClick(arg: DateClickArg) {
    setPopover(null);
    setAddDate(arg.dateStr.slice(0, 10));
  }

  function handleEventClick(arg: EventClickArg) {
    const shift = arg.event.extendedProps.shift as ShiftData;
    const rect  = arg.el.getBoundingClientRect();
    setPopover({
      shift,
      x: rect.left + window.scrollX,
      y: rect.bottom + window.scrollY + 4,
    });
  }

  return (
    <>
      <div
        className="flex flex-col h-full overflow-hidden relative"
        onClick={() => setPopover(null)}
      >
        <div className="flex items-center justify-between px-8 py-6 border-b border-border shrink-0">
          <h1 className="text-xl font-bold text-text">Kalender</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-4 text-xs text-text-muted">
              {Object.entries(STATUS_LABEL).map(([key, label]) => (
                <span key={key} className="flex items-center gap-1.5">
                  <span
                    className="inline-block w-3 h-3 rounded-sm"
                    style={{ background: STATUS_COLOR[key]?.bg }}
                  />
                  {label}
                </span>
              ))}
            </div>
            <Button
              size="sm"
              onClick={() => setAddDate(new Date().toISOString().split("T")[0])}
            >
              + Shift inplannen
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden px-4 pb-4 pt-2">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
            locale={nlLocale}
            initialView="dayGridMonth"
            headerToolbar={{
              left:   "prev,next today",
              center: "title",
              right:  "dayGridMonth,timeGridWeek,listMonth",
            }}
            height="100%"
            events={events}
            dateClick={handleDateClick}
            eventClick={handleEventClick}
            editable={false}
            selectable={false}
          />
        </div>

        {popover && (
          <div
            className="fixed z-50 bg-surface border border-border rounded-xl shadow-lg p-4 text-sm w-64"
            style={{
              top:  popover.y,
              left: Math.min(popover.x, window.innerWidth - 280),
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <p className="font-semibold text-text mb-1">
              {popover.shift.assistantName}
            </p>
            <p className="text-text-muted mb-1">{popover.shift.locationName}</p>
            <p className="text-text-muted mb-1">
              {new Date(popover.shift.date).toLocaleDateString("nl-BE", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </p>
            <p className="text-text-muted mb-2">
              {popover.shift.startTime.slice(0, 5)}–
              {popover.shift.endTime.slice(0, 5)}
              {popover.shift.breakMinutes > 0 &&
                ` (${popover.shift.breakMinutes} min pauze)`}
            </p>
            <span
              className="inline-block text-xs px-2 py-0.5 rounded-full"
              style={{
                background: STATUS_COLOR[popover.shift.status]?.bg,
                color:      STATUS_COLOR[popover.shift.status]?.text,
              }}
            >
              {STATUS_LABEL[popover.shift.status] ?? popover.shift.status}
            </span>
          </div>
        )}
      </div>

      {addDate && (
        <ShiftAddModal
          date={addDate}
          assistants={assistants}
          locations={locations}
          unavailability={unavailability}
          bookedSlots={bookedSlots}
          onClose={() => setAddDate(null)}
        />
      )}
    </>
  );
}
