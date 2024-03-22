export function formatSessionTime(dateTimeStr: string) {
    let date;
    if (dateTimeStr.includes('AM') || dateTimeStr.includes('PM')) {
        const [time, period] = dateTimeStr.split(' ');
        const [hoursStr, minutesStr] = time.split(':');
        let hours = parseInt(hoursStr);
        const minutes = parseInt(minutesStr);

        if (period === 'PM' && hours < 12) {
            hours += 12;
        } else if (period === 'AM' && hours === 12) {
            hours = 0;
        }

        date = new Date(2000, 0, 1, hours, minutes);
    } else {
        const [hours, minutes, seconds] = dateTimeStr.split(':').map(Number);
        date = new Date(2000, 0, 1, hours, minutes, seconds);
    }
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
}

export function formatCurrentTime(dateTimeStr: string) {
    const date = new Date(dateTimeStr);
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
}

export function formatQuizSessionTime(dateTimeStr: string) {
    const time = new Date(`01/01/2000 ${dateTimeStr}`);
    return time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export function formatTime(dateTimeStr: string) {
    const time = new Date(`2000-01-01T${dateTimeStr}`);
    return time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

export function isSessionActive(endTime: string): boolean {
    const currentTime = new Date();
    const currentTimeStr = formatCurrentTime(currentTime.toISOString());
    const sessionEndTime = new Date(`2000-01-01T${endTime}`);
    const currentTimeObj = new Date(`2000-01-01T${currentTimeStr}`);
    return sessionEndTime.getTime() > currentTimeObj.getTime();
}

export function formatDate(dateStr: string): string {
    const [year, month, day] = dateStr.split('-');
    return `${day}-${month}-${year}`;
}

