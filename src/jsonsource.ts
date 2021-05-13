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

import { JsonSource } from "./loaders"
import { Locale } from "./locale"

/**
 * Creates new `JsonSource` which loads messages by making a HTTP `GET` request.
 * The URL is constructed from the given `baseUrl` and the locale. For every
 * locale, the URL is `<baseUrl>/<locale>.json`. When locale is `undefined`,
 * the default messages is loaded from `<baseUrl>/default.json`.
 * 
 * @param baseUrl the baseUrl
 * @param options additional options being passed to every `fetch` call
 * @returns a `JsonSource`
 */
export function fetchJsonSource(baseUrl: string, options?: RequestInit): JsonSource {
    return (locale: Locale): Promise<string | undefined> => {
        const url = `${baseUrl}/${locale?.tag ?? "default"}.json`
        return fetch(url, {
            body: options?.body,
            cache: options?.cache,
            credentials: options?.credentials,
            headers: options?.headers,
            integrity: options?.integrity,
            keepalive: options?.keepalive,
            method: options?.method ?? "GET",
            mode: options?.mode,
            redirect: options?.redirect,
            referrer: options?.referrer,
            referrerPolicy: options?.referrerPolicy,
            signal: options?.signal,
            window: options?.window,
        })
            .then(response => {
                if (response.status < 300) {
                    return response.text()
                }
                throw `Got unexpected status code when loading '${url}': ${response.status} (${response.statusText})`
            })
    }
}