# API Endpoints

## User Register

### `POST /api/users/register`

Registers a new user account in the system.

#### Request Body

| Field | Type | Required | Notes |
| ----- | ---- | -------- | ----- |
| first_name | string | yes | User's given name. |
| last_name | string | no | User's family name. |
| email | string | yes | Must be unique across all users. |
| contact_number | string | no | User's contact phone number. |
| password | string | yes | Submitted by the client and stored as a hashed password. |
| role_id | string | yes | References `role.id`. |

#### Success Response

- `201 Created`
- Returns the created user record or registration success payload.

#### Error Responses

- `400 Bad Request` for invalid or missing input fields.
- `409 Conflict` if the email already exists.

## User Login

### `POST /api/users/login`

Authenticates an existing user and returns an access token.

#### Request Body

| Field | Type | Required | Notes |
| ----- | ---- | -------- | ----- |
| email | string | yes | Email address of the user account. |
| password | string | yes | Plaintext password submitted by the client for verification. |

#### Success Response

- `200 OK`
- Returns an access token payload.
- The access token should contain the authenticated user's information and role information.

#### Error Responses

- `400 Bad Request` for invalid or missing input fields.
- `401 Unauthorized` for invalid credentials.
