"use client";

export default function Client({
    message,
    children,
}: {
    message: string;
    children: React.ReactNode;
}) {
    return (
        <div>
            <h2>Client Component</h2>
            <p>Data received:</p>
            {children}
            {message}
        </div>
    );
}
