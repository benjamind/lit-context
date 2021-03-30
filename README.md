# LitContext

A prototype implementation of Context API for lit-element. The context API is not yet finalized, this is just for initial discussion.

NOTE: This library is being developed at Adobe, this is a temporary repository that will be moved into the public Adobe organization later once we commit to maintaining this implementation.

## Context API Introduction

The Context API is an community protocol [currently in open discussion](https://github.com/webcomponents/community-protocols/issues/2) for web components to implement dependency injection behaviors similar to React's Context API.

Elements emit an event when they require a dependency to be provided to them. This event is `composed` and `bubbling` so it travels up the DOM and any listener can catch the event and provide the requested value.

## Goals

-   Allow elements in the DOM to retrieve data based on their contextual position in the DOM
-   Alleviate the problem of 'prop drilling'
-   Simple API that is easily implemented in any framework / library
-   Synchronous protocol, while supporting asynchronous patterns
-   Support single or multiple delivery of context values

## Non-Goals

### Context API !== Dependency Injection Framework

The Context API does not intend to cover all cases and forms of Dependency Injection. It does not specify constructor, factory or property injection patterns. Its only goal is to formalize the pattern of sharing data across the hierarchy in the DOM, specifically avoiding 'prop drilling' type scenarios. Dependency Injection patterns could be implemented using this protocol, but this is not the goal and should remain explicitly outside the scope of Context API for simplicity.

### Context API is not a state management alternative

State management libraries often need to perform similar behaviors to the problems that Context API helps to solve. An element deep in the DOM tree made need access to some state, and may need to respond to that state being changed. While state management could be built using the Context API, it is not a primary goal of Context API to solve this problem.

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
 * A map of context type strings to context value types.
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

An element which wishes to receive some context and participate in the Context API should emit an event with the `context-request` type. This library includes an implementation of the [ContextEvent](./src/lib/context-event.ts) class which implements the above interface and can be used in the following way:

```javascript
this.dispatchEvent(
    new ContextEvent(
        'cool-thing', // the name of the context we want to receive
        callback: (coolThing) => {
            this.myCoolThing = coolThing; // do something with value
        }
    )
);
```

If a provider listening for this event can provide the requested context it will invoke the callback passed in the payload of the event. The element can then do whatever it wishes with this value.

It may also be the case that a provider can retain a reference to this callback, and can then invoke the callback multiple times. In this case providers should pass a `dispose` function as a second argument to the callback to allow consumers to inform the provider that it should no longer update the element, and should dispose of the callback.

As a convenience, and a hint for providers, an element may also provide a `once` boolean on the event detail to indicate that it is not interested in receiving updates to the value. If this behavior is essential to the correct operation of the consumer, then they should be implemented defensively as there is no guarantee that providers will honor this agreement. An example is provided below:

```javascript
this.dispatchEvent(
    new ContextEvent(
        'cool-thing-we-want-once',
        (coolThing, dipose) => {
            // if we were given a disposer, this provider is likely to send us updates
            if (dispose) {
                // so dispose immediately
                dispose();
            }
            // guard against multiple assignment in case of bad actor providers
            if (!this.myCoolThing) {
                this.myCoolThing = coolThing; // do something with value
            }
        },
        true // we only want the event once
    )
);
```

It is recommended that custom elements which participate in the context API should fire their `context-request` events in their `connectedCallback` handler. Likewise in their `disconnectedCallback` they should invoke any `dispose` functions they have received.

A more complete example is as follows:

```javascript
class SimpleElement extends HTMLElement {
    connectedCallback() {
        this.dispatchEvent(
            new ContextEvent('logger', (value, dispose) => {
                // protect against changing providers
                if (dispose && dispose !== this.loggerDisposer) {
                    this.dispose();
                }
                this.logger = value;
                this.loggerDisposer = dispose;
            })
        );
    }
    disconnectedCallback() {
        if (this.loggerDisposer) {
            this.loggerDisposer();
        }
        this.loggerDisposer = undefined;
        this.logger = undefined;
    }
}
```

## Lit-Context API

The `lit-context` library provides a reference implementation of the Context API, and helper classes and methods for using it within the `lit-element` v2 library. It makes use of the 'Controller' approach which will become part of the library in the upcoming v3 release, but makes this avialable in v2 of `lit-element` through the [LitControllerHost](./src/lib/controllers/controller-host.ts) implementation.

It is hoped that a reference Controller implementation could become the standard across all web component and other framework implementations.

### [LitControllerHost](./src/lib/controllers/context-controller.ts)

This is a class mixin which can be used to add 'controller' capabilities to any LitElement. An example usage can be found in [the demo](./demo/counter.ts).

### [ContextEvent](./src/lib/context-event.ts)

An implementation of the `ContextEvent` as referred to above.

```typescript
this.dispatchEvent(
    new ContextEvent('logger', (value, dispose) => {
        if (this.loggerDispose && this.loggerDispose !== dispose) {
            // we already have a value, lets cleanup before we take the new one
            this.loggerDispose();
        }
        this.logger = value;
        this.loggerDispose = dispose;
    })
);
```

This is used internally by the other classes provided in this library which correctly handle the Context API as described above.

### [ContextController](./src/lib/controllers/context-controller.ts)

The ContextController provides an implementation of the Context API that works with the lifecycle of the host element. An example usage:

```typescript
this.addController(
    new ContextController(
        this,
        (logger) => {
            this.logger = logger;
        },
        'logger'
    )
);
```

Since its a controller, it will automatically emit the `context-request` event when the host element is connected, and dispose of the context correctly when disconnected.

### [ContextProvider](./src/lib/controllers/context-provider.ts)

A controller which makes it easy to turn any LitElement into a context provider. The ContextProvider handles listening for the `context-request` event, and properly triggering the callbacks when appropriate. It also handles cleanup based on the host elements lifecycle.

```typescript
export class LoggingContextProvider extends LitControllerHost(LitElement) {
    private loggerProvider: ContextProvider<'logger'>;

    public constructor() {
        super();

        const logger = {
            log(msg: string): void {
                console.log(`logger: ${msg}`);
            },
        };

        this.loggerProvider = new ContextProvider(this, 'logger', logger);
        this.addController(this.loggerProvider);
    }
}
```

The ContextProvider implementation supports changing the provided context, correctly implementing the `dispose` functionality describe in the Context API. Therefore you can update the context provided value safely like so:

```typescript
this.loggerProvider.setValue(myNewLogger);
```

And the provider controller will handle updating all current active context consumers.

### [ContextMapProvider](./src/lib/controller/context-map-provider.ts)

Similar to `ContextProvider` above this is a controller which allows a provider to be created which can satisfy multiple different context request keys. This can make it easy to provide many different contexts from a single element.
