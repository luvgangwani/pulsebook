# API File Pattern

- `apps/api/src/main.ts`
  Bootstraps the Nest application, loads environment variables, sets shared app configuration, and enables global behavior such as validation.
- `apps/api/src/app.module.ts`
  Registers the root API modules and imports feature modules into the application.
- `apps/api/src/database/database.module.ts`
  Exposes shared database access so feature modules can reuse one database integration module.
- `apps/api/src/database/prisma.service.ts`
  Wraps `PrismaClient` and manages the connect/disconnect lifecycle for the API process.
- `apps/api/src/<feature>/<feature>.module.ts`
  Wires the feature's controller, service, and any shared modules together.
- `apps/api/src/<feature>/<feature>.controller.ts`
  Defines the HTTP routes for the feature and passes validated input to the service layer.
- `apps/api/src/<feature>/dto/*.dto.ts`
  Validates and normalizes incoming request bodies, params, or query values.
- `apps/api/src/<feature>/<feature>.service.ts`
  Contains the feature's business logic, coordinates database access, and maps data into response-safe shapes.

# Request Flow Pattern

1. The request enters Nest through `apps/api/src/main.ts`, where global app configuration such as prefixes and validation is applied.
2. The feature controller receives the matching route and method.
3. DTOs validate and normalize the incoming request data before business logic runs.
4. The feature service performs the main use-case logic and any domain checks.
5. Shared database access is performed through the Prisma service when persistence is needed.
6. The service maps the result into the API response shape and returns it through the controller.

# API Endpoints

## User Register

### `POST /api/users/register`

Registers a new user account in the system.

#### Request Body

| Field          | Type    | Required | Notes                                                    |
| -------------- | ------- | -------- | -------------------------------------------------------- |
| first_name     | string  | yes      | User's given name.                                       |
| last_name      | string  | no       | User's family name.                                      |
| email          | string  | yes      | Must be unique across all users.                         |
| contact_number | string  | no       | User's contact phone number.                             |
| password       | string  | yes      | Submitted by the client and stored as a hashed password. |
| role_id        | integer | yes      | References `role.id`.                                    |

#### Success Response

- `201 Created`
- Returns the created user record without the password.

#### Error Responses

- `400 Bad Request` for invalid or missing input fields.
- `409 Conflict` if the email already exists.

#### Test Request

```bash
curl -X POST http://localhost:3001/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Jane",
    "last_name": "Doe",
    "email": "jane.doe@example.com",
    "contact_number": "0400000000",
    "password": "Password123!",
    "role_id": 1
  }'
```

## User Login

### `POST /api/users/login`

Authenticates an existing user and returns an access token.

#### Request Body

| Field    | Type   | Required | Notes                                                        |
| -------- | ------ | -------- | ------------------------------------------------------------ |
| email    | string | yes      | Email address of the user account.                           |
| password | string | yes      | Plaintext password submitted by the client for verification. |

#### Success Response

- `200 OK`
- Returns an access token payload.
- The access token should contain the authenticated user's information and role information.

#### Error Responses

- `400 Bad Request` for invalid or missing input fields.
- `401 Unauthorized` for invalid credentials.
