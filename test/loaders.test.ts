import { expect } from "iko"
import { ObjectMessageLoader, CascadingMessageLoader, Messages } from ".."
import { JsonMessageLoader } from "../src/loaders"

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