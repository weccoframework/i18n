/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

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
 * An implementation of `MessageLoader` that "loads" `Messages` from given Javascript objects.
 * This implemenation is especially usefull when loading messages from JSON files that are included
 * during Javascript assembly.
 */
class ObjectMessageLoader {
    constructor(defaultMessages, messagesByLanguage) {
        this.defaultMessages = defaultMessages;
        this.messagesByLanguage = messagesByLanguage !== null && messagesByLanguage !== void 0 ? messagesByLanguage : {};
    }
    loadDefaultMessages() {
        return Promise.resolve(this.transformMessagesObject(this.defaultMessages));
    }
    loadMessages(language) {
        if (typeof this.messagesByLanguage[language] === "undefined") {
            return Promise.resolve(undefined);
        }
        return Promise.resolve(this.transformMessagesObject(this.messagesByLanguage[language]));
    }
    transformMessagesObject(o) {
        const m = new Map();
        Object.keys(o).forEach(key => m.set(key, this.transformMessage(o[key])));
        return m;
    }
    transformMessage(m) {
        if (typeof m === "string") {
            return m;
        }
        const msg = new Map();
        Object.keys(m).forEach(k => msg.set(k === "n" ? "n" : parseInt(k), m[k]));
        return msg;
    }
}
/**
 * An implementation of `MessageLoader` that merges `Messages` loaded from
 * multiple `MessageLoaders` before returning them to the caller.
 *
 * The order in which loaders are given to instances of this class is
 * important as it defines how single messages get overwritten.
 */
class CascadingMessageLoader {
    constructor(...loaders) {
        if (loaders.length < 2) {
            throw new Error(`Invalid number of loaders to merge: ${loaders.length}`);
        }
        this.loaders = loaders;
    }
    loadDefaultMessages() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.mergeMessages(this.loaders.map(l => l.loadDefaultMessages()));
        });
    }
    loadMessages(language) {
        return this.mergeMessages(this.loaders.map(l => l.loadMessages(language)));
    }
    mergeMessages(input) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const loaded = yield Promise.all(input);
            const msg = (_a = loaded[0]) !== null && _a !== void 0 ? _a : new Map();
            loaded.slice(1).forEach(m => {
                if (!m) {
                    return;
                }
                m.forEach((val, key) => msg.set(key, val));
            });
            return msg;
        });
    }
}
class JsonMessageLoaderError extends Error {
    constructor(msg) {
        super(msg);
    }
}
/**
 * A `MessageLoader` that loads messages from `JsonSource`s. The loader parses
 * the JSON and normalizes the plural messages by replacing string notated numbers,
 * i.e. `"1"` with their numeric keys.
 */
class JsonMessageLoader {
    constructor(defaultsLoader, localizedLoader) {
        this.defaultsLoader = defaultsLoader;
        this.localizedLoader = localizedLoader !== null && localizedLoader !== void 0 ? localizedLoader : this.defaultsLoader;
    }
    loadDefaultMessages() {
        return this.parseJson(this.defaultsLoader());
    }
    loadMessages(language) {
        return this.parseJson(this.localizedLoader(language));
    }
    parseJson(input) {
        return __awaiter(this, void 0, void 0, function* () {
            const jsonString = yield input;
            if (typeof jsonString === "undefined") {
                return jsonString;
            }
            const messages = new Map();
            const parsed = JSON.parse(jsonString);
            Object.keys(parsed).forEach(messageKey => {
                const msg = parsed[messageKey];
                if (typeof msg === "string") {
                    messages.set(messageKey, msg);
                }
                else {
                    const pluralMessage = new Map();
                    Object.keys(parsed[messageKey]).forEach((pluralKey) => {
                        if (pluralKey.match(/^[0-9]+$/)) {
                            pluralMessage.set(parseInt(pluralKey), msg[pluralKey]);
                        }
                        else if (pluralKey === "n") {
                            pluralMessage.set("n", msg[pluralKey]);
                        }
                        else {
                            throw new JsonMessageLoaderError(`invalid plural key '${pluralKey}' for message key '${messageKey}'`);
                        }
                    });
                    messages.set(messageKey, pluralMessage);
                }
            });
            return messages;
        });
    }
}

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
 * Determines the language used by the given browser.
 * @returns the preferred language of the current browser
 */
