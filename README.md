# LitContext

A prototype implement of Context API for lit-element.

## What is Context API?

The Context API is an agreed upon community protocol for web components to implement dependency injection.

Elements emit an event when they require a dependency to be provided to them. This event is `composed` and `bubbling` so it travels up the DOM and any listener can catch the event and provide the requested value.

### Definitions

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
 * A callback which is provided by a context consumer and is called with the
 * value satisfying the request.
 *
 * This callback can be called multiple times by context providers as the
 * requested value is changed.
 */
export type ContextCallback<
    ValueType extends ContextTypeMap[keyof ContextTypeMap]
> = (value: ValueType, dispose?: () => void) => void;
```

### Usage

An element which wishes to receive some context and participate in the context API should emit an event with the `context-request`, one method for doing this is as follows:

```javascript
this.dispatchEvent(
    new CustomEvent('context-request', {
        bubbles: true,
        composed: true,
        detail: {
            name: 'cool-thing',
            callback: (coolThing) => {
                this.myCoolThing = coolThing; // do something with value
            },
        },
    })
);
```

It may be convenient to extend from `Event` to simplify this syntax, as we have done in [ContextEvent](./src/lib/context-event.ts).

If a provider listening for this event can provide the requested context it will invoke the callback passed in the payload of the event. The element can then do whatever it wishes with this value.

It may also be the case that a provider can retain a reference to this callback, and can then invoke the callback multiple times. In this case providers should pass a `dispose` function as a second argument to the callback to allow consumers to inform the provider that it should no longer update the element, and should dispose of the callback.

As a convenience, and a hint for providers, an element may also provide a `once` boolean on the event detail to indicate that it is not interested in receiving updates to the value. If this behavior is essential to the correct operation of the consumer, then they should be implemented defensively as there is no guarantee that providers will honor this agreement. An example is provided below:

```javascript
this.dispatchEvent(
    new CustomEvent('context-request', {
        bubbles: true,
        composed: true,
        detail: {
            name: 'cool-thing-we-want-once',
            callback: (coolThing, dipose) => {
                // if we were given a disposer, this provider is likely to send us updates
                if (dispose) {
                    // so dispose immediately
                    dispose();
                }
                // guard against multiple assignment in case of bad actor providersU
                if (!this.myCoolThing) {
                    this.myCoolThing = coolThing; // do something with value
                }
            },
        },
    })
);
```
