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

import { Language, Messages } from "./Messages"

/**
 * `MessageLoader` defines the interface for components that
 * load `Messages`.
 */
export interface MessageLoader {
    /**
     * Instructs the loader to load the `Messages` for the given
     * `Language`. Returns a `Promise` that resolves either to 
     * the messages or `undefined` if this loader has no messages
     * for the given language. The promise rejects in case of 
     * an error.
     * @param language the language to load messages for
     * @returns a `Promise` resolving to either the messages or `undefined`
     */
    loadMessages(language: Language): Promise<Messages | undefined>

    /**
     * Loads the default languages which are used as a fallback in case
     * messages for a specific language are missing. Returns a `Promise`
     * that resolves to the default messages which are never `undefined`.
     * @returns a `Promise` resolving to the default messages
     */
    loadDefaultMessages(): Promise<Messages>
}
