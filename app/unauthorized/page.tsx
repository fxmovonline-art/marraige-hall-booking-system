export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="max-w-md text-center">
        <h1 className="text-3xl font-bold">Access Denied</h1>
        <p className="mt-3 text-sm text-zinc-600">
          You do not have permission to view this page.
        </p>
      </div>
    </main>
  );
}
