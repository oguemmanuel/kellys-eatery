import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/auth";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Kitchen admin | Kelly's Eatery",
  robots: { index: false },
};

export default async function LoginPage({
  searchParams,
}: PageProps<"/admin/login">) {
  if (await getAdmin()) redirect("/admin");
  const { denied } = await searchParams;

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-5 py-12">
      <Image
        src="/brand/logo.webp"
        alt="Kelly's Eatery"
        width={600}
        height={260}
        priority
        className="mx-auto h-auto w-48"
      />
      <h1 className="mt-4 text-center font-display text-2xl font-bold text-brand">
        Kitchen admin
      </h1>
      <LoginForm
        initialError={
          denied
            ? "This account does not have access to the kitchen admin."
            : undefined
        }
      />
    </main>
  );
}
