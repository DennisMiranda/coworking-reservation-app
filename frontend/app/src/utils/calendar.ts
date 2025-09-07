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
        left: "prev,next",
        center: "title",
        right: "dayGridMonth,timeGridWeek",
      },

      // Fixed week count to display 4 or 5 weeks
      fixedWeekCount: false,

      //Hour Configuration
      slotMinTime: "08:00:00",
      slotMaxTime: "20:00:00",

      //Allow selection
      selectable: true,
      selectMirror: true,

      // Block previous days
      datesSet: (info) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const prevButton = calendarEl.querySelector(
          ".fc-prev-button"
        ) as HTMLButtonElement;
        if (info.start < new Date(today.getFullYear(), today.getMonth(), 1)) {
          prevButton.setAttribute("disabled", "true");
        } else {
          prevButton.removeAttribute("disabled");
        }
      },

      // Restringir selección
      selectAllow: (selectInfo) => {
        const now = new Date();
        const start = selectInfo.start;

        // No permitir fechas pasadas
        if (start < now) return false;

        return true;
      },

      // Colorear días pasados en gris
      dayCellClassNames: (arg) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (arg.date < today) {
          return ["fc-day-disabled"];
        }
        return [];
      },

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
          start: new Date().setHours(8, 0, 0, 0),
          end: (function () {
            const now = new Date();
            return now.getMinutes() < 30
              ? now.setHours(now.getHours(), 30, 0, 0)
              : now.setHours(now.getHours() + 1, 0, 0, 0);
          })(),
          backgroundColor: "#d6d2d2ff",
          display: "background",
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
