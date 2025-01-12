export const isArray = Array.isArray

export const isObject = (val: unknown) => val !== null && typeof val === 'object'

// compare whether a value has changed, accounting for NaN.
export const hasChanged = (value: any, oldValue: any): boolean => !Object.is(value, oldValue)

export const isFunction = (val: unknown): val is Function => typeof val === 'function'
