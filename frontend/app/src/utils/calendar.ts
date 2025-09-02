import { Calendar } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
//Add plugin to select calendar time
import timeGridPlugin from "@fullcalendar/timegrid";
//Add plugin to select dates
import interactionPlugin from "@fullcalendar/interaction";

export function initCalendar(id: string) {
  const calendarEl = document.getElementById(id);
  if (calendarEl) {
    const calendar = new Calendar(calendarEl, {
      plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
      initialView: "dayGridMonth",
      // Buttons to change view
      headerToolbar: {
        left: "prev,next today",
        center: "title",
        right: "dayGridMonth,timeGridWeek",
      },
      //Hour Configuration
      slotMinTime: "08:00:00",
      slotMaxTime: "20:00:00",

      //Allow selection
      selectable: true,
      selectMirror: true,

      // Function to handle selection
      select: function (info) {
        if (calendar.view.type !== "timeGridWeek") {
          return;
        }
        //Remove previous selections
        calendar.getEvents().forEach((ev) => {
          if (ev.extendedProps.isSelection) {
            ev.remove();
          }
        });
        //Add event weekly
        calendar.addEvent({
          title: "Selected",
          start: info.start,
          end: info.end,
          backgroundColor: "#8b5e3c",
          borderColor: "#8b5e3c",
          extendedProps: { isSelection: true },
        });
        dispatchSelectionDate(info.start.toISOString(), info.end.toISOString());
      },

      //Date booking message
      events: [
        {
          title: "Booking",
          start: "2025-09-04T23:00:00.000Z",
          end: "2025-09-04T23:30:00.000Z",
        },
      ],
      //Date click event
      dateClick: function (info: { dateStr: string }) {
        if (calendar.view.type === "dayGridMonth") {
          calendar.changeView("timeGridWeek", info.dateStr);
        }
      },
    });
    calendar.render();
    return calendar;
  }
}

export function dispatchSelectionDate(start: string, end: string) {
  const event = new CustomEvent("selected-date", {
    detail: {
      start,
      end,
    },
  });
  document.dispatchEvent(event);
}

export function watchForSelectionDate(
  callback: (start: string, end: string) => void
) {
  document.addEventListener("selected-date", (event: Event) => {
    const customEvent = event as CustomEvent;
    const { start, end } = customEvent.detail;
    callback(start, end);
  });
}
