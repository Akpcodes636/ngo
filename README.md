# Healthy Golden Years Initiative — Website

The official website for **Healthy Golden Years Initiative**, a Nigerian non-profit organisation founded by Juliet Ugbomeh (RN, BNSc, RPHN) to promote the health, dignity, and wellbeing of older persons.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Icons:** Lucide React
- **Payments:** Paystack (server-side via `/api/donate/initialize`)

## Project Structure

```
app/                  # Next.js App Router pages
  about/              # About Us — mission, values, founder biography
  contact/            # Contact page
  donate/             # Donation page + success/failed states
  gallery/            # Photo gallery
  get-involved/       # Volunteering and engagement
  impact/             # Impact metrics and stories
  privacy-policy/     # Privacy Policy
  programs/           # Programmes offered
  safeguarding-policy/# Safeguarding Policy
  terms/              # Terms of Use
  api/donate/         # Server-side Paystack integration

components/           # Shared UI components (Navbar, Footer, Cards, etc.)
data/                 # Static site content (site config, programs, team, etc.)
public/               # Static assets (images, icons)
```

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

Create a `.env.local` file in the project root. The donation flow requires:

```env
PAYSTACK_SECRET_KEY=sk_live_...
```

Without this key the donation endpoint returns `501` and the form falls back to the Bank Transfer option automatically.

## Content

All site content is managed through files in the `data/` directory:

| File | Contents |
|---|---|
| `data/site.ts` | Organisation name, mission, vision, contact details, nav links |
| `data/team.ts` | Founder biography, leadership placeholders, partners |
| `data/programs.ts` | Programme descriptions and approach steps |
| `data/values.ts` | Core values |
| `data/impact.ts` | Impact statistics |
| `data/images.ts` | Image paths and alt text |

To update contact details, edit the `contact` object in `data/site.ts`. To update the founder biography, edit the `founder` object in `data/team.ts`.

## Deployment

The site is designed for deployment on [Vercel](https://vercel.com). Push to your connected repository and Vercel will build and deploy automatically. Set `PAYSTACK_SECRET_KEY` as an environment variable in the Vercel project settings before going live with donations.

## Organisation

**Healthy Golden Years Initiative**
Ijede, Lagos 104102, Nigeria
Tel: 08031642580
