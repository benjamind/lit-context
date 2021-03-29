import { ContextContainer } from '../context-container';
import { ContextEvent, ContextTypeMap } from '../context-event';
import { ReactiveController, ReactiveElement } from './controller-host';

/**
 * A ReactiveController which can add context provider behavior to a
 * custom-element.
 *
 * This controller simply listens to the `context-request` event when
 * the host is connected to the DOM and registers the received callbacks
 * against its observable Context implementation.
 */
export class ContextProvider<T extends keyof ContextTypeMap>
    extends ContextContainer<ContextTypeMap[T]>
    implements ReactiveController {
    constructor(
        protected host: ReactiveElement,
        private name: T,
        defaultValue?: ContextTypeMap[T]
    ) {
        super(defaultValue);
    }

    private onContextRequest = (
        ev: ContextEvent<keyof ContextTypeMap>
    ): void => {
        if (ev.name !== this.name) {
            return;
        }
        ev.stopPropagation();
        this.addCallback(ev.callback);
    };
    hostConnected(): void {
        this.host.addEventListener('context-request', this.onContextRequest);
    }
    hostDisconnected(): void {
        this.clearCallbacks();
    }
}
