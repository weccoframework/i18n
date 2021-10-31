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
import { fetchJsonByLocale, JsonSource, Locale } from ".."
import { fetchJson } from "../src/jsonsource"

class ResponseMock implements Response {
    headers: Headers
    ok: boolean
    redirected: boolean
    status: number
    statusText: string
    trailer: Promise<Headers>
    type: ResponseType
    url: string
    body: ReadableStream<Uint8Array> | null
    bodyUsed: boolean

    private readonly bodyText: string

    constructor (status: number, body: string) {
        this.status = status
        this.bodyText = body
    }
    
    async arrayBuffer(): Promise<ArrayBuffer> {
        throw `Not implemented`
    }

    async blob(): Promise<Blob> {
        throw `Not implemented`
    }

    async formData(): Promise<FormData> {
        throw `Not implemented`
    }

    async json(): Promise<any> {
        return JSON.parse(this.bodyText)
    }

    async text(): Promise<string> {
        return this.bodyText
    }
    
    clone(): Response {
        return this
    }
}

describe("fetchJsonByLocale", () => {
    let source: JsonSource
    let url: string
    let requestInit: RequestInit

    describe("found", () => {        
        before(() => {
            global.fetch = function (u: string, i: RequestInit): Promise<Response> {
                url = u
                requestInit = i
                
                return Promise.resolve(new ResponseMock(200, `{"foo": "bar"}`))
            }
            
            source = fetchJsonByLocale("/test/path", {
                method: "POST",
            })
        })
        
        it("should load de.json", async () => {        
            const json = await source(new Locale("de"))
            expect(json).toBe(`{"foo": "bar"}`)
            expect(url).toBe("/test/path/de.json")
            expect(requestInit.method).toBe("POST")
        })
    })

    describe("not found", () => {        
        before(() => {
            global.fetch = function (u: string, i: RequestInit): Promise<Response> {
                url = u
                requestInit = i
                
                return Promise.resolve(new ResponseMock(404, ""))
            }
            
            source = fetchJsonByLocale("/test/path", {
                method: "POST",
            })
        })
        
        it("should load de.json", async () => {        
            const json = await source(new Locale("de"))
            expect(json).toBeUndefined()
            expect(url).toBe("/test/path/de.json")
            expect(requestInit.method).toBe("POST")
        })
    })
})

describe("fetchJson", () => {
    let source: JsonSource
    let url: string
    let requestInit: RequestInit

    before(() => {
        global.fetch = function (u: string, i: RequestInit): Promise<Response> {
            url = u
            requestInit = i

            return Promise.resolve(new ResponseMock(200, `{"foo": "bar"}`))
        }
    
        source = fetchJson("/test/path", {
            method: "POST",
        })
    })

    it("should load /text/path", async () => {        
        const json = await source(new Locale("de"))
        expect(json).toBe(`{"foo": "bar"}`)
        expect(url).toBe("/test/path")
        expect(requestInit.method).toBe("POST")
    })
})
