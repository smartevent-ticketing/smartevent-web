"use client"

interface GlobalErrorProps {
  error: Error & {
    digest?: string
  }
  reset: () => void
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <html lang="vi">
      <body>
        <main
          style={{
            minHeight: "100vh",
            display: "grid",
            placeItems: "center",
            padding: "24px",
            fontFamily: "sans-serif",
          }}
        >
          <section style={{ maxWidth: "420px", textAlign: "center" }}>
            <p style={{ color: "#dc2626", fontWeight: 600 }}>Lỗi hệ thống</p>

            <h1>Ứng dụng tạm thời không khả dụng</h1>

            <p>Vui lòng thử tải lại ứng dụng. Mã lỗi: {error.digest ?? "UNKNOWN"}</p>

            <button
              type="button"
              onClick={reset}
              style={{
                marginTop: "16px",
                padding: "10px 16px",
                border: 0,
                borderRadius: "8px",
                background: "#171717",
                color: "#ffffff",
                cursor: "pointer",
              }}
            >
              Tải lại
            </button>
          </section>
        </main>
      </body>
    </html>
  )
}
