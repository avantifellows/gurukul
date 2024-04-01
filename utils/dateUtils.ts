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
    } else if (dateTimeStr.includes('T') && dateTimeStr.includes('Z')) {
        const isoDate = new Date(dateTimeStr);
        date = new Date(2000, 0, 1, isoDate.getUTCHours(), isoDate.getUTCMinutes());
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

export function formatQuizSessionTime(dateTimeString: string): string {
    const dateTime = new Date(dateTimeString);
    const hours = dateTime.getUTCHours().toString().padStart(2, '0');
    const minutes = dateTime.getUTCMinutes().toString().padStart(2, '0');
    const time = hours + ':' + minutes;
    return time;
}

export function formatTime(dateTimeStr: string) {
    const time = new Date(`2000-01-01T${dateTimeStr}`);
    return time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

export function format12HrQuizSessionTime(time: string): string {
    const isoDate = new Date(time);
    const hours = isoDate.getUTCHours();
    const minutes = isoDate.getUTCMinutes();
    const period = hours >= 12 ? 'PM' : 'AM';
    let formattedHours = hours % 12;
    formattedHours = formattedHours ? formattedHours : 12;
    const formattedMinutes = String(minutes).padStart(2, '0');
    return `${formattedHours}:${formattedMinutes} ${period}`;
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

