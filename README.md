# LitContext

A prototype implement of Context API for lit-element.

## What is Context API?

The Context API is an agreed upon community protocol for web components to implement dependency injection.

Elements emit an event when they require a dependency to be provided to them. This event is `composed` and `bubbling` so it travels up the DOM and any listener can catch the event and provide the requested value.

The `context-request` event is defined as:

```typescript
interface ContextEvent extends Event {
    /**
     * The name of the context that is requested
     */
    readonly name: T;
    /**
     * A boolean indicating if the context should only be provided once.
     */
    readonly once: boolean;
    /**
     * A callback which a provider of this named callback should invoke.
     */
    readonly callback: ContextCallback<ContextTypeMap[T]>;
}
```

The callback is defined as follows:

```typescript
/**
 * A map context type strings to context value types.
 */
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
 * A callback which is provided by a context requester and is called with the
 * value satisfying the request.
 *
 * This callback can be called multiple times by context providers as the
 * requested value is changed.
 */
export type ContextCallback<
    ValueType extends ContextTypeMap[keyof ContextTypeMap]
> = (value: ValueType, dispose?: () => void) => void;
```
