export interface ContextTypeMap {}

declare global {
    interface HTMLElementEventMap {
        /**
         * A 'context-request' event can be emitted by any element which desires
         * a context value to be injected by an external provider.
         */
        'context-request': ContextEvent<keyof ContextTypeMap>;
    }
}

/**
 * A callback which is provided by a context requester and is called with the value satisfying the request.
 * This callback can be called multiple times by context providers as the requested value is changed.
 */
export type ContextCallback<
    ValueType extends ContextTypeMap[keyof ContextTypeMap]
> = (value: ValueType, dispose?: () => void) => void;

/**
 * An event fired by a context requester to signal it desires a named context.
 *
 * A provider should inspect the `name` property of the event to determine if it has a value that can
 * satisfy the request, calling the `callback` with the requested value if so.
 *
 * A provider can call the callback multiple times if the value is changed, if this is the case the
 * provider should pass a `dispose` method to the callback which requesters can invoke to indicate they
 * no longer wish to receive these updates.
 *
 * If a requester only wishes to ever receive the context once, then they can optionally set the
 * `once` property on the event, providers should respect this property and only execute the
 * callback once.
 */
export class ContextEvent<T extends keyof ContextTypeMap> extends Event {
    public readonly name: T;
    public readonly once: boolean;
    public readonly callback: ContextCallback<ContextTypeMap[T]>;

    public constructor(
        name: T,
        callback: ContextCallback<ContextTypeMap[T]>,
        once: boolean = false
    ) {
        super('context-request', { bubbles: true, composed: true });
        this.name = name;
        this.callback = callback;
        this.once = once;
    }
}
