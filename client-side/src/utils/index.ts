
export const formatHourToDate = (hour: number): string => {
  const hourStr = hour.toString();
  const year = hourStr.substring(0, 4);
  const month = hourStr.substring(4, 6);
  const day = hourStr.substring(6, 8);
  const hourPart = hourStr.substring(8, 10);
  
  return `${year}-${month}-${day}T${hourPart}:00:00`;
};

export const formatTemperature = (temp: number): string => {
    if (temp === null || temp === undefined) {
        return 'N/A';
    }

    return `${temp} °C`;
};

export const formatDateTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const generateHourRange = (hoursBack: number = 24): { from: number; to: number } => {
  const now = new Date();
  const fromDate = new Date(now.getTime() - (hoursBack * 60 * 60 * 1000));
  
  const formatToHour = (date: Date): number => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    return parseInt(`${year}${month}${day}${hour}`);
  };
  
  return {
    from: formatToHour(fromDate),
    to: formatToHour(now),
  };
};

export const decodeJWT = (token: string): any => {
  return JSON.parse(atob(token.split('.')[1]));
};
