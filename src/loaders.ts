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
import { Language, Message, MessageKey, Messages, PluralKey } from "./Messages"

export type MessagesObject = {[messageKey in MessageKey]: string | {[pluralKey: string]: string}}

export type MessagesByLanguage = {[key in Language]: MessagesObject}

/**
 * An implementation of `MessageLoader` that "loads" `Messages` from given Javascript objects.
 * This implemenation is especially usefull when loading messages from JSON files that are included
 * during Javascript assembly.
 */
export class ObjectMessageLoader implements MessageLoader {
    private readonly messagesByLanguage: MessagesByLanguage
    
    constructor(private readonly defaultMessages: MessagesObject, messagesByLanguage?: MessagesByLanguage) { 
        this.messagesByLanguage = messagesByLanguage ?? {}
    }

    loadDefaultMessages(): Promise<Messages> {
        return Promise.resolve(this.transformMessagesObject(this.defaultMessages))
    }

    loadMessages(language: Language): Promise<Messages | undefined> {
        if (typeof this.messagesByLanguage[language] === "undefined") {
            return Promise.resolve(undefined)
        }

        return Promise.resolve(this.transformMessagesObject(this.messagesByLanguage[language]))
    }

    private transformMessagesObject(o: MessagesObject): Messages {
        const m = new Map<MessageKey, Message>()
        Object.keys(o).forEach(key => m.set(key, this.transformMessage(o[key])))
        return m
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
 * An implementation of `MessageLoader` that merges `Messages` loaded from
 * multiple `MessageLoaders` before returning them to the caller.
 * 
 * The order in which loaders are given to instances of this class is
 * important as it defines how single messages get overwritten.
 */
export class CascadingMessageLoader implements MessageLoader {
    private readonly loaders: Array<MessageLoader>

    constructor(...loaders: Array<MessageLoader>) {
        if (loaders.length < 2) {
            throw new Error(`Invalid number of loaders to merge: ${loaders.length}`)
        }
        this.loaders = loaders
    }

    async loadDefaultMessages(): Promise<Messages> {
        return this.mergeMessages(this.loaders.map(l => l.loadDefaultMessages()))
    }

    loadMessages(language: Language): Promise<Messages | undefined> {
        return this.mergeMessages(this.loaders.map(l => l.loadMessages(language)))
    }

    private async mergeMessages(input: Array<Promise<Messages | undefined>>): Promise<Messages> {
        const loaded = await Promise.all(input)
        const msg = loaded[0] ?? new Map<MessageKey, Message>()        
        
        loaded.slice(1).forEach(m => {
            if (!m) {
                return
            }
            m.forEach((val, key) => msg.set(key, val))
        })

        return msg
    }
}

export type JsonMessages = {[key: string]: string | {[pluralKey: string]: string}}

/**
 * A strategy interface used for different loaders loading JSON representation
 * of a message.
 */
export interface JsonSource {
    (language?: Language): Promise<string | undefined>
}

export class JsonMessageLoaderError extends Error {
    constructor (msg: string) {
        super(msg)
    }
}

/**
 * A `MessageLoader` that loads messages from `JsonSource`s. The loader parses
 * the JSON and normalizes the plural messages by replacing string notated numbers,
 * i.e. `"1"` with their numeric keys.
 */
export class JsonMessageLoader implements MessageLoader {
    private readonly localizedLoader: JsonSource
    constructor(private readonly defaultsLoader: JsonSource, localizedLoader?: JsonSource) { 
        this.localizedLoader = localizedLoader ?? this.defaultsLoader
    }

    loadDefaultMessages(): Promise<Messages> {
        return this.parseJson(this.defaultsLoader())
    }

    loadMessages(language: Language): Promise<Messages | undefined> {
        return this.parseJson(this.localizedLoader(language))
    }

    private async parseJson(input: Promise<string | undefined>): Promise<Messages | undefined> {
        const jsonString = await input
        if (typeof jsonString === "undefined") {
            return jsonString
        }

        const messages = new Map<MessageKey, Message>()

        const parsed = JSON.parse(jsonString) as JsonMessages
        Object.keys(parsed).forEach(messageKey => {
            const msg = parsed[messageKey] 
            if (typeof msg === "string") {
                messages.set(messageKey, msg)
            } else {
                const pluralMessage = new Map<PluralKey, string>()
                Object.keys(parsed[messageKey]).forEach((pluralKey: string) => {
                    if (pluralKey.match(/^[0-9]+$/)) {
                        pluralMessage.set(parseInt(pluralKey), msg[pluralKey])
                    } else if (pluralKey === "n") {
                        pluralMessage.set("n", msg[pluralKey])                    
                    } else {
                        throw new JsonMessageLoaderError(`invalid plural key '${pluralKey}' for message key '${messageKey}'`)
                    }
                })
                messages.set(messageKey, pluralMessage)
            }
        })

        return messages
    }
}