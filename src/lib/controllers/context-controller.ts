import { ContextEvent, ContextTypeMap } from '../context-event.js';
import { ReactiveController, ReactiveElement } from './controller-host.js';

/**
 * ContextController is a ReactiveController which binds a custom-element's
 * lifecycle to the Context API. When an element is connected to the DOM it
 * will emit the context-request event, invoking the callback set on the
 * controller when the context request is satisfied. It will also call
 * the dispose method provided by the Context API when the element is
 * disconnected.
 */
export class ContextController<
    T extends keyof ContextTypeMap,
    HostElement extends ReactiveElement
> implements ReactiveController {
    constructor(
        protected host: HostElement,
        private callback: (
            value: ContextTypeMap[T],
            dispose?: () => void
        ) => void,
        private name: T
    ) {}

    private dispose?: () => void;

    hostConnected(): void {
        this.host.dispatchEvent(
            new ContextEvent(this.name, (value, dispose) => {
                if (this.dispose && this.dispose !== dispose) {
                    // we already have a value, lets cleanup before we take the new one
                    this.dispose();
                }
                this.callback(value, dispose);
                this.dispose = dispose;
            })
        );
    }
    hostDisconnected(): void {
        if (this.dispose) {
            this.dispose();
            this.dispose = undefined;
        }
    }
}
