import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { completeBooking, fetchCalendar } from "../api/studiesApi";
import type { CalendarEvent, UserRole } from "../types";

interface ScheduleCalendarProps {
  role: UserRole;
}

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

function dateKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function ScheduleCalendar({ role }: ScheduleCalendarProps) {
  const [month, setMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completing, setCompleting] = useState<string | null>(null);

  useEffect(() => {
    fetchCalendar()
      .then(({ events: calendarEvents }) => setEvents(calendarEvents))
      .catch(() => setError("Couldn't load calendar."))
      .finally(() => setIsLoading(false));
  }, []);

  const eventsByDate = useMemo(() => {
    const grouped = new Map<string, CalendarEvent[]>();
    for (const event of events) {
      const key = dateKey(new Date(event.start_time));
      grouped.set(key, [...(grouped.get(key) ?? []), event]);
    }
    return grouped;
  }, [events]);

  const days = useMemo(() => {
    const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
    const gridStart = new Date(firstDay);
    gridStart.setDate(firstDay.getDate() - firstDay.getDay());
    const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    const cellCount = firstDay.getDay() + daysInMonth <= 35 ? 35 : 42;

    return Array.from({ length: cellCount }, (_, index) => {
      const day = new Date(gridStart);
      day.setDate(gridStart.getDate() + index);
      return day;
    });
  }, [month]);

  function changeMonth(offset: number) {
    setMonth((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));
  }

  async function handleComplete(bookingId: string) {
    setCompleting(bookingId);
    try {
      await completeBooking(bookingId);
      setEvents((current) =>
        current.map((event) => ({
          ...event,
          bookings: event.bookings.map((booking) =>
            booking.booking_id === bookingId ? { ...booking, status: "completed" } : booking
          ),
        }))
      );
    } catch {
      setError("Couldn't complete booking.");
    } finally {
      setCompleting(null);
    }
  }

  return (
    <section className="min-h-80 w-full rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Calendar</h2>
          <p className="text-xs text-slate-500">
            {role === "participant" ? "Your bookings" : "Study time slots"}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Previous month"
            onClick={() => changeMonth(-1)}
            className="rounded-md p-1.5 text-slate-600 hover:bg-slate-100"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <p className="min-w-24 text-center text-xs font-medium text-slate-800">
            {month.toLocaleDateString(undefined, { month: "short", year: "numeric" })}
          </p>
          <button
            type="button"
            aria-label="Next month"
            onClick={() => changeMonth(1)}
            className="rounded-md p-1.5 text-slate-600 hover:bg-slate-100"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {error ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>
      ) : isLoading ? (
        <div className="h-56 animate-pulse rounded-lg bg-slate-100" />
      ) : (
        <>
          <div className="grid grid-cols-7">
            {WEEKDAYS.map((day, index) => (
              <div key={`${day}-${index}`} className="py-1 text-center text-[11px] font-medium text-slate-400">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days.map((day) => {
              const dayEvents = eventsByDate.get(dateKey(day)) ?? [];
              const hasEvents = dayEvents.length > 0;
              const isCurrentMonth = day.getMonth() === month.getMonth();
              const alignTooltipRight = day.getDay() >= 4;

              return (
                <div key={day.toISOString()} className="group relative">
                  <button
                    type="button"
                    disabled={!hasEvents}
                    aria-label={
                      hasEvents
                        ? `${day.toLocaleDateString()}: ${dayEvents.length} scheduled`
                        : day.toLocaleDateString()
                    }
                    className={`flex aspect-square w-full items-center justify-center rounded-md text-xs ${
                      hasEvents
                        ? "bg-[#1F6F6B] font-semibold text-white hover:bg-[#195954] focus:outline-none focus:ring-2 focus:ring-[#1F6F6B] focus:ring-offset-1"
                        : isCurrentMonth
                          ? "text-slate-700"
                          : "text-slate-300"
                    }`}
                  >
                    {day.getDate()}
                  </button>

                  {hasEvents && (
                    <div
                      role="tooltip"
                      className={`absolute top-full z-20 mt-1 hidden w-64 rounded-lg border border-slate-200 bg-white p-3 text-left shadow-lg group-hover:block group-focus-within:block ${
                        alignTooltipRight ? "right-0" : "left-0"
                      }`}
                    >
                      <p className="mb-2 text-xs font-semibold text-slate-900">
                        {day.toLocaleDateString(undefined, {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                      <div className="max-h-56 space-y-3 overflow-y-auto">
                        {dayEvents.map((event) => (
                          <div key={event.time_slot_id} className="text-xs text-slate-600">
                            <p className="font-semibold text-[#195954]">{event.study_title}</p>
                            <p>{formatTime(event.start_time)} - {formatTime(event.end_time)}</p>
                            <p>{event.is_remote ? "Remote" : event.location || "Location not set"}</p>
                            {role === "participant" && (
                              <p className={event.booking_status === "completed" ? "font-medium text-emerald-700" : ""}>
                                {event.booking_status === "completed" ? "Completed" : "Session booked"}
                              </p>
                            )}
                            {role === "researcher" && (
                              <>
                                <p className="font-medium text-slate-700">
                                  {event.booked_count}/{event.capacity} booked
                                </p>
                                {event.bookings.map((booking) => (
                                  <div key={booking.booking_id} className="mt-1 flex items-center justify-between gap-2">
                                    <span>{booking.participant_name}</span>
                                    {booking.status === "confirmed" ? (
                                      <button
                                        type="button"
                                        disabled={completing === booking.booking_id}
                                        onClick={() => handleComplete(booking.booking_id)}
                                        className="rounded bg-[#1F6F6B] px-2 py-1 text-[11px] text-white disabled:opacity-50"
                                      >
                                        {completing === booking.booking_id ? "Saving…" : "Complete"}
                                      </button>
                                    ) : (
                                      <span className="text-emerald-700">Completed</span>
                                    )}
                                  </div>
                                ))}
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}
