import { isArray } from '@vue/shared'
import { createDep, Dep } from './dep'
import { ComputedRefImpl } from './computed'

type KeyToDepMap = Map<any, Dep>

export type EffectScheduler = (...args: any[]) => any

// 收集所有依赖的 WeakMap 实例
const targetMap = new WeakMap<any, KeyToDepMap>()

/**
 * 用于收集依赖的方法
 * @param target 被代理对象，作为 targetMap 的 key
 * @param key 代理对象的 key，当依赖被触发时，需要根据该 key 获取
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
 * 利用 dep 依次跟踪指定 key 的所有 effect
 * @param dep
 */
export function trackEffects(dep: Dep) {
  // activeEffect! 断言 activeEffect 不为 null
  dep.add(activeEffect!)
}

// ============================================================

/**
 * 触发依赖的方法
 * @param target 被代理对象，作为 targetMap 的 key
 * @param key 代理对象的 key，当依赖被触发时，需要根据该 key 获取
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
  // for (const effect of effects) {
  //   triggerEffect(effect)
  // }

  // 先触发所有的计算属性依赖，再触发所有的非计算属性依赖，以免触发死循环
  for (const effect of effects) {
    if (effect.computed) {
      triggerEffect(effect)
    }
  }
  for (const effect of effects) {
    if (!effect.computed) {
      triggerEffect(effect)
    }
  }
}

// 触发指定的依赖
export function triggerEffect(effect: ReactiveEffect) {
  if (effect.scheduler) {
    effect.scheduler()
  } else {
    effect.run()
  }
}

/**
 * 单例，当前的 effect
 */
export let activeEffect: ReactiveEffect | undefined

/**
 * 响应性触发依赖时的执行类
 */
export class ReactiveEffect<T = any> {
  // 存在该属性，则表示当前的 effect 为计算属性的 effect
  computed?: ComputedRefImpl<T>

  constructor(public fn: () => T, public scheduler: EffectScheduler | null = null) {}

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
