# OfferTracker — Frontend API Reference

This document is the definitive guide for integrating against the OfferTracker backend API. Every endpoint, request body, response model, enum value, and status code is documented from the source of truth: the backend code itself.

**Base URL**: `http://127.0.0.1:8000`  
**API Prefix**: `/api/v1`  
**Full prefix for all endpoints below**: `http://127.0.0.1:8000/api/v1`

**Interactive docs** (try requests live, authenticate via the Authorize button): `http://127.0.0.1:8000/docs`

---

## Authentication

All endpoints except `POST /auth/register` and `POST /auth/login` require:

```
Authorization: Bearer <access_token>
```

The `access_token` is returned by both the register and login responses.

---

## Enums Reference

These are the valid string values for enum fields throughout the API. The API accepts and returns these exact strings.

| Enum | Values |
|------|--------|
| `ApplicationStatus` | `Saved` · `Applied` · `Interviewing` · `Offer` · `Accepted` · `Rejected` · `Withdrawn` |
| `StageType` | `Recruiter Call` · `Phone Screen` · `Technical` · `Coding Challenge` · `Take-Home` · `System Design` · `Behavioral` · `Panel` · `Onsite` · `Final Round` · `Other` |
| `StageResult` | `Pending` · `Passed` · `Failed` · `Cancelled` |
| `JobType` | `Full-time` · `Part-time` · `Contract` · `Internship` · `Freelance` |
| `WorkMode` | `Remote` · `Hybrid` · `On-site` |
| `Priority` | `High` · `Medium` · `Low` |
| `Source` | `LinkedIn` · `Indeed` · `Glassdoor` · `Company Website` · `Referral` · `Job Board` · `Recruiter` · `Networking` · `Career Fair` · `Other` |
| `ContactType` | `Recruiter` · `Hiring Manager` · `Referral` · `HR` · `Peer` · `Other` |
| `DocumentType` | `Resume` · `Cover Letter` · `Portfolio` · `Reference` · `Other` |
| `ReminderType` | `Follow-up` · `Deadline` · `Interview` · `General` |
| `PostType` | `Update` · `Tip` · `Milestone` · `Question` · `Resource` · `Celebration` |
| `ReactionType` | `Like` · `Celebrate` · `Support` · `Insightful` |
| `GroupRole` | `admin` · `member` |
| `ProfileVisibility` | `private` · `followers` · `groups` · `public` |

---

## Common Response Patterns

| HTTP Status | Meaning |
|-------------|---------|
| `200` | Successful read or update |
| `201` | Successful creation |
| `400` | Bad request — business logic violation (e.g. already following, duplicate tag name) |
| `401` | Missing or invalid JWT |
| `403` | Authenticated but not the owner of this resource |
| `404` | Resource not found |
| `409` | Conflict — e.g. trying to POST a second outcome when one already exists |
| `422` | Validation error — malformed request body or query parameters |

**Validation error shape** (HTTP 422):

```json
{
  "detail": [
    {
      "loc": ["body", "field_name"],
      "msg": "Human-readable message",
      "type": "error_type_identifier"
    }
  ]
}
```

---

## Auth

### `POST /auth/register`

Register a new account via Supabase Auth.

#### Request Body

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `email` | `string` | **Yes** | max 255 chars |
| `username` | `string` | **Yes** | 3–50 chars |
| `password` | `string` | **Yes** | 6–128 chars |
| `display_name` | `string \| null` | No | max 100 chars — defaults to username if omitted |

#### Response — `201`

```json
{
  "access_token": "eyJhbGc...",
  "token_type": "bearer",
  "user": { "...UserResponse fields..." }
}
```

**Errors**: `400` email already taken · `400` username already taken.

---

### `POST /auth/login`

Log in and receive a Supabase session JWT.

#### Request Body

| Field | Type | Required |
|-------|------|----------|
| `email` | `string` | **Yes** |
| `password` | `string` | **Yes** (min 6 chars) |

#### Response — `200`

```json
{
  "access_token": "eyJhbGc...",
  "token_type": "bearer",
  "user": { "...UserResponse fields..." }
}
```

**Errors**: `401` incorrect email or password · `401` session could not be established.

---

## Users

### `GET /users/me`

Get the authenticated user's full profile.

#### Response — `200` → `UserResponse`

---

### `PUT /users/me`

Update the authenticated user's profile. Only fields sent are updated.

#### Request Body

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `display_name` | `string \| null` | No | max 100 chars |
| `bio` | `string \| null` | No | |
| `is_profile_public` | `boolean \| null` | No | Legacy flag — prefer `profile_visibility` |
| `profile_visibility` | `string \| null` | No | `private` · `followers` · `groups` · `public` |

#### Response — `200` → `UserResponse`

---

### `GET /users/search`

Search public profiles by username or display name.

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `q` | `string` | `""` | Search query — returns empty array if blank |
| `skip` | `integer` | `0` | |
| `limit` | `integer` | `20` | |

#### Response — `200` → `array[UserPublicProfile]`

---

### `GET /users/{user_id}`

