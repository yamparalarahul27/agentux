import Link from 'next/link';

export default function Users() {
  return (
    <div>
      <h1>Users</h1>
      <Link href="/users/123">View User Detail</Link>
      <Link href="/dashboard">Dashboard</Link>
    </div>
  );
}
