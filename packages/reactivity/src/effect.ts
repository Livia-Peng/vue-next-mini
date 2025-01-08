import { isArray } from '@vue/shared'
import { createDep, Dep } from './dep'

type KeyToDepMap = Map<any, Dep>

// 收集所有依赖的 WeakMap 实例
const targetMap = new WeakMap<any, KeyToDepMap>()

/**
 *
 * @param target
 * @param key
 * @returns
 */
export function track(target: object, key: unknown) {
  if (!activeEffect) return
  // 尝试从 targetMap 中，根据 target 获取 map
  let depsMap = targetMap.get(target)
  // target 对应的 map 不存在，则生成新的 map 对象，并缓存
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()))
  }
  // 获取指定 key 的 dep
  let dep = depsMap.get(key)
  // 如果 dep 不存在，则生成一个新的 dep，并放入到 depsMap 中
  if (!dep) {
    // depsMap.set(key, (dep = createDep()))
    depsMap.set(key, (dep = createDep()))
  }
  // console.log(targetMap)
  trackEffects(dep)
}

/**
 *
 * @param dep
 */
export function trackEffects(dep: Dep) {
  dep.add(activeEffect!)
}

// ============================================================

/**
 *
 * @param target
 * @param key
 * @returns
 */
export function trigger(target: object, key?: unknown) {
  // 依据 target 获取存储的 map 实例
  const depsMap = targetMap.get(target)
  // 如果 map 不存在，则直接 return
  if (!depsMap) return
  const dep: Dep | undefined = depsMap.get(key)
  if (!dep) return
  // 触发 dep
  triggerEffects(dep)
}

// 依次触发 dep 中保存的依赖
export function triggerEffects(dep: Dep) {
  // 把 dep 构建为一个数组
  const effects = isArray(dep) ? dep : [...dep]
  for (const effect of effects) {
    triggerEffect(effect)
  }
}

/**
 *
 * @param effect
 */
export function triggerEffect(effect: ReactiveEffect) {
  effect.run()
}

/**
 * 单例，当前的 effect
 */
export let activeEffect: ReactiveEffect | undefined

/**
 * 响应性触发依赖时的执行类
 */
export class ReactiveEffect<T = any> {
  constructor(public fn: () => T) {}

  run() {
    // 为 activeEffect 赋值
    activeEffect = this

    // 执行 fn 函数
    return this.fn()
  }

  stop() {}
}

/**
 * @param fn 执行方法
 * @param options
 */
export function effect<T = any>(fn: () => T) {
  // 生成 ReactiveEffect 实例
  const _effect = new ReactiveEffect(fn)

  // 执行 run 函数
  _effect.run()
}
