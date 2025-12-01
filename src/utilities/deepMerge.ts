/**
 * Simple object check.
 * @param item
 * @returns {boolean}
 */
export function isObject(item: unknown): boolean {
  return item !== null && typeof item === 'object' && !Array.isArray(item)
}

/**
 * Deep merge two objects.
 * @param target
 * @param ...sources
 */
export function deepMerge<T extends Record<string, any>, R extends Record<string, any>>(
  target: T,
  source: R,
): T {
  const output = { ...target }
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach((key) => {
      if (isObject((source as any)[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: (source as any)[key] })
        } else {
          ;(output as any)[key] = deepMerge((target as any)[key], (source as any)[key])
        }
      } else {
        Object.assign(output, { [key]: (source as any)[key] })
      }
    })
  }

  return output
}
