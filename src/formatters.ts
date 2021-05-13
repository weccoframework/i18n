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

import { Formatter } from "./bundle"
import { Locale } from "./locale"
import { MessageResolver } from "./messageresolver"

/**
 * Creates a `Formatter` formatting `Date` or `number` objects based on `Intl.DateTimeFormat`.
 * 
 * @param locale locale to use
 * @param opts additional options
 * @returns 
 */
export function dateTimeFormatter(locale: Locale, opts?: Intl.DateTimeFormatOptions): Formatter {
    const format = new Intl.DateTimeFormat(locale.tag, opts)
    return (val: Date | number): string => {
        if (val instanceof Date) {
            val = val.getTime()
        }

        return format.format(val)
    }
}

/**
 * Creates a `Formatter` formatting durations given as a number of seconds using a
 * `Intl.RelativeTimeFormat`.
 * @param locale the locale
 * @param opts additional options
 * @returns 
 */
export function relativeDateFormatter(locale: Locale, opts?: Intl.RelativeTimeFormatOptions): Formatter {
    const format = new Intl.RelativeTimeFormat(locale.tag, opts)
    return (val: number): string => {
        const negativeFactor = val < 0 ? -1 : 1

        val = Math.floor(Math.abs(val))
        if (val < 60) {
            return format.format(negativeFactor * val, "second")
        }

        val = Math.floor(val / 60)
        if (val < 60) {
            return format.format(negativeFactor * val, "minute")
        }

        val = Math.floor(val / 60)
        if (val < 24) {
            return format.format(negativeFactor * val, "hour")
        }
        
        return format.format(negativeFactor * Math.floor(val / 24), "day")
    }
}

/**
 * Creates a `Formatter` formatting `number` objects based on `Intl.NumberFormat`.
 * 
 * @param locale locale to use
 * @param opts additional options passed to 
 * @returns 
 */
export function numberFormatter(locale: Locale, opts?: Intl.NumberFormatOptions): Formatter {
    const format = new Intl.NumberFormat(locale.tag, opts)
    return (val: any): string => format.format(val)    
}

/**
 * Registers a set of "standard" formatters to the bundle managed by the given `MessageResolver`.
 * See the documentation for a list of registered formatters.
 * @param messageResolver the message resolver to register the formatters with
 * @returns 
 */
export function registerStandardFormatters (messageResolver: MessageResolver): MessageResolver {
    messageResolver.bundle.formatters.set("date", dateTimeFormatter(messageResolver.locale, {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }))

    messageResolver.bundle.formatters.set("time", dateTimeFormatter(messageResolver.locale, { 
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    }))

    messageResolver.bundle.formatters.set("datetime", dateTimeFormatter(messageResolver.locale, { 
        dateStyle: "short",
        timeStyle: "short",
    }))

    messageResolver.bundle.formatters.set("relativeTime", relativeDateFormatter(messageResolver.locale))

    messageResolver.bundle.formatters.set("integer", numberFormatter(messageResolver.locale, {
        maximumFractionDigits: 0,
    }))

    return messageResolver
}