import { expect } from "iko"
import { MessageResolver, ObjectMessageLoader, MessageResolvingError } from ".."

describe("MessageResolver", () => {
    let messageResolver: MessageResolver

    before(async () => {
        messageResolver = await MessageResolver.create(new ObjectMessageLoader({
            "close": "Close",
            "msg": "Welcome, {{0}}",
            "numberOfMails": {
                "0": "No mails",
                "1": "One mail",
                "2": "Two mails",
                "n": "{{n}} mails",
            }
        }, {
            "de": {
                "msg": "Herzlich Willkommen, {{0}}",
                "numberOfMails": {
                    0: "Keine Nachrichten für {{0}}",
                    1: "Eine Nachricht für {{0}}",
                    "n": "{{n}} Nachrichten für {{0}}",
                },
            },
        }), "de")
    })

    describe("m", () => {
        it("should resolve and format message", () => {
            expect(messageResolver.m("msg", "John")).toBe("Herzlich Willkommen, John")
        })

        it("should resolve fallback message", () => {
            expect(messageResolver.m("close")).toBe("Close")
        })
    })

    describe("mpl", () => {
        it("should format message for 0", () => {
            expect(messageResolver.mpl("numberOfMails", 0, "John")).toBe("Keine Nachrichten für John")
        })

        it("should format message for 1", () => {
            expect(messageResolver.mpl("numberOfMails", 1, "John")).toBe("Eine Nachricht für John")
        })

        it("should format message for 2", () => {
            expect(messageResolver.mpl("numberOfMails", 2, "John")).toBe("2 Nachrichten für John")
        })
    })

    describe("errorReporting", () => {
        describe("message", () => {
            it("should return error message when key is missing", () => {
                expect(messageResolver.m("missing")).toBe("Undefined message key: 'missing'")
            })
        })

        describe("exception", () => {
            before(() => {
                messageResolver.errorReporting = "exception"
            })

            after(() => {
                messageResolver.errorReporting = "message"
            })

            it("should return error message when key is missing", () => {
                expect(() => messageResolver.m("missing")).toThrow(new MessageResolvingError("Undefined message key: 'missing'"))
            })
        })
    })
})