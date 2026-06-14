# PixelPi Technologies

# api-reference.md

## Purpose

This document serves as the primary API reference for frontend and backend development.

For each endpoint it documents:

* Purpose
* Authentication requirements
* Request format
* Response format
* Storage layer
* Frontend usage
* Verification status

---

# Base URLs

## Development

```txt
http://localhost:3000
```

## Production

```txt
https://pixelpitechnologies.in
```

---

# Authentication

Admin APIs require JWT authentication.

Header:

```http
Authorization: Bearer <token>
```

JWT obtained through:

```http
POST /api/admin/login
```

---

# Verification Levels

| Status | Meaning |
|----------|----------|
| **Verified** | Personally tested and confirmed working. |
| **Partially Verified** | Implementation confirmed through code review, but not fully tested end-to-end. |
| **Discovered** | Endpoint or functionality exists in code, but behavior has not been fully validated. |

---

# PUBLIC APIS

---

## Health Check

### GET /api/health

### Purpose

Check application health and database connectivity.

### Auth

No

### Response

```json
{
  "status": "OK",
  "database": "connected"
}
```

### Verification

Verified

---

## Contact Form

### POST /api/contact

### Purpose

Submit a website contact inquiry.

### Auth

No

### Request

```json
{
  "name": "Ash",
  "email": "ash@example.com",
  "subject": "Project Inquiry",
  "message": "Hello"
}
```

### Response

```json
{
  "success": true,
  "message": "Message sent successfully! We will get back to you soon."
}
```

### Storage

```txt
contact_submissions
```

### Side Effects

* Stores inquiry
* Email notification behavior requires verification

### Frontend Usage

Home Page → Contact Section

### Verification

Verified

---

## Newsletter Subscription

### POST /api/newsletter

### Purpose

Subscribe user to newsletter.

### Auth

No

### Request

```json
{
  "email": "ash@example.com"
}
```

### Response

```json
{
  "success": true,
  "message": "Successfully subscribed to our newsletter!"
}
```

### Storage

```txt
newsletter_subscriptions
```

### Frontend Usage

Newsletter Section

### Verification

Verified

---

## Collaboration Inquiry

### POST /api/collaboration

### Purpose

Submit partnership request.

### Auth

No

### Request

```json
{
  "name": "Ash",
  "email": "ash@example.com",
  "organization": "PixelPi",
  "message": "Interested in collaboration"
}
```

### Response

```json
{
  "success": true,
  "message": "Collaboration inquiry submitted! Our team will review and contact you."
}
```

### Storage

```txt
collaboration_inquiries
```

### Side Effects

* Stores inquiry
* Email notification behavior requires verification

### Frontend Usage

Collaboration Section

### Verification

Verified

---

## Blog Listing

### GET /api/blog

### Purpose

Retrieve published blog posts.

### Auth

No

### Response

```json
{
  "success": true,
  "data": {
    "posts": [],
    "categories": [],
    "pagination": {}
  }
}
```

### Storage

```txt
blog_posts
```

### Frontend Usage

Blog Listing Page

### Verification

Verified

---

## Blog Detail

### GET /api/blog/:slug

### Purpose

Retrieve a single blog post.

### Auth

No

### Example

```http
GET /api/blog/space-tech-iot-breakthrough
```

### Storage

```txt
blog_posts
```

### Frontend Usage

Blog Detail Page

### Verification

Discovered

---

## Career Openings

### GET /api/career-openings

### Purpose

Retrieve active job openings.

### Auth

No

### Storage

```txt
career_openings
```

### Seeded Jobs

* Embedded Systems Intern
* Application Developer Intern

### Frontend Usage

Career Page

### Verification

Verified

---

## Career Application

### POST /api/careers/apply

### Purpose

Submit internship/job application.

### Auth

No

### Content Type

```txt
multipart/form-data
```

### Fields

```txt
name
email
phone

position

education
university

skills
experience

portfolio
message

resume
```

### Resume Upload

Location:

```txt
uploads/resumes/
```

### Allowed File Types

```txt
PDF
DOC
DOCX
PNG
JPG
JPEG
```

### Maximum Size

```txt
5 MB
```

### Storage

```txt
career_applications
```

### Frontend Usage

Career Application Form

### Verification

Partially Verified

Frontend and backend implementation confirmed.
End-to-end submission not yet manually tested.

---

## Gallery

### GET /api/gallery

### Purpose

Retrieve gallery assets.

### Auth

No

### Storage

Files:

```txt
uploads/gallery/
```

Metadata:

```txt
gallery_metadata.json
```

### Frontend Usage

Gallery Section

### Verification

Verified

---

# STATIC FILE ACCESS

---

## Gallery Images

### GET /uploads/gallery/:filename

### Purpose

Serve uploaded gallery images.

### Auth

No

### Verification

Verified

---

## Resume Files

### GET /uploads/resumes/:filename

### Purpose

Serve uploaded resumes.

### Auth

Protected through admin workflows.

### Verification

Discovered

---

# ADMIN APIS

All endpoints below require:

```http
Authorization: Bearer <token>
```

and:

```txt
Admin Role
```

---

# Authentication

---

## POST /api/admin/login

### Purpose

Authenticate administrator.

### Auth

No

