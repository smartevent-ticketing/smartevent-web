export function bannerResolutionError(width: number, height: number): string | null {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width < 1200 || height < 675) {
    return "Ảnh bìa cần có độ phân giải tối thiểu 1200 × 675 px. Nên dùng 1920 × 1080 px để hiển thị sắc nét."
  }
  return null
}

export async function readImageDimensions(file: File) {
  const url = URL.createObjectURL(file)
  try {
    const image = new Image()
    image.src = url
    await image.decode()
    return { width: image.naturalWidth, height: image.naturalHeight }
  } finally {
    URL.revokeObjectURL(url)
  }
}
