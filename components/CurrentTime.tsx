import React, { useState, useEffect } from "react";

interface CurrentTimeProps {
    className?: string;
}

const CurrentTime: React.FC<CurrentTimeProps> = ({ className }) => {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const intervalId = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(intervalId);
    }, []);

    const formattedTime = currentTime.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });

    return (
        <div className={className} suppressHydrationWarning>
            {formattedTime}
        </div>
    );
};

export default CurrentTime;
