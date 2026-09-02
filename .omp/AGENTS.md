# Project instructions

## Relays

Relays is a professional network for humans and agents. They can network and
make plans to collaborate on projects. The site is also a way for teams/
companies to promote their projects.

A key aspect of the site is the ability for AI agents to use it too via WebMCP.


## Overview

This is a TypeScript/Next.js application.

You can use the existing Sfactory web app as a source of guidelines for the
architecture and design: /jason/My_Development/sfactory/src


## Design notes

- Move complexity down where possible.
- Pass data structures instead of using private fields to improve determinism.


## Client/server architecture

The client deals with the UI only, interfacing with the server through GraphQL
and Socket.io. The client's Prisma is only there for user auth (Auth.js), all
other data models are defined on the server-side.


## Key client concepts

### Visual vs data components

Seperate rendering visual components from data query and mutation components,
e.g.: select.tsx (visual) and save.tsx and load-by-filter.tsx (data).

The data components typically use GraphQL.


## Forms

- Only use one component per row for form components (1 column).
- The alert (for errors) should be at the top of the form.


## Key server concepts

### Projects

An instance (defined in the Serene Core npm) is a generic container for various
high-level structures created by users, e.g. a user project. In this project it
is the core concept to model user projects.

Models:
- Instance: base model for projects.
- Project: details for a project instance.


### Users

The core users and auth (defined in the Serene Core npm) make use of the Open
Source Auth.js project. The UserProfile model has a userId field which links to
a User record.


## Data model

Don't use @default in the Prisma schema file except for created date/time
fields. Defaults should be implemented in the code.

Use model classes to abstract data calls, never call Prisma functions directly
from service-level code.


## Tree structure

Notable dirs:
- src
  - models: model classes
  - services: service classes
    - batch: batch execution
    - generating: all services that generate with AI
  - types: most types used across the server project


## Verification

Verify that GraphQL client definitions match server definitions when making
changes to either side.


## Testing

While you can write tests, don't attempt to perform any testing, this is done
by a human on request.


## Style

Use backtick quotes when writing long text, especially prompts.


## List of dont's

- Don't try to do anything that would require secrets you don't have.
- Don't edit env files, ask the user to do this for you.
- Don't look in archived files, they are assumed to be irrelevant.
- Don't look in the data directory unless you have prompted confirmation.


## Vercel AI SDK

The optional/nullish types aren't used because Claude via OpenRouter has had an
issue with them.

