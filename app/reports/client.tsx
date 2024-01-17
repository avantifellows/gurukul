"use client";

import Image from "next/image";
import Forecast from "../../assets/forecast.png"

export default function Client({
    message,
    children,
}: {
    message: string;
    children: React.ReactNode;
}) {
    return (
        <div>
            {/* <div className="bg-heading h-20">
                <h1 className="text-primary ml-4 font-semibold text-xl pt-6">Overall Performance Analysis</h1>
            </div>
            <div className="px-8 text-sm md:text-base">
                <div className="flex flex-row py-2">
                    <Image src={Forecast} alt="Forecast" />
                    <h1 className="text-primary ml-4 font-semibold">Predictive rank <p className="text-black font-normal">Top 15k All India Ranks</p></h1>

                </div>
                <p className="pb-3 text-justify">
                    Based on your performance in all the tests, we predict that you will be eligible for an MBBS admission. Keep up the Good Work!
                </p>
            </div> */}
            <div className="bg-heading h-20 mb-4">
                <h1 className="text-primary ml-4 font-semibold text-xl pt-6">Test Reports</h1>
            </div>
            {children}
            {message}
        </div>
    );
}
