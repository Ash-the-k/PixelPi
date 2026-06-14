# PixelPi Technologies

# System Audit, Architecture Assessment & Modernization Plan

## Purpose

This document summarizes the technical audit and architectural assessment of the existing PixelPi Technologies platform.

The objective is to:

* Understand the current system architecture
* Preserve existing business functionality
* Identify modernization opportunities
* Guide future development decisions
* Provide onboarding context for future developers

---

# Project Context

PixelPi Technologies is a startup operating a custom-built web platform.

The current platform is already functional and contains both public-facing and internal administrative functionality.

I have been hired to redesign and modernize the platform while preserving all business-critical workflows.

## Constraints

* Existing functionality must continue working
* Current production data volume is minimal
* Architecture may be refactored or redesigned
* Business workflows must be preserved
* Hosting costs should remain startup-friendly

## Primary Goals

* Deliver a production-ready platform
* Improve maintainability
* Improve user experience
* Improve visual quality
* Maintain existing functionality

## Secondary Goals

* Improve architecture
* Improve scalability
* Improve developer experience
* Create a strong real-world portfolio project

---

# Current Repository Structure

```txt
pixelpitechnologies/
├── data/
│   ├── applications.json
│   ├── audit_logs.json
│   ├── blog_posts.json
│   ├── career_openings.json
│   ├── collaborations.json
│   ├── contacts.json
│   ├── gallery_metadata.json
│   └── newsletters.json
│
├── public/
│   ├── admin.html
│   ├── blog.html
│   ├── career.html
│   ├── index.html
│   ├── ads.txt
│   ├── humans.txt
│   ├── manifest.json
│   ├── robots.txt
│   ├── sitemap.xml
│   ├── images/
│   └── js/admin.js
│
├── scratch/
│   ├── diff_index.txt
│   ├── test_upload.js
│   └── verify_all.js
│
├── server/
│   ├── server.js
│   ├── middleware/auth.js
│   ├── package.json
│   └── generate-secrets.js
│
└── uploads/
    ├── gallery/
    └── resumes/
```

---

# Technology Stack

## Frontend

Current:

* HTML
* CSS
* Vanilla JavaScript

## Backend

Current:

* Node.js
* Express

## Database

Current:

* MySQL

Fallback:

* JSON file storage

## Authentication

* JWT
* Express Session

## Uploads

* Multer

## Email

* Nodemailer

## Security

* Helmet
* Rate Limiting
* JWT Authentication

## Logging

* Audit Logging

---

# Backend Assessment

## Core Backend

File:

```txt
server/server.js
```

Size:

```txt
2435 lines
```

Architecture:

```txt
Monolithic Express Application
```

Most business logic, routing, database handling, authentication, and administrative functionality currently exist inside a single server file.

Despite the monolithic structure, the platform contains substantial business functionality and several production-oriented features.

---

# Security Notes

Current strengths:

- JWT Authentication
- Rate Limiting
- Helmet
- Audit Logging
- Role-based Admin Access

Current concerns:

- Authentication recently migrated from Base64 password encoding to bcrypt hashing
- Express Session and JWT are currently used together and should be reviewed for simplification

---

# Authentication System

File:

```txt
server/middleware/auth.js
```

Contains:

### authenticateToken

Authorization Header
↓
JWT Verification
↓
req.user

### generateToken

Creates JWT tokens.

Expiration:

```txt
24 hours
```

### isAdmin

Checks:

```txt
req.user.role === "admin"
```

Authentication implementation is clean, modular, and reusable.

---

# Current Database Schema

## Core Tables

contact_submissions
newsletter_subscriptions
collaboration_inquiries
career_applications
email_logs

## Administration

admin_users
audit_logs
website_settings

## Content Management

blog_posts
career_openings

## Storage Strategy

Uploaded files are stored on disk:

uploads/gallery/
uploads/resumes/

Database stores metadata and file paths.

---

# Database Architecture

## Primary Storage

```txt
MySQL
```

## Fallback Storage

```txt
applications.json
contacts.json
newsletters.json
blog_posts.json
career_openings.json
gallery_metadata.json
audit_logs.json
collaborations.json
```

If MySQL becomes unavailable:

```txt
Express API
↓
JSON Storage
```

continues functioning.

This creates resilience against database outages and allows development without requiring a running MySQL instance.

---

# File Storage Architecture

The platform stores uploaded files directly on disk.

## Gallery Images

```txt
uploads/gallery/
```

## Applicant Resumes

```txt
uploads/resumes/
```

Metadata and business records are stored separately.

Examples:

### Applicant Record

```txt
resume_path = uploads/resumes/file.pdf
```

### Gallery Record

```txt
filename = image.jpg
title = ...
description = ...
```

This architecture is appropriate for the current scale of the platform and should be preserved unless future growth requires object storage solutions such as AWS S3 or Cloudflare R2.

---

# Existing Public Features

## Contact Form

Endpoint:

```http
POST /api/contact
```

Status:

```txt
Verified Working
```

Behavior:

* Stores inquiry
* Email notification expected but not yet verified

---

## Newsletter System

