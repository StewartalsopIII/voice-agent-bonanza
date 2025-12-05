import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Voice Agent Bonanza</h1>
        <p className="text-gray-600 mb-8">Voice agent management platform</p>
        <Link href="/admin" className="btn-primary inline-block">
          Admin Dashboard
        </Link>
      </div>
    </main>
  );
}
