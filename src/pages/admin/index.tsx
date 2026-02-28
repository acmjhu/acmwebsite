import Head from "next/head";

export default function AdminDashboard() {
  return (
    <>
      <Head>
        <title>Admin Dashboard | ACM@JHU</title>
      </Head>

      <h1 className="text-2xl font-bold text-primary-dark">Dashboard</h1>
      <p className="mt-2 text-gray-600">
        Welcome to the ACM@JHU admin dashboard.
      </p>
    </>
  );
}
