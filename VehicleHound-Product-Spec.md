# VehicleHound — Product Specification

> This document describes the complete functional specification for VehicleHound, a multi-tenant SaaS platform for automotive dealership inventory management. It covers all pages, features, user flows, data models, and integrations — without prescribing any specific technology stack, design system, or visual language.

---

## Table of Contents

1. [Platform Overview](#1-platform-overview)
2. [User Roles & Permissions](#2-user-roles--permissions)
3. [Data Model](#3-data-model)
4. [Public Pages (Unauthenticated)](#4-public-pages-unauthenticated)
5. [Authentication & Onboarding Flows](#5-authentication--onboarding-flows)
6. [Portal — Dashboard](#6-portal--dashboard)
7. [Portal — Inventory Management](#7-portal--inventory-management)
8. [Portal — New Vehicle Wizard](#8-portal--new-vehicle-wizard)
9. [Portal — Import & Export](#9-portal--import--export)
10. [Portal — Reports & Insights](#10-portal--reports--insights)
11. [Portal — Credit Applications](#11-portal--credit-applications)
12. [Portal — Integrations Hub](#12-portal--integrations-hub)
13. [Portal — Webflow Integration](#13-portal--webflow-integration)
14. [Portal — Embeddable Widget System](#14-portal--embeddable-widget-system)
15. [Portal — Billing & Subscriptions](#15-portal--billing--subscriptions)
16. [Portal — Account Settings](#16-portal--account-settings)
17. [Portal — Dealership Settings](#17-portal--dealership-settings)
18. [Portal — User Management](#18-portal--user-management)
19. [Public Storefront](#19-public-storefront)
20. [Super Admin Panel](#20-super-admin-panel)
21. [AI-Powered Features](#21-ai-powered-features)
22. [API Layer](#22-api-layer)
23. [Notifications & Emails](#23-notifications--emails)
24. [Background Jobs & Scheduled Tasks](#24-background-jobs--scheduled-tasks)
25. [Navigation Structure](#25-navigation-structure)

---

## 1. Platform Overview

VehicleHound is a multi-tenant SaaS platform that enables automotive dealerships to:

- Manage their vehicle inventory (for-sale and lease vehicles)
- Publish inventory to their own website via embeddable widgets or Webflow CMS sync
- Receive and manage credit applications from prospective buyers
- Access AI-powered market insights, pricing analysis, and reports
- Manage their team with role-based access
- Subscribe to tiered plans with feature gating

Each dealership operates in complete isolation — users can only see and manage data belonging to their own dealership. A Super Admin layer provides system-wide management capabilities.

---

## 2. User Roles & Permissions

### System-Level Roles

| Role | Description |
|------|-------------|
| **Super Admin** | Full system access. Manages all dealerships, all users, all data. |
| **Admin** | Primary dealership user. Created during signup. Assigned to exactly one dealership. |
| **User** | Standard dealership user. Invited by an admin/owner. |

### Dealership-Level Roles

Within each dealership, users have a secondary role:

| Role | Capabilities |
|------|-------------|
| **Owner** | Full dealership control. Can invite/remove users, change roles, manage settings. One per dealership. |
| **Manager** | Can manage users, full inventory access. |
| **User** | Standard inventory access, limited admin features. |

### Permission Rules

- Every authenticated route enforces **dealership isolation** — a user can never access another dealership's vehicles, settings, or data.
- **Owner-only actions**: invite users, remove users, change user roles, resend/cancel invitations, update dealership settings.
- **Feature gating**: Certain features are restricted based on subscription plan (Starter, Professional, Enterprise).
- **User limits**: Each dealership has a configurable max user count (default: 4).

---

## 3. Data Model

### Core Entities

#### Dealership (Tenant)
The top-level organizational unit. All data is scoped to a dealership.

| Field | Description |
|-------|-------------|
| Name/Label | Dealership display name |
| Slug | URL-friendly identifier (used for storefront URLs) |
| Address, City, State, Zip | Physical location |
| Phone Number | Contact phone |
| Website | Dealership website URL |
| Logo | Uploaded dealership logo |
| Storefront Enabled | Whether the public storefront is active |
| Credit App Emails | Array of email addresses to receive credit application notifications |
| Max Users | User seat limit |
| Active Users Count | Current active user count |
| Subscription Status | Current billing status |
| Is Free Account | Whether this is a comp/free account |
| Trial Ends At | Trial expiration timestamp |

#### Vehicle (Car)
The primary inventory item.

| Field | Description |
|-------|-------------|
| Inventory Type | `sale` or `lease` |
| Stock Number | Dealer-assigned stock ID |
| VIN | 17-character Vehicle Identification Number |
| Year, Make, Model | Core vehicle identity |
| Trim / Trim Level / Series | Vehicle configuration |
| Vehicle Type | Body style category |
| Body Class | Specific body classification |
| Doors | Number of doors |
| Mileage | Odometer reading |
| **Pricing (Sale)** | |
| Online Price | Listed asking price |
| Sale Price | Final sale price |
| Purchase Price | Dealer acquisition cost |
| MSRP | Manufacturer's suggested retail price |
| **Pricing (Lease)** | |
| Lease Payment | Monthly lease payment |
| Lease Term | Lease duration in months |
| Lease Spec | Additional lease details |
| Broker Fee | Broker fee amount |
| **Specifications** | |
| Engine HP | Horsepower |
| Engine Cylinders | Number of cylinders |
| Engine Displacement | Engine size |
| Fuel Type | Gas, diesel, electric, hybrid, etc. |
| Transmission Style | Automatic, manual, CVT, etc. |
| Drive Type | FWD, RWD, AWD, 4WD |
| Exterior Color | Selected from color palette |
| Interior Color | Selected from color palette |
| **Content** | |
| Features | JSON array of vehicle features/options |
| Description | Free-text vehicle description |
| Title Status | Clean, salvage, rebuilt, etc. |
| **Status** | |
| Status | `For Sale` (1), `Sold` (0), `Coming Soon` (2), `Dream Build` (3) |
| Sold At | Timestamp when marked as sold |
| **Market Data** | |
| Market Value Data | JSON blob of market pricing analysis |
| Market Value Updated At | Last market data refresh |
| Insights | AI-generated insights JSON |
| Insights Generated At | Last AI insights generation |
| **Integration** | |
| Webflow Item ID | Linked Webflow CMS item ID |
| Last Webflow Sync | Timestamp of most recent Webflow sync |
| Location Detail | Physical location description |
| Preview Image | Designated primary/cover image |

#### Vehicle Image
| Field | Description |
|-------|-------------|
| Vehicle Reference | Parent vehicle |
| File Path | Image storage path |
| Display Order | Sort position for gallery display |

#### Vehicle Options & Option Groups
Dealerships can define custom option groups (e.g., "Safety Features", "Interior Packages") with individual options. Options are linked to vehicles via a many-to-many relationship.

| Entity | Fields |
|--------|--------|
| Option Group | Label, Dealership reference |
| Option | Label, Group reference |
| Option Extra | Additional metadata per option |
| Vehicle-Option Link | Vehicle reference, Option reference |

#### Color
Shared reference table for interior/exterior colors.

| Field | Description |
|-------|-------------|
| Label | Display name (e.g., "Midnight Blue") |
| Hex | Hex color value |

#### Vehicle Draft
Temporary storage for in-progress vehicle creation (multi-step wizard).

| Field | Description |
|-------|-------------|
| Dealership | Owner dealership |
| Current Step | Which wizard step the user is on (1-4) |
| Form Data | JSON blob of all collected data so far |
| Step Completion | Which steps have been completed |

---

### User & Team Entities

#### User
| Field | Description |
|-------|-------------|
| Name | Display name |
| Email | Login email |
| Pending Email | Email pending verification (during email change) |
| Password | Hashed credential |
| System Role | `sa`, `a`, or `user` |
| Dealership Role | `owner`, `manager`, or `user` |
| Dealership Reference | Which dealership this user belongs to |
| Invited By | The user who invited this person |
| Joined At | When they accepted their invitation |
| Last Activity At | Most recent action timestamp |

#### User Invitation
| Field | Description |
|-------|-------------|
| Dealership | Target dealership |
| Email | Invitee email address |
| Token | Unique acceptance token |
| Invited By | Inviting user |
| Expires At | Token expiration |
| Accepted At | When the invitation was accepted (null if pending) |
| Failed Attempts | Number of failed acceptance attempts |

#### Dealership Audit Log
Tracks all significant actions within a dealership.

| Field | Description |
|-------|-------------|
| Dealership | Which dealership |
| User | Who performed the action |
| Action | Type: `user_invited`, `user_removed`, `user_role_changed`, `invitation_resent`, `invitation_cancelled`, `user_joined`, `dealership_updated`, etc. |
| Target User | The user affected (if applicable) |
| Details | JSON with contextual information |
| IP Address | Requester IP |
| User Agent | Browser/client info |

---

### Credit Application

| Field | Description |
|-------|-------------|
| Dealership | Receiving dealership |
| Vehicle | Optional — specific vehicle of interest |
| **Applicant Info** | |
| First Name, Last Name | |
| Email, Phone | |
| Address, City, State, Zip | |
| Residential Status | Rent, own, etc. |
| Monthly Payment | Housing payment |
| **Employment Info** | |
| Employer | Company name |
| Occupation | Job title |
| Employment Status | Full-time, part-time, self-employed, etc. |
| Monthly Income | |
| **Co-Applicant** | |
| Has Co-Applicant | Boolean |
| Co-First Name, Co-Last Name | |
| **Business Application** | |
| Is Business Application | Boolean |
| Business Name | |
| **Status** | |
| Status | `new`, `reviewed`, `approved`, `denied` |
| IP Address | Submission source IP |

> **Important**: SSN is collected on the form but NEVER stored in the database. It is only included in the PDF that is emailed to the dealership.

---

### Market Data Entities

#### Vehicle Market Data (Snapshot)
Per-vehicle market analysis snapshots taken over time.

| Field | Description |
|-------|-------------|
| Vehicle | Reference to the vehicle |
| Snapshot Date | When this data was captured |
| User Lease Payment / Term / Driveoff | Dealer's current lease terms |
| Market Lease Payment / Term / Driveoff | Average market lease terms |
| Pricing Position | `significantly_overpriced`, `slightly_overpriced`, `competitively_priced`, `slightly_underpriced`, `significantly_underpriced` |
| Region | Geographic market |
| Similar Listings Count | Number of comparable listings found |
| Market Analysis | JSON with detailed analysis |

#### Market Pricing Reference
Aggregated reference data for pricing benchmarks.

| Field | Description |
|-------|-------------|
| Make, Model, Trim, Year | Vehicle identity |
| Region | Geographic market |
| Average Price, Median Price | Central tendency |
| Min Price, Max Price | Range |
| Listing Count | Sample size |
| Scraped Date | Data collection date |

#### Report Insights Cache
Cached AI-generated report insights for performance.

| Field | Description |
|-------|-------------|
| Dealership | Owner dealership |
| Report Type | Which report (inventory, profitability, etc.) |
| Inventory Type | sale or lease |
| Insights | JSON with AI-generated insights |
| Data Snapshot | JSON with the data used to generate insights |
| Generated At | When insights were created |

---

### Integration Entities

#### Webflow Connection
| Field | Description |
|-------|-------------|
| Dealership | Owner dealership |
| API Token | Encrypted Webflow API token |
| Site ID | Target Webflow site |
| Collection ID | Target Webflow CMS collection |
| Enabled | Whether sync is active |
| Last Full Sync | Most recent complete sync timestamp |

#### Webflow Field Mapping
| Field | Description |
|-------|-------------|
| Connection | Parent Webflow connection |
| VH Field | VehicleHound data field name |
| Webflow Field | Corresponding Webflow CMS field |
| Data Type | Type conversion info |
| Is Required | Whether this mapping is required |
| Default Value | Fallback value if VH field is empty |

#### Webflow Sync Log
| Field | Description |
|-------|-------------|
| Connection | Parent connection |
| Vehicle | Which vehicle was synced |
| Webflow Item ID | The Webflow CMS item ID |
| Status | Success, failed, etc. |
| Error Message | Details if sync failed |
| Synced At | Timestamp |

#### Widget Config
| Field | Description |
|-------|-------------|
| ID | UUID |
| Dealership | Owner dealership |
| Widget Type | `grid`, `search`, or `details` |
| Name | Widget display name |
| Config | JSON with widget settings (display options, filters, behavior) |
| Allowed Domains | JSON array of authorized embed domains |
| API Key | Unique key for widget API authentication |
| Status | `active`, `paused`, or `deleted` |

#### Widget Domain
| Field | Description |
|-------|-------------|
| Widget | Parent widget |
| Domain | The verified domain |
| Verified | Whether verification succeeded |
| Verification Token | Token for meta tag or DNS verification |
| Verification Method | `meta`, `dns`, or `auto` |
| Verified At | When verification completed |

#### Widget Analytics
Tracks widget usage events (impressions, clicks, etc.).

---

### Subscription & Billing Entities

#### Subscription Plan
| Field | Description |
|-------|-------------|
| Name | Plan display name |
| Slug | URL identifier |
| Description | Plan description |
| Monthly Price | Price in cents |
| Yearly Price | Annual price in cents |
| Max Vehicles | Vehicle inventory limit |
| Max Users | Team member limit |
| Features | JSON array of included feature flags |
| Is Active | Whether this plan is available for new signups |
| Sort Order | Display ordering |

**Plans:**
- **Starter** — Entry-level plan
- **Professional** — Mid-tier plan with more features
- **Enterprise** — Full-featured plan

Each plan supports monthly and yearly billing intervals.

#### Dealership Subscription
| Field | Description |
|-------|-------------|
| Dealership | Subscriber |
| Plan | Which plan |
| Payment Provider Customer ID | External customer reference |
| Payment Provider Subscription ID | External subscription reference |
| Status | `trialing`, `active`, `past_due`, `canceled`, `unpaid`, `incomplete`, `incomplete_expired` |
| Current Period Start/End | Billing cycle bounds |
| Trial Ends At | Trial expiration |
| Canceled At | Cancellation timestamp |
| Grace Period Ends At | Access cutoff after cancellation |

#### Payment History
| Field | Description |
|-------|-------------|
| Dealership | Payer |
| Payment Provider Payment ID | External payment reference |
| Payment Provider Invoice ID | External invoice reference |
| Amount | In cents |
| Currency | e.g., USD |
| Status | `succeeded`, `failed`, `pending`, `refunded` |
| Description | What was paid for |
| Failure Reason | Error details if failed |
| Paid At | Payment timestamp |

#### Feature Flag
| Field | Description |
|-------|-------------|
| Name | Feature identifier |
| Description | What the feature does |
| Required Plans | Array of plan slugs that include this feature |
| Is Active | Global on/off toggle |

---

### Other Entities

#### API Token
Personal API tokens for programmatic access to the VehicleHound API.

| Field | Description |
|-------|-------------|
| User / Dealership | Owner |
| Token Hash | Hashed token value |
| Abilities | Array of granted abilities (`inventory:read`, `inventory:write`, `reports:read`, `admin`, `*`) |
| Last Used At | Most recent usage |

#### Source Account & Plugin
Used for external data source integrations (vAuto, GWG, etc.).

| Field | Description |
|-------|-------------|
| Label | Display name |
| Plugin | Which source system plugin |

#### Onboarding Progress
Tracks per-user progress through guided onboarding tours.

| Field | Description |
|-------|-------------|
| User | Which user |
| Tour ID | Which onboarding tour |
| Status | pending, in_progress, completed, skipped |
| Current Step | Which step they're on |
| Total Steps | How many steps in this tour |
| Completed At | When they finished |

#### Auth Log
Records authentication events for security auditing.

---

## 4. Public Pages (Unauthenticated)

### Login Page
- Email/password login form
- Redirect to Dashboard (regular users) or Super Admin Dashboard (super admins) on success

### Signup Flow Entry
- `/start/{plan}/{interval}` — Begins the onboarding process for a specific plan
- Collects dealership information before redirecting to payment

### Signup Success / Cancel
- **Success**: After payment completes, creates the dealership account, admin user, and subscription. Redirects to login.
- **Cancel**: Payment was abandoned. Shows cancellation message.

### Team Invitation Page
- `/invitation/{token}` — Public page where invited users create their account
- Validates token, shows invitation details, collects name + password
- On accept: creates user account, links to dealership, records in audit log

### Public Vehicle Detail Page
- `/vehicles/{id}` — Direct link to any active vehicle's details
- Used by widget links to show vehicle details outside the dealership portal
- Shows vehicle images, specs, pricing, description
- Returns 404 if vehicle is sold

### Public Storefront
- See [Section 19: Public Storefront](#19-public-storefront)

---

## 5. Authentication & Onboarding Flows

### Signup & Onboarding Flow

```
User visits /start/{plan}/{interval}
    ↓
Onboarding form collects:
  - Dealership name
  - Contact information
  - Business details
    ↓
Data stored in session → redirect to payment checkout
    ↓
Payment provider creates checkout session
  - 14-day trial period
  - Monthly or yearly billing
    ↓
On payment success → /signup/success
  - Creates Dealership record
  - Creates Admin User (role: admin, dealership role: owner)
  - Creates Subscription record
  - Sends welcome email with login credentials
    ↓
Redirect to Login
```

### Login Flow

```
User visits /login
    ↓
Enter email + password
    ↓
On success:
  - Super Admins → /super_admin
  - All others → /dashboard
```

### Team Invitation Flow

```
Owner invites user (enters email)
    ↓
System creates invitation with:
  - Unique token
  - Expiration date
  - Audit log entry
    ↓
Email sent to invitee with link
    ↓
Invitee visits /invitation/{token}
    ↓
Enters name + password
    ↓
Account created, linked to dealership
  - Audit log entry recorded
  - Redirected to login
```

### Password Reset Flow

```
User clicks "Forgot Password" on login page
    ↓
Enters email address
    ↓
Reset link emailed
    ↓
User clicks link, enters new password
    ↓
Password updated, redirected to login
```

### Email Change Flow

```
User submits new email in Account Settings
    ↓
New email stored as "pending_email"
    ↓
Verification email sent to new address
    ↓
User clicks verification link → /account/verify-email-change
    ↓
Email updated, pending cleared
    ↓
(Optional) User can cancel via /account/cancel-email-change
```

---

## 6. Portal — Dashboard

The main landing page after login. Provides an at-a-glance overview of the dealership's inventory and market position.

### Content

- **Inventory Summary Stats**: Total vehicles, vehicles for sale, recently added, recently sold
- **Chart Data**: Visual representation of inventory trends over time (fetched asynchronously)
- **AI Market Insights**: AI-generated market analysis for the dealership's inventory, including:
  - Market positioning summary
  - Pricing recommendations
  - Inventory health indicators
  - Refreshable on demand
- **Quick Actions**: Links to add a new vehicle, view full inventory, view reports

### Data Sources
- Aggregated vehicle data for the dealership
- Cached AI insights (regenerated on demand or periodically)
- Chart data fetched via async API call

---

## 7. Portal — Inventory Management

### Inventory List Page

The main inventory management view showing all vehicles for the dealership.

**Features:**
- **Table/list view** of all vehicles with key details (image thumbnail, year/make/model, price, status, mileage, days in inventory)
- **Filtering**: By status (For Sale, Sold, Coming Soon, Dream Build), inventory type (sale/lease), search by text
- **Sorting**: By various fields
- **Bulk Operations**: Select multiple vehicles → bulk delete
- **Quick Actions per vehicle**: View, Edit, Delete, Mark as Sold, Mark as Available

### Vehicle Detail Page

Detailed view of a single vehicle.

**Features:**
- Full image gallery with primary image
- All vehicle specifications
- Pricing information (sale or lease)
- Description and features list
- Status badge and management
- **Market Value Widget**: Shows current market value data, pricing position (overpriced/underpriced), similar listings count
- **Market Trends Widget**: Historical pricing trend data for this vehicle
- **Title Check Widget**: Title status verification
- **AI Pricing Analysis**: On-demand analysis button that triggers AI-powered pricing evaluation
- **Webflow Sync Status**: If Webflow integration is active, shows sync status and last sync time

### Vehicle Edit Page

Edit an existing vehicle's information.

**Features:**
- All fields from the vehicle model are editable
- Image management:
  - Upload new images
  - Delete existing images
  - Reorder images via drag-and-drop
  - Set preview/primary image
- Status changes
- Save/cancel actions

### Mark as Sold / Mark as Available

Quick status toggles:
- **Mark as Sold**: Sets status to Sold, records sold timestamp
- **Mark as Available**: Sets status back to For Sale, clears sold timestamp

---

## 8. Portal — New Vehicle Wizard

A guided multi-step form for adding a new vehicle to inventory. Supports both sale and lease vehicle types.

### Pre-Step: Type Selection

User selects the inventory type:
- **For Sale** — Standard purchase vehicle
- **Lease** — Lease inventory (shows lease-specific pricing fields)

This selection persists through all subsequent steps.

### Step 1: Basic Vehicle Information

**Fields:**
- VIN (with auto-decode button)
- Year, Make, Model
- Trim / Trim Level
- Vehicle Type / Body Class
- Doors
- Stock Number
- Mileage
- Engine specs (HP, cylinders, displacement)
- Fuel type, transmission, drive type

**VIN Decode Feature:**
- User enters VIN → clicks Decode
- System calls external VIN decode API (primary + fallback)
- Auto-populates all available fields from decoded data
- Results cached for 1 hour to reduce API costs
- Two decode sources available (NHTSA government API + commercial API)

**Draft System:**
- Progress is auto-saved as a draft
- If user navigates away, they can resume from where they left off
- Explicit "Discard Draft" option to start fresh

### Step 2: Pricing Information

**Sale Vehicle Fields:**
- Online/Asking Price
- Sale Price
- Purchase Price (dealer cost)
- MSRP
- Location Detail

**Lease Vehicle Fields:**
- Lease Payment (monthly)
- Lease Term (months)
- Lease Specification details
- Broker Fee
- MSRP
- Location Detail

**AI Pricing Analysis:**
- Button to trigger AI analysis of the entered pricing
- Returns market positioning assessment and recommendations

### Step 3: Colors & Options

**Fields:**
- Exterior Color (from color palette)
- Interior Color (from color palette)
- Features/Options selection from dealership's option groups
- Free-text features entry
- Title Status

**AI Feature Detection:**
- User can click to auto-detect features from vehicle data
- AI analyzes the vehicle's make/model/trim/year and suggests common features
- User can accept, modify, or reject suggestions

### Step 4: Images & Description

**Features:**
- Multi-image upload (drag-and-drop or file picker)
- Image reordering
- Image deletion
- Set primary/preview image

**AI Description Generation:**
- Button to generate a vehicle description using AI
- AI uses all entered vehicle data to create a compelling listing description
- User can edit the generated text before saving

**Final Submission:**
- Review all entered data
- Submit to create the vehicle record
- Redirects to inventory list on success

### Wizard Navigation
- Step indicator showing current position (1 of 4)
- Back/forward navigation between completed steps
- Session state preserved between steps
- Unsaved changes detection and warning

---

## 9. Portal — Import & Export

### CSV Import

Bulk vehicle import from a CSV file.

**Flow:**
1. User visits CSV Import page
2. Downloads a template CSV file (available for different formats)
3. Fills in vehicle data in the template
4. Uploads the completed CSV
5. System processes the file:
   - Validates all rows
   - Reports errors per row
   - Shows preview of what will be imported
6. User confirms import
7. Vehicles created in inventory

**Supported template types**: Standard sale vehicles, lease vehicles

### vAuto Import

Import vehicles from a vAuto data feed.

**Flow:**
1. System connects to vAuto source account
2. Shows list of available vehicles from the feed
3. User can:
   - View vehicle details from the feed
   - Compare feed data with existing inventory
   - Select vehicles to import (new) or update (existing)
   - Hide unavailable vehicles
4. Import creates/updates vehicle records including images and pricing

### GWG Import

Similar to vAuto but for GWG (Great White Graphics) data source.

**Flow:** Same as vAuto import but with GWG-specific data mappings.

### Export

Export inventory data for external systems.

**Formats:**
- vAuto-compatible format
- GWG-compatible format
- General data export

---

## 10. Portal — Reports & Insights

A comprehensive analytics section with both standard reports and AI-powered insights.

### Reports Dashboard

Landing page showing available reports as cards, organized by category.

### Standard Reports

#### Inventory Report
- Total vehicle count by status
- Inventory breakdown by type (sale vs. lease)
- Make/model distribution
- Average days in inventory
- Inventory value summary

#### Price Analysis Report
- Price distribution across inventory
- Average price by make/model
- Price vs. market value comparison
- Outlier identification

#### Age Analysis Report
- Distribution of inventory by age (days listed)
- Aging buckets (0-30, 31-60, 61-90, 90+ days)
- Aging trends over time
- Flagging of stale inventory

### AI-Powered Reports

Each of these reports uses AI to generate narrative insights alongside the data:

#### Profitability Report
- Estimated profit margins per vehicle
- Cost analysis (purchase price vs. asking price)
- Most/least profitable vehicle categories
- AI-generated profitability recommendations

#### Velocity Report
- How quickly vehicles are selling
- Turn rate analysis
- Fast movers vs. slow movers
- AI recommendations for improving velocity

#### Pricing Optimization Report
- Vehicles that may be mispriced
- Market-based pricing suggestions
- Competitive positioning analysis
- AI-generated re-pricing recommendations

#### Market Positioning Report
- How the dealership's inventory compares to the local market
- Segment-by-segment positioning
- Gap analysis (what's missing from inventory)
- AI-generated strategic recommendations

#### Risk Report
- Vehicles at risk of becoming stale
- Depreciation risk assessment
- Market demand indicators
- AI-generated risk mitigation strategies

#### Predictive Report
- Forecasted demand trends
- Predicted time-to-sell estimates
- Seasonal pattern analysis
- AI-generated forward-looking recommendations

### Report Caching
- AI insights are cached per dealership/report type
- Cache includes the data snapshot used to generate insights
- Reports can be manually refreshed to regenerate insights

---

## 11. Portal — Credit Applications

### Credit Applications List

View all credit applications submitted to the dealership.

**Features:**
- Table/list of all applications
- Display: applicant name, email, phone, vehicle of interest, status, submission date
- Filter by status (New, Reviewed, Approved, Denied)
- Status update: change application status via dropdown or action buttons

### Status Flow

```
New → Reviewed → Approved
                → Denied
```

Each status change is recorded with timestamp.

### Credit Application Details
- Full applicant information
- Employment details
- Co-applicant info (if applicable)
- Business info (if applicable)
- Vehicle of interest (linked)
- Submission metadata (IP, timestamp)

---

## 12. Portal — Integrations Hub

A central page listing all available integrations.

**Current Integrations:**
- **Webflow** — Sync inventory to a Webflow CMS website
- **Embeddable Widget** — Add inventory to any website via embed code
- **Storefront** — Built-in public-facing inventory page (configured in Dealership Settings)

Each integration card shows:
- Integration name and description
- Current status (connected/not connected, active/paused)
- Quick link to manage

---

## 13. Portal — Webflow Integration

### Webflow Connection Management

**Setup Flow (Auto-Setup):**
1. User enters their Webflow API token
2. System fetches available Webflow sites
3. User selects target site
4. System automatically:
   - Creates a CMS collection for vehicles (if needed)
   - Sets up all required fields
   - Generates field mappings
5. Shows success page with connection details

**Setup Flow (Manual):**
1. User enters API token, site ID, and collection ID
2. System verifies the connection
3. User proceeds to field mapping

### Field Mapping Configuration
- Map VehicleHound vehicle fields to Webflow CMS fields
- Auto-mapping option (AI-assisted best-guess mapping)
- Manual override for each field
- Data type selection (text, number, image, etc.)
- Required field indicators
- Default value configuration

### Sync Operations
- **Sync All**: Push all active vehicles to Webflow
- **Sync Single Vehicle**: Push one vehicle's data
- **Publish Site**: Trigger a Webflow site publish after sync
- **Toggle Connection**: Enable/disable automatic syncing

### Sync Logs
- Table of all sync operations
- Per-vehicle sync status (success/failed)
- Error messages for failed syncs
- Log details view with full sync information

---

## 14. Portal — Embeddable Widget System

### Widget Management

**Widget List:**
- All widgets for this dealership
- Show widget name, type, status, creation date
- Quick actions: edit, preview, get embed code, delete

### Widget Types
- **Grid**: Gallery/grid view of inventory
- **Search**: Searchable inventory list with filters
- **Details**: Single vehicle detail widget

### Create / Edit Widget

**Configuration Options:**
- Widget name
- Widget type selection
- Display settings (stored as JSON config):
  - Which vehicle fields to show
  - Sorting preferences
  - Filter defaults
  - Behavior settings
- Allowed domains (where the widget can be embedded)
- Status (active/paused)

### Embed Code Page
- Shows the HTML/JavaScript snippet to embed the widget
- Instructions for adding to any website
- Domain whitelist management

### Widget Preview
- Live preview of the widget as it will appear on a website
- Updates in real-time as configuration changes

### Widget Domain Verification
- Each widget has a list of allowed domains
- Domains can be verified via:
  - **Meta tag verification**: Add a meta tag to the target site
  - **DNS verification**: Add a DNS TXT record
  - **Auto verification**: Automatic on first request from the domain
- Unverified domains are blocked from using the widget

### Widget API
The widget loads data from a dedicated API using the widget's API key:
- Inventory list (filtered per widget config)
- Individual vehicle details
- Domain verification endpoint
- Analytics tracking endpoint
- Error reporting endpoint

### Widget API Key
- Each widget has a unique API key
- Can be regenerated (invalidates the old key)
- Rate limited (1000 requests/hour per key)

---

## 15. Portal — Billing & Subscriptions

### Billing Dashboard

**Displays:**
- Current plan name and details
- Billing interval (monthly/yearly)
- Current period dates
- Subscription status (active, trialing, canceled, past due)
- Trial information (if in trial)
- Next billing date
- Payment method summary

**Actions:**
- **Upgrade Plan**: Switch to a higher-tier plan
- **Cancel Subscription**: Initiates cancellation (with grace period)
- **Resume Subscription**: If canceled but still in grace period, resume the plan
- **Manage Payment Method**: Update billing information

### Subscription Plans

| Plan | Description |
|------|-------------|
| **Starter** | Entry-level. Basic inventory management and storefront. |
| **Professional** | Mid-tier. Adds advanced reports, integrations, more vehicle capacity. |
| **Enterprise** | Full-featured. All features, highest limits, priority support. |

Each plan has monthly and yearly pricing, with yearly offering a discount.

### Subscription Lifecycle

```
Signup → Trialing (14 days) → Active → (Cancel) → Grace Period → Expired
                              Active → Past Due → (Payment retry) → Active / Unpaid
```

### Feature Gating
Features are gated based on the active subscription plan. Attempting to access a gated feature shows an upgrade prompt.

---

## 16. Portal — Account Settings

### Personal Information
- View/edit name
- View/change email (with verification flow)
- Change password (requires current password)

### API Token Management
- View all personal API tokens
- Create new tokens with specific abilities:
  - `inventory:read` — Read inventory data
  - `inventory:write` — Create/update/delete inventory
  - `reports:read` — Access report data
- Revoke/delete tokens
- Copy token value (shown only at creation time)

---

## 17. Portal — Dealership Settings

**Available to: Owner and Manager roles**

### Business Information
- Edit dealership name
- Address, city, state, zip
- Phone number
- Website URL

### Logo Management
- Upload dealership logo
- Preview current logo
- Remove logo

### Storefront Configuration
- Enable/disable public storefront
- Storefront URL (based on dealership slug): `/s/{slug}`

### Credit Application Email Routing
- Manage list of email addresses that receive credit application notifications
- Add/remove email addresses
- All listed emails receive every credit application submission

---

## 18. Portal — User Management

**Available to: Owner (full control) and Manager (view + limited management)**

### Team Members List
- All users in the dealership
- Show: name, email, role, join date, last activity
- Role badges (Owner, Manager, User)
- Actions: change role, remove user

### Pending Invitations
- List of outstanding invitations
- Show: email, sent date, expiration
- Actions: resend invitation, cancel invitation

### Invite User
- Enter email address
- System sends invitation email
- Checks against user limit before allowing

### Role Management
- Change a user's dealership role (Manager ↔ User)
- Owner role cannot be reassigned through this interface

### Remove User
- Remove a team member from the dealership
- Confirmation required
- Audit log entry created

---

## 19. Public Storefront

Each dealership with storefront enabled gets a public-facing inventory page.

### Storefront Home (`/s/{slug}`)
- Dealership branding (logo, name)
- Vehicle grid/list showing all active (for-sale) inventory
- Each vehicle card shows: primary image, year/make/model, price, key specs
- Link to individual vehicle pages
- Link to credit application

### Storefront Vehicle Detail (`/s/{slug}/vehicle/{id}`)
- Full vehicle details page
- Image gallery
- All specifications
- Pricing
- Description
- Call-to-action: "Apply for Credit" link

### Storefront Credit Application (`/s/{slug}/credit-application`)
General credit application form (not vehicle-specific).

### Storefront Credit Application for Vehicle (`/s/{slug}/credit-application/{vehicleId}`)
Credit application pre-linked to a specific vehicle.

### Credit Application Form

**Form Fields:**
- First Name, Last Name
- Email, Phone
- Address, City, State, Zip
- Residential Status, Monthly Payment
- Employer, Occupation, Employment Status, Monthly Income
- SSN (sensitive — for PDF only, never stored)
- Has Co-Applicant toggle → Co-applicant fields
- Is Business Application toggle → Business fields
- ID upload (front)
- Insurance document upload
- Registration document upload

**Bot Protection:**
- Captcha/verification challenge on submission

**Submission Flow:**
1. Form validated client-side and server-side
2. Bot protection verified
3. PDF generated in memory with all form data (including SSN)
4. Email sent to all configured dealership credit app emails:
   - PDF attachment
   - Uploaded document attachments
5. Non-sensitive data stored in database (NO SSN)
6. Confirmation shown to applicant

**Rate Limited:** 5 submissions per minute per IP.

---

## 20. Super Admin Panel

System-wide administration panel for platform operators.

### Super Admin Dashboard
- System overview stats
- Total dealerships, total users, total vehicles across platform
- System health indicators

### Dealership Management

**Dealership List:**
- All dealerships in the system
- Show: name, status, vehicle count, user count, subscription status
- Search/filter

**Dealership Detail:**
- Full dealership information
- List of vehicles in this dealership
- List of users and admins
- Subscription details
- API tokens
- Source account connections

**Actions:**
- Create new dealership
- Delete dealership (with confirmation)
- View/manage dealership admins
- Create new admin for a dealership
- Create API tokens for a dealership
- Reset user passwords

### Admin Management
- List all admin users across the platform
- Edit admin details
- Delete admin (with confirmation)

### User Management
- List all users across all dealerships
- Reset any user's password

### Source Account Management
- Create/delete source accounts (external data feed connections)
- Link source accounts to dealerships

### Token Management
- View all API tokens across the platform
- Create tokens for specific dealerships
- Delete tokens
- View tokens by user

---

## 21. AI-Powered Features

VehicleHound integrates AI throughout the platform. These features use a large language model API.

### AI Vehicle Description Generation
- **Where**: Step 4 of New Vehicle Wizard, Vehicle Edit page
- **Input**: All vehicle data (year, make, model, trim, specs, features, pricing)
- **Output**: Compelling, professional vehicle listing description
- **User Control**: Generated text is fully editable before saving

### AI Feature Detection
- **Where**: Step 3 of New Vehicle Wizard
- **Input**: Vehicle make, model, trim, year
- **Output**: Suggested list of standard and optional features for that vehicle
- **User Control**: User can accept/reject individual suggestions

### AI Pricing Analysis
- **Where**: Step 2 of New Vehicle Wizard, Vehicle Detail page, Inventory list
- **Input**: Vehicle details + pricing + market data
- **Output**: Pricing position assessment, market comparison, recommendations
- **User Control**: Advisory only — user decides whether to adjust pricing

### AI Market Insights (Dashboard)
- **Where**: Dashboard
- **Input**: Dealership's full inventory data + market data
- **Output**: Narrative market analysis with actionable insights
- **Caching**: Insights are cached and can be manually refreshed

### AI Report Insights
- **Where**: Each AI-powered report (profitability, velocity, pricing, market positioning, risk, predictive)
- **Input**: Report data + inventory data + market data
- **Output**: Narrative analysis, recommendations, key findings
- **Caching**: Cached per dealership/report type with data snapshot

### AI Chat Assistant
- **Where**: Available via API endpoint
- **Input**: Natural language questions about the dealership's inventory
- **Output**: Conversational responses with inventory data and recommendations

---

## 22. API Layer

VehicleHound exposes a RESTful API for programmatic access.

### Authentication
- Token-based authentication
- Tokens created via `POST /api/token` with email/password
- Each token has specific abilities (permissions)
- Rate limited: 10 token creation attempts per minute

### Inventory API

| Method | Endpoint | Ability Required | Description |
|--------|----------|-----------------|-------------|
| GET | `/api/inventory` | `inventory:read` | List all vehicles |
| GET | `/api/inventory/{id}` | `inventory:read` | Get single vehicle |
| POST | `/api/inventory` | `inventory:write` | Create vehicle |
| PUT | `/api/inventory/{id}` | `inventory:write` | Update vehicle |
| DELETE | `/api/inventory/{id}` | `inventory:write` | Delete vehicle |

### Reports API

| Method | Endpoint | Ability Required | Description |
|--------|----------|-----------------|-------------|
| GET | `/api/reports` | `reports:read` | List available reports |
| GET | `/api/reports/{type}` | `reports:read` | Get specific report data |

### Chat API

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat/inventory-assistant` | AI inventory chat assistant |

### Vehicle Market Data API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/vehicle/{id}/market-data` | Get vehicle market data |
| GET | `/api/vehicle/{id}/market-trends` | Get market price trends |
| POST | `/api/vehicle/{id}/analyze-market-pricing` | Trigger AI pricing analysis |

### Market Data Collection API
(API key authenticated — used by external data collection services)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/market-data/snapshot` | Store a market data snapshot |
| GET | `/api/market-data/latest` | Get latest market data |
| GET | `/api/market-data/inventory-for-scraping` | Get inventory list for external scraping |
| GET | `/api/market-data/export/{month}` | Export monthly market data as CSV |

### Market Pricing Reference API

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/market-pricing-reference/store` | Store pricing reference data |
| GET | `/api/market-pricing-reference/average` | Get average pricing for make/model/year |

### Widget API
(API key authenticated per widget)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/widget/v1/inventory` | Get inventory for widget display |
| GET | `/api/widget/v1/vehicle/{id}` | Get single vehicle for widget |
| POST | `/api/widget/v1/verify` | Verify widget domain authorization |
| POST | `/api/widget/v1/analytics` | Track widget usage analytics |
| POST | `/api/widget/v1/errors` | Report widget-side errors |

### Dashboard API (Session authenticated)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/chart-data` | Dashboard chart data |
| GET | `/api/market-insights` | AI market insights |
| POST | `/api/market-insights/refresh` | Force-refresh AI market insights |

### Onboarding API (Session authenticated)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/onboarding/tours` | Get all onboarding tours |
| GET | `/api/onboarding/tours/{tourId}` | Get specific tour |
| POST | `/api/onboarding/progress` | Update tour progress |
| POST | `/api/onboarding/reset` | Reset all tour progress |

---

## 23. Notifications & Emails

### Email Types

| Email | Trigger | Recipients | Contents |
|-------|---------|------------|----------|
| **Welcome Email** | New dealership signup | Dealership owner | Login credentials, getting started info |
| **Dealership Invitation** | Owner invites a team member | Invitee | Invitation link with token, dealership name |
| **Credit Application** | Customer submits credit app | All configured dealership emails | PDF attachment with full application, uploaded documents |
| **Password Reset** | User requests password reset | User | Reset link with token |
| **Email Change Verification** | User changes their email | New email address | Verification link |

### Notification Service Capabilities
- Send to individual user
- Send to all users with a specific role
- Send bulk notifications to dealership users
- Send admin-level notifications

---

## 24. Background Jobs & Scheduled Tasks

### Scheduled Commands

| Job | Description | Schedule |
|-----|-------------|----------|
| **HomeNet Feed Generation** | Generates XML vehicle feed in HomeNet format and uploads via SFTP | Periodic |
| **Market Data Update** | Refreshes market pricing data for all active vehicles | Periodic |
| **Webflow Sync** | Syncs inventory changes to connected Webflow sites | Periodic / On-change |
| **Vehicle Insights Generation** | Generates AI insights for vehicles that need them | Periodic |

### Event-Driven Jobs

| Trigger | Job |
|---------|-----|
| Vehicle created/updated | Sync to Webflow (if connected) |
| Vehicle status changed | Update Webflow, update feeds |
| Credit application submitted | Generate PDF, send emails |
| Subscription webhook received | Update subscription status, handle downgrades |
| Market data snapshot received | Store and process market data |

---

## 25. Navigation Structure

### Regular User Sidebar

```
[Dealership Name]

Dashboard

── Inventory ──
New Vehicle
Manage Inventory
CSV Import
Insights (Reports)
Applications (Credit Apps)

── Storefront & Tools ──
Storefront & Tools (Integrations Hub)

── Settings ──
Account
Billing
User Management (owner/manager only)
Dealership Settings (owner/manager only)

[Logout]
```

### Super Admin Sidebar

```
[Super Admin]

Dashboard
Dealerships
Manage Admins
Integrations

── Account ──
Account
Billing
User Management (if applicable)
Dealership Settings (if applicable)

[Logout]
```

---

## Appendix: External Service Integrations

VehicleHound integrates with several external services. The new build should plan for equivalent functionality:

| Service Category | Purpose |
|-----------------|---------|
| **VIN Decode API** (primary) | Decode VIN to auto-populate vehicle specifications. Government/free API. |
| **VIN Decode API** (fallback) | Commercial VIN decode API as fallback when primary fails. Cached for 1 hour. |
| **Vehicle Market Value API** | Look up current market value for a specific vehicle by VIN. Cached for 1 hour. |
| **Title Check API** | Verify vehicle title status (clean, salvage, rebuilt, etc.) by VIN. |
| **AI / LLM API** | Powers all AI features: descriptions, feature detection, pricing analysis, report insights, market insights, chat assistant. |
| **Payment Processing** | Subscription billing, checkout sessions, webhooks for subscription lifecycle events. |
| **Transactional Email** | Sends all system emails (welcome, invitations, credit apps, password resets). |
| **Bot Protection** | Captcha/challenge on public forms (credit applications). |
| **Webflow CMS API** | Sync vehicle inventory to Webflow CMS collections. |
| **HomeNet Feed** | Generate and deliver vehicle data in HomeNet XML format via SFTP. |
| **External Workflow Automation** | External workflows for market data collection and processing. |

---

## Appendix: Key Business Rules

1. **Tenant Isolation**: Every data query must be scoped to the authenticated user's dealership. No cross-tenant data access.
2. **SSN Handling**: SSN is collected in credit applications but NEVER stored in the database. It only appears in the emailed PDF.
3. **Vehicle Status Transitions**: For Sale ↔ Sold, Coming Soon → For Sale, Dream Build → For Sale.
4. **Subscription Enforcement**: Feature access is gated by plan. Vehicle and user limits are enforced at the plan level.
5. **Trial Period**: 14-day trial on all new signups. Full feature access during trial.
6. **Grace Period**: After cancellation, dealership retains access until the end of the current billing period.
7. **Rate Limiting**: Credit application submissions (5/min), API token creation (10/min), general API calls (60/min), widget API (1000/hour per key).
8. **Image Ordering**: Vehicle images have explicit sort order. First image (or designated preview image) is used as the thumbnail/primary image.
9. **Draft Persistence**: In-progress vehicle creation is saved as a draft. Users can resume or discard drafts.
10. **Audit Logging**: All user management actions (invite, remove, role change) are recorded in the audit log with IP and user agent.
