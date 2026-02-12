# WhatsApp Funding Application Bot

A comprehensive WhatsApp bot for collecting business funding applications with direct integration to Airtable.

## Features

✅ **Complete Application Flow**
- Personal Information (SA ID, Name, DOB, Phone, Email)
- Business Information (Name, Trading Name, CIPC, Type, Industry)
- Address Information (Street, Township, City, District, Province, ZIP)
- Employment & Revenue (Employees, Years, Revenue Range)
- Funding Request (Amount, Purpose, Type, Justification)
- Readiness Assessment (Business Plan, Records, Training, Support Needs)

✅ **Advanced Capabilities**
- Save and Continue functionality
- Application progress tracking
- Real-time validation
- South African ID verification
- Session management
- Airtable integration with your existing schema
- WhatsApp Business API integration

✅ **Security & Compliance**
- Data privacy consent agreement
- Secure session handling
- Input validation
- Error handling and logging

## Prerequisites

- Node.js 18+
- Airtable account with "Applicants" table
- Meta Developer account with WhatsApp Business API access
- Render.com account (for deployment)

## Quick Start

### 1. Local Setup

```bash
# Clone repository
git clone <your-repo-url>
cd whatsapp-funding-bot

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your credentials

# Run locally
npm run dev