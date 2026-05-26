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

| Field         | Type    | Required | Notes                                                    |
| ------------- | ------- | -------- | -------------------------------------------------------- |
| firstName     | string  | yes      | User's given name.                                       |
| lastName      | string  | no       | User's family name.                                      |
| email         | string  | yes      | Must be unique across all users.                         |
| contactNumber | string  | no       | User's contact phone number.                             |
| password      | string  | yes      | Submitted by the client and stored as a hashed password. |
| roleId        | integer | yes      | References `role.id`.                                    |

#### Success Response

- `201 Created`
- Returns the created user record without the password.

#### Error Responses

- `400 Bad Request` for invalid or missing input fields.
- `409 Conflict` if the email already exists.

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
- Returns a bearer token response with:
  - `accessToken`
  - `tokenType`
  - `email`
- Sets the `access_token` as an HTTP-only cookie for browser requests.
- The access token contains the authenticated user's ID, email, role ID, and role name in camelCase claims.

#### Error Responses

- `400 Bad Request` for invalid or missing input fields.
- `401 Unauthorized` if no user is registered with the submitted email.
- `401 Unauthorized` if the submitted password is incorrect.

## Patient Register

### `POST /api/users/register/patient`

Creates the patient profile for the authenticated user after the base account has already been created.

#### Request Body

Authenticated second-step endpoint.
- Requires a valid access token from `POST /api/users/login`.
- Uses the authenticated user from the bearer token or `access_token` cookie.
- Does not accept `roleId` or `userId` in the request body.

Additional patient fields:

| Field                | Type    | Required | Notes                       |
| -------------------- | ------- | -------- | --------------------------- |
| postcode             | string  | yes      | Patient postcode.           |
| addressLine1         | string  | no       | Patient address line 1.     |
| addressLine2         | string  | no       | Patient address line 2.     |
| suburb               | string  | no       | Patient suburb.             |
| state                | string  | no       | Patient state.              |
| preferredSpecialityId | integer| no       | References `speciality.id`. |

#### Success Response

- `201 Created`
- Creates the related patient profile for the authenticated user.
- Returns the created patient payload.

#### Error Responses

- `400 Bad Request` for invalid or missing input fields.
- `400 Bad Request` if the authenticated user does not have the `PATIENT` role.
- `401 Unauthorized` if the request is not authenticated.
- `409 Conflict` if a patient profile already exists for the authenticated user.

## HCP Register

### `POST /api/users/register/hcp`

Creates the HCP profile for the authenticated user after the base account has already been created.

#### Request Body

Authenticated second-step endpoint.
- Requires a valid access token from `POST /api/users/login`.
- Uses the authenticated user from the bearer token or `access_token` cookie.
- Does not accept `roleId` or `userId` in the request body.

Additional HCP fields:

| Field        | Type   | Required | Notes                       |
| ------------ | ------ | -------- | --------------------------- |
| specialityId | integer| yes      | References `speciality.id`. |

#### Success Response

- `201 Created`
- Creates the related HCP profile for the authenticated user.
- Returns the created HCP payload.

#### Error Responses

- `400 Bad Request` for invalid or missing input fields.
- `400 Bad Request` if the authenticated user does not have the `HCP` role.
- `401 Unauthorized` if the request is not authenticated.
- `409 Conflict` if an HCP profile already exists for the authenticated user.

## Clinic Location Create

### `POST /api/clinic-locations`

Creates a clinic location and stores the authenticated creator in `createdBy`.

#### Access Control

- Authenticated endpoint
- Requires `ADMIN` role

#### Request Body

| Field        | Type   | Required | Notes                      |
| ------------ | ------ | -------- | -------------------------- |
| addressLine1  | string | no       | Clinic address line 1.          |
| addressLine2  | string | no       | Clinic address line 2.          |
| suburb        | string | no       | Clinic suburb.                  |
| state         | string | no       | Clinic state.                   |
| postcode      | string | yes      | Clinic postcode.                |
| managedById   | string | yes      | User ID of the `CLINIC_ADMIN`.  |

