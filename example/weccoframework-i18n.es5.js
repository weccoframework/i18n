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
class Locale {
    constructor(tag) {
        this.tag = tag;
        if (this.tag.length < 2) {
            throw TypeError(`Invalid locale: "${this.tag}"`);
        }
    }
    /**
     * Returns a new Locale which contains only the language
     * attribute from this locale. Every invocation of this
     * method creates a new Locale instance.
     * @returns
     */
    stripAllButLang() {
        return new Locale(this.lang);
    }
    /**
     * Returns the base language encoded in this locale.
     */
    get lang() {
        return this.tag.substr(0, 2).toLowerCase();
    }
    /**
     * Returns whether the locale consists only of the
     * language and does not contain any other attributes
     * (such as a region).
     */
    get hasOnlyLang() {
        return this.tag.length === 2;
    }
    toString() {
        return this.tag;
    }
}

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
 * Determines the locale used by the given browser.
 * @returns the preferred language of the current browser
 */
function determineNavigatorLocale() {
    if (navigator.languages && navigator.languages.length > 0) {
        return new Locale(navigator.languages[0]);
    }
    else if (navigator.language) {
        return new Locale(navigator.language);
    }
    return new Locale("en");
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
    constructor(locale, bundle) {
        this.locale = locale;
        this.bundle = bundle;
        /**
         * `errorReporting` defines how errors during message resolving are reported. When
         * set to `message` a formatted message string is returned. Use this mode for development.
         * When set to `exception` an exception will be thrown.
         */
        this.errorReporting = "message";
    }
    /**
     * Factory method that creates a `MessageResolver` from the messages loaded by the given
     * `BundleLoader`. This method uses either the given `Locale` or the browser's default
     * Locale for determining localized versions of the messages.
     * @param loader the message loader
     * @param Locale optional Locale to use. Defaults to the browser's Locale
     * @returns a Promise resolving to a `BundleLoader` instance
     */
    static create(loader, locale) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const localeToUse = locale !== null && locale !== void 0 ? locale : determineNavigatorLocale();
            const bundle = (_a = yield loader.load(localeToUse)) !== null && _a !== void 0 ? _a : {
                messages: new Map(),
                formatters: new Map(),
            };
            return new MessageResolver(localeToUse, bundle);
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
        if (key.startsWith("$")) {
            // If the message key starts with a dollar sign, it is a reference
            // to a formatter to be applied directly to the first argument.
            if (args.length !== 1) {
                return this.reportError(`Formatter message must be formatted with exactly one argument, ${args} given`);
            }
            const formatterKey = key.substr(1);
            if (!this.bundle.formatters.has(formatterKey)) {
                return this.reportError(`Missing formatter: ${formatterKey}`);
            }
            return this.bundle.formatters.get(formatterKey)(args[0], this);
        }
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
        if (this.bundle.messages.has(key)) {
            return this.bundle.messages.get(key);
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
        const parts = msg.split(/(\{\{(\d+|n)(:[a-zA-Z]+)?\}\})/);
        if (parts.length === 1) {
            // Message contains no placeholders. Return the message
            return msg;
        }
        let result = "";
        let i = 0;
        while (i < parts.length) {
            // The first part is always a string literal
            result += parts[i];
            i++;
            if (i < parts.length) {
                // If there are more parts, we find at least
                // three:
                // - the whole marker (ignored)
                // - the index or "n"
                // - the format to apply (may be undefined)
                i++;
                let val;
                if (parts[i] === "n") {
                    val = amount;
                }
                else {
                    val = args[parseInt(parts[i])];
                }
                i++;
                if (typeof parts[i] === "undefined") {
                    // No format has been given
                    result += val;
                }
                else {
                    // Apply the format. parts[i] contains
                    // the leading colon so we remove that
                    // first
                    const formatter = this.bundle.formatters.get(parts[i].substr(1));
                    if (typeof formatter === "undefined") {
                        if (this.errorReporting === "message") {
                            result += `Missing formatter: ${parts[i].substr(1)}`;
                        }
                        else {
                            throw new MessageResolvingError(`Missing formatter: ${parts[i].substr(1)}`);
                        }
                    }
                    else {
                        result += formatter(val, this);
                    }
                }
                i++;
            }
        }
        return result;
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
 * An implementation of `BundleLoader` that "loads" `Bundle`s from given Javascript objects.
 * This implemenation is especially usefull when loading messages from JSON files that are included
 * during Javascript assembly.
 */
class ObjectBundleLoader {
    constructor(bundlesByLanguage) {
        this.bundlesByLanguage = bundlesByLanguage !== null && bundlesByLanguage !== void 0 ? bundlesByLanguage : {};
    }
    load(locale) {
        if (typeof this.bundlesByLanguage[locale.tag] === "undefined") {
            if (!locale.hasOnlyLang) {
                return this.load(locale.stripAllButLang());
            }
            return Promise.resolve(undefined);
        }
        return Promise.resolve(this.transformBundle(this.bundlesByLanguage[locale.tag]));
    }
    transformBundle(o) {
        const bundle = {
            messages: new Map(),
            formatters: new Map(),
        };
        if (typeof o.messages !== "undefined") {
            Object.keys(o.messages).forEach(key => bundle.messages.set(key, this.transformMessage(o.messages[key])));
        }
        if (typeof o.formatters !== "undefined") {
            Object.keys(o.formatters).forEach(key => bundle.formatters.set(key, o.formatters[key]));
        }
        return bundle;
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
 * An implementation of `BundleLoader` that merges `Messages` loaded from
 * multiple `BundleLoaders` before returning them to the caller.
 *
 * The order in which loaders are given to instances of this class is
 * important as it defines how single messages get overwritten.
 */
class CascadingBundleLoader {
    constructor(...loaders) {
        if (loaders.length < 2) {
            throw new Error(`Invalid number of loaders to merge: ${loaders.length}`);
        }
        this.loaders = loaders;
    }
    load(locale) {
        return this.mergeBundle(this.loaders.map(l => l.load(locale)));
    }
    mergeBundle(input) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const loaded = yield Promise.all(input);
            const bundle = (_a = loaded[0]) !== null && _a !== void 0 ? _a : {
                messages: new Map(),
                formatters: new Map(),
            };
            loaded.slice(1).forEach(b => {
                if (!b) {
                    return;
                }
                b.messages.forEach((val, key) => bundle.messages.set(key, val));
                b.formatters.forEach((val, key) => bundle.formatters.set(key, val));
            });
            return bundle;
        });
    }
}
/**
 * Error stating that loading some JSON ressource failed.
 */
class JsonBundleLoaderError extends Error {
    constructor(msg) {
        super(msg);
    }
}
/**
 * A `BundleLoader` that loads messages from `JsonSource`s. The loader parses
 * the JSON and normalizes the plural messages by replacing string notated numbers,
 * i.e. `"1"` with their numeric keys.
 */
class JsonBundleLoader {
    constructor(source) {
        this.source = source;
    }
    load(locale) {
        return this.source(locale)
            .then(s => typeof s === "undefined" && !locale.hasOnlyLang
            ? this.load(locale.stripAllButLang())
            : this.parseJson(s));
    }
    parseJson(jsonString) {
        if (typeof jsonString === "undefined") {
            return jsonString;
        }
        const bundle = {
            messages: new Map(),
            formatters: new Map(),
        };
        const parsed = JSON.parse(jsonString);
        Object.keys(parsed).forEach(messageKey => {
            const msg = parsed[messageKey];
            if (typeof msg === "string") {
                bundle.messages.set(messageKey, msg);
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
                        throw new JsonBundleLoaderError(`invalid plural key '${pluralKey}' for message key '${messageKey}'`);
                    }
                });
                bundle.messages.set(messageKey, pluralMessage);
            }
        });
        return bundle;
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
 * Creates a `JsonSource` that loads a static URL via HTTP GET using the
 * `fetch` function.
 * @param url the URL to fetch
 * @param options additional fetch options
 * @returns a JsonSource
 */
