/*
Copyright 2018 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { html, TemplateResult, customElement, LitElement } from 'lit-element';

import { ContextProvider, LitControllerHost } from '../src/lit-context.js';
import { Logger } from './logger.js';

import './counter.js';

// declare the context we'll provide
declare module '../src/lit-context.js' {
    interface ContextTypeMap {
        logger: Logger;
    }
}

@customElement('simple-provider-demo')
export class SimpleProviderDemo extends LitControllerHost(LitElement) {
    private logger: Logger;
    private loggerProvider: ContextProvider<'logger'>;

    public constructor() {
        super();

        this.logger = {
            log(msg: string): void {
                console.log(`logger: ${msg}`);
            },
        };

        this.loggerProvider = new ContextProvider(this, 'logger', this.logger);
        this.addController(this.loggerProvider);
    }

    public render(): TemplateResult {
        return html`
            <h3>Simple ContextProvider Example</h3>
            <p>
                In this example we show a simple context provider controller
                being used to provide a context value down to a child component.
                We also demonstrate the context value being updated.
            </p>
            <my-counter></my-counter>
            <button @click=${this.changeLogger}>Change Logger</button>
        `;
    }

    private changeLogger(): void {
        const loggerCreationTime = Date.now();
        this.logger = {
            log(msg: string): void {
                console.log(
                    `logger [created at ${loggerCreationTime}]: ${msg}`
                );
            },
        };
        this.loggerProvider.setValue(this.logger);
    }
}
