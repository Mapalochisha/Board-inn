export function getSlotDateTime(slotDate: string, startTime: string): Date {
  const [year, month, day] = slotDate.split("-").map(Number);
  const [hours, minutes] = startTime.split(":").map(Number);
  return new Date(year, month - 1, day, hours, minutes);
}

export function isWithin24Hours(slotDate: string, startTime: string): boolean {
  const slotDateTime = getSlotDateTime(slotDate, startTime);
  const now = new Date();
  const diffInMs = slotDateTime.getTime() - now.getTime();
  const diffInHours = diffInMs / (1000 * 60 * 60);
  return diffInHours >= 0 && diffInHours <= 24;
}

export function formatSlotTime(startTime: string, endTime: string): string {
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
  };

  return `${formatTime(startTime)} – ${formatTime(endTime)}`;
}

export function canRenterCancel(bookingStatus: string): boolean {
  return bookingStatus === "pending" || bookingStatus === "confirmed";
}
