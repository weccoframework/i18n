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

import { Bundle, Formatter, Message, MessageKey, PluralKey } from "./bundle"
import { BundleLoader } from "./loader"
import { Locale } from "./locale"

export interface BundleObject {
    messages?: { [messageKey: string]: string | {[pluralKey: string]: string} }
    formatters?: {[formatterKey in string]: Formatter}
}

export type BundlesByLanguage = {[locale: string]: BundleObject}

/**
 * An implementation of `BundleLoader` that "loads" `Bundle`s from given Javascript objects.
 * This implemenation is especially usefull when loading messages from JSON files that are included
 * during Javascript assembly.
 */
export class ObjectBundleLoader implements BundleLoader {
    private readonly bundlesByLanguage: BundlesByLanguage
    
    constructor(bundlesByLanguage?: BundlesByLanguage) { 
        this.bundlesByLanguage = bundlesByLanguage ?? {}
    }

    load(locale: Locale): Promise<Bundle | undefined> {
        if (typeof this.bundlesByLanguage[locale.tag] === "undefined") {
            if (!locale.hasOnlyLang) {
                return this.load(locale.stripAllButLang())
            }
            return Promise.resolve(undefined)
        }

        return Promise.resolve(this.transformBundle(this.bundlesByLanguage[locale.tag]))
    }

    private transformBundle(o: BundleObject): Bundle {
        const bundle: Bundle = {
            messages: new Map<MessageKey, Message>(),
            formatters: new Map<string, Formatter>(),
        }
        
        if (typeof o.messages !== "undefined") {
            Object.keys(o.messages).forEach(key => bundle.messages.set(key, this.transformMessage(o.messages[key])))
        }
        
        if (typeof o.formatters !== "undefined") {
            Object.keys(o.formatters).forEach(key => bundle.formatters.set(key, o.formatters[key]))
        }

        return bundle
    }

    private transformMessage(m: string | {[pluralKey: string]: string}): Message {
        if (typeof m === "string") {
            return m
        }

        const msg = new Map<PluralKey, string>()

        Object.keys(m).forEach(k => msg.set(k === "n" ? "n" : parseInt(k), m[k]))

        return msg
    }
}

/**
 * An implementation of `BundleLoader` that merges `Messages` loaded from
 * multiple `BundleLoaders` before returning them to the caller.
 * 
 * The order in which loaders are given to instances of this class is
 * important as it defines how single messages get overwritten.
 */
export class CascadingBundleLoader implements BundleLoader {
    private readonly loaders: Array<BundleLoader>

    constructor(...loaders: Array<BundleLoader>) {
        if (loaders.length < 2) {
            throw new Error(`Invalid number of loaders to merge: ${loaders.length}`)
        }
        this.loaders = loaders
    }

    load(locale: Locale): Promise<Bundle | undefined> {
        return this.mergeBundle(this.loaders.map(l => l.load(locale)))
    }

    private async mergeBundle(input: Array<Promise<Bundle | undefined>>): Promise<Bundle> {
        const loaded = await Promise.all(input)
        
        const bundle: Bundle = loaded[0] ?? {
            messages: new Map<MessageKey, Message>(),
            formatters: new Map<string, Formatter>(),
        }
        
        loaded.slice(1).forEach(b => {
            if (!b) {
                return
            }
            
            b.messages.forEach((val, key) => bundle.messages.set(key, val))
            b.formatters.forEach((val, key) => bundle.formatters.set(key, val))
        })

        return bundle
    }
}

export type JsonMessages = {[key: string]: string | {[pluralKey: string]: string}}

/**
 * A strategy interface used for different loaders loading JSON representation
 * of a message.
 */
export interface JsonSource {
    (locale: Locale): Promise<string | undefined>
}

/**
 * Error stating that loading some JSON ressource failed.
 */
export class JsonBundleLoaderError extends Error {
    constructor (msg: string) {
        super(msg)
    }
}

/**
 * A `BundleLoader` that loads messages from `JsonSource`s. The loader parses
 * the JSON and normalizes the plural messages by replacing string notated numbers,
 * i.e. `"1"` with their numeric keys.
 */
export class JsonBundleLoader implements BundleLoader {
    constructor(private readonly source: JsonSource) { }

    load(locale: Locale): Promise<Bundle | undefined> {
        return this.source(locale)
                .then(s => typeof s === "undefined" && !locale.hasOnlyLang 
                    ? this.load(locale.stripAllButLang()) 
                    : this.parseJson(s)
                )
    }

    private parseJson(jsonString: string | undefined): Bundle | undefined {
        if (typeof jsonString === "undefined") {
            return jsonString
        }

        const bundle = {
            messages: new Map<MessageKey, Message>(),
            formatters: new Map<string, Formatter>(),
        }

        const parsed = JSON.parse(jsonString) as JsonMessages
        Object.keys(parsed).forEach(messageKey => {
            const msg = parsed[messageKey] 
            if (typeof msg === "string") {
                bundle.messages.set(messageKey, msg)
            } else {
                const pluralMessage = new Map<PluralKey, string>()
                Object.keys(parsed[messageKey]).forEach((pluralKey: string) => {
                    if (pluralKey.match(/^[0-9]+$/)) {
                        pluralMessage.set(parseInt(pluralKey), msg[pluralKey])
                    } else if (pluralKey === "n") {
                        pluralMessage.set("n", msg[pluralKey])                    
                    } else {
                        throw new JsonBundleLoaderError(`invalid plural key '${pluralKey}' for message key '${messageKey}'`)
                    }
                })
                bundle.messages.set(messageKey, pluralMessage)
            }
        })

        return bundle
    }
}