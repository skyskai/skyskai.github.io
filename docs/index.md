---
layout: home
hero:
  name: ABAP ADT API
  text: SAP ABAP Development Tools API Library
  tagline: JavaScript/TypeScript library for SAP ABAP development
  actions:
    - theme: brand
      text: Get Started
      link: /getting-started
    - theme: alt
      text: API Documentation
      link: /api/
    - theme: alt
      text: GitHub
      link: https://github.com/marcellourbani/abap-adt-api

features:
  - icon: 🔄
    title: Integration with SAP ABAP
    details: Provides API integration with SAP NetWeaver ABAP Development Tools (ADT).
  - icon: 💻
    title: Developer-Friendly
    details: Offers an easy-to-use API interface for JavaScript/TypeScript.
  - icon: 🚀
    title: Powerful Features
    details: Supports various functions including ABAP object management, code development, debugging, testing, and more.
---

# ABAP ADT API Library

ABAP ADT API is a library that allows you to use SAP's ABAP Development Tools (ADT) REST API in JavaScript/TypeScript. With this library, you can easily develop applications that interact with the ABAP development environment.

## Key Features

- ABAP system login and session management
- ABAP object exploration and management
- Source code retrieval and modification
- Syntax checking and activation
- Transport management
- ABAP Git integration
- Debugging
- Unit testing
- Various other ADT features

## Installation

```bash
npm install abap-adt-api
```

## Simple Usage Example

```typescript
import { ADTClient } from 'abap-adt-api';

async function main() {
  // Create client and login
  const client = new ADTClient('https://your-sap-server.com', 'username', 'password');
  await client.login();
  
  // Retrieve ABAP object information
  const objectStructure = await client.objectStructure('/sap/bc/adt/programs/programs/Z_YOUR_PROGRAM');
  
  // Get source code
  const sourceUrl = ADTClient.mainInclude(objectStructure);
  const source = await client.getObjectSource(sourceUrl);
  
  console.log(source);
}

main().catch(console.error);
```

For more details, please refer to the [Getting Started](/getting-started) guide.