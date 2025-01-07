import { track, trigger } from './effect'

const get = createGetter()

/**
 * @returns getter 回调方法
 */
function createGetter() {
  return function get(target: object, key: string | symbol, receiver: object) {
    // 取值
    const res = Reflect.get(target, key, receiver)
    // 收集依赖
    track(target, key)
    return res
  }
}

const set = createSetter()

/**
 * @returns setter 回调方法
 */
function createSetter() {
  return function set(target: object, key: string | symbol, value: unknown, receiver: object) {
    // 赋值
    const res = Reflect.set(target, key, value, receiver)
    // 触发依赖
    trigger(target, key)
    return res
  }
}

// 响应性的 handler
export const mutableHandlers: ProxyHandler<object> = {
  get,
  set
}
