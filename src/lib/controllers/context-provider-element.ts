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

import { customElement, LitElement, property } from 'lit-element';
import { LitControllerHost, ContextProvider } from '../../lit-context.js';
import { ContextTypeMap } from '../context-event.js';

declare global {
    interface HTMLElementTagNameMap {
        'context-provider': ContextProviderElement<keyof ContextTypeMap>;
    }
}

@customElement('context-provider')
export class ContextProviderElement<
    T extends keyof ContextTypeMap
> extends LitControllerHost(LitElement) {
    private localValue?: ContextTypeMap[T];

    @property({ attribute: false })
    public set value(value: ContextTypeMap[T]) {
        this.localValue = value;
        if (this.context) {
            this.context.value = value;
        }
    }

    private context?: ContextProvider<T>;

    @property()
    public set name(value: string) {
        if (!this.context) {
            this.context = new ContextProvider(this, value as T);
            this.addController(this.context);
            if (this.localValue) {
                this.context.value = this.localValue;
            }
        } else {
            throw new Error('Can only set context provider element name once!');
        }
    }

    public createRenderRoot(): Element {
        return this;
    }
}
