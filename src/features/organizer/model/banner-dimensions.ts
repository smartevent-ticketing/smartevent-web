export function bannerResolutionError(width: number, height: number): string | null {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width < 1080 || height < 608) {
    return "Ảnh bìa cần có độ phân giải tối thiểu 1080 × 608 px. Khuyến nghị ảnh ngang gần tỷ lệ 16:9."
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
