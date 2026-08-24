import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-6">
      <section className="text-center">
        <p className="text-sm font-semibold text-indigo-600">404</p>
        <h1 className="mt-2 text-3xl font-semibold">Không tìm thấy trang</h1>
        <p className="mt-3 text-neutral-600">
          Trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển.
        </p>
        <Link
          className="mt-6 inline-flex rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white"
          href="/"
        >
          Về trang chủ
        </Link>
      </section>
    </main>
  );
}
