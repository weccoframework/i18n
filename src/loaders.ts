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
import { Language, Messages } from "./Messages"

/**
 * An implementation of `MessageLoader` that "loads" `Messages` from given objects.
 * This implemenation is especially usefull when loading messages from JSON files that are included
 * during Javascript assembly.
 */
export class DirectMessageLoader implements MessageLoader {
    constructor(private readonly defaultMessages: Messages, private readonly messagesByLanguage: { [key in Language]: Messages }) { }

    loadDefaultMessages(): Promise<Messages> {
        return Promise.resolve(this.defaultMessages)
    }

    loadMessages(language: Language): Promise<Messages | undefined> {
        return Promise.resolve(this.messagesByLanguage[language])
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
            throw `Invalid number of loaders to merge: ${loaders.length}`
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
        const msg = loaded[0] ?? {}
        loaded.slice(1).forEach(m => {
            if (!m) {
                return
            }
            Object.keys(m).forEach(k => {
                msg[k] = m[k]
            })
        })

        return msg
    }
}