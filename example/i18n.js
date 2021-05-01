import * as i18n from "../weccoframework-i18n.es5.js"

let messageResolver

export const loadingPromise = i18n.MessageResolver.create(new i18n.JsonMessageLoader(i18n.fetchJsonSource("./messages")))
    .then(mr => messageResolver = mr)

export const m = (key, ...args) => messageResolver.m(key, ...args)
