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
import { ObjectBundleLoader, CascadingBundleLoader, JsonBundleLoader, Bundle, BundleObject, Locale } from ".."
import { JsonSource } from "../src/loaders"

describe("ObjectBundleLoader", () => {
    const messagesByLanguage = {
        "de": {
            messages: {
                "foo": "Bar",
            },
        },
        "en": {
            messages: {
                "foo": "bar",
            },
        },
    }
    const loader = new ObjectBundleLoader(messagesByLanguage)

    describe("load", () => {
        describe("language found", () => {
            let bundle: Bundle | undefined

            before(async () => {
                bundle = await loader.load(new Locale("de"))
            })

            it("should return bundle languages", async () => {
                expect(bundle.messages)
                    .toBeMap()
                    .toHave("foo")
            })

            it("should return bundle formatters", async () => {
                expect(bundle.formatters)
                    .toBeMap()
            })
        })

        describe("more specific locale", () => {
            it("should return best match", async () => {
                const bundle = await loader.load(new Locale("de-DE"))
                expect(bundle)
                    .toBeObject()
            })
        })

        describe("language not found", () => {
            it("should return undefined when language is not found", async () => {
                expect(await loader.load(new Locale("es"))).toBeUndefined()
            })
        })
    })
})

describe("CascadingBundleLoader", () => {
    const dl1 = new ObjectBundleLoader({
        "de": {
            messages: {
                "foo": "Bar",
            },
            formatters: {
                "foo": v => `${v}`,
            },
        },
        "en": {
            messages: {
                "foo": "bar",
            },
        },
    })

    const dl2 = new ObjectBundleLoader({
        "de": {
            messages: {

                "foo": "BAR",
                "spam": "Eier",
            },
            formatters: {
                "bar": v => `${v}`,
            },
        },
        "en": {
            messages: {
                "spam": "eggs",
            },
        },
    })

    const loader = new CascadingBundleLoader(dl1, dl2)

    describe("load", () => {
        let bundle: Bundle
        before(async () => {
            bundle = await loader.load(new Locale("de"))
        })

        it("should merge bundle from first", () => {
            expect(bundle.messages.get("foo")).toBe("BAR")
        })

        it("should overwrite bundle from second", () => {
            expect(bundle.messages.get("spam")).toBe("Eier")
        })

        it("should merge formatters", () => {
            expect(bundle.formatters)
                .toBeMap()
                .toHave("foo")
                .toHave("bar")
        })
    })
})

describe("JsonBundleLoader", () => {
    describe("load", () => {
        describe("with exact locale match", () => {
            let loaded: Bundle
            
            before(async () => {
                const bundle = {
                    foo: "bar",
                    plural: {
                        "0": "0",
                        "1": "1",
                        "n": "n",
                    },
                }
                
                const source = () => Promise.resolve(JSON.stringify(bundle))
                const loader = new JsonBundleLoader(source)            
                loaded = await loader.load(new Locale("en"))
            })
            
            it("should load bundle", () => {
                expect(loaded.messages.get("foo")).toBe("bar")
            })
            
            it("should normalized plural object", () => {
                expect(loaded.messages.get("plural"))
                .toBeMap()
                .toHave(0)
                .toHave(1)
                .toHave("n")
            })
        })

        describe("with non-exact locale match", () => {
            let loaded: Bundle
            
            before(async () => {
                const bundle = {
                    foo: "bar",
                    plural: {
                        "0": "0",
                        "1": "1",
                        "n": "n",
                    },
                }
                
                const source: JsonSource = (locale: Locale) => Promise.resolve(locale.tag === "en" ? JSON.stringify(bundle) : undefined)
                const loader = new JsonBundleLoader(source)
                loaded = await loader.load(new Locale("en-US"))
            })
            
            it("should load bundle", () => {
                expect(loaded.messages.get("foo")).toBe("bar")
            })
            
            it("should normalized plural object", () => {
                expect(loaded.messages.get("plural"))
                .toBeMap()
                .toHave(0)
                .toHave(1)
                .toHave("n")
            })
        })

        describe("with skipErrors", () => {
            let loaded: Bundle | undefined
            
            before(async () => {                
                const source: JsonSource = (_: Locale) => Promise.resolve('json error')
                const loader = new JsonBundleLoader(source, true)
                loaded = await loader.load(new Locale("en-US"))
            })
            
            it("should return empty bundle", () => {
                expect(loaded).toBeUndefined()
            })            
        })
    })
})