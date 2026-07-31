import { Resend } from "resend";
import type { BookingInvite } from "../types/index.js";

const formatDate = (date: string) =>
  new Date(date).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

export async function sendBookingInvite(invite: BookingInvite) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;
  const resend = new Resend(apiKey);

  const location = invite.location || "Remote";
  const calendarUrl = new URL("https://calendar.google.com/calendar/render");
  calendarUrl.search = new URLSearchParams({
    action: "TEMPLATE",
    text: invite.study_title,
    dates: `${formatDate(invite.start_time)}/${formatDate(invite.end_time)}`,
    details: `ResearchConnect session with ${invite.participant_name} and ${invite.researcher_name}`,
    location,
  }).toString();

  await Promise.all(
    [
      ["participant", invite.participant_email],
      ["researcher", invite.researcher_email],
    ].map(async ([recipient, email]) => {
      const { error } = await resend.emails.send(
        {
          from: "ResearchConnect <bookings@researchconnect.tech>",
          to: email,
          subject: `Booking confirmed: ${invite.study_title}`,
          html: `<p>Your booking is confirmed.</p><p><a href="${calendarUrl.toString().replace(/&/g, "&amp;")}">Add to Google Calendar</a></p>`,
        },
        { idempotencyKey: `booking-${invite.booking_id}-${recipient}` }
      );
      if (error) throw new Error(error.message);
    })
  );
}
