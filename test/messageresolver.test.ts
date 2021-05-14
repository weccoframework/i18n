import { expect } from "iko"
import { MessageResolver, ObjectBundleLoader, MessageResolvingError, Locale } from ".."
import { ResolvingContext } from "../src/bundle"

describe("MessageResolver", () => {
    let messageResolver: MessageResolver

    before(async () => {
        messageResolver = await MessageResolver.create(new ObjectBundleLoader({
            "de": {
                messages: {
                    "msg": "Herzlich Willkommen, {{0}}",
                    "loggedInSince": "Sie sind seit {{0:date}} eingeloggt.",
                    "numberOfMails": {
                        0: "Keine Nachrichten für {{0}}",
                        1: "Eine Nachricht für {{0}}",
                        "n": "{{n}} Nachrichten für {{0}}",
                    },
                },
                formatters: {
                    "date": (val: any, context: ResolvingContext) => new Intl.DateTimeFormat(context.locale.tag).format(val)
                }
            },
        }), new Locale("de"))
    })

    describe("m", () => {
        it("should resolve and format message", () => {
            expect(messageResolver.m("msg", "John")).toBe("Herzlich Willkommen, John")
        })

        it("should invoke formatter when message key starts with $", () => {
            expect(messageResolver.m("$date", new Date("2006-01-02T15:04:05"))).toBe("2.1.2006")
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

    describe("formats", () => {
        it("should use format", () => {
            expect(messageResolver.m("loggedInSince", new Date("2006-01-02"))).toBe("Sie sind seit 2.1.2006 eingeloggt.")
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