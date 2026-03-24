# Apex AI Sales Assistant

## Current State
New project. No existing application files.

## Requested Changes (Diff)

### Add
- Lead management: create, view, update leads with contact info, status, deal value
- AI sales coaching: context-aware suggestions for each lead (objection handling, follow-up tips, closing techniques)
- Deal pipeline: Kanban-style view of leads across stages (New, Contacted, Qualified, Proposal, Closed Won, Closed Lost)
- Conversation log: track notes and interactions per lead
- Dashboard overview: total leads, pipeline value, win rate, recent activity
- Performance stats: deals closed, revenue, conversion rate
- Authorization: admin vs. sales rep roles

### Modify
N/A (new project)

### Remove
N/A (new project)

## Implementation Plan
1. Backend: Lead data model (id, name, company, email, phone, status, value, notes, createdAt, updatedAt)
2. Backend: CRUD for leads, pipeline stage updates, note/interaction logging
3. Backend: AI suggestion engine (rule-based tips by lead stage and context)
4. Backend: Dashboard stats aggregation
5. Backend: Authorization with admin and sales rep roles
6. Frontend: Dashboard page with KPI cards and charts
7. Frontend: Leads list with search/filter
8. Frontend: Lead detail view with AI coaching panel and conversation log
9. Frontend: Pipeline Kanban board
10. Frontend: Settings/profile page