Endpoint:

```http
POST /api/newsletter
```

Status:

```txt
Verified Working
```

Behavior:

* Stores subscriber
* Sends email notification

---

## Collaboration System

Endpoint:

```http
POST /api/collaboration
```

Status:

```txt
Verified Working
```

Behavior:

* Stores inquiry
* Sends email notification

---

## Blog System

Endpoints:

```http
GET /api/blog
GET /api/blog/:slug
```

Status:

```txt
Verified Working
```

Features:

* Blog listing
* Blog detail pages
* Categories
* Search
* Reading time
* View tracking
* Metadata support

---

## Career System

Endpoints:

```http
GET /api/career-openings
POST /api/careers/apply
```

Features:

* Career listings
* Resume uploads
* Applicant tracking

Uses:

```txt
Multer
```

Known seeded openings:

* Embedded Systems Intern
* Application Developer Intern

---

## Gallery System

Endpoint:

```http
GET /api/gallery
```

Features:

* Public gallery
* Metadata support
* Dynamic image retrieval

---

# Existing Admin Features

## Authentication

Endpoints:

```http
POST /api/admin/login
POST /api/admin/logout
GET /api/admin/status
```

Status:

```txt
Verified Working
```

Returns:

* JWT
* User details
* Role information

---

## Dashboard

Endpoints:

```http
GET /api/admin/dashboard/stats
GET /api/admin/dashboard/overview
```

Status:

```txt
Verified Working
```

Tracks:

* Applications
* Contacts
* Subscribers
* Collaborations
* Blog posts
* Blog views

Includes:

* Activity feed
* Platform statistics

---

## Blog CMS

Endpoints:

```http
GET /api/admin/blog
GET /api/admin/blog/:id

POST /api/admin/blog

PUT /api/admin/blog/:id

DELETE /api/admin/blog/:id
```

Capabilities:

* Create posts
* Edit posts
* Delete posts
* Publish posts

---

## Applications Management

Endpoints:

```http
GET /api/admin/applications
GET /api/admin/applications/:id

PUT /api/admin/applications/:id/status
```

Capabilities:

* View applicants
* Review applications
* Update statuses

---

## Contact Management

Endpoints:

```http
GET /api/admin/contacts

PUT /api/admin/contacts/:id/status
```

---

## Newsletter Management

Endpoint:

```http
GET /api/admin/newsletters
```

---

## Collaboration Management

Endpoints:

```http
GET /api/admin/collaborations

PUT /api/admin/collaborations/:id/status
```

---

## Gallery Management

Endpoints:

```http
GET /api/admin/gallery

POST /api/admin/gallery/upload

PUT /api/admin/gallery/:filename

DELETE /api/admin/gallery/:filename
```

Capabilities:

* Upload images
* Edit metadata
* Delete images

Status:

```txt
Verified Working
```

Gallery workflow successfully verified end-to-end through automated integration testing.

---

## Career Openings Management

Endpoints:

```http
GET /api/admin/career-openings

POST /api/admin/career-openings

PUT /api/admin/career-openings/:id

DELETE /api/admin/career-openings/:id
```

---

## Audit Logging

Endpoint:

```http
GET /api/admin/audit-logs
```

Tracks:

* Blog creation
* Blog updates
* Contact submissions
* Administrative actions

---

## Analytics

Endpoint:

```http
GET /api/admin/analytics
```

Exists.

---

## Security

Endpoints:

```http
GET /api/admin/security

POST /api/admin/security/block-ip

POST /api/admin/security/unblock-ip
```

Exists.

---

## Settings

Endpoints:

```http
GET /api/admin/settings

PUT /api/admin/settings
```

Exists.

---

# Email System

Observed behavior:

When users submit:

* Contact requests
* Collaboration requests
* Other inquiries

The founder receives email notifications.

Implementation:

Nodemailer
+
Gmail SMTP/App Password

Configured through:

EMAIL_USER
EMAIL_PASS
ADMIN_EMAIL

This functionality should be preserved.

---

# Verification Tooling

The repository contains automated verification scripts.

This indicates deliberate testing and maintenance workflows.

## verify_all.js

Purpose:

Regression testing.

Verifies:

* Career API
* Homepage
* Blog page
* Career page
* Navigation consistency
* Footer consistency
* Branding consistency

Homepage sections discovered:

```txt
Services
Collaboration
Vision
Why Us
Gallery
Contact
```

---

## test_upload.js

Purpose:

End-to-end gallery integration testing.

Workflow:

Admin Login
↓
Image Upload
↓
Metadata Update
↓
Public Gallery Retrieval
↓
Image Deletion
↓
Deletion Verification

Result:

```txt
Verified Working
```

This confirms the gallery subsystem is fully functional.

---

# Architectural Assessment

Initial assumption:

```txt
Simple company website
```

Actual discovery:

```txt
Company Website
+
Blog CMS
+
Career Portal
+
Applicant Tracking System
+
Gallery CMS
+
Newsletter Management
+
Analytics Dashboard
+
Audit Logging
+
Admin Portal
```

This is a business platform rather than a traditional marketing website.

