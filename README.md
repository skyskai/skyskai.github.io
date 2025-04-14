# ABAP ADT API Documentation

English | [한국어](./README.ko.md)

This repository contains documentation for the [abap-adt-api](https://github.com/marcellourbani/abap-adt-api) library created by Marcello Urbani. The original library allows you to use SAP's ABAP Development Tools (ADT) REST API in JavaScript/TypeScript, making it easy to develop applications that interact with the ABAP development environment.

> **Note:** This is an unofficial documentation project and is not affiliated with or owned by the original library creator. For the official repository, please visit [https://github.com/marcellourbani/abap-adt-api](https://github.com/marcellourbani/abap-adt-api).

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

## Documentation

For more detailed information, please check the following sections:

- [Getting Started](/getting-started) - Basic setup and creating your first application
- [API Documentation](/api/) - Detailed API reference and usage
- [Examples](/examples/) - Common use cases and scenario-based examples

## Contributing

Would you like to contribute to this documentation? Visit our [GitHub repository](https://github.com/skyskai/skyskai.github.io) to submit issues or send pull requests.

For issues or feature requests related to the library itself, please visit the [original repository](https://github.com/marcellourbani/abap-adt-api).

## License

This documentation is distributed under the MIT License. See the LICENSE file for more details.

The original abap-adt-api library is licensed under the MIT License. Please refer to the [original repository](https://github.com/marcellourbani/abap-adt-api) for more information about the library's license.

## Support

If you have questions or issues, please reach out through GitHub issues.