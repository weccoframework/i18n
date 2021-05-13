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
import { Locale } from ".."

describe("Locale", () => {
    describe("lang", () => {
        it("should return lang when locale only has lang", () => {
            expect(new Locale("en").lang).toBe("en")
        })

        it("should return lang when locale has lang and region", () => {
            expect(new Locale("en-US").lang).toBe("en")
        })
    })
})