import AuthenticatedLayout from "@/component/AuthenticatedLayout";

export default function Home() {
  return (
    <AuthenticatedLayout>
      <main className="flex min-h-screen flex-col items-center justify-between p-24">
        Welcome To Gurukul
      </main>
    </AuthenticatedLayout>
  );
}