---

# Assessment of Existing Code Quality

## Strengths

* JWT Authentication
* Rate Limiting
* Audit Logging
* JSON Fallback Layer
* Gallery Metadata Management
* Automated Verification Scripts
* CMS Features
* File Upload Support
* Email Notification System
* Administrative Dashboard

## Weaknesses

* Monolithic server.js
* Limited separation of concerns
* Mixed route and business logic
* Harder long-term maintenance

## Conclusion

While the backend is architecturally monolithic, it demonstrates solid engineering fundamentals and contains several production-oriented features.

The platform should be treated as a functioning business system rather than a simple website.

---

# Recommended Future Architecture

## Frontend

> need to decide

Architecture:

```txt
Public Website
+
Admin Dashboard
```

implemented as separate frontend sections sharing a common backend.

---

## Backend

Recommendation:

Do not immediately rewrite.

Treat the existing backend as:

```txt
Working Reference Implementation
+
Business Requirements Source
```

---

# Database Recommendation

Keep:

```txt
MySQL
```

Do not migrate databases without a clear business requirement.

Potential future schema:

```txt
users
blog_posts
blog_categories
contacts
newsletter_subscribers
collaborations
career_openings
applications
gallery_items
audit_logs
settings
```

---

# Public/Admin Separation

Strong recommendation:

Treat as two products.

## Public Platform

Audience:

* Clients
* Partners
* Investors
* Applicants

Contains:

```txt
Home
About
Services
Projects
Gallery
Blog
Careers
Contact
```

---

## Admin Platform

Audience:

* PixelPi Team

Contains:

```txt
Dashboard
Blog CMS
Applications
Contacts
Subscribers
Collaborations
Gallery
Analytics
Settings
```

Both should share:

* Backend
* Database
* Authentication infrastructure

while maintaining separate user experiences.

---

# Deployment Recommendation

Recommended architecture:

```txt
Nginx
↓
React Frontend
↓
Express Backend
↓
MySQL
```

Single VPS.

Single backend.

Single database.

Admin hosted at:

```txt
/ admin
```

rather than requiring a separate deployment.

---

# Migration Strategy

Phase 1

- Build React frontend
- Preserve existing backend
- Preserve existing database

Phase 2

- Introduce API abstraction layer
- Modularize backend

Phase 3

- Improve database structure where required
- Improve deployment pipeline

Phase 4

- Optional admin subdomain deployment

admin.pixelpitechnologies.in

---

# Open Questions For Founder

## Business

- What features are currently used most frequently?
- What pain points exist in the current platform?
- What new functionality is expected in the redesign?
- What future roadmap exists for the company website?

## Technical

- Current hosting provider?
- Current VPS specifications?
- Production deployment workflow?
- MySQL access or database dump available?

---

# Strategic Recommendation

Do not treat this project as:

```txt
Website Redesign
```

Treat it as:

```txt
Business Platform Modernization
```

The platform already contains:

* CMS
* Applicant Tracking
* Analytics
* Media Management
* Audit Logging
* Administration Tools

The redesign should preserve those capabilities while improving:

* Architecture
* Maintainability
* User Experience
* Visual Quality
* Scalability

The existing backend should be treated as a valuable reference architecture and business requirements source rather than being discarded without careful evaluation.

---

## Email Notification System Investigation

### Current State

The backend contains email infrastructure using:

* Nodemailer
* Gmail SMTP
* EMAIL_USER
* EMAIL_PASS
* ADMIN_EMAIL

The transporter is successfully initialized and verified at startup.

Example:

```js
nodemailer.createTransport(...)
transporter.verify(...)
```

### Discovery

During code audit, no actual email sending implementation was found.

Specifically, no usage of:

```js
transporter.sendMail(...)
```

was discovered in:

* server.js
* auth.js
* admin.js

Additionally, the database contains an:

```txt
email_logs
```

table, but no confirmed implementation currently writes to it.

### Impact

Forms currently return success responses:

* Contact Form
* Newsletter
* Collaboration Form

However, it has not been confirmed that email notifications are actually being sent.

Responses may indicate successful form processing rather than successful email delivery.

### Action Required

Verify with founder:

1. Are email notifications currently being received?
2. Which forms are expected to send emails?
3. Which email address receives notifications?
4. Has email functionality ever worked in production?
5. Is there any external service or script handling notifications?

### Recommendation

If email notifications are not currently functional:

* Implement a centralized sendEmail() helper
* Add email delivery logging
* Log failures to email_logs
* Send notifications for:

  * Contact Submissions
  * Collaboration Requests
  * Career Applications
* Optionally send confirmation emails to users


# Final Verdict

The existing platform is not a simple company website.

It is a functioning business platform that includes:

- CMS
- Career Portal
- Applicant Tracking
- Gallery Management
- Analytics
- Security Monitoring
- Audit Logging
- Administrative Operations

The backend architecture is monolithic but functional.

The recommended modernization strategy is:

1. Preserve existing backend behavior.
2. Build a modern frontend.
3. Modularize backend incrementally.
4. Avoid full rewrites until business workflows are fully understood.