import AuthenticatedLayout from "@/component/AuthenticatedLayout";

export default function Home() {
  return (
    <AuthenticatedLayout>
      <div className="flex flex-col items-center p-24">
        Welcome To Gurukul
      </div>
    </AuthenticatedLayout>
  );
}
