/*
 * This file is part of wecco.
 * 
 * Copyright (c) 2021 Alexander Metzner.
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * A BCP 47 locale tag.
 */
export class Locale {
    constructor (public readonly tag: string) {
        if (this.tag.length < 2) {
            throw TypeError(`Invalid locale: "${this.tag}"`)
        }
    }

    /**
     * Returns a new Locale which contains only the language
     * attribute from this locale. Every invocation of this
     * method creates a new Locale instance.
     * @returns 
     */
    stripAllButLang (): Locale {
        return new Locale(this.lang)
    }

    /**
     * Returns the base language encoded in this locale.
     */
    get lang(): string {
        return this.tag.substr(0, 2).toLowerCase()
    }

    /**
     * Returns whether the locale consists only of the
     * language and does not contain any other attributes
     * (such as a region).
     */
    get hasOnlyLang(): boolean {
        return this.tag.length === 2
    }

    toString(): string {
        return this.tag
    }
}