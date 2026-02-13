
export default async function testFileSize(
  fileSize: number,
  fileType: string
): Promise<boolean> {

  const maxSize = {
    profile_picture: 300 * 1024,    // 300 KB
    attachment: 100 * 1024 * 1024      // 100 MB 
  }

  if (!(fileType in maxSize)) return false

  const maxFileSize = maxSize[fileType as keyof typeof maxSize]

  return fileSize <= maxFileSize
}
