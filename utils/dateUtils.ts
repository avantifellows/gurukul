export function formatSessionTime(dateTimeStr: string) {
    const date = new Date(dateTimeStr);
    const hours = String(date.getUTCHours()).padStart(2, "0");
    const minutes = String(date.getUTCMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
}

export function formatCurrentTime(dateTimeStr: string) {
    const date = new Date(dateTimeStr);
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
}

export function formatQuizSessionTime(dateTimeStr: string) {
    const [time, period] = dateTimeStr.split(' ');
    const [hours, minutes, seconds] = time.split(':');
    let hours24 = parseInt(hours, 10);

    if (period && period.toUpperCase() === 'PM') {
        hours24 += 12;
    }

    const formattedTime = `${String(hours24).padStart(2, "0")}:${minutes}`;
    return formattedTime;
}

export function formatTime(dateTimeStr: string) {
    const [hours, minutes] = dateTimeStr.split(':');
    return `${hours}:${minutes}`;
}
