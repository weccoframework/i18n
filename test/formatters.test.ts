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
import { Locale, ResolvingContext, dateTimeFormatter, relativeDateFormatter } from ".."

const contextMock: ResolvingContext = {
    locale: new Locale("de-DE"),
    m: () => "not implemented",
    mpl: () => "not implemented",
}

describe("formatters", () => {
    describe("dateTimeFormatter", () => {
        const formatter = dateTimeFormatter(new Locale("de-DE"), {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",        
        })

        it("should format date", () => {
            expect(formatter(new Date("2006-01-02T15:04:05"), contextMock)).toBe("02.01.2006")
        })

        it("should format timestamp", () => {
            expect(formatter(new Date("2006-01-02T15:04:05").getTime(), contextMock)).toBe("02.01.2006")
        })
    })

    describe("relativeTimeFormatter", () => {
        const formatter = relativeDateFormatter(new Locale("de-DE"))

        it("should format seconds in the future", () => {
            expect(formatter(45 * 1000, contextMock)).toBe("in 45 Sekunden")
        })

        it("should format seconds in the past", () => {
            expect(formatter(-45 * 1000, contextMock)).toBe("vor 45 Sekunden")
        })

        it("should format minutes in the future", () => {
            expect(formatter(45 * 60 * 1000, contextMock)).toBe("in 45 Minuten")
        })

        it("should format minutes in the past", () => {
            expect(formatter(-45 * 60 * 1000, contextMock)).toBe("vor 45 Minuten")
        })

        it("should format hours in the future", () => {
            expect(formatter(18 * 60 * 60 * 1000, contextMock)).toBe("in 18 Stunden")
        })

        it("should format hours in the past", () => {
            expect(formatter(-18 * 60 * 60 * 1000, contextMock)).toBe("vor 18 Stunden")
        })

        it("should format days in the future", () => {
            expect(formatter(18 * 60 * 60 * 24 * 1000, contextMock)).toBe("in 18 Tagen")
        })

        it("should format days in the past", () => {
            expect(formatter(-18 * 60 * 60 * 24 * 1000, contextMock)).toBe("vor 18 Tagen")
        })
    })
})