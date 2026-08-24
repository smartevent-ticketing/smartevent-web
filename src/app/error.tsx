"use client";

import { useEffect } from "react";

interface ErrorPageProps {
  error: Error & {
    digest?: string;
  };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <section className="max-w-md text-center">
        <p className="text-sm font-semibold text-red-600">Đã xảy ra lỗi</p>

        <h1 className="mt-2 text-2xl font-semibold">
          Không thể tải nội dung
        </h1>

        <p className="mt-3 text-sm text-neutral-600">
          Vui lòng thử lại. Nếu lỗi tiếp tục xảy ra, hãy quay lại sau.
        </p>

        <button
          type="button"
          onClick={reset}
          className="mt-6 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700"
        >
          Thử lại
        </button>
      </section>
    </main>
  );
}