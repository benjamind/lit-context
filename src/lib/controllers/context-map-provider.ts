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
import { ContextContainer } from './context-container.js';
import { ReactiveController, ReactiveElement } from './controller-host.js';

/**
 * A more complex implementation of ContextProvider controller which
 * allows for multiple named contexts to be provided by a single element.
 */
export class ContextMapProvider<T extends keyof ContextTypeMap>
    implements ReactiveController {
    private contexts: Map<T, ContextContainer<ContextTypeMap[T]>> = new Map();

    public set(key: T, v: ContextTypeMap[T]) {
        let context = this.contexts.get(key);
        // if we're monitoring a fixed set of keys and we haven't got a context for it
        // then we should throw
        if (!context) {
            if (this.monitorKeys) {
                throw new Error(`Unknown context key '${key}'`);
            }
            context = new ContextContainer(v);
            this.contexts.set(key, context);
        }
        context.value = v;
    }

    public get(key: T): ContextTypeMap[T] | undefined {
        return this.contexts.get(key)?.value;
    }

    constructor(
        protected host: ReactiveElement,
        private readonly monitorKeys?: readonly T[]
    ) {
        if (monitorKeys) {
            monitorKeys.forEach((key) =>
                this.contexts.set(key, new ContextContainer())
            );
        }
    }

    private onContextRequest = (
        ev: ContextEvent<keyof ContextTypeMap>
    ): void => {
        const key = ev.name as T;

        if (!this.contexts.has(key)) {
            // if we have no context for this key and are not monitoring it ignore
            if (!this.monitorKeys?.includes(key)) {
                return;
            }
            // otherwise create it
            this.contexts.set(key, new ContextContainer());
        }

        const contexts = this.contexts.get(key)!;
        contexts.addCallback(ev.callback);
        ev.stopPropagation();
    };
    hostConnected(): void {
        this.host.addEventListener('context-request', this.onContextRequest);
    }
    hostDisconnected(): void {
        this.contexts.forEach((context) => context.clearCallbacks());
        this.contexts.clear();
    }
}
ContextEvent;
