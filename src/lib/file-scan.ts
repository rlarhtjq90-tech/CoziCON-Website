// Magic byte signatures for dangerous file types that should never be uploaded
const DANGEROUS_MAGIC: number[][] = [
  [0x4D, 0x5A],                   // PE executable (Windows EXE/DLL, MZ header)
  [0x7F, 0x45, 0x4C, 0x46],       // ELF executable (Linux)
  [0x23, 0x21],                   // Shebang (#!) — shell scripts
  [0xCA, 0xFE, 0xBA, 0xBE],       // Java class / Mach-O universal
  [0xCE, 0xFA, 0xED, 0xFE],       // Mach-O 32-bit
  [0xCF, 0xFA, 0xED, 0xFE],       // Mach-O 64-bit
]

/**
 * Scans the first 16 bytes of a file for known dangerous magic bytes.
 * Does not catch all malware, but blocks the most common disguised executables.
 */
export async function scanFile(file: File): Promise<{ safe: boolean; reason?: string }> {
  try {
    const buffer = await file.slice(0, 16).arrayBuffer()
    const bytes = new Uint8Array(buffer)

    for (const sig of DANGEROUS_MAGIC) {
      if (sig.every((byte, i) => bytes[i] === byte)) {
        return { safe: false, reason: '실행 파일은 업로드할 수 없습니다.' }
      }
    }

    return { safe: true }
  } catch {
    // If scanning fails, block the file rather than allowing a potentially unsafe upload
    return { safe: false, reason: '파일 검사 중 오류가 발생했습니다.' }
  }
}
