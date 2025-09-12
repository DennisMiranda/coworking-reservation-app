/**
 * Get reservation date
 *
 * @param {string} start - Start date
 * @param {string} end - End date
 * @param {number} timezone - Timezone in hours
 */
export const getReservationDate = (
  start: string,
  end: string,
  timezone: number = 0
) => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  startDate.setHours(startDate.getHours() + timezone);
  endDate.setHours(endDate.getHours() + timezone);

  const timeStart = startDate.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  const timeEnd = endDate.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  const day = startDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return {
    day,
    timeStart,
    timeEnd,
  };
};
