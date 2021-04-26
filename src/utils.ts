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

import { Language } from "./Messages"

/**
 * Determines the language used by the given browser.
 * @returns the preferred language of the current browser
 */
export function determineNavigatorLanguage(): Language {
    if (navigator.languages && navigator.languages.length > 0) {
        return extractLanguageFromLocale(navigator.languages[0])
    } else if (navigator.language) {
        return extractLanguageFromLocale(navigator.language)
    }

    return "en"
}

function extractLanguageFromLocale(locale: string): Language {
    return locale.substr(0, 2).toLowerCase()
}