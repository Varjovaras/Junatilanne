# Junatilanne

A real-time train tracking application that shows delayed VR (Finnish Railways) trains. Built with TanStack Start and TypeScript.

## Features

- Real-time tracking of delayed trains
- Separate views for commuter and long-distance trains
- Detailed view for individual trains
- Bilingual support (Finnish/English)
- Sorting options for train listings
- Responsive design

## Tech Stack

- [TanStack Start](https://tanstack.com/start)
- [Vite](https://vite.dev/)
- [Nitro](https://nitro.build/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Bun](https://bun.sh/)
- [Digitraffic API](https://www.digitraffic.fi/rautatieliikenne/)

## Getting Started

### Prerequisites

- Node.js 20 or later
- npm, yarn, pnpm or bun (preferably bun)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/Varjovaras/junatilanne.git
```

2. Navigate to the project directory:

```bash
cd junatilanne
```

3. Install dependencies:

```bash
bun install
# or
npm install
# or
yarn install
# or
pnpm install
```

4. Run the development server:

```bash
bun dev
# or
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173) with your browser to see the result.

## Frontend Project Structure

```
src/
├── app/           # TanStack file-based routes
├── components/    # React components
└── lib/           # Queries, domain helpers, types and configuration
    ├── i18n/      # Internationalization
    ├── queries/   # GraphQL queries and server functions
    ├── station/   # Station metadata and schedule helpers
    ├── train/     # Train classification, delay and progress helpers
    └── types/     # Shared TypeScript types
```

## Acknowledgments

- Data provided by [Digitraffic](https://www.digitraffic.fi/), made available under the [CC 4.0 BY license](https://creativecommons.org/licenses/by/4.0/).