### Request

```json
{
  "username": "Admin",
  "password": "******"
}
```

### Response

```json
{
  "success": true,
  "token": "...",
  "user": {}
}
```

### Storage

```txt
admin_users
```

### Verification

Verified

---

## POST /api/admin/logout

### Purpose

Logout admin session.

### Verification

Discovered

---

## GET /api/admin/status

### Purpose

Validate current session.

### Verification

Discovered

---

# Dashboard

---

## GET /api/admin/dashboard/stats

### Purpose

Retrieve dashboard metrics.

### Verification

Discovered

---

## GET /api/admin/dashboard/overview

### Purpose

Retrieve overview data and activity feed.

### Returns

* Applications
* Contacts
* Subscribers
* Collaborations
* Blog Stats
* Recent Activity

### Verification

Verified

---

# Blog CMS

---

## GET /api/admin/blog

Retrieve all blog posts.

Verified.

---

## GET /api/admin/blog/:id

Retrieve specific blog post.

Discovered.

---

## POST /api/admin/blog

Create blog post.

Storage:

```txt
blog_posts
```

Discovered.

---

## PUT /api/admin/blog/:id

Update blog post.

Verified through audit logs.

---

## DELETE /api/admin/blog/:id

Delete blog post.

Discovered.

---

# Applications

---

## GET /api/admin/applications

Retrieve career applications.

### Storage

```txt
career_applications
```

### Verification

Verified

---

## GET /api/admin/applications/:id

Retrieve application details.

Verification: Discovered

---

## PUT /api/admin/applications/:id/status

Update application status.

Possible statuses:

```txt
new
reviewing
shortlisted
rejected
hired
```

Verification: Discovered

---

# Contacts

---

## GET /api/admin/contacts

Retrieve contact submissions.

Verification: Verified

---

## PUT /api/admin/contacts/:id/status

Update contact status.

Verification: Discovered

---

# Newsletters

---

## GET /api/admin/newsletters

Retrieve subscribers.

Verification: Verified

---

# Collaborations

---

## GET /api/admin/collaborations

Retrieve collaboration requests.

Verification: Verified

---

## PUT /api/admin/collaborations/:id/status

Update collaboration status.

Verification: Discovered

---

# Gallery Management

---

## GET /api/admin/gallery

Retrieve gallery assets.

Verification: Verified

---

## POST /api/admin/gallery/upload

Upload gallery image.

### Content Type

```txt
multipart/form-data
```

### Storage

```txt
uploads/gallery/
```

### Metadata

```txt
gallery_metadata.json
```

### Verification

Fully Verified

Integration tested using:

```txt
scratch/test_upload.js
```

---

## PUT /api/admin/gallery/:filename

Update image metadata.

### Request

```json
{
  "title": "Aerospace Core Module",
  "desc": "Description"
}
```

### Verification

Fully Verified

---

## DELETE /api/admin/gallery/:filename

Delete gallery image.

### Verification

Fully Verified

---

# Career Openings CMS

---

## GET /api/admin/career-openings

Retrieve openings.

Verified.

---

## POST /api/admin/career-openings

Create opening.

Discovered.

---

## PUT /api/admin/career-openings/:id

Update opening.

Discovered.

---

## DELETE /api/admin/career-openings/:id

Delete opening.

Discovered.

---

# Audit Logs

---

## GET /api/admin/audit-logs

### Purpose

Retrieve audit history.

### Storage

```txt
audit_logs
```

### Verification

Discovered

---

# Analytics

---

## GET /api/admin/analytics

### Purpose

Retrieve analytics data.

### Metrics

* Views
* Visitors
* Traffic Sources
* Browsers
* Hourly Traffic

### Verification

Discovered

---

# Security

---

## GET /api/admin/security

### Purpose

Retrieve security dashboard information.

### Returns

* Security Score
* Threat Log
* Blocked IPs
* Failed Logins
* SSL Status

### Verification

Verified

---

## POST /api/admin/security/block-ip

### Purpose

Manually block an IP address.

### Request

```json
{
  "ip": "192.168.1.100"
}
```

### Current Implementation

```txt
blockedIPs.add(ip)
```

Stored in memory only.

### Persistence

```txt
No
```

Blocked IPs are lost after server restart.

### Verification

Verified

---

## POST /api/admin/security/unblock-ip

### Purpose

Remove blocked IP.

### Request

```json
{
  "ip": "192.168.1.100"
}
```

### Current Implementation

```txt
blockedIPs.delete(ip)
```

### Verification

Verified

---

# Settings

---

## GET /api/admin/settings

Retrieve platform settings.

Discovered.

---

## PUT /api/admin/settings

Update platform settings.

Discovered.

---

# Developer Notes

## Verified Systems

✓ Authentication
✓ Contact Form
✓ Newsletter
✓ Collaboration
✓ Blog Listing
✓ Gallery System
✓ Gallery Uploads
✓ Gallery Metadata
✓ Dashboard
✓ Applications
✓ Contacts
✓ Collaborations
✓ Subscribers

---

## Known Technical Debt

1. Monolithic `server.js` (~2435 lines)
2. Blocked IPs are stored in memory only
3. Public and admin frontend are tightly coupled
4. JSON fallback duplicates database logic

---