Get a user's public profile. Returns `403` if the profile is private and the requester is not the owner.

#### Response — `200` → `UserPublicProfile`

**Errors**: `404` user not found · `403` profile is private.

---

## Resumes

### `GET /resumes/`

List the authenticated user's resume versions.

#### Query Parameters

| Parameter | Type | Default |
|-----------|------|---------|
| `skip` | `integer` | `0` |
| `limit` | `integer` | `100` |

#### Response — `200` → `array[ResumeVersionResponse]`

---

### `POST /resumes/`

Create a new resume version.

#### Request Body

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `version_name` | `string` | **Yes** | max 50 chars |
| `notes` | `string \| null` | No | |
| `file_url` | `string \| null` | No | max 500 chars — set automatically by the upload endpoint, or provide an external URL |

#### Response — `201` → `ResumeVersionResponse`

---

### `GET /resumes/{id}`

Get a resume version by ID.

#### Response — `200` → `ResumeVersionResponse`

**Errors**: `404` not found · `403` not your resume.

---

### `PUT /resumes/{id}`

Update a resume version. Only sent fields are updated.

#### Request Body

| Field | Type |
|-------|------|
| `version_name` | `string \| null` |
| `notes` | `string \| null` |
| `file_url` | `string \| null` |

#### Response — `200` → `ResumeVersionResponse`

**Errors**: `404` not found · `403` not your resume.

---

### `DELETE /resumes/{id}`

#### Response — `200`

```json
{ "detail": "Resume version deleted" }
```

---

## Applications

The entry form is intentionally minimal. Only `company_name` and `role_title` are required — everything else has a sensible default or is optional.

### Status Flow

```
Saved → Applied → Interviewing → Offer → Accepted
                              ↘ Rejected  (any point)
                              ↘ Withdrawn (any point)
```

**Auto-transitions (no extra API call needed)**:
- Creating with `status: "Applied"` → `applied_date` auto-set to today.
- Updating `status` from `"Saved"` → `"Applied"` → `applied_date` auto-set to today.
- Adding a Stage to an `"Applied"` application → status auto-moves to `"Interviewing"`.
- Creating an Outcome → status auto-moves to `"Offer"`.

---

### `GET /applications/`

List all applications with their nested stages, outcome, and reflection.

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `skip` | `integer` | `0` | |
| `limit` | `integer` | `100` | |
| `status` | `string \| null` | `null` | Filter by `ApplicationStatus` |
| `priority` | `string \| null` | `null` | Filter by `Priority` |

#### Response — `200` → `array[ApplicationResponse]`

---

### `POST /applications/`

Create a new application.

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `company_name` | `string` | **Yes** | max 255 chars |
| `role_title` | `string` | **Yes** | max 255 chars |
| `url` | `string \| null` | No | Job posting URL, max 500 chars |
| `description` | `string \| null` | No | Job description or key requirements |
| `location` | `string \| null` | No | max 255 chars |
| `job_type` | `JobType \| null` | No | |
| `work_mode` | `WorkMode \| null` | No | |
| `salary_min` | `integer \| null` | No | ≥ 0, annual |
| `salary_max` | `integer \| null` | No | ≥ 0 |
| `salary_currency` | `string` | No | Default: `"USD"`, max 3 chars (ISO 4217) |
| `applied_source` | `Source \| null` | No | |
| `applied_date` | `string \| null` | No | `YYYY-MM-DD` — auto-set when status is `"Applied"` |
| `follow_up_date` | `string \| null` | No | `YYYY-MM-DD` |
| `priority` | `Priority \| null` | No | |
| `notes` | `string \| null` | No | Personal notes |
| `status` | `ApplicationStatus` | No | Default: `"Saved"` |
| `resume_version_id` | `string \| null` | No | UUID of a resume version |

#### Response — `201` → `ApplicationResponse`

**Errors**: `404` resume version not found (if `resume_version_id` is provided but invalid).

---

### `GET /applications/{id}`

Get a single application by ID with all nested relations (stages, outcome, reflection).

#### Response — `200` → `ApplicationResponse`

**Errors**: `404` not found · `403` not your application.

---

### `PUT /applications/{id}`

Update an application. Only sent fields are updated.

#### Request Body — all fields optional

Same fields as the create body (`company_name`, `role_title`, `url`, `description`, `location`, `job_type`, `work_mode`, `salary_min`, `salary_max`, `salary_currency`, `applied_source`, `applied_date`, `follow_up_date`, `priority`, `notes`, `status`, `resume_version_id`) — all `string | null` or their respective type.

#### Response — `200` → `ApplicationResponse`

**Errors**: `404` not found · `403` not your application.

---

### `DELETE /applications/{id}`

Delete an application and cascade-delete all related data (stages, outcome, reflection, documents, contacts, reminders, activity log entries).

#### Response — `200`

```json
{ "detail": "Application deleted" }
```

---

## Application — Stages

### `POST /applications/{id}/stages`

