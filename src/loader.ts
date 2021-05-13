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

import { Bundle } from "./bundle";
import { Locale } from "./locale";


/**
 * `BundleLoader` defines the interface for components that
 * load `Messages`.
 */
export interface BundleLoader {
    /**
     * Instructs the loader to load the `Bundle` for the given
     * `locale`. Returns a `Promise` that resolves either to 
     * the messages or `undefined` if this loader has no bundle
     * for the given locale.
     * 
     * A loader is responsible for trying different aspects of the
     * locale (such as ignoring the region or other attributes) in
     * case an exact match is not found. The loader should return
     * the most relevant match without resorting to a generic
     * default (which is handled by the resolver). 
     * 
     * The promise rejects in case of an error.
     * 
     * @param language the language to load the bundle for
     * @returns a `Promise` resolving to either the bundle or `undefined`
     */
    load(locale: Locale): Promise<Bundle | undefined>
}