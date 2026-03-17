import { BackgroundPattern } from "@/components/ui/background-pattern";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-12">
      <BackgroundPattern />
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
