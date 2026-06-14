# PixelPi Technologies

# database-notes.md

## Purpose

This document describes the current data architecture of the PixelPi Technologies platform.

It serves as:

* Database reference
* Storage reference
* Migration planning document
* Future schema redesign guide

---

# Database Overview

Current primary database:

```txt
MySQL
```

Fallback storage:

```txt
JSON Files
```

The backend is capable of operating in two modes:

```txt
Normal Mode
MySQL
↓
Application
```

and

```txt
Fallback Mode
JSON Storage
↓
Application
```

This appears intended to allow development and limited fallback operation when MySQL is unavailable.

---

# Data Storage Strategy

The platform uses three storage layers:

```txt
MySQL
↓
Business Data
```

```txt
JSON Files
↓
Fallback Data Storage
```

```txt
Filesystem
↓
Uploaded Assets
```

---

# Current Database Tables

## Core Business Tables

### contact_submissions

Stores contact form inquiries submitted through the website.

Purpose:

```txt
Lead Generation
Customer Enquiries
Business Enquiries
```

Expected fields:

```txt
id
name
email
subject
message
status
created_at
```

---

### newsletter_subscriptions

Stores newsletter subscribers.

Purpose:

```txt
Marketing
Announcements
Subscriber Tracking
```

Expected fields:

```txt
id
email
status
subscribed_at
```

---

### collaboration_inquiries

Stores partnership and collaboration requests.

Purpose:

```txt
Business Partnerships
Strategic Collaborations
Vendor Requests
```

Expected fields:

```txt
id
name
email
organization
message
status
created_at
```

---

### career_applications

Stores job applications submitted through the careers portal.

Purpose:

```txt
Applicant Tracking
Recruitment
Resume Management
```

Known fields:

```txt
id
application_id

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

resume_filename
resume_path

status

created_at
updated_at
```

---

### email_logs

Stores email delivery history.

Purpose:

```txt
Email Tracking
Delivery Auditing
Notification Monitoring
```

Expected fields:

```txt
id
recipient
subject
status
sent_at
```

---

# Administration Tables

## admin_users

Stores administrative accounts.

Purpose:

```txt
Admin Authentication
Role Management
```

Expected fields:

```txt
id
username
password
email
role
created_at
```

Current Observation:

Authentication appears to have been migrated from Base64 password encoding to bcrypt hashing.

Verification of all administrative account records has not yet been completed.

---

## audit_logs

Stores administrative activity.

Purpose:

```txt
Auditing
Accountability
Change Tracking
```

Examples:

```txt
Blog Creation
Blog Update
Application Review
Contact Submission
Admin Login
```

Expected fields:

```txt
id
user_id
username

action

resource
resource_id

details

ip_address

created_at
```

---

## website_settings

Stores platform configuration.

Purpose:

```txt
Dynamic Settings
Admin Configuration
```

Possible examples:

```txt
Website Title
Contact Information
Feature Toggles
```

---

# Content Management Tables

## blog_posts

Primary CMS table.

Purpose:

```txt
Blog Management
SEO Content
Marketing Content
```

Known fields:

```txt
id

title
slug

excerpt
content

cover_image

category
tags

author

status

views
reading_time

meta_title
meta_description

published_at

created_at
updated_at
```

---

## career_openings

Stores active job openings.

Purpose:

```txt
Recruitment
Career Listings
```

Known seeded entries:

```txt
Embedded Systems Intern
Application Developer Intern
```

Expected fields:

```txt
id

title
department

type

location

description

requirements

status

created_at
updated_at
```

---

# File Storage Architecture

The platform stores uploaded files directly on the server filesystem.

---

## Gallery Storage

Location:

```txt
uploads/gallery/
```

Purpose:

```txt
Website Gallery
Project Images
Marketing Assets
```

Current examples:

```txt
Auto.jpg
Cost.jpg
Cubic.jpg
Industrial.jpg
Smart.jpg
```

---

## Resume Storage

Location:

```txt
uploads/resumes/
```

Purpose:

```txt
Applicant Resume Storage
```

Example:

```txt
1768149733636-285681568_resume.pdf
```

---

# Gallery Metadata System

Images are not represented solely by their filenames.

Additional metadata is stored separately.

Example:

```txt
filename
title
description
```

Public API merges:

```txt
Physical Image
+
Metadata
↓
Gallery Response
```

This system was verified through integration testing.

---

# JSON Fallback Architecture

Current fallback files:

```txt
applications.json
audit_logs.json
blog_posts.json
career_openings.json
collaborations.json
contacts.json
gallery_metadata.json
newsletters.json
```

Purpose:

```txt
Development Convenience
Database Outage Protection
Emergency Recovery
```

These files mirror the primary MySQL data model.

---

# Data Relationships

## Career Applications

```txt
career_openings
        ↓
career_applications
```

One opening can have many applications.

---

## Admin Activity

```txt
admin_users
        ↓
audit_logs
```

One admin can generate many audit entries.

---

## Blog System

```txt
blog_posts
```

Currently standalone.

Future improvement:

```txt
blog_categories
blog_tags
```

---

# Current Data Flow

## Contact Form

```txt
User
↓
Contact Form
↓
API
↓
contact_submissions
↓
Potential Email Notification
```

---

## Collaboration Form

```txt
User
↓
Collaboration Form
↓
API
↓
collaboration_inquiries
↓
Potential Email Notification
```

---

## Career Application

```txt
Applicant
↓
Resume Upload
↓
uploads/resumes
↓
career_applications
↓
Potential Email Notification
```

---

## Blog CMS

```txt
Admin
↓
Blog CMS
↓
blog_posts
↓
Public Blog
```

---

## Gallery CMS

```txt
Admin
↓
Image Upload
↓
uploads/gallery
↓
Metadata Storage
↓
Public Gallery API
```

---

# Future Schema Improvements

## Potential Tables

### users

For future user accounts.

---

### blog_categories

Separate category management.

---

### blog_tags

Tag normalization.

---

### media_library

Unified media management.

Would replace:

```txt
gallery files
blog images
misc uploads
```

with a centralized media system.

---

### notifications

Centralized notification tracking.

---

# Migration Recommendations

## Keep

```txt
MySQL
Filesystem Uploads
```

Both are appropriate for the current scale.

---

## Preserve

```txt
Blog CMS
Career Applications
Gallery Metadata
Audit Logs
```

These are valuable platform features.

---

## Avoid Premature Complexity

Do not introduce:

```txt
Microservices
Kubernetes
Event Buses
Multiple Databases
```

without a clear business requirement.

---

# Long-Term Recommendation

The current schema is sufficient for the startup's current scale.

Focus should be placed on:

```txt
Frontend Modernization
Backend Modularization
Developer Experience
Administrative Usability
```

before major database redesign efforts.

The database should evolve gradually rather than being rebuilt from scratch.