#### Success Response

- `201 Created`
- Returns created clinic location payload:
  - `id`
  - `addressLine1`
  - `addressLine2`
  - `suburb`
  - `state`
  - `postcode`
  - `createdBy`
  - `managedBy`
  - `createdAt`
  - `updatedAt`


#### Error Responses

- `400 Bad Request` for invalid or missing input fields.
- `400 Bad Request` if the authenticated user does not have the `ADMIN` role.
- `401 Unauthorized` if the request is not authenticated.

## Clinic Location List

### `GET /api/clinic-locations`

Returns all clinic locations for admin users.

#### Access Control

- Authenticated endpoint
- Requires `ADMIN` role

#### Success Response

- `200 OK`
- Returns an array of clinic location objects:
  - `id`
  - `addressLine1`
  - `addressLine2`
  - `suburb`
  - `state`
  - `postcode`
  - `createdBy`
  - `managedBy`
  - `createdAt`
  - `updatedAt`


#### Error Responses

- `400 Bad Request` if the authenticated user does not have the `ADMIN` role.
- `401 Unauthorized` if the request is not authenticated.

## HCP Clinic Location Mapping Create

### `POST /api/hcp-clinic-locations`

Assigns an HCP to a clinic location.

#### Access Control

- Authenticated endpoint
- Requires `ADMIN` or `CLINIC_ADMIN` role

#### Request Body

| Field            | Type   | Required | Notes                            |
| ---------------- | ------ | -------- | -------------------------------- |
| hcpId            | string | yes      | References `hcp.id`.             |
| clinicLocationId | string | yes      | References `clinic_location.id`. |

#### Success Response

- `201 Created`
- Returns created HCP-clinic mapping payload:
  - `id`
  - `hcpId`
  - `userId`
  - `clinicLocationId`
  - `createdAt`
  - `updatedAt`

#### Error Responses

- `400 Bad Request` for invalid or missing fields.
- `400 Bad Request` if authenticated user role is not allowed.
- `401 Unauthorized` if request is not authenticated.
- `404 Not Found` if `hcpId` or `clinicLocationId` does not exist.
- `409 Conflict` if mapping already exists.

## HCP Assigned Clinic Locations List

### `GET /api/clinic-locations/assigned/:hcpId`

Lists clinic locations assigned to a specific HCP.

#### Access Control

- Authenticated endpoint
- Any authenticated role

#### Success Response

- `200 OK`
- Returns:
  - `hcp` object (`id`, `userId`, `firstName`, `lastName`, `email`)
  - `clinicLocations` array (`id`, `addressLine1`, `addressLine2`, `suburb`, `state`, `postcode`, `createdBy`, `assignedAt`)

#### Error Responses

- `400 Bad Request` if `hcpId` is invalid.
- `401 Unauthorized` if request is not authenticated.
- `404 Not Found` if HCP does not exist.

## Clinic Location Assigned HCPs List

### `GET /api/hcps/assigned/:clinicLocationId`

Lists HCPs assigned to a specific clinic location.

#### Access Control

- Authenticated endpoint
- Any authenticated role

#### Success Response

- `200 OK`
- Returns:
  - `clinicLocation` object (`id`, `addressLine1`, `addressLine2`, `suburb`, `state`, `postcode`, `createdBy`)
  - `hcps` array (`id`, `userId`, `firstName`, `lastName`, `email`, `specialityId`, `assignedAt`)

#### Error Responses

- `400 Bad Request` if `clinicLocationId` is invalid.
- `401 Unauthorized` if request is not authenticated.
- `404 Not Found` if clinic location does not exist.

## HCP Schedule Create

### `POST /api/hcp-schedules`

Creates a new schedule for an HCP at a specific clinic location.

#### Access Control

- Authenticated endpoint
- Requires `ADMIN`, `CLINIC_ADMIN`, or `HCP` role

#### Request Body

