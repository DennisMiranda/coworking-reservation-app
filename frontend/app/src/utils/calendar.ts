import { Calendar } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";

export function initCalendar(id: string) {
  const calendarEl = document.getElementById(id);
  if (calendarEl) {
    const calendar = new Calendar(calendarEl, {
      plugins: [dayGridPlugin],
      initialView: "dayGridMonth",
      events: [
        { title: "Booking", start: new Date().toISOString().split("T")[0] },
      ],
      // height: "100%",
    });
    calendar.render();
    return calendar;
  }
}
