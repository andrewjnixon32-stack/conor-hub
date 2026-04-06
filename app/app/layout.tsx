import TabNav from "@/components/TabNav";
import { cookies } from "next/headers";
import Link from "next/link";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const isConnected = !!cookieStore.get("google_tokens");

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-white border-b border-gray-100 px-6 py-4 shadow-sm flex items-center justify-between">
        <h1 className="text-base font-semibold text-gray-900 tracking-tight">
          Conor McKenna · Work Hub
        </h1>
        {isConnected ? (
          <form action="/api/auth/disconnect" method="POST">
            <button
              type="submit"
              className="text-xs font-medium text-green-600 bg-green-50 border border-green-200 px-3 py-1 rounded-full hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
            >
              Google Connected · Disconnect
            </button>
          </form>
        ) : (
          <Link
            href="/api/auth"
            className="text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
          >
            Connect Google
          </Link>
        )}
      </header>
      <TabNav />
      <main className="flex-1 p-8 max-w-6xl mx-auto w-full">{children}</main>
    </div>
  );
}
