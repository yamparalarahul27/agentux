import Link from 'next/link';

export default function Home() {
  return (
    <div>
      <h1>Home</h1>
      <Link href="/dashboard">Go to Dashboard</Link>
      <Link href="/users">View Users</Link>
    </div>
  );
}
