import { useEffect, useState } from "react";
import { bookTimeSlot, fetchAvailableTimeSlots } from "../api/studiesApi";
import type { Study, TimeSlot } from "../types";

export function BookingModal({
  study,
  onClose,
  onBooked,
}: {
  study: Study;
  onClose: () => void;
  onBooked: () => void;
}) {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selected, setSelected] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAvailableTimeSlots(study.id)
      .then((response) => setSlots(response.timeSlots))
      .catch(() => setError("Could not load sessions."));
  }, [study.id]);

  async function book() {
    try {
      await bookTimeSlot(study.id, selected);
      onBooked();
    } catch {
      setError("This session could not be booked.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold">Choose a time</h2>
        <p className="text-sm text-slate-500">{study.title}</p>

        <div className="mt-4 space-y-2">
          {slots.map((slot) => {
            const remaining = slot.capacity - (slot.booked_count ?? 0);
            return (
              <label key={slot.id} className="flex gap-3 rounded-md border p-3 text-sm">
                <input
                  type="radio"
                  name="slot"
                  disabled={remaining === 0}
                  checked={selected === slot.id}
                  onChange={() => setSelected(slot.id)}
                />
                <span>
                  {new Date(slot.start_time).toLocaleString()} ·{" "}
                  {remaining > 0 ? `${remaining} spots left` : "Full"}
                </span>
              </label>
            );
          })}
          {slots.length === 0 && <p className="text-sm text-slate-500">No sessions available.</p>}
        </div>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-md border px-4 py-2 text-sm">Cancel</button>
          <button
            onClick={book}
            disabled={!selected}
            className="rounded-md bg-[#1F6F6B] px-4 py-2 text-sm text-white disabled:opacity-50"
          >
            Book
          </button>
        </div>
      </div>
    </div>
  );
}
