import { mutableHandlers } from './baseHandlers'

/**
 * 响应性代理对象缓存
 * key: target, value: proxy
 */
export const reactiveMap = new WeakMap<object, any>()

/**
 * 为复杂数据类型创建响应性对象
 * @param target 被代理对象
 * @returns 代理对象
 */
export function reactive(target: Object) {
  return createReactiveObject(target, mutableHandlers, reactiveMap)
}

/**
 * 创建响应性代理对象
 * @param target 被代理对象
 * @param baseHandlers handler
 * @param proxyMap 代理对象缓存
 * @returns 代理对象
 */
function createReactiveObject(target: object, baseHandlers: ProxyHandler<any>, proxyMap: WeakMap<object, any>) {
  // 如果该实例已经被代理，则直接读取即可
  const existingProxy = proxyMap.get(target)
  if (existingProxy) {
    return existingProxy
  }
  // 未被代理，创建代理对象
  const proxy = new Proxy(target, baseHandlers)

  // 缓存代理对象
  proxyMap.set(target, proxy)
  return proxy
}
