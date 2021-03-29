import { LitElement, PropertyValues } from 'lit-element';

export type Constructor<T> = { new (...args: any[]): T };

export interface ReactiveController {
    hostConnected?(): void;
    hostDisconnected?(): void;
    hostUpdate?(): void;
    hostUpdated?(): void;
}

export interface ReactiveControllerHost {
    addController(controller: ReactiveController): void;
}

export interface ReactiveElement extends LitElement, ReactiveControllerHost {}

export function LitControllerHost<C extends Constructor<LitElement>>(
    constructor: C
): Constructor<ReactiveElement> {
    return class extends constructor implements ReactiveControllerHost {
        __controllers?: Array<ReactiveController>;

        public addController(controller: ReactiveController) {
            (this.__controllers ??= []).push(controller);
            if (this.isConnected) {
                controller.hostConnected?.();
            }
        }

        public connectedCallback() {
            super.connectedCallback?.();
            this.__controllers?.forEach((c) => c.hostConnected?.());
        }

        public disconnectedCallback() {
            this.__controllers?.forEach((c) => c.hostDisconnected?.());
            super.disconnectedCallback?.();
        }

        protected update(changedProperties: PropertyValues) {
            this.__controllers?.forEach((c) => c.hostUpdate?.());
            super.update(changedProperties);
            this.__controllers?.forEach((c) => c.hostUpdated?.());
        }
    };
}
