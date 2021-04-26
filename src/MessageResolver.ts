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

import { MessageLoader } from "./MessageLoader"
import { Language, Message, MessageKey, Messages, PluralKey, PluralMessage } from "./Messages"
import { determineNavigatorLanguage } from "./utils"

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
export class MessageResolver {
    /**
     * `errorReporting` defines how errors during message resolving are reported. When
     * set to `message` a formatted message string is returned. Use this mode for development.
     * When set to `exception` an exception will be thrown.
     */
    errorReporting: "message" | "exception" = "message"

    /**
     * Factory method that creates a `MessageResolver` from the messages loaded by the given
     * `MessageLoader`. This method uses either the given `Language` or the browser's default
     * language for determining localized versions of the messages.
     * @param loader the message loader
     * @param language optional language to use. Defaults to the browser's language
     * @returns a Promise resolving to a `MessageLoader` instance
     */
    static async create(loader: MessageLoader, language?: Language): Promise<MessageResolver> {
        const lang = language ?? determineNavigatorLanguage()
        const [defaultMessages, localizedMessages] = await Promise.all([loader.loadDefaultMessages(), loader.loadMessages(lang)])
        return new MessageResolver(defaultMessages, localizedMessages)
    }

    constructor(private readonly defaultMessages: Messages, private readonly localizedMessages?: Messages) { }

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

        if (typeof msg[amount] !== "undefined") {
            return this.formatMessage(msg[amount], args, amount)
        }

        const pm = msg as PluralMessage

        if (amount >= 0 && amount <= 12) {
            const a = `${amount}` as PluralKey
            if (typeof pm[a] !== "undefined") {
                return this.formatMessage(pm[a], args, amount)
            }
        }

        if (typeof pm.n === "undefined") {
            return this.reportError(`Missing catch-all in plural message for key '${key}'`)
        }

        return this.formatMessage(pm.n, args, amount)
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
        return (this.localizedMessages ? this.localizedMessages[key] : undefined) ?? this.defaultMessages[key] ?? this.reportError(`Undefined message key: '${key}'`)
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
        for (let i = 0; i < args.length; i++) {
            msg = msg.replace(`{{${i}}}`, `${args[i]}`)
        }

        if (typeof amount !== "undefined") {
            msg = msg.replace("{{n}}", `${amount}`)
        }

        return msg

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