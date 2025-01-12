import { isFunction } from '@vue/shared'
import { Dep } from './dep'
import { ReactiveEffect } from './effect'
import { trackRefValue, triggerRefValue } from './ref'

export class ComputedRefImpl<T> {
  public dep?: Dep = undefined

  private _value!: T

  public readonly effect: ReactiveEffect<T>

  public readonly __v_isRef = true

  // 为 false 时，表示需要触发依赖；为 true 时表示需要重新执行 run 方法，获取数据。即：数据脏了
  public _dirty = true

  constructor(getter) {
    this.effect = new ReactiveEffect(getter, () => {
      // 判断当前脏的状态，如果为 false，表示需要触发依赖
      if (!this._dirty) {
        this._dirty = true
        triggerRefValue(this)
      }
    })
    this.effect.computed = this
  }

  get value() {
    trackRefValue(this)

    // 判断当前脏的状态，如果为 true ，则表示需要重新获取最新数据
    if (this._dirty) {
      this._dirty = false
      // 执行 run 函数
      this._value = this.effect.run()!
    }

    return this._value
  }

  // set value(newValue) {}
}

// 计算属性方法
export function computed(getterOrOptions) {
  let getter

  const onlyGetter = isFunction(getterOrOptions)
  if (onlyGetter) {
    getter = getterOrOptions
  }

  const cRef = new ComputedRefImpl(getter)

  return cRef as any
}
