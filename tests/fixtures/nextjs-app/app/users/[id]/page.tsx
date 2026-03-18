import Link from 'next/link';

export default function UserDetail({ params }: { params: { id: string } }) {
  return (
    <div>
      <h1>User {params.id}</h1>
      <Link href="/users">Back to Users</Link>
    </div>
  );
}
