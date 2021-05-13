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

import { Locale } from "./locale"

/**
 * `MessageKey` defines the key of a single message.
 */
export type MessageKey = string

/**
 * Defines the possible plural key values.
 */
export type PluralKey = number | "n"

/**
 * Defines the type for message being used to format plurals.
 */
export type PluralMessage = Map<PluralKey, string>

/**
 * Defines the type of a single message which is either a `string` for plain messages
 * or a plural object for plural keys.
 */
export type Message = string | PluralMessage

/**
 * `Messages` defines a mapping of message keys (strings) to
 * message patterns.
 */
export type Messages = Map<MessageKey, Message>

/**
 * A `ResolvingContext` defines the interface for a context surrounding
 * a resolving transaction.
 */
export interface ResolvingContext {
    /** The effective locale in use */
    locale: Locale

    /**
     * Resolves the pluralized version of the given message key based on the given amount.
     * Formats the message using the given arguments.
     * @param key the message key
     * @param amount the amount
     * @param args additional arguments
     * @returns the formatted message or an error message
     */
    mpl(key: MessageKey, amount: number, ...args: Array<unknown>): string

    /**
     * Resolves a message key and format the message using the given arguments.
     * @param key the message key
     * @param args additional arguments used during formatting
     * @returns the formatted message or an error message
     */
    m(key: MessageKey, ...args: Array<unknown>): string
}

/**
 * A `Formatter` is a function that formats a given value.
 * Examples are number formatters, date formatters, ...
 */
export interface Formatter {
    (value: any, context: ResolvingContext): string
}

/**
 * A `Bundle` is a combined set of `Messages` and
 * formatters.
 */
export interface Bundle {
    messages: Messages
    formatters: Map<string, Formatter>
}
