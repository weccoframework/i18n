# i18n Example

This directory contains a very simple web application that renders a welcome message
based on messages loaded from JSON files via `fetch`.

The example demonstrates how to bootstrap a SPA after messages have been loaded.

The file [`i18n.js`](./i18n.js) contains a typical setup. It exports a function
`m` which simply delegates to `MessageResolver.m` (in a real world setup also create
a function `mpl` that delegates to `MessageResolver.mpl`). It also exports a 
`Promise` which is used to delay the application initialization to ensure, that 
all messages have been loaded.
