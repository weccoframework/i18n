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

import { expect } from "iko"
import { ObjectMessageLoader, CascadingMessageLoader, JsonMessageLoader, Messages } from ".."

describe("ObjectMessageLoader", () => {
    const defaultMessages = {
        "foo": "bar",
    }

    const messagesByLanguage = {
        "de": {
            "foo": "Bar",
        },
        "en": defaultMessages,
    }
    const loader = new ObjectMessageLoader(defaultMessages, messagesByLanguage)

    describe("loadDefaultMessage", () => {
        it("should return default messages", async () => {
            expect(await loader.loadDefaultMessages())
                .toBeMap()
                .toHave("foo")
        })
    })

    describe("loadMessages", () => {
        it("should return messages when language is found", async () => {
            expect(await loader.loadMessages("de"))
                .toBeMap()
                .toHave("foo")
        })

        it("should return undefined when language is not found", async () => {
            expect(await loader.loadMessages("es")).toBeUndefined()
        })
    })
})

describe("CascadingMessageLoader", () => {
    const dl1 = new ObjectMessageLoader({
        "foo": "bar",
    }, {
        "de": {
            "foo": "Bar",
        },
        "en": {
            "foo": "bar",
        }
    })

    const dl2 = new ObjectMessageLoader({
        "spam": "eggs",
    }, {
        "de": {
            "foo": "BAR",
            "spam": "Eier",
        },
        "en": {
            "spam": "eggs",
        }
    })

    const loader = new CascadingMessageLoader(dl1, dl2)

    describe("loadDefaultMessages", () => {
        let messages: Messages
        before(async () => {
            messages = await loader.loadDefaultMessages()
        })

        it("should merge messages from first", () => {
            expect(messages.get("foo")).toBe("bar")
        })

        it("should overwrite messages from second", () => {
            expect(messages.get("spam")).toBe("eggs")
        })
    })

    describe("loadMessages", () => {
        let messages: Messages
        before(async () => {
            messages = await loader.loadMessages("de")
        })

        it("should merge messages from first", () => {
            expect(messages.get("foo")).toBe("BAR")
        })

        it("should overwrite messages from second", () => {
            expect(messages.get("spam")).toBe("Eier")
        })
    })
})

describe("JsonMessageLoader", () => {
    const messages = {
        foo: "bar",
        plural: {
            "0": "0",
            "1": "1",
            "n": "n",
        },
    }
    const source = () => Promise.resolve(JSON.stringify(messages))
    const loader = new JsonMessageLoader(source, source)

    describe("loadDefaultMessages", () => {
        let loaded: Messages

        before(async () => {
            loaded = await loader.loadDefaultMessages()
        })

        it("should load default messages", () => {
            expect(loaded.get("foo")).toBe("bar")
        })

        it("should normalized plural object", () => {
            expect(loaded.get("plural"))
                .toBeMap()
                .toHave(0)
                .toHave(1)
                .toHave("n")
        })
    })
})