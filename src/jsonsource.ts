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
 * Creates a `JsonSource` that loads a static URL via HTTP GET using the 
 * `fetch` function.
 * @param url the URL to fetch
 * @param options additional fetch options
 * @returns a JsonSource
 */
export function fetchJson(url: string, options?: RequestInit): JsonSource {
    return (): Promise<string | undefined> => {
        return fetchText(url, options)
    }
}

/**
 * Creates new `JsonSource` which loads messages by making a HTTP `GET` request
 * using the `fetch` function.
 * The URL is constructed from the given `baseUrl` and the locale. For every
 * locale, the URL is `<baseUrl>/<locale>.json`.
 * 
 * @param baseUrl the baseUrl
 * @param options additional options being passed to every `fetch` call
 * @returns a `JsonSource`
 */
export function fetchJsonByLocale(baseUrl: string, options?: RequestInit): JsonSource {
    return (locale: Locale): Promise<string | undefined> => {
        return fetchText(`${baseUrl}/${locale.tag}.json`, options)
    }
}

function fetchText(url: string, options?: RequestInit): Promise<string | undefined> {
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

            if (response.status === 404) {
                return Promise.resolve(undefined)
            }
            
            throw `Got unexpected status code when loading '${url}': ${response.status} (${response.statusText})`
        })
}