# Database

## Entities

This is a list of all proposed entities to be defined in the application

All entities should include the common base fields `id`, `created_at`, and `updated_at`.
Each entity added to this document should define every field's type, nullability, uniqueness, and references.
If any of those details are not specified, ask clarifing questions to complete the entity definitions.

| Entity              |
| ------------------- |
| user                |
| role                |
| slot                |
| patient             |
| hcp                 |
| clinic_location     |
| hcp_clinic_location |
| hcp_schedule        |
| appointment         |
| speciality          |

## User

| Field          | Type     | Nullable | Unique | References |
| -------------- | -------- | -------- | ------ | ---------- |
| id             | string   | no       | yes    | -          |
| first_name     | string   | no       | no     | -          |
| last_name      | string   | yes      | no     | -          |
| email          | string   | no       | yes    | -          |
| contact_number | string   | yes      | no     | -          |
| password       | string   | no       | no     | -          |
| role_id        | string   | no       | no     | role.id    |
| created_at     | datetime | no       | no     | -          |
| updated_at     | datetime | no       | no     | -          |

## Role

| Field      | Type     | Nullable | Unique | References |
| ---------- | -------- | -------- | ------ | ---------- |
| id         | string   | no       | yes    | -          |
| name       | string   | no       | no     | -          |
| created_at | datetime | no       | no     | -          |
| updated_at | datetime | no       | no     | -          |

## Patient

| Field                   | Type     | Nullable | Unique | References    |
| ----------------------- | -------- | -------- | ------ | ------------- |
| id                      | string   | no       | yes    | -             |
| user_id                 | string   | no       | yes    | user.id       |
| address_line_1          | string   | yes      | no     | -             |
| address_line_2          | string   | yes      | no     | -             |
| suburb                  | string   | yes      | no     | -             |
| state                   | string   | yes      | no     | -             |
| postcode                | string   | no       | no     | -             |
| preferred_speciality_id | string   | yes      | no     | speciality.id |
| created_at              | datetime | no       | no     | -             |
| updated_at              | datetime | no       | no     | -             |

## Hcp

| Field         | Type     | Nullable | Unique | References    |
| ------------- | -------- | -------- | ------ | ------------- |
| id            | string   | no       | yes    | -             |
| user_id       | string   | no       | yes    | user.id       |
| speciality_id | string   | no       | no     | speciality.id |
| created_at    | datetime | no       | no     | -             |
| updated_at    | datetime | no       | no     | -             |

## Clinic Location

| Field          | Type     | Nullable | Unique | References |
| -------------- | -------- | -------- | ------ | ---------- |
| id             | string   | no       | yes    | -          |
| address_line_1 | string   | yes      | no     | -          |
| address_line_2 | string   | yes      | no     | -          |
| suburb         | string   | yes      | no     | -          |
| state          | string   | yes      | no     | -          |
| postcode       | string   | no       | no     | -          |
| created_at     | datetime | no       | no     | -          |
| updated_at     | datetime | no       | no     | -          |

## Hcp Clinic Location

| Field              | Type     | Nullable | Unique | References         |
| ------------------ | -------- | -------- | ------ | ------------------ |
| id                 | string   | no       | yes    | -                  |
| hcp_id             | string   | no       | no     | hcp.id             |
| clinic_location_id | string   | no       | no     | clinic_location.id |
| created_at         | datetime | no       | no     | -                  |
| updated_at         | datetime | no       | no     | -                  |

`(hcp_id, clinic_location_id)` should be unique to avoid duplicate HCP-clinic assignments.

## Hcp Schedule

| Field              | Type          | Nullable | Unique | References         |
| ------------------ | ------------- | -------- | ------ | ------------------ |
| id                 | string        | no       | yes    | -                  |
| hcp_id             | string        | no       | no     | hcp.id             |
| clinic_location_id | string        | no       | no     | clinic_location.id |
| available_days     | day_of_week[] | no       | no     | -                  |
| slot_duration      | integer       | no       | no     | -                  |
| schedule_expiry_at | datetime      | no       | no     | -                  |
| created_at         | datetime      | no       | no     | -                  |
| updated_at         | datetime      | no       | no     | -                  |

`available_days` is limited to `Sunday` through `Saturday`, with the week starting on `Sunday` and ending on `Saturday`.
`slot_duration` is stored in minutes and defaults to `15`.
`schedule_expiry_at` should be set to `updated_at + 1 year` so HCPs can review schedule changes annually.
There should be one active schedule record per HCP-clinic combination.

## Slot

| Field              | Type        | Nullable | Unique | References         |
| ------------------ | ----------- | -------- | ------ | ------------------ |
| id                 | string      | no       | yes    | -                  |
| slot_date          | date        | no       | no     | -                  |
| slot_day           | day_of_week | no       | no     | -                  |
| slot_time          | time        | no       | no     | -                  |
| hcp_id             | string      | no       | no     | hcp.id             |
| clinic_location_id | string      | no       | no     | clinic_location.id |
| hcp_schedule_id    | string      | no       | no     | hcp_schedule.id    |
| created_at         | datetime    | no       | no     | -                  |
| updated_at         | datetime    | no       | no     | -                  |

Slots are generated from the clinic-specific HCP schedule's configured availability and slot duration.
Slot rows are created on the HCP's first login for that day, only for days included in `hcp_schedule.available_days`.
If a schedule is updated during the day, all unappointed slots should be deleted and then re-created, or not re-created, based on the updated schedule.
For example, a 10-hour clinic day from `8:00` to `18:00` with a `15` minute duration yields entries such as `8:00`, `8:15`, and so on.
Generated slots should be attributable to the `hcp_schedule` record and `clinic_location` that created them.
`(hcp_id, slot_date, slot_time)` should be unique to avoid duplicate HCP slots.

## Appointment

| Field      | Type               | Nullable | Unique | References |
| ---------- | ------------------ | -------- | ------ | ---------- |
| id         | string             | no       | yes    | -          |
| slot_id    | string             | no       | yes    | slot.id    |
| hcp_id     | string             | no       | no     | hcp.id     |
| patient_id | string             | no       | no     | patient.id |
| status     | appointment_status | no       | no     | -          |
| created_at | datetime           | no       | no     | -          |
| updated_at | datetime           | no       | no     | -          |

`appointment_status` is limited to `PENDING`, `ACCEPTED`, and `REJECTED`.

## Speciality

| Field      | Type     | Nullable | Unique | References |
| ---------- | -------- | -------- | ------ | ---------- |
| id         | string   | no       | yes    | -          |
| name       | string   | no       | no     | -          |
| created_at | datetime | no       | no     | -          |
| updated_at | datetime | no       | no     | -          |