Add an interview stage. If the application is currently `"Applied"`, it auto-transitions to `"Interviewing"`.

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `stage_name` | `string` | **Yes** | max 100 chars, e.g. `"Recruiter Call"` |
| `stage_type` | `StageType \| null` | No | |
| `stage_date` | `string \| null` | No | `YYYY-MM-DD` |
| `result` | `StageResult` | No | Default: `"Pending"` |
| `duration_minutes` | `integer \| null` | No | Length in minutes, > 0 |
| `interviewer_names` | `string \| null` | No | Comma-separated |
| `prep_notes` | `string \| null` | No | Pre-interview preparation notes |
| `questions_asked` | `array[string] \| null` | No | Questions encountered during the round |
| `notes` | `string \| null` | No | General post-round notes |

#### Response — `201` → `ApplicationStageResponse`

**Errors**: `404` application not found · `403` not your application.

---

### `PUT /applications/{id}/stages/{stage_id}`

Update a stage. Only sent fields are updated.

#### Request Body — all fields optional

Same fields as the create body, all optional.

#### Response — `200` → `ApplicationStageResponse`

**Errors**: `404` stage not found · `403` not your application.

---

### `DELETE /applications/{id}/stages/{stage_id}`

#### Response — `200`

```json
{ "detail": "Stage deleted" }
```

---

## Application — Outcome (Offer Details)

There is one outcome per application (one-to-one). Creating one auto-transitions the application to `"Offer"`.

### `POST /applications/{id}/outcome`

Record offer and compensation details.

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `status` | `string \| null` | No | Default: `"Offer"`. Also accepts `"Rejected"` or `"Withdrawn"` |
| `salary` | `integer \| null` | No | Annual base salary, ≥ 0 |
| `salary_currency` | `string` | No | Default: `"USD"`, max 3 chars |
| `bonus` | `string \| null` | No | e.g. `"$20k sign-on"` |
| `equity` | `string \| null` | No | e.g. `"10k RSUs over 4 years"` |
| `benefits` | `string \| null` | No | Key benefits summary |
| `start_date` | `string \| null` | No | `YYYY-MM-DD` |
| `deadline` | `string \| null` | No | `YYYY-MM-DD` — offer acceptance deadline |
| `negotiation_notes` | `string \| null` | No | |
| `notes` | `string \| null` | No | |

#### Response — `201` → `OutcomeResponse`

**Errors**: `404` application not found · `403` not your application · `409` outcome already exists (use PUT to update).

---

### `PUT /applications/{id}/outcome/{outcome_id}`

Update offer details. Only sent fields are updated.

#### Request Body — all fields optional

Same fields as the create body.

#### Response — `200` → `OutcomeResponse`

**Errors**: `404` outcome not found · `403` not your application.

---

### `DELETE /applications/{id}/outcome/{outcome_id}`

#### Response — `200`

```json
{ "detail": "Outcome deleted" }
```

---

## Application — Reflection

### `POST /applications/{id}/reflection`

Add a post-interview reflection.

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `what_worked` | `string \| null` | No | What went well |
| `what_failed` | `string \| null` | No | What didn't go well |
| `skill_gaps` | `object \| null` | No | Freeform JSON — e.g. `{"TypeScript": "intermediate", "System Design": "beginner"}` |
| `improvement_plan` | `string \| null` | No | Steps to close the gaps |

#### Response — `201` → `ReflectionResponse`

**Errors**: `404` application not found · `403` not your application.

---

### `PUT /applications/{id}/reflection/{reflection_id}`

Update a reflection. Only sent fields are updated.

#### Request Body — all fields optional

Same fields as the create body.

#### Response — `200` → `ReflectionResponse`

---

### `DELETE /applications/{id}/reflection/{reflection_id}`

#### Response — `200`

```json
{ "detail": "Reflection deleted" }
```

---

## Contacts

Track recruiters, hiring managers, referrals, and other networking contacts. Contacts can be linked to a specific application or kept as standalone entries.

### `GET /contacts/`

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `application_id` | `string \| null` | `null` | Filter to contacts linked to one application |
| `contact_type` | `string \| null` | `null` | Filter by `ContactType` value |
| `skip` | `integer` | `0` | |
| `limit` | `integer` | `100` | |

#### Response — `200` → `array[ContactResponse]`

---

### `POST /contacts/`

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `string` | **Yes** | max 255 chars |
| `application_id` | `string \| null` | No | Link to an application |
| `email` | `string \| null` | No | max 255 chars |
| `phone` | `string \| null` | No | max 50 chars |
| `role_title` | `string \| null` | No | Contact's job title, max 255 chars |
| `company` | `string \| null` | No | max 255 chars |
| `contact_type` | `ContactType` | No | Default: `"Other"` |
| `linkedin_url` | `string \| null` | No | max 500 chars |
| `notes` | `string \| null` | No | |
| `last_contacted` | `string \| null` | No | `YYYY-MM-DD` |

#### Response — `201` → `ContactResponse`

---

### `GET /contacts/{contact_id}`

#### Response — `200` → `ContactResponse`

**Errors**: `404` · `403`

---

### `PUT /contacts/{contact_id}`

All fields optional. Only sent fields are updated.