function fetchJson(url, options) {
    return () => {
        return fetchText(url, options);
    };
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
function fetchJsonByLocale(baseUrl, options) {
    return (locale) => {
        return fetchText(`${baseUrl}/${locale.tag}.json`, options);
    };
}
function fetchText(url, options) {
    var _a;
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
 * Creates a `Formatter` formatting `Date` or `number` objects based on `Intl.DateTimeFormat`.
 *
 * @param locale locale to use
 * @param opts additional options
 * @returns
 */
function dateTimeFormatter(locale, opts) {
    const format = new Intl.DateTimeFormat(locale.tag, opts);
    return (val) => {
        if (val instanceof Date) {
            val = val.getTime();
        }
        return format.format(val);
    };
}
/**
 * Creates a `Formatter` formatting durations given as a number of milliseconds using a
 * `Intl.RelativeTimeFormat`.
 * @param locale the locale
 * @param opts additional options
 * @returns
 */
function relativeDateFormatter(locale, opts) {
    const format = new Intl.RelativeTimeFormat(locale.tag, opts);
    return (val) => {
        const negativeFactor = val < 0 ? -1 : 1;
        val = Math.floor(Math.abs(val / 1000));
        if (val < 60) {
            return format.format(negativeFactor * val, "second");
        }
        val = Math.floor(val / 60);
        if (val < 60) {
            return format.format(negativeFactor * val, "minute");
        }
        val = Math.floor(val / 60);
        if (val < 24) {
            return format.format(negativeFactor * val, "hour");
        }
        return format.format(negativeFactor * Math.floor(val / 24), "day");
    };
}
/**
 * Creates a `Formatter` formatting `number` objects based on `Intl.NumberFormat`.
 *
 * @param locale locale to use
 * @param opts additional options passed to
 * @returns
 */
function numberFormatter(locale, opts) {
    const format = new Intl.NumberFormat(locale.tag, opts);
    return (val) => format.format(val);
}
/**
 * Registers a set of "standard" formatters to the bundle managed by the given `MessageResolver`.
 * See the documentation for a list of registered formatters.
 * @param messageResolver the message resolver to register the formatters with
 * @returns
 */
function registerStandardFormatters(messageResolver) {
    messageResolver.bundle.formatters.set("date", dateTimeFormatter(messageResolver.locale, {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }));
    messageResolver.bundle.formatters.set("time", dateTimeFormatter(messageResolver.locale, {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    }));
    messageResolver.bundle.formatters.set("datetime", dateTimeFormatter(messageResolver.locale, {
        dateStyle: "short",
        timeStyle: "short",
    }));
    messageResolver.bundle.formatters.set("relativeTime", relativeDateFormatter(messageResolver.locale));
    messageResolver.bundle.formatters.set("integer", numberFormatter(messageResolver.locale, {
        maximumFractionDigits: 0,
    }));
    return messageResolver;
}

export { CascadingBundleLoader, JsonBundleLoader, Locale, MessageResolver, MessageResolvingError, ObjectBundleLoader, dateTimeFormatter, fetchJson, fetchJsonByLocale, numberFormatter, registerStandardFormatters, relativeDateFormatter };
//# sourceMappingURL=weccoframework-i18n.es5.js.map
