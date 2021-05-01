# i18n

![CI Status][ci-img-url] [![Releases][release-img-url]][release-url]

A simple localization framework for web applications.

# Installation

`i18n` is available via [Github NPM Packages](https://docs.github.com/en/packages/guides/configuring-npm-for-use-with-github-packages). 
To install it, create a file `.npmrc` next to your `package.json` with the following content:

```
@weccoframework:registry=https://npm.pkg.github.com
```

After you created this file, you can install `@weccoframework/i18n` as a standard NPM dependency.

# Usage

`i18n` uses _messages_ identified by _message keys_. For every piece of text
you wish to localize, you add a call to `m("message.key")` which will be replaced
by the actual message in the localized version.

`i18n` supports default messages to be used when a localized version does not exist.
It also allows you to use placeholders in a message to be replaced with actual 
content (think: mini templates) as well as plural support.

See the [example app](./example) for a full example.

## Defining Messages

Messages are defined in a datastructure which maps _message keys_ to _message 
content_. In its simplest form, a messages structure looks like the following:

```javascript
const messages = new Map()
    .put("greeting", "Hello, world")
    .put("bye", "See you soon")

```

This defines a single message identified by the key `greeting` and the content `Hello, world`
as well as a message with key `bye` and the content `See you soon`. Note that in this
example all keys and messages are `string`s. While this is true for all message keys,
messages may also be a nested `Map` when used with _plurals_ (see below).


## Loading Messages

Messages must be loaded before you can use them. As being a framework targeting web
applications (which must render fast), loading is done _before_ messages can be used.

`i18n` defines an interface [`MessageLoader`](./src/MessageLoader.ts) as well as a 
couple of implementations which load messages. You can use one (or multiple) of the 
bundled loaders or implement your own loaders.

Loaders work asynchronously, i.e. they return a `Promise` which resolves to the 
loaded messages.

## Resolving Messages

The process of replacing a message key with the actual content is called _resolving_
and is performed by a [`MessageResolver`](./src/MessageResolver.ts). 
`MessageResolver` is a class which accepts loaded messages and provides synchronous
methods for resolving a message given it's key as well as replacing paramaters.

Resolving is done by invoking the `m` method on the message resolver passing the 
message's key as the first argument. The method returns the message content.


```javascript
messageResolver.m("message.key")
```

### Reporting Errors

If the message key is neither found in the local messages nor in the default messages,
the resolver returns an error message. This behaviour can be changed by setting the 
message resolver' property `errorReporting` to `"exception"`. Once
set, the message resolver throws an error reporting the missing key.

### Formatting Arguments

A message's content may contain placeholders to be replaced with
actual values passed to `m`. Placeholders are referred to by index
and use the typical mustache notation, i.e. `{{0}}` to refer to the
first argument.

If you have a messages definition like

```javascript
const messages = new Map()
    .put("greeting", "Welcome, {{0}}!")
```

and you perform a call like

```javascript
console.log(messageResolver.m("greeting", "John Doe"))
```

you'll be welcomed with `Welcome, John Doe!`.

### Plurals

Sometimes you want to issue different messages depending on a kind of _amount_ being used. A common
example is an inbox which might display `No new message`, if the inbox is empty, or 
`One new message`, if a single new message is available or `145 new messages` in case you haven't 
looked at your inbox for a long time. While it is possible to define different message keys and
use arguments to replace the _more than one_ key, `i18n` provides an easier to use mechanic called
_plurals_.

You can define a message's content to be an object with keys describing the _amount case_ to match.
Here is the message definition from the example above:

```javascript
const messages = new Map()
    .put("inbox.summary", new Map()
        .put(0, "No new message")
        .put(1, "One new message")
        .put(n, "{{n}} new messages")
    )
}
```

To resolve such a message key, you have to use the `mpl` method (which is short for _plural 
message_) and provide at least two arguments: the message's key and the amount:

```javascript
console.log(messageResolver.mpl("inbox.summary", numberOfNewMessages))
```

You can use placeholders in plural messages and provide additional arguments, such as:

```javascript
const messages = new Map()
    .put("inbox.folder.summary", new Map()
        .put(0, "Your {{0}} folder contains no messages.")
        .put(1, "Your {{0}} folder contains one message.")
        .put(n, "Your {{0}} folder contains {{n}} messages.")
    )
// ...

console.log(messageResolver.mpl("inbox.folder.summary", numberOfMessages, "trash"))
```

## Loaders

The following section contains a description of the provided `MessageLoader` implementions.
Make sure you also check out the source code and doc comments for the classes.

### ObjectMessageLoader

A `MessageLoader` that "loads" messages from a given object. This message loader is typically be
used in an environment where messages are `import`ed from static files during Javascript assembly.

The object loader's input uses plain Javascript `object`s like the following:

```javascript
{
    "message.key": "message content",
    "plural.message.key": {
        "0": "empty message",
        "n": "{{n}} message",
    },
}
```

See the following example for how to use the `ObjectMessageLoader`:

```javascript
import { MessageResolver, ObjectMessageLoader } from "@weccoframework/i18n"
import { en, de, fr } from "./messages"

const messageResolver = await MessageResolver.create(new ObjectMessageLoader(en, {
    en: en,
    de: de,
    fr: fr,
}))
```

This pattern is very easy to get running and works very for few translations with a small number
of messages.

### JsonMessageLoader

The `JsonMessageLoader` supports loading messages from `JsonSource`. A `JsonSource` is a function
which accepts a language as a single argument and retuns a `Promise` resolving to a JSON-formatted
`string` which defines the messages. The format of the JSON messages is almost identical to the one used
by the `ObjectMessageLoader`:

```json
{
    "message.key": "message content",
    "plural.message.key": {
        "0": "empty message",
        "n": "{{n}} message",
    },
}
```

To construct a `JsonMessagesLoader` you need to pass at least one `JsonSource`. You may pass
two. In this case the first one is used to load the default messages while the second one is
used to load the localized messages. 

```javascript
const jsonSource = (language) => {
    // ...
    // return a Promise resolving to a string. 
    // When loading the default messages, language is undefined
}

const messageResolver = await MessageResolver.create(new JsonMessageLoader(jsonSource))
```

#### fetchJsonSource

`i18n` comes with with a ready to use implementation of `JsonSource`
which uses `fetch` to load messages identified by language. The implementation uses
the following conventions to load messages:

* all messages are located under a given _base URL_
* default messages can be loaded from `<baseURL>/default.json`
* localized messages for `<lang>` can be loaded from `<baseURL>/<lang>.json`

You can pass additional request init options, such as `CORS` mode, change the
request method (which defaults to `GET`), set headers, ...

### CascadingMessageLoader
The `CascadingMessageLoader` loads messages by using a set of underlying `MessageLoader`s
and merging the messages returned by each loader together in a way similiar to how CSS
rules are merged (thus the name). Use this loader to get an aggregated set of messages
from multiple sources.

The following (rather academic) example demonstrates the merging.

```javascript

const loader1 = new ObjectMessageLoader({
    foo: "foo",
    bar: "bar",
})

const loader2 = new ObjectMessageLoader({
    bar: "Bar",
    spam: "Eggs",
})

const messageResolver = await MessageResolver.create(new CascadingMessageLoader(loader1, loader2))

console.log(messageResolver.m("bar")) // Logs: Bar
```

# Author

`i18n` is written by Alexander Metzner <alexander.metzner@gmail.com>.

# License

```
Copyright (c) 2021 Alexander Metzner.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```

[ci-img-url]: https://github.com/weccoframework/i18n/workflows/CI/badge.svg
[release-img-url]: https://img.shields.io/github/v/release/weccoframework/i18n.svg
[release-url]: https://github.com/weccoframework/i18n/releases