#### Response — `200` → `ContactResponse`

---

### `DELETE /contacts/{contact_id}`

#### Response — `200`

```json
{ "detail": "Contact deleted" }
```

---

## Documents

Attach cover letters, portfolios, work samples, and references to applications.

### `GET /documents/{application_id}`

List all documents for an application.

#### Response — `200` → `array[DocumentResponse]`

**Errors**: `404` application not found · `403` not your application.

---

### `POST /documents/`

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `application_id` | `string` | **Yes** | |
| `name` | `string` | **Yes** | Descriptive file name, max 255 chars |
| `doc_type` | `DocumentType` | No | Default: `"Other"` |
| `file_url` | `string \| null` | No | URL to the file, max 500 chars |
| `notes` | `string \| null` | No | |

#### Response — `201` → `DocumentResponse`

**Errors**: `404` application not found · `403` not your application.

---

### `PUT /documents/{doc_id}`

#### Request Body — all optional

| Field | Type |
|-------|------|
| `doc_type` | `DocumentType \| null` |
| `name` | `string \| null` |
| `file_url` | `string \| null` |
| `notes` | `string \| null` |

#### Response — `200` → `DocumentResponse`

---

### `DELETE /documents/{doc_id}`

#### Response — `200`

```json
{ "detail": "Document deleted" }
```

---

## Reminders

Schedule follow-up alerts, interview prep reminders, and offer deadlines.

### `GET /reminders/`

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `is_completed` | `boolean \| null` | `null` | Filter by completion status |
| `reminder_type` | `string \| null` | `null` | Filter by `ReminderType` value |
| `skip` | `integer` | `0` | |
| `limit` | `integer` | `100` | |

#### Response — `200` → `array[ReminderResponse]`

---

### `GET /reminders/upcoming`

Next upcoming incomplete reminders, ordered by `remind_at` ascending.

#### Query Parameters

| Parameter | Type | Default |
|-----------|------|---------|
| `limit` | `integer` | `10` |

#### Response — `200` → `array[ReminderResponse]`

---

### `POST /reminders/`

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | `string` | **Yes** | max 255 chars |
| `remind_at` | `datetime` | **Yes** | ISO 8601, e.g. `"2026-03-15T09:00:00"` |
| `application_id` | `string \| null` | No | Link to an application |
| `description` | `string \| null` | No | |
| `reminder_type` | `ReminderType` | No | Default: `"General"` |

#### Response — `201` → `ReminderResponse`

---

### `GET /reminders/{reminder_id}`

#### Response — `200` → `ReminderResponse`

**Errors**: `404` · `403`

---

### `PUT /reminders/{reminder_id}`

#### Request Body — all optional

| Field | Type |
|-------|------|
| `title` | `string \| null` |
| `description` | `string \| null` |
| `remind_at` | `datetime \| null` |
| `reminder_type` | `ReminderType \| null` |
| `is_completed` | `boolean \| null` |

#### Response — `200` → `ReminderResponse`

---

### `POST /reminders/{reminder_id}/complete`

Mark a reminder as completed. Sets `is_completed: true` and stamps `completed_at`.

#### Response — `200` → `ReminderResponse`

**Errors**: `404` · `403`

---

### `DELETE /reminders/{reminder_id}`

#### Response — `200`

```json
{ "detail": "Reminder deleted" }
```

---

## Tags

User-defined, colour-coded labels. Tags are personal — each user maintains their own library.

### `GET /tags/`

List all of the user's tags.

#### Response — `200` → `array[TagResponse]`

---

### `POST /tags/`

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `string` | **Yes** | max 50 chars — unique per user |
| `color` | `string` | No | Hex colour code, max 7 chars. Default: `"#6366f1"` |

#### Response — `201` → `TagResponse`

**Errors**: `400` tag with this name already exists.

---

### `PUT /tags/{tag_id}`

#### Request Body — all optional

| Field | Type |
|-------|------|
| `name` | `string \| null` |
| `color` | `string \| null` |

#### Response — `200` → `TagResponse`

**Errors**: `404` · `403`

---

### `DELETE /tags/{tag_id}`

Deletes the tag and removes it from every application it was assigned to.

#### Response — `200`

```json
{ "detail": "Tag deleted" }
```

---

### `GET /tags/application/{application_id}`

Get all tags assigned to a specific application.

#### Response — `200` → `array[ApplicationTagResponse]`

---

### `POST /tags/application/{application_id}/assign/{tag_id}`

Assign a tag to an application.

#### Response — `201` → `ApplicationTagResponse`

**Errors**: `404` application or tag not found · `403` not your application.

---

### `DELETE /tags/application/{application_id}/remove/{tag_id}`

Remove a tag from an application.

#### Response — `200`

```json
{ "detail": "Tag removed from application" }
```

---

## Saved Jobs

Bookmark job postings and decide to apply later. A saved job can be promoted to a full application via the `/convert` endpoint.

### `GET /saved-jobs/`

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `status` | `string \| null` | `null` | `Active` · `Archived` · `Converted` |
| `priority` | `string \| null` | `null` | Filter by `Priority` |
| `skip` | `integer` | `0` | |
| `limit` | `integer` | `100` | |

