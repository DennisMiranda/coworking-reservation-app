export const getReservationDate = (start: string, end: string) => {
  const timeStart = new Date(start).toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  const timeEnd = new Date(end).toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  const day = new Date(start).toLocaleDateString("en-US", {
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