function determineNavigatorLanguage() {
    if (navigator.languages && navigator.languages.length > 0) {
        return extractLanguageFromLocale(navigator.languages[0]);
    }
    else if (navigator.language) {
        return extractLanguageFromLocale(navigator.language);
    }
    return "en";
}
function extractLanguageFromLocale(locale) {
    return locale.substr(0, 2).toLowerCase();
}

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
class MessageResolver {
    constructor(defaultMessages, localizedMessages) {
        this.defaultMessages = defaultMessages;
        this.localizedMessages = localizedMessages;
        /**
         * `errorReporting` defines how errors during message resolving are reported. When
         * set to `message` a formatted message string is returned. Use this mode for development.
         * When set to `exception` an exception will be thrown.
         */
        this.errorReporting = "message";
    }
    /**
     * Factory method that creates a `MessageResolver` from the messages loaded by the given
     * `MessageLoader`. This method uses either the given `Language` or the browser's default
     * language for determining localized versions of the messages.
     * @param loader the message loader
     * @param language optional language to use. Defaults to the browser's language
     * @returns a Promise resolving to a `MessageLoader` instance
     */
    static create(loader, language) {
        return __awaiter(this, void 0, void 0, function* () {
            const lang = language !== null && language !== void 0 ? language : determineNavigatorLanguage();
            const [defaultMessages, localizedMessages] = yield Promise.all([loader.loadDefaultMessages(), loader.loadMessages(lang)]);
            return new MessageResolver(defaultMessages, localizedMessages);
        });
    }
    /**
     * Resolves the pluralized version of the given message key based on the given amount.
     * Formats the message using the given arguments.
     * @param key the message key
     * @param amount the amount
     * @param args additional arguments
     * @returns the formatted message or an error message
     */
    mpl(key, amount, ...args) {
        const msg = this.resolveMessage(key);
        if (typeof msg === "string") {
            return this.reportError(`Expected message for key '${key}' to be plural object but got string "${msg}"`);
        }
        if (msg.has(amount)) {
            return this.formatMessage(msg.get(amount), args, amount);
        }
        if (msg.has("n")) {
            return this.formatMessage(msg.get("n"), args, amount);
        }
        return this.reportError(`Missing catch-all in plural message for key '${key}'`);
    }
    /**
     * Resolves a message key and format the message using the given arguments.
     * @param key the message key
     * @param args additional arguments used during formatting
     * @returns the formatted message or an error message
     */
    m(key, ...args) {
        const msg = this.resolveMessage(key);
        if (typeof msg !== "string") {
            return this.reportError(`Message for key '${key}' is a plural object; expected string`);
        }
        return this.formatMessage(msg, args);
    }
    /**
     * Resolves the message with the given `key`. Performs a lookup for the
     * key in the localized messages and if the key is not found falls back
     * to the default messages.
     * @param key the key to lookup
     * @returns the resolved key or an error message (depending on `errorReporting`)
     */
    resolveMessage(key) {
        if (this.localizedMessages) {
            if (this.localizedMessages.has(key)) {
                return this.localizedMessages.get(key);
            }
        }
        if (this.defaultMessages.has(key)) {
            return this.defaultMessages.get(key);
        }
        return this.reportError(`Undefined message key: '${key}'`);
    }
    /**
     * Formats the given message string with the arguments given. If amount is
     * given also replaces the special `n` placeholder.
     * @param msg the resolved message string
     * @param args the positional arguments
     * @param amount the optional amount argument
     * @returns the formatted message
     */
    formatMessage(msg, args, amount) {
        for (let i = 0; i < args.length; i++) {
            msg = msg.replace(`{{${i}}}`, `${args[i]}`);
        }
        if (typeof amount !== "undefined") {
            msg = msg.replace("{{n}}", `${amount}`);
        }
        return msg;
    }
    reportError(msg) {
        if (this.errorReporting === "message") {
            return msg;
        }
        throw new MessageResolvingError(msg);
    }
}
class MessageResolvingError extends Error {
    constructor(msg) {
        super(`MessageResolvingError: ${msg}`);
    }
}

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
 * Creates new `JsonSource` which loads messages by making a HTTP `GET` request.
 * The URL is constructed from the given `baseUrl` and the language. For every
 * language, the URL is `<baseUrl>/<language>.json`. When language is undefined,
 * the default messages is loaded from `<baseUrl>/default.json`.
 *
 * @param baseUrl the baseUrl
 * @param options additional options being passed to every `fetch` call
 * @returns a `JsonSource`
 */
function fetchJsonSource(baseUrl, options) {
    return (language) => {
        var _a;
        const url = `${baseUrl}/${language !== null && language !== void 0 ? language : "default"}.json`;
        return fetch(url, {
            body: options === null || options === void 0 ? void 0 : options.body,
            cache: options === null || options === void 0 ? void 0 : options.cache,
            credentials: options === null || options === void 0 ? void 0 : options.credentials,
            headers: options === null || options === void 0 ? void 0 : options.headers,
            integrity: options === null || options === void 0 ? void 0 : options.integrity,
            keepalive: options === null || options === void 0 ? void 0 : options.keepalive,
            method: (_a = options === null || options === void 0 ? void 0 : options.method) !== null && _a !== void 0 ? _a : "GET",
            mode: options === null || options === void 0 ? void 0 : options.mode,
            redirect: options === null || options === void 0 ? void 0 : options.redirect,
            referrer: options === null || options === void 0 ? void 0 : options.referrer,
            referrerPolicy: options === null || options === void 0 ? void 0 : options.referrerPolicy,
            signal: options === null || options === void 0 ? void 0 : options.signal,
            window: options === null || options === void 0 ? void 0 : options.window,
        })
            .then(response => {
            if (response.status < 300) {
                return response.text();
            }
            throw `Got unexpected status code when loading '${url}': ${response.status} (${response.statusText})`;
        });
    };
}

export { CascadingMessageLoader, JsonMessageLoader, MessageResolver, MessageResolvingError, ObjectMessageLoader, fetchJsonSource };
//# sourceMappingURL=weccoframework-i18n.es5.js.map
