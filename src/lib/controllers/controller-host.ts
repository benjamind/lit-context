/*
Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

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
