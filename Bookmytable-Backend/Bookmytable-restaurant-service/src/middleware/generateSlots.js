export function generateSlots({
  open,
  close,
  breaks,
  interval,
  duration,
}) {
  const slots = [];

  let current = open;

  while (current + duration <= close) {
    const slotStart = current;
    const slotEnd = current + duration;

    const isInBreak = breaks.some(
      (b) => slotStart < b.end && slotEnd > b.start
    );

    if (!isInBreak) {
      slots.push({
        startTime: slotStart,
        endTime: slotEnd,
      });
    }

    current += interval;
  }

  return slots;
}