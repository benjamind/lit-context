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

import {
    customElement,
    LitElement,
    property,
    TemplateResult,
    html,
    CSSResult,
    css,
} from 'lit-element';
import { ContextController, LitControllerHost } from '../src/lit-context.js';
import { Logger } from './logger.js';

@customElement('my-counter')
export default class MyCounter extends LitControllerHost(LitElement) {
    @property({ type: Number }) public count = 0;

    private logger?: Logger;

    public constructor() {
        super();
        // request the logger via context
        this.addController(
            new ContextController(
                this,
                (logger) => {
                    this.logger = logger;
                },
                'logger'
            )
        );
    }
    public inc(): void {
        this.count++;
        this.logger?.log(`count ${this.count}`);
    }

    public dec(): void {
        this.count--;
        this.logger?.log(`count ${this.count}`);
    }

    protected render(): TemplateResult {
        return html`
            <button @click="${this.dec}">-</button>
            <span>${this.count}</span>
            <button @click="${this.inc}">+</button>
        `;
    }

    static get styles(): CSSResult {
        return css`
            * {
                font-size: 200%;
            }

            span {
                width: 4rem;
                display: inline-block;
                text-align: center;
            }

            button {
                width: 4rem;
                height: 4rem;
                border: none;
                border-radius: 10px;
                background-color: seagreen;
                color: white;
            }
        `;
    }
}
