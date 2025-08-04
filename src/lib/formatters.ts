export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
}

export function formatKoreanNumber(num: number): string {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + "만";
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + "천";
  }
  return num.toString();
}

export function formatDuration(duration: string): string {
  // Convert ISO 8601 duration to readable format
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return duration;
  
  const hours = parseInt(match[1] || "0");
  const minutes = parseInt(match[2] || "0");
  const seconds = parseInt(match[3] || "0");
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  } else {
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(date));
}

export function getPerformanceBadge(level: string) {
  switch (level) {
    case "great":
      return { text: "Great!!", color: "bg-green-500" };
    case "good":
      return { text: "Good", color: "bg-yellow-500" };
    default:
      return { text: "보통", color: "bg-gray-500" };
  }
}
