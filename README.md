# Vincit Executive Dashboard

Next.js 14 App Router dashboard with live HubSpot CRM integration.

## Features
- **Pipeline View**: KPI cards, bar/pie/line charts, expandable owner tables with deal-level detail
- **New Deal Form**: Auto-generated deal names, direct HubSpot submission
- **Team Filters**: SAM, QSI BDM, Vincit Enterprise pipeline segmentation
- **At-Risk Alerts**: Flags deals with no close date or recent activity

## Tech Stack
- Next.js 14.1.0 (App Router)
- React 18 + Recharts 2.10
- Tailwind CSS
- HubSpot CRM API

## Environment Variables
- `HUBSPOT_ACCESS_TOKEN` — Required for both `/api/deals` and `/api/create-deal` endpoints

## Deployment
Connected to Vercel at `vincit-dashboard.vercel.app`
