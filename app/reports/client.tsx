"use client";

// import ReportsData from "./api_service";
import getData from "./page";
import { useEffect, useState } from "react";

export default function Client({
    message,
    children,
}: {
    message: string;
    children: React.ReactNode;
}) {
    console.log("Client component rendering");

    return (
        <div>
            <h2>Client Component</h2>
            <p>Data received:</p>
            {children}
            {message}
        </div>
    );
}
