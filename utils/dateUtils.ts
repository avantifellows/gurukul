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

export function format12HrSessionTime(time: string): string {
    const isoDate = new Date(time);
    const hours = isoDate.getUTCHours();
    const minutes = isoDate.getUTCMinutes();
    const period = hours >= 12 ? 'PM' : 'AM';
    let formattedHours = hours % 12;
    formattedHours = formattedHours ? formattedHours : 12;
    const formattedMinutes = String(minutes).padStart(2, '0');
    return `${formattedHours}:${formattedMinutes} ${period}`;
}

// IST is the wall-clock basis for all session start/end times the backend returns
// (they arrive as IST-local values tagged with a literal "Z"). Used to express
// "now" on the same basis when comparing full timestamps.
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

/**
 * Whether a session's response window is still open.
 *
 * Accepts the FULL end timestamp (e.g. "2026-06-30T17:43:30Z") and compares it
 * date-and-time-aware against now. Previously this compared only the time-of-day
 * (both sides pinned to 2000-01-01), which silently treated any session whose end
 * clock-time had already passed *today* as ended — even when the window actually
 * runs into tomorrow. That hid every continuous / overnight session (24h windows,
 * teacher-feedback forms, late-evening tests) once the wall clock passed the end's
 * HH:MM, despite ~hours still remaining.
 *
 * The end string is IST wall-clock tagged "Z", so new Date(endTime).getTime() is
 * "IST as if UTC"; we shift real-now by +IST so both sides share that basis.
 */
export function isSessionActive(endTime: string): boolean {
    const sessionEndTime = new Date(endTime).getTime();
    const nowSameBasis = Date.now() + IST_OFFSET_MS;
    return sessionEndTime > nowSameBasis;
}

export function formatDate(dateStr: string): string {
    const [year, month, day] = dateStr.split('-');
    return `${day}-${month}-${year}`;
}

