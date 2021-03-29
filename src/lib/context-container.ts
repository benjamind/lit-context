import { ContextCallback, ContextTypeMap } from './context-event';

/**
 * A simple class which stores a value, and triggers registered callbacks when the
 * value is changed via its setter.
 *
 * An implementor might use other observable patterns such as MobX or Redux to get
 * behavior like this. But this is a pretty minimal approach that will likely work
 * for a number of use cases.
 */
export class ContextContainer<T extends ContextTypeMap[keyof ContextTypeMap]> {
    private callbacks: ContextCallback<T>[] = [];

    private _value!: T;
    public get value(): T {
        return this._value;
    }
    public set value(v: T) {
        this.setValue(v);
    }

    public setValue(v: T, force: boolean = false) {
        let changed = false;
        if (v !== this._value) {
            changed = true;
        }
        this._value = v;
        if (changed || force) {
            this.updateContext();
        }
    }

    constructor(defaultValue?: T) {
        if (defaultValue !== undefined) {
            this.value = defaultValue;
        }
    }

    updateContext = (): void => {
        this.callbacks.forEach((callback) => callback(this._value));
    };

    addCallback(callback: ContextCallback<T>): void {
        this.callbacks.push(callback);
        callback(this.value);
    }
    clearCallbacks(): void {
        this.callbacks = [];
    }
}
