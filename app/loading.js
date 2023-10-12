"use client"

import BottomNavigationBar from "@/components/BottomNavigationBar";
import { Bars } from "react-loader-spinner";
import tailwindConfig from "../tailwind.config.js"

export default function Loading() {
    const primaryColor = tailwindConfig.theme.extend.colors.primary;

    return <div className="min-h-screen flex items-center justify-center">
        <div className="mb-8">
            <Bars
                height={40}
                width={40}
                color={primaryColor}
                ariaLabel="bars-loading"
                wrapperStyle={{}}
                wrapperClass=""
                visible={true}
            />
        </div>
        <BottomNavigationBar />
    </div>
}
