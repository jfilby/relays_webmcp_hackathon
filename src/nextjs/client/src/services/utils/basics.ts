export function getEnumKey<T extends Record<string, string | number>>(
  enumObj: T,
  value: T[keyof T]
): keyof T | undefined {
  return Object.entries(enumObj).find(([, v]) => v === value)?.[0] as keyof T | undefined
}
