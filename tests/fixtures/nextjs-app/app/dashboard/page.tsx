import Link from 'next/link';

export default function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <Link href="/">Back Home</Link>
      <Link href="/users">View Users</Link>
    </div>
  );
}
