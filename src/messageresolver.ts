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

import { Message, MessageKey, Bundle, ResolvingContext } from "./bundle"
import { BundleLoader } from "./loader"
import { Locale } from "./locale"
import { determineNavigatorLocale } from "./utils"

/**
 * `MessageResolver` resolves and formats strings from multiple `Messages`.
 * 
 * A `MessageResolver` uses a set of default messages as well as localized messages.
 * Resolving order is to try the localized messages first and - if no match is found -
 * try the default messages.
 * 
 * Message strings may contain placeholder - denoted as `{{<index>}}` - that will be replaced
 * by positional arguments.
 * 
 * In addition, `MessageResolver` supports pluralization by appending `.1` or `.n` to the key.
 */
export class MessageResolver implements ResolvingContext {
    /**
     * `errorReporting` defines how errors during message resolving are reported. When
     * set to `message` a formatted message string is returned. Use this mode for development.
     * When set to `exception` an exception will be thrown.
     */
    errorReporting: "message" | "exception" = "message"

    /**
     * Factory method that creates a `MessageResolver` from the messages loaded by the given
     * `BundleLoader`. This method uses either the given `Locale` or the browser's default
     * Locale for determining localized versions of the messages.
     * @param loader the message loader
     * @param Locale optional Locale to use. Defaults to the browser's Locale
     * @returns a Promise resolving to a `BundleLoader` instance
     */
    static async create(loader: BundleLoader, locale?: Locale): Promise<MessageResolver> {
        const localeToUse = locale ?? determineNavigatorLocale()
        const bundle = await loader.load(localeToUse) ?? {
            messages: new Map(),
            formatters: new Map(),
        }
        return new MessageResolver(localeToUse, bundle)
    }

    constructor(readonly locale: Locale, readonly bundle: Bundle) { }

    /**
     * Resolves the pluralized version of the given message key based on the given amount.
     * Formats the message using the given arguments.
     * @param key the message key
     * @param amount the amount
     * @param args additional arguments
     * @returns the formatted message or an error message
     */
    mpl(key: MessageKey, amount: number, ...args: Array<unknown>): string {
        const msg = this.resolveMessage(key)

        if (typeof msg === "string") {
            return this.reportError(`Expected message for key '${key}' to be plural object but got string "${msg}"`)
        }

        if (msg.has(amount)) {
            return this.formatMessage(msg.get(amount), args, amount)
        }

        if (msg.has("n")) {
            return this.formatMessage(msg.get("n"), args, amount)
        }

        return this.reportError(`Missing catch-all in plural message for key '${key}'`)
    }

    /**
     * Resolves a message key and format the message using the given arguments.
     * @param key the message key
     * @param args additional arguments used during formatting
     * @returns the formatted message or an error message
     */
    m(key: MessageKey, ...args: Array<unknown>): string {
        const msg = this.resolveMessage(key)

        if (typeof msg !== "string") {
            return this.reportError(`Message for key '${key}' is a plural object; expected string`)
        }
        return this.formatMessage(msg, args)
    }

    /**
     * Resolves the message with the given `key`. Performs a lookup for the
     * key in the localized messages and if the key is not found falls back
     * to the default messages.
     * @param key the key to lookup
     * @returns the resolved key or an error message (depending on `errorReporting`)
     */
    private resolveMessage(key: MessageKey): Message {
        if (this.bundle.messages.has(key)) {
            return this.bundle.messages.get(key)
        }

        return this.reportError(`Undefined message key: '${key}'`)
    }

    /**
     * Formats the given message string with the arguments given. If amount is
     * given also replaces the special `n` placeholder.
     * @param msg the resolved message string
     * @param args the positional arguments
     * @param amount the optional amount argument
     * @returns the formatted message
     */
    private formatMessage(msg: string, args: Array<unknown>, amount?: number): string {
        const parts = msg.split(/(\{\{(\d+|n)(:[a-zA-Z]+)?\}\})/)
        
        if (parts.length === 1) {
            // Message contains no placeholders. Return the message
            return msg
        }

        let result = ""
        let i = 0
        while (i < parts.length) {
            // The first part is always a string literal
            result += parts[i]
            i++        
            if (i < parts.length) {
                // If there are more parts, we find at least
                // three:
                // - the whole marker (ignored)
                // - the index or "n"
                // - the format to apply (may be undefined)
                i++
                let val: any
                if (parts[i] === "n") {
                    val = amount
                } else {
                    val = args[parseInt(parts[i])]
                }
                i++
                
                if (typeof parts[i] === "undefined") {
                    // No format has been given
                    result += val
                } else {
                    // Apply the format. parts[i] contains
                    // the leading colon so we remove that
                    // first
                    const formatter = this.bundle.formatters.get(parts[i].substr(1))
                    if (typeof formatter === "undefined") {
                        if (this.errorReporting === "message") {
                            result += `Missing formatter: ${parts[i].substr(1)}`
                        } else {
                            throw new MessageResolvingError(`Missing formatter: ${parts[i].substr(1)}`)
                        }
                    } else {
                        result += formatter(val, this)
                    }
                }
                i++
            }
        }

        return result
    }

    private reportError(msg: string): string {
        if (this.errorReporting === "message") {
            return msg
        }

        throw new MessageResolvingError(msg)
    }
}

export class MessageResolvingError extends Error {
    constructor(msg: string) {
        super(`MessageResolvingError: ${msg}`)
    }
}