#### Response — `200` → `array[SavedJobResponse]`

---

### `POST /saved-jobs/`

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `company_name` | `string` | **Yes** | max 255 chars |
| `role_title` | `string \| null` | No | max 255 chars |
| `url` | `string \| null` | No | Job posting URL, max 500 chars |
| `company_website` | `string \| null` | No | max 500 chars |
| `location` | `string \| null` | No | max 255 chars |
| `job_type` | `JobType \| null` | No | |
| `work_mode` | `WorkMode \| null` | No | |
| `salary_range_min` | `integer \| null` | No | ≥ 0 |
| `salary_range_max` | `integer \| null` | No | ≥ 0 |
| `salary_currency` | `string` | No | Default: `"USD"` |
| `priority` | `Priority` | No | Default: `"Medium"` |
| `source` | `string \| null` | No | Where you found it, max 255 chars |
| `notes` | `string \| null` | No | |
| `deadline` | `string \| null` | No | `YYYY-MM-DD` application deadline |
| `excitement_level` | `integer \| null` | No | 1–5 rating |

#### Response — `201` → `SavedJobResponse`

---

### `GET /saved-jobs/{id}`

#### Response — `200` → `SavedJobResponse`

**Errors**: `404` · `403`

---

### `PUT /saved-jobs/{id}`

Update a saved job. To archive it, set `status: "Archived"`. Do **not** manually set `status: "Converted"` — that is managed by the `/convert` endpoint.

#### Request Body — all optional

Same fields as the create body, plus `status` (`Active` or `Archived` only).

#### Response — `200` → `SavedJobResponse`

---

### `DELETE /saved-jobs/{id}`

#### Response — `200`

```json
{ "detail": "Saved job deleted" }
```

---

### `POST /saved-jobs/{id}/convert`

Promote a saved job to a full application. Sets the saved job's status to `Converted` and `converted_to_application_id`. Returns the new application.

#### Response — `201` → `ApplicationResponse`

**Errors**: `404` · `403` · `400` already converted.

---

## Analytics

### `GET /analytics/dashboard`

Comprehensive analytics for the authenticated user.

#### Response — `200` → `AnalyticsDashboardResponse`

---

### `GET /analytics/activity`

Chronological activity timeline.

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `application_id` | `string \| null` | `null` | Filter to one application's timeline |
| `skip` | `integer` | `0` | |
| `limit` | `integer` | `50` | |

#### Response — `200` → `array[ActivityLogResponse]`

---

### `GET /analytics/questions`

Personal interview question bank — aggregates all questions from `questions_asked` across every stage.

#### Response — `200`

```json
{
  "questions": [
    {
      "question": "Tell me about a time you resolved a conflict.",
      "stage_type": "Behavioral",
      "company": "Acme Corp",
      "role": "Software Engineer"
    }
  ],
  "total": 42
}
```

---

## Social — Follows

### `POST /social/follow/{user_id}`

#### Response — `201` → `FollowResponse`

**Errors**: `400` cannot follow yourself · `400` already following.

---

### `DELETE /social/follow/{user_id}`

#### Response — `200`

```json
{ "detail": "Unfollowed successfully" }
```

**Errors**: `404` not following this user.

---

### `GET /social/followers/{user_id}`

| Parameter | Default |
|-----------|---------|
| `skip` | `0` |
| `limit` | `50` |

#### Response — `200` → `array[FollowResponse]`

---

### `GET /social/following/{user_id}`

| Parameter | Default |
|-----------|---------|
| `skip` | `0` |
| `limit` | `50` |

#### Response — `200` → `array[FollowResponse]`

---

### `GET /social/follow-stats/{user_id}`

#### Response — `200` → `FollowStats`

---

## Social — Groups

### `POST /social/groups`

Creator is automatically added as an admin member.

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `string` | **Yes** | max 100 chars |
| `description` | `string \| null` | No | |
| `is_public` | `boolean` | No | Default: `true` |

#### Response — `201` → `GroupResponse`

---

### `GET /social/groups`

List public groups.

| Parameter | Default |
|-----------|---------|
| `skip` | `0` |
| `limit` | `50` |

#### Response — `200` → `array[GroupResponse]`

---

### `GET /social/groups/mine`

Groups the authenticated user belongs to.

#### Response — `200` → `array[GroupResponse]`

---

### `GET /social/groups/{group_id}`

Get group details including member count.

#### Response — `200` → `GroupResponse`

**Errors**: `404`

---

### `PUT /social/groups/{group_id}`

Creator only.

#### Request Body — all optional

| Field | Type |
|-------|------|
| `name` | `string \| null` |
| `description` | `string \| null` |
| `is_public` | `boolean \| null` |

#### Response — `200` → `GroupResponse`

**Errors**: `404` · `403` only the creator can update.

---

### `DELETE /social/groups/{group_id}`

Creator only.

#### Response — `200`

```json
{ "detail": "Group deleted" }
```

---

