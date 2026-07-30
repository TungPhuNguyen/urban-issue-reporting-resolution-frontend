import { describe, expect, it } from 'vitest'

import {
  getImageValidationErrors,
  getNoteValidationError,
  STAFF_IMAGE_MAX_SIZE_BYTES,
} from './staff-report-validation'

function createImage(name: string, type = 'image/jpeg', size = 1) {
  return new File([new Uint8Array(size)], name, {
    type,
  })
}

describe('Staff report validation - UC-24 to UC-27', () => {
  it('requires notes to contain from 5 to 2000 trimmed characters', () => {
    expect(getNoteValidationError('   ', 'Ghi chú tiến độ')).toBe(
      'Ghi chú tiến độ không được để trống.',
    )
    expect(getNoteValidationError('abcd', 'Ghi chú tiến độ')).toBe(
      'Ghi chú tiến độ phải có ít nhất 5 ký tự.',
    )
    expect(getNoteValidationError('Xử lý xong', 'Ghi chú tiến độ')).toBeNull()
    expect(getNoteValidationError('a'.repeat(2001), 'Ghi chú tiến độ')).toBe(
      'Ghi chú tiến độ không được vượt quá 2000 ký tự.',
    )
  })

  it('accepts from 1 to 5 JPEG, PNG or WEBP images up to 5 MB', () => {
    const validFiles = [
      createImage('one.jpg'),
      createImage('two.png', 'image/png'),
      createImage('three.webp', 'image/webp'),
    ]

    expect(getImageValidationErrors(validFiles, 'ảnh tiến độ')).toEqual([])
  })

  it('rejects missing, excessive, empty, oversized and unsupported images', () => {
    expect(getImageValidationErrors([], 'ảnh tiến độ')).toEqual([
      'Cần chọn ít nhất 1 ảnh tiến độ.',
    ])

    const tooManyFiles = Array.from({ length: 6 }, (_, index) =>
      createImage(`${index}.jpg`),
    )

    expect(getImageValidationErrors(tooManyFiles, 'ảnh tiến độ')).toContain(
      'Chỉ được chọn tối đa 5 ảnh tiến độ.',
    )

    const invalidFiles = [
      createImage('empty.jpg', 'image/jpeg', 0),
      createImage('large.png', 'image/png', STAFF_IMAGE_MAX_SIZE_BYTES + 1),
      createImage('document.pdf', 'application/pdf'),
    ]
    const errors = getImageValidationErrors(invalidFiles, 'ảnh tiến độ')

    expect(errors).toContain('"empty.jpg" là tệp rỗng.')
    expect(errors).toContain('"large.png" vượt quá 5 MB.')
    expect(errors).toContain('"document.pdf" không đúng định dạng JPEG, PNG hoặc WEBP.')
  })
})
