"use client";

import dynamic from "next/dynamic";
import type {
  ShiftData,
  Assistent,
  LocationOption,
  UnavailabilityEntry,
  BookedSlot,
} from "./page";

const KalenderApotheekClient = dynamic(
  () => import("./KalenderApotheekClient"),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 flex items-center justify-center text-text-muted text-sm">
        Kalender laden…
      </div>
    ),
  }
);

export default function KalenderApotheekWrapper({
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
  return (
    <KalenderApotheekClient
      shifts={shifts}
      assistants={assistants}
      locations={locations}
      unavailability={unavailability}
      bookedSlots={bookedSlots}
    />
  );
}
