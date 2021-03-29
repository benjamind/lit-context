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
