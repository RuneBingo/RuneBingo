# Frontend

Frontend application for RuneBingo, an application that lets Old School RuneScape players create and manage bingo events.

## Architecture

This project is built with [Next.js](https://nextjs.org/) with the App Router, and uses the [Shadcn UI](https://ui.shadcn.com/) library.

It is divided into a few modules:

### API <kbd>/api</kbd>

The API module exports types and functions to call the RuneBingo API endpoints. It serves as a client both for server-side and client-side requests.

### Application <kbd>/app</kbd>

This is the main module, where the app is rendered. Everything must be nested under the <kbd>[locale]</kbd> folder because we use [next-intl](https://next-intl-docs.vercel.app/) for internationalization.

### Common <kbd>/common</kbd>

This module contains shared components, hooks and utilities that are used throughout the application. They are coupled with our application library and may contain some application-specific logic.

### Design System <kbd>/design-system</kbd>

This module contains UI-only components, hooks and utilities that are also used thorought the application, but this module must be an application-agnostic library. It is built with the [Shadcn UI](https://ui.shadcn.com/) library.

The <kbd>components</kbd> folder contains our house-made implementations of the Shadcn UI components, as well as some additional hand-crafted components. The <kbd>ui</kbd> folder contains the actual Shadcn UI components.

### Internationalization <kbd>/i18n</kbd>

This module contains the translated messages for the application, as well as Next.js internationalization utilities.

## Pre-requisites

- [Node.js](https://nodejs.org/en/)
- The [API](../api/README.md) must be up and running

## Configuration

Copy the `frontend/.env.example` file to `frontend/.env` and set the environment variables. Here is a table for reference:

| Name                  | Description                                                                                       |
| --------------------- | ------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_API_URL` | The base URL of the API. Must include the protocol (http or https) and the version (v1, v2, etc.) |

## Development

Start the development server:

```bash
npm run dev
```

You will get some IP addresses as a result:

```
   ▲ Next.js 15.2.4
   - Local:    http://localhost:3000
   - Network: http://<YOUR_LOCAL_IP>:3000
   - Environments: .env
```

To avoid CORS issues, make sure to add these IP addresses to `cors.origin` to `/api/config.local.json` file.
