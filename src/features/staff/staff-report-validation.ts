export const STAFF_NOTE_MIN_LENGTH = 5
export const STAFF_NOTE_MAX_LENGTH = 2000
export const STAFF_IMAGE_MAX_COUNT = 5
export const STAFF_IMAGE_MAX_SIZE_BYTES = 5 * 1024 * 1024

export const STAFF_IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp'

const ALLOWED_IMAGE_TYPES = new Set(STAFF_IMAGE_ACCEPT.split(','))

export function getNoteValidationError(note: string, fieldName: string): string | null {
  const trimmedNote = note.trim()

  if (!trimmedNote) {
    return `${fieldName} không được để trống.`
  }

  if (trimmedNote.length < STAFF_NOTE_MIN_LENGTH) {
    return `${fieldName} phải có ít nhất ${STAFF_NOTE_MIN_LENGTH} ký tự.`
  }

  if (trimmedNote.length > STAFF_NOTE_MAX_LENGTH) {
    return `${fieldName} không được vượt quá ${STAFF_NOTE_MAX_LENGTH} ký tự.`
  }

  return null
}

export function getImageValidationErrors(files: File[], imageName: string): string[] {
  const errors: string[] = []

  if (files.length === 0) {
    return [`Cần chọn ít nhất 1 ${imageName}.`]
  }

  if (files.length > STAFF_IMAGE_MAX_COUNT) {
    errors.push(`Chỉ được chọn tối đa ${STAFF_IMAGE_MAX_COUNT} ${imageName}.`)
  }

  for (const file of files.slice(0, STAFF_IMAGE_MAX_COUNT)) {
    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      errors.push(`"${file.name}" không đúng định dạng JPEG, PNG hoặc WEBP.`)
    }

    if (file.size === 0) {
      errors.push(`"${file.name}" là tệp rỗng.`)
    } else if (file.size > STAFF_IMAGE_MAX_SIZE_BYTES) {
      errors.push(`"${file.name}" vượt quá 5 MB.`)
    }
  }

  return errors
}

export function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback
}
