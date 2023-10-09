"use client"
import { useAuth } from "./AuthContext";

export default function Home() {
  const { loggedIn, userId } = useAuth();

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      {loggedIn ? (
        <p>Welcome to Gurukul</p>
      ) : (
        <p>User not logged in</p>
      )}
    </main>
  );
}
