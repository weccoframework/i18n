import * as i18n from "../weccoframework-i18n.es5.js"

let messageResolver

export const loadingPromise = i18n.MessageResolver.create(new i18n.JsonBundleLoader(i18n.fetchJsonByLocale("./messages")))
    .then(mr => messageResolver = i18n.registerStandardFormatters(mr))

export const m = (key, ...args) => messageResolver.m(key, ...args)