### `POST /social/groups/{group_id}/join`

#### Response — `201` → `GroupMemberResponse`

**Errors**: `404` · `400` already a member.

---

### `DELETE /social/groups/{group_id}/leave`

#### Response — `200`

```json
{ "detail": "Left group successfully" }
```

---

### `GET /social/groups/{group_id}/members`

#### Response — `200` → `array[GroupMemberResponse]`

---

## Social — Posts & Reactions

### `POST /social/posts`

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `content` | `string` | **Yes** | Post body |
| `post_type` | `PostType` | No | Default: `"Update"` |
| `title` | `string \| null` | No | max 255 chars |
| `group_id` | `string \| null` | No | Post into a specific group |
| `is_public` | `boolean` | No | Default: `true` |

#### Response — `201` → `PostResponse`

---

### `GET /social/posts/feed`

Public post feed.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `group_id` | `string \| null` | `null` | Filter to a group |
| `skip` | `integer` | `0` | |
| `limit` | `integer` | `50` | |

#### Response — `200` → `array[PostResponse]`

---

### `GET /social/posts/mine`

| Parameter | Default |
|-----------|---------|
| `skip` | `0` |
| `limit` | `50` |

#### Response — `200` → `array[PostResponse]`

---

### `PUT /social/posts/{post_id}`

Author only.

#### Request Body — all optional

| Field | Type |
|-------|------|
| `title` | `string \| null` |
| `content` | `string \| null` |
| `is_public` | `boolean \| null` |

#### Response — `200` → `PostResponse`

**Errors**: `404` · `403` not the author.

---

### `DELETE /social/posts/{post_id}`

Author only.

#### Response — `200`

```json
{ "detail": "Post deleted" }
```

---

### `POST /social/posts/{post_id}/react`

One reaction per user per post — sending a new reaction replaces the previous one.

#### Request Body

| Field | Type | Required |
|-------|------|----------|
| `reaction` | `ReactionType` | No — default: `"Like"` |

#### Response — `201` → `ReactionResponse`

---

### `DELETE /social/posts/{post_id}/react`

Remove the authenticated user's reaction.

#### Response — `200`

```json
{ "detail": "Reaction removed" }
```

---

## Progress & Milestones

### `GET /progress/milestones`

All 12 available milestones.

#### Response — `200` → `array[MilestoneResponse]`

---

### `GET /progress/milestones/mine`

Milestones the authenticated user has earned, with `reached_at` timestamps.

#### Response — `200` → `array[UserMilestoneResponse]`

---

### `GET /progress/community`

Active users with public profiles, ordered by recent activity.

| Parameter | Default |
|-----------|---------|
| `limit` | `20` |

#### Response — `200` → `array[CommunityMemberEntry]`

---

### `GET /progress/stats`

The authenticated user's personal summary.

#### Response — `200` → `UserStatsResponse`

---

## File Upload

### `POST /upload/resumes/{resume_id}`

Upload a resume file to Supabase Storage. Updates the `file_url` field on the resume version automatically.

**Content-Type**: `multipart/form-data`

| Field | Type | Description |
|-------|------|-------------|
| `file` | `file` | PDF or Word document (`.pdf`, `.doc`, `.docx`), max 10 MB |

#### Response — `200`

```json
{
  "file_url": "https://your-project.supabase.co/storage/v1/object/public/resumes/...",
  "resume": { "...ResumeVersionResponse fields..." }
}
```

**Errors**: `404` resume not found · `403` not your resume · `400` unsupported file type · `400` file too large (> 10 MB).

---

## Root

### `GET /`

#### Response — `200`

```json
{ "message": "Welcome to OfferTracker API" }
```

---

## Response Models

All `datetime` fields are ISO 8601 strings. All `date` fields are `YYYY-MM-DD` strings. All `id` fields are UUIDs.

---

### `UserResponse`

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | UUID |
| `email` | `string` | |
| `username` | `string` | |
| `display_name` | `string \| null` | |
| `bio` | `string \| null` | |
| `is_profile_public` | `boolean` | Default `false` |
| `profile_visibility` | `string` | `private` · `followers` · `groups` · `public` |
| `streak_days` | `integer` | Consecutive active days |
| `last_active_date` | `string \| null` | `YYYY-MM-DD` |
| `created_at` | `datetime` | |
| `updated_at` | `datetime` | |

---

### `UserPublicProfile`

| Field | Type |
|-------|------|
| `id` | `string` |
| `username` | `string` |
| `display_name` | `string \| null` |
| `bio` | `string \| null` |
| `profile_visibility` | `string` |
| `streak_days` | `integer` |
| `created_at` | `datetime` |

---

### `ResumeVersionResponse`

| Field | Type |
|-------|------|
| `id` | `string` |
| `user_id` | `string` |
| `version_name` | `string` |
| `notes` | `string \| null` |
| `file_url` | `string \| null` |
| `created_at` | `datetime` |
| `updated_at` | `datetime` |

---

