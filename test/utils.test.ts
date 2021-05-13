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
import { determineNavigatorLocale } from "../src/utils"


type NavigatorMock = {-readonly [P in keyof Navigator]?: Navigator[P]}
declare global {
    namespace NodeJS {
        interface Global {
            navigator: NavigatorMock
        }
    }
}

global.navigator = {} as any as Navigator

describe("utils", () => {
    describe("determineNavigatorLanguage", () => {
        describe("using navigator.language", () => {
            before(() => {
                (navigator as any as {-readonly [P in keyof Navigator]: Navigator[P]}).language  = "de";
                (navigator as any as {-readonly [P in keyof Navigator]: Navigator[P]}).languages  = undefined;
            })
    
            it("should return preferred language", () => {
                expect(determineNavigatorLocale().tag).toBe("de")
            })    
        })

        describe("using navigator.languages", () => {
            before(() => {
                (navigator as any as {-readonly [P in keyof Navigator]: Navigator[P]}).language  = undefined;
                (navigator as any as {-readonly [P in keyof Navigator]: Navigator[P]}).languages  = ["de-DE", "en-US", "en"];
            })
    
            it("should return preferred language", () => {
                expect(determineNavigatorLocale().tag).toBe("de-DE")
            })    
        })
    })
})