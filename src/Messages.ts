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
 * `Language` defines the type used to represent a language code.
 * Language is the two character ISO-639-1 code.
 */
export type Language = Lowercase<string>

/**
 * `MessageKey` defines the key of a single message.
 */
export type MessageKey = string

/**
 * Defines the possible plural key values.
 */
export type PluralKey = number | "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "11" | "12" | "n"

/**
 * Defines the type for message being used to format plurals.
 */
export type PluralMessage = { [Property in PluralKey]?: string }

/**
 * Defines the type of a single message which is either a `string` for plain messages
 * or a plural object for plural keys.
 */
export type Message = string | PluralMessage

/**
 * `Messages` defines a mapping of message keys (strings) to
 * message patterns.
 */
export type Messages = { [key: string]: Message }