| Field               | Type   | Required | Notes                                          |
| ------------------- | ------ | -------- | ---------------------------------------------- |
| hcpId               | string | yes      | References `hcp.id`.                           |
| clinicLocationId    | string | yes      | References `clinic_location.id`.               |
| availableDays       | array  | yes      | Array of `DayOfWeek` strings (e.g., "MONDAY"). |
| slotDuration        | integer| yes      | Duration in minutes (min 1).                   |

#### Success Response

- `201 Created`
- Returns created HCP schedule payload:
  - `id`
  - `hcpClinicLocationId`
  - `availableDays`
  - `slotDuration`
  - `createdBy`
  - `createdAt`
  - `updatedAt`

#### Error Responses

- `400 Bad Request` for invalid or missing fields.
- `401 Unauthorized` if request is not authenticated.
- `404 Not Found` if `hcpClinicLocationId` does not exist.
- `409 Conflict` if a schedule already exists for this mapping.

## HCP Schedules List (By HCP)

### `GET /api/hcp-schedules/hcp/:hcpId`

Lists all schedules across all clinic locations for a specific HCP.

#### Access Control

- Authenticated endpoint
- Requires `ADMIN` or `HCP` role

#### Success Response

- `200 OK`
- Returns an array of schedule objects:
  - `id`
  - `hcpClinicLocationId`
  - `clinicLocation` object (`id`, `addressLine1`, `addressLine2`, `suburb`, `state`, `postcode`)
  - `availableDays`
  - `slotDuration`
  - `createdBy`
  - `createdAt`
  - `updatedAt`

#### Error Responses

- `400 Bad Request` if `hcpId` is invalid.
- `401 Unauthorized` if request is not authenticated.

## HCP Schedules List (By Clinic Location)

### `GET /api/hcp-schedules/clinic-location/:clinicLocationId`

Lists all HCPs and their schedules for a specific clinic location.

#### Access Control

- Authenticated endpoint
- Requires `ADMIN` or `CLINIC_ADMIN` role

#### Success Response

- `200 OK`
- Returns an array of schedule objects:
  - `id`
  - `hcpClinicLocationId`
  - `hcp` object (`id`, `firstName`, `lastName`, `speciality`)
  - `availableDays`
  - `slotDuration`
  - `createdBy`
  - `createdAt`
  - `updatedAt`

#### Error Responses

- `400 Bad Request` if `clinicLocationId` is invalid.
- `401 Unauthorized` if request is not authenticated.

## Appointments

### `POST /api/appointments`

Creates a new appointment for a specific slot and patient.

#### Access Control

- Authenticated endpoint
- Requires `ADMIN`, `PATIENT`, `HCP`, or `CLINIC_ADMIN` role
- `CLINIC_ADMIN` restricted to their own clinic locations

#### Request Body

| Field     | Type   | Required | Notes                            |
| --------- | ------ | -------- | -------------------------------- |
| slotId    | string | yes      | References `slot.id`.            |
| patientId | string | yes      | References `patient.id`.         |

#### Success Response

- `201 Created`
- Returns created appointment payload:
  - `id`
  - `slotId`
  - `patientId`
  - `status`
  - `createdAt`
  - `updatedAt`

#### Error Responses

- `400 Bad Request` for invalid or missing fields.
- `403 Forbidden` if `CLINIC_ADMIN` attempts to book for another clinic.
- `404 Not Found` if slot or patient does not exist.
- `409 Conflict` if slot already has an active appointment.

### `GET /api/appointments`

Lists appointments based on role permissions.

#### Access Control

- `ADMIN`: all appointments
- `CLINIC_ADMIN`: appointments for their own clinics
- `PATIENT`: their own appointments
- `HCP`: appointments for their own slots

#### Success Response

- `200 OK`
- Returns an array of appointment objects.

### `GET /api/appointments/:id`

Retrieves details for a specific appointment.

#### Access Control

- Same restrictions as `GET /api/appointments`
