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

import {
    html,
    TemplateResult,
    customElement,
    LitElement,
    property,
} from 'lit-element';

import {
    ContextController,
    ContextProvider,
    LitControllerHost,
} from '../src/lit-context.js';

import './counter.js';

// declare the context we'll provide
declare module '../src/lit-context.js' {
    interface ContextTypeMap {
        'random-image': HTMLImageElement;
    }
}

@customElement('async-provider-demo')
export class AsyncProviderDemo extends LitControllerHost(LitElement) {
    private imageProvider: ContextProvider<'random-image'>;

    public constructor() {
        super();

        this.imageProvider = new ContextProvider(this, 'random-image');
        this.addController(this.imageProvider);
    }

    public render(): TemplateResult {
        return html`
            <h3>Async ContextProvider Example</h3>
            <p>
                In this example we show a context provider which asynchronously
                satsifies a request for an image.
            </p>
            <image-element></image-element>
            <button @click=${this.loadImage}>Load Image</button>
        `;
    }

    private loadImage(): void {
        // don't do this, just use a src tag, but as an example....
        fetch('https://picsum.photos/200/300')
            .then((response) => response.blob())
            .then((myBlob) => {
                const objectURL = URL.createObjectURL(myBlob);
                const myImage = new Image();
                myImage.src = objectURL;
                this.imageProvider.setValue(myImage);
            });
    }
}

@customElement('image-element')
export class ImageElement extends LitControllerHost(LitElement) {
    @property({ attribute: false })
    public img?: HTMLImageElement;

    public constructor() {
        super();
        this.addController(
            new ContextController(
                this,
                (image) => {
                    this.img = image;
                },
                'random-image'
            )
        );
    }

    protected render() {
        return html`
            ${this.img
                ? this.img
                : html`
                      <span>Loading...</span>
                  `}
        `;
    }
}