### `ApplicationResponse`

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | |
| `user_id` | `string` | |
| `company_name` | `string` | |
| `role_title` | `string` | |
| `url` | `string \| null` | |
| `description` | `string \| null` | |
| `location` | `string \| null` | |
| `job_type` | `string \| null` | |
| `work_mode` | `string \| null` | |
| `salary_min` | `integer \| null` | |
| `salary_max` | `integer \| null` | |
| `salary_currency` | `string` | Default `"USD"` |
| `applied_source` | `string \| null` | |
| `applied_date` | `string \| null` | `YYYY-MM-DD` |
| `follow_up_date` | `string \| null` | `YYYY-MM-DD` |
| `priority` | `string \| null` | |
| `notes` | `string \| null` | |
| `status` | `string` | One of `ApplicationStatus` |
| `resume_version_id` | `string \| null` | |
| `created_at` | `datetime` | |
| `updated_at` | `datetime` | |
| `stages` | `array[ApplicationStageResponse]` | Always present, may be `[]` |
| `outcome` | `OutcomeResponse \| null` | Always present, may be `null` |
| `reflection` | `ReflectionResponse \| null` | Always present, may be `null` |

---

### `ApplicationStageResponse`

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | |
| `application_id` | `string` | |
| `stage_name` | `string` | |
| `stage_type` | `string \| null` | |
| `stage_date` | `string \| null` | `YYYY-MM-DD` |
| `result` | `string` | Default `"Pending"` |
| `duration_minutes` | `integer \| null` | |
| `interviewer_names` | `string \| null` | |
| `prep_notes` | `string \| null` | |
| `questions_asked` | `array[string] \| null` | |
| `notes` | `string \| null` | |
| `created_at` | `datetime` | |
| `updated_at` | `datetime` | |

---

### `OutcomeResponse`

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | |
| `application_id` | `string` | |
| `status` | `string \| null` | `"Offer"` · `"Rejected"` · `"Withdrawn"` |
| `salary` | `integer \| null` | Annual base |
| `salary_currency` | `string` | Default `"USD"` |
| `bonus` | `string \| null` | |
| `equity` | `string \| null` | |
| `benefits` | `string \| null` | |
| `start_date` | `string \| null` | `YYYY-MM-DD` |
| `deadline` | `string \| null` | `YYYY-MM-DD` — acceptance deadline |
| `negotiation_notes` | `string \| null` | |
| `notes` | `string \| null` | |
| `created_at` | `datetime` | |
| `updated_at` | `datetime` | |

---

### `ReflectionResponse`

| Field | Type |
|-------|------|
| `id` | `string` |
| `application_id` | `string` |
| `what_worked` | `string \| null` |
| `what_failed` | `string \| null` |
| `skill_gaps` | `object \| null` |
| `improvement_plan` | `string \| null` |
| `created_at` | `datetime` |
| `updated_at` | `datetime` |

---

### `ContactResponse`

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | |
| `user_id` | `string` | |
| `application_id` | `string \| null` | |
| `name` | `string` | |
| `email` | `string \| null` | |
| `phone` | `string \| null` | |
| `role_title` | `string \| null` | Contact's job title |
| `company` | `string \| null` | |
| `contact_type` | `string` | Default `"Other"` |
| `linkedin_url` | `string \| null` | |
| `notes` | `string \| null` | |
| `last_contacted` | `string \| null` | `YYYY-MM-DD` |
| `created_at` | `datetime` | |
| `updated_at` | `datetime` | |

---

### `DocumentResponse`

| Field | Type |
|-------|------|
| `id` | `string` |
| `application_id` | `string` |
| `doc_type` | `string` |
| `name` | `string` |
| `file_url` | `string \| null` |
| `notes` | `string \| null` |
| `created_at` | `datetime` |
| `updated_at` | `datetime` |

---

### `ReminderResponse`

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | |
| `user_id` | `string` | |
| `application_id` | `string \| null` | |
| `title` | `string` | |
| `description` | `string \| null` | |
| `remind_at` | `datetime` | ISO 8601 |
| `reminder_type` | `string` | Default `"General"` |
| `is_completed` | `boolean` | Default `false` |
| `completed_at` | `datetime \| null` | Set when marked complete |
| `created_at` | `datetime` | |
| `updated_at` | `datetime` | |

---

### `TagResponse`

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | |
| `user_id` | `string` | |
| `name` | `string` | |
| `color` | `string` | Hex code, default `"#6366f1"` |
| `created_at` | `datetime` | |

---

### `ApplicationTagResponse`

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | |
| `application_id` | `string` | |
| `tag_id` | `string` | |
| `created_at` | `datetime` | |
| `tag` | `TagResponse \| null` | Nested tag details |

---

### `SavedJobResponse`

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | |
| `user_id` | `string` | |
| `company_name` | `string` | |
| `role_title` | `string \| null` | |
| `url` | `string \| null` | |
| `company_website` | `string \| null` | |
| `location` | `string \| null` | |
| `job_type` | `string \| null` | |
| `work_mode` | `string \| null` | |
| `salary_range_min` | `integer \| null` | |
| `salary_range_max` | `integer \| null` | |
| `salary_currency` | `string` | Default `"USD"` |
| `priority` | `string` | Default `"Medium"` |
| `source` | `string \| null` | |
| `notes` | `string \| null` | |
| `deadline` | `string \| null` | `YYYY-MM-DD` |
| `excitement_level` | `integer \| null` | 1–5 |
| `status` | `string` | `Active` · `Archived` · `Converted` |
| `converted_to_application_id` | `string \| null` | Set on conversion |
| `created_at` | `datetime` | |
| `updated_at` | `datetime` | |

---

### `FollowResponse`

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | |
| `follower_id` | `string` | The user doing the following |
| `following_id` | `string` | The user being followed |
| `created_at` | `datetime` | |

---

### `FollowStats`

| Field | Type |
|-------|------|
| `followers_count` | `integer` |
| `following_count` | `integer` |

---

### `GroupResponse`

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | |
| `name` | `string` | |
| `description` | `string \| null` | |
| `created_by` | `string` | User ID of creator |
| `is_public` | `boolean` | |
| `member_count` | `integer` | |
| `created_at` | `datetime` | |
| `updated_at` | `datetime` | |

---

### `GroupMemberResponse`

| Field | Type |
|-------|------|
| `id` | `string` |
| `group_id` | `string` |
| `user_id` | `string` |
| `role` | `string` |
| `joined_at` | `datetime` |

---

### `PostResponse`

| Field | Type |
|-------|------|
| `id` | `string` |
| `user_id` | `string` |
| `group_id` | `string \| null` |
| `post_type` | `string` |
| `title` | `string \| null` |
| `content` | `string` |
| `is_public` | `boolean` |
| `reaction_count` | `integer` |
| `created_at` | `datetime` |
| `updated_at` | `datetime` |

---

### `ReactionResponse`

| Field | Type |
|-------|------|
| `id` | `string` |
| `post_id` | `string` |
| `user_id` | `string` |
| `reaction` | `string` |
| `created_at` | `datetime` |

---

### `MilestoneResponse`

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | |
| `name` | `string` | |
| `description` | `string \| null` | |
| `criteria` | `object` | Trigger criteria — backend-managed, informational only |
| `created_at` | `datetime` | |

---

### `UserMilestoneResponse`

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | |
| `user_id` | `string` | |
| `milestone_id` | `string` | |
| `reached_at` | `datetime` | When it was earned |
| `milestone` | `MilestoneResponse \| null` | Nested milestone details |

---

### `CommunityMemberEntry`

| Field | Type |
|-------|------|
| `user_id` | `string` |
| `username` | `string` |
| `display_name` | `string \| null` |
| `streak_days` | `integer` |

---

### `UserStatsResponse`

| Field | Type | Description |
|-------|------|-------------|
| `total_applications` | `integer` | |
| `total_offers` | `integer` | |
| `total_rejections` | `integer` | |
| `total_reflections` | `integer` | |
| `total_stages` | `integer` | Total interview rounds logged |
| `streak_days` | `integer` | |
| `milestones_reached` | `integer` | |
| `total_contacts` | `integer` | |
| `total_reminders_pending` | `integer` | Incomplete reminders |

---

### `AnalyticsDashboardResponse`

| Field | Type | Description |
|-------|------|-------------|
| `pipeline` | `array[PipelineBreakdown]` | Application count per status |
| `response_rate` | `float` | Fraction that received a response (Interviewing or further) |
| `interview_rate` | `float` | Fraction that reached at least one interview |
| `offer_rate` | `float` | Fraction that received an offer |
| `source_breakdown` | `array[SourceEffectiveness]` | Effectiveness per application source |
| `weekly_trend` | `array[WeeklyTrend]` | Activity over the last 12 ISO weeks |
| `salary_insights` | `SalaryInsight` | Aggregated salary data |
| `top_companies` | `array[{company: string, count: integer}]` | Top 10 companies by application count |

**`PipelineBreakdown`**

```json
{ "status": "Applied", "count": 14 }
```

**`SourceEffectiveness`**

```json
{ "source": "LinkedIn", "applied": 20, "interviews": 8, "offers": 2 }
```

**`WeeklyTrend`** — `week` is ISO week format, e.g. `"2026-W09"`

```json
{ "week": "2026-W09", "applications": 5, "stages": 2 }
```

**`SalaryInsight`**

```json
{
  "applications_with_salary": 12,
  "average_expected_min": 95000.0,
  "average_expected_max": 120000.0,
  "offers_with_salary": 3,
  "average_offered": 112000.0,
  "highest_offer": 130000,
  "currency": "USD"
}
```

---

### `ActivityLogResponse`

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | |
| `user_id` | `string` | |
| `application_id` | `string \| null` | |
| `action` | `string` | e.g. `"Application Created"` · `"Status Changed"` · `"Stage Added"` · `"Offer Added"` · `"Reflection Added"` |
| `description` | `string \| null` | Human-readable summary |
| `metadata` | `object \| null` | Extra context — e.g. `{"old_status": "Applied", "new_status": "Interviewing", "auto": true}` |
| `created_at` | `datetime` | |
