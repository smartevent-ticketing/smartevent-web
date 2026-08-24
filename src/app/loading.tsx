export default function Loading() {
  return (
    <main className="grid min-h-screen place-items-center">
      <div
        aria-label="Đang tải"
        className="size-8 animate-spin rounded-full border-4 border-neutral-200 border-t-indigo-600"
        role="status"
      />
    </main>
  );
}
