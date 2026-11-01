import Image from "next/image";

export function AuthHeader({ title, subtitle }: { title: string; subtitle: React.ReactNode }) {
  return (
    <div className="text-center">
      <Image src="/logo.png" alt="Lieluwish" width={80} height={80} className="mx-auto rounded-2xl" priority />
      <h1 className="mt-2 text-2xl font-bold text-slate-900">{title}</h1>
      <p className="mt-1 text-slate-500">{subtitle}</p>
    </div>
  );
}
