import TopBar from "../components/TopBar";
import BottomNavigation from "../components/BottomNavigation";

export default function Home() {
    return (
        <>
            <TopBar />
            <main className="flex min-h-screen flex-col items-center justify-between p-24 bg-white text-black">
                Welcome To Gurukul
            </main>
            <BottomNavigation />
        </>
    );
}
