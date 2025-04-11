# API Documentation Overview

The ABAP ADT API library wraps the REST API of SAP ABAP Development Tools (ADT) to provide an easy-to-use JavaScript/TypeScript interface. This documentation explores the main components and features of the library.

## Library Structure

The ABAP ADT API library consists of the following main components:

### Core Classes

- **ADTClient**: The primary class of the library, handling all interactions with the ABAP system.
- **AdtHTTP**: An internal class responsible for HTTP communication, handling RESTful API calls.

### Main API Modules

The library is divided into the following main API modules:

1. **Basic Features**: Login, session management, system information, etc.
2. **Object Management**: ABAP object exploration, creation, modification, deletion, etc.
3. **Development Features**: Code editing, syntax checking, code completion, refactoring, etc.
4. **Transport**: Transport request management
5. **ABAP Git**: ABAP Git repository management
6. **Debugging**: ABAP program debugging
7. **Testing**: Unit test execution and result handling
8. **Advanced Features**: ATC (ABAP Test Cockpit), tracing, etc.

## API Usage Patterns

The ABAP ADT API is typically used with the following patterns:

1. **Client Initialization and Login**
   ```typescript
   const client = new ADTClient(url, username, password);
   await client.login();
   ```

2. **Object Retrieval and Manipulation**
   ```typescript
   const objectStructure = await client.objectStructure(objectUrl);
   ```

3. **Performing Operations Requiring State**
   ```typescript
   client.stateful = "stateful";  // Set stateful session
   const lock = await client.lock(objectUrl);  // Lock object
   // Perform operations...
   await client.unLock(objectUrl, lock.LOCK_HANDLE);  // Release lock
   ```

4. **Handling Asynchronous Operations**
   ```typescript
   // Most API methods return Promises
   try {
     const result = await client.someAsyncMethod();
     // Process results...
   } catch (error) {
     // Handle errors...
   }
   ```

## How to Use the API Documentation

Each API page is structured as follows:

- **Overview**: A brief description of the API module
- **Main Classes and Interfaces**: Related type definitions
- **Methods**: Available methods and parameter descriptions
- **Examples**: Common use cases and code examples

## Main API Modules

You can find detailed information about each API module on the following pages:

- [Basic Features](./core.md): Login, session management, system information, etc.
- [Object Management](./object-management.md): ABAP object management functionality
- [Development Features](./development.md): Code development related features
- [Transport](./transport.md): Transport management
- [ABAP Git](./git.md): ABAP Git integration
- [Debugging](./debugging.md): ABAP debugging features
- [Testing](./testing.md): Unit testing related functionality
- [Advanced Features](./advanced.md): Other advanced features

## API Reference Table

| API Module | Main Features | Related Classes/Interfaces |
|----------|----------|------------------------|
| Basic Features | Login, session management, system information | `ADTClient`, `AdtHTTP` |
| Object Management | Object exploration, creation, modification, deletion | `ObjectStructure`, `NodeStructure` |
| Development Features | Code editing, syntax checking, refactoring | `SyntaxCheckResult`, `CompletionProposal` |
| Transport | Transport request management | `TransportInfo`, `TransportsOfUser` |
| ABAP Git | Git repository management | `GitRepo`, `GitStaging` |
| Debugging | Program debugging | `DebugAttach`, `DebugStackInfo` |
| Testing | Unit test execution | `UnitTestClass`, `UnitTestMethod` |
| Advanced Features | ATC, tracing, etc. | `AtcWorkList`, `TraceResults` |