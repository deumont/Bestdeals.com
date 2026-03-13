# BestDeals AI

A simple AI-powered website that lets you upload a product image and returns likely prices from multiple shopping websites.

## Features
- Upload a product image.
- Uses an AI vision model to infer product identity.
- Returns estimated price comparisons and website links in a table.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create `.env` file:
   ```bash
   cp .env.example .env
   ```
3. Add your `OPENAI_API_KEY` in `.env`.
4. Run:
   ```bash
   npm start
   ```
5. Open `http://localhost:3000`

## Notes
- Prices are AI-estimated possibilities and may not be real-time accurate.
- For production-grade results, integrate trusted shopping/search APIs.
