<a id="readme-top" />

<div align="center">

[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]
[![Github Release][github-release-shield]][github-release-url]
[![NPM Version][npm-release-shield]][npm-release-url]

</div>
<br />
<div align="center">
    <h3>rpcwebsocket</h3>
    <p>
        TypeSafe WebSocket events.
        <br />
        <br />
        <br />
        <a href="https://github.com/jslno/rpcwebsocket/issues/new">Report Bug</a>
        &middot;
        <a href="https://github.com/jslno/rpcwebsocket/issues/new">Request Feature</a>
    </p>
</div>
<br />

<details>
    <summary>Table of Contents</summary>
    <ol>
        <li><a href="#features">Features</a></li>
        <li><a href="#installation">Installation</a></li>
        <li>
            <a href="#usage">Usage</a>
            <ul>
                <li><a href="#1-register-events">Register Events</a></li>
                <li><a href="#2-create-server-instance">Create Server Instance</a></li>
                <li><a href="#3-create-client-instance">Create Client Instance</a></li>
            </ul>
        </li>
        <li><a href="#roadmap">Roadmap</a></li>
        <li><a href="#dependencies">Dependencies</a></li>
        <li><a href="#license">License</a></li>
    </ol>
</details>

## Features

- Easy Event Subscription & Emission
- Bi-directional Communication
- Schema Validation
  - works with zod, yup and many other validation libraries.
- Clean & modular structure

<div align="right"><a href="#readme-top">(&ShortUpArrow;)</a></div>

## Installation

If not done already, install a schema validator. This example uses [`Zod`][zod-url] but you can use any validator using the [`StandardSchema`][standardschema-url]. You can find the list of featured compatible libraries [here][standardschema-lib-url].

```sh
npm install zod
```

Add `rpcwebsocket` to your project:

```sh
npm install rpcwebsocket@latest
```

<div align="right"><a href="#readme-top">(&ShortUpArrow;)</a></div>

## Usage

### 1. Register Events

Before setting up the server and client, define the events they will handle. The event registry ensures structured communication by defining valid message types.

server.ts

```ts
import { rpcwebsocket } from "rpcwebsocket";
import { z } from "zod";

export const serverEvents = rpcwebsocket.$eventRegistry({
  message: z.string(),
});
```

client.ts

```ts
import { client } from "rpcwebsocket/client";

export const clientEvents = client.$eventRegistry({
  "nested.ping": null,
});
```

### 2. Create Server Instance

The WebSocket server listens for incoming connections and handles registered events.

server.ts

```ts
import type { clientEvents } from "./client"; // Import as type

const server = await rpcwebsocket<typeof clientEvents>()({
  server: {
    port: 8000,
  },
  events: serverEvents,
});

server.on.message((msg) => {
  console.log(msg);
});

server.emit.nested.ping();
```

### 3. Create Client Instance

The WebSocket client connects to the server and listens for events.

client.ts

```ts
import type { serverEvents } from "./server"; // Import as type

const socket = client<typeof serverEvents>()({
  address: "ws://localhost:8000",
  events: clientEvents,
});

socket.on.nested.ping(() => {
  console.log("PING");
  socket.emit.message("PONG");
});
```
---

This setup establishes a bidirectional messaging system with minimal configuration.

1. The server emits a `nested.ping` event.

2. The client receives the event, logs `"PING"`, and responds with `message`.

3. The server receives the `message` event and logs `"PONG"`.


<div align="right"><a href="#readme-top">(&ShortUpArrow;)</a></div>

## Roadmap

- [ ] Error Handling
- [ ] Middleware Support
- [ ] Rate Limiting

<div align="right"><a href="#readme-top">(&ShortUpArrow;)</a></div>

## Dependencies

- [ws][ws-url]

<div align="right"><a href="#readme-top">(&ShortUpArrow;)</a></div>

## License

Distributed under the MIT License. See [LICENSE.md][license-url] for more information.

<div align="right"><a href="#readme-top">(&ShortUpArrow;)</a></div>

[forks-shield]: https://img.shields.io/github/forks/jslno/rpcwebsocket.svg?style=for-the-badge
[forks-url]: https://github.com/jslno/rpcwebsocket/network/members
[stars-shield]: https://img.shields.io/github/stars/jslno/rpcwebsocket.svg?style=for-the-badge
[stars-url]: https://github.com/jslno/rpcwebsocket/stargazers
[issues-shield]: https://img.shields.io/github/issues/jslno/rpcwebsocket.svg?style=for-the-badge
[issues-url]: https://github.com/jslno/rpcwebsocket/issues
[license-shield]: https://img.shields.io/github/license/jslno/rpcwebsocket.svg?style=for-the-badge
[license-url]: https://github.com/jslno/rpcwebsocket/blob/master/LICENSE.txt
[github-release-shield]: https://img.shields.io/github/v/release/jslno/rpcwebsocket?style=for-the-badge
[github-release-url]: github.com/jslno/rpcwebsocket/releases/latest
[npm-release-shield]: https://img.shields.io/npm/v/rpcwebsocket?style=for-the-badge
[npm-release-url]: www.npmjs.com/package/rpcwebsocket/v/latest
[zod-url]: https://github.com/colinhacks/zod
[standardschema-url]: https://standardschema.dev
[standardschema-lib-url]: https://standardschema.dev/#what-schema-libraries-implement-the-spec
[ws-url]: https://github.com/websockets/ws
