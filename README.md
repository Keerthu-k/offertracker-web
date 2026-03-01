# OfferTracker

A career intelligence API and platform for professionals who want genuine clarity in their job search — not another chore.

---

## What is OfferTracker?

OfferTracker is built around one core idea: the job search deserves more than a Kanban board. 

Most trackers record what happened. OfferTracker is built to help you understand *why* — why certain interview rounds go well, why certain resume versions perform better, what skill gaps keep surfacing, and how consistent your effort actually is.

At its core, it is a **personal job search database**: every application, every interview stage, every offer and rejection, every reflection written after the fact. The entry form is intentionally flat — just `company_name` and `role_title` are required. Everything else is optional. Adding an application should take five seconds, not five minutes.

Beyond the personal tracker, OfferTracker has a lightweight **social layer** — follow friends, join circles, share updates and tips. Not a social media platform, not a competition. Just a small space where people navigating the same experience can see how each other is doing.

Progress is surfaced through **milestones**: quiet, automatic markers reached by actually using the product. No points, no leaderboard.

## Philosophy: Why This Exists

| Problem | What OfferTracker does about it |
|---|---|
| Forgetting what happened in each interview round | Structured **Stages** with per-round notes, prep notes, and questions asked |
| Not knowing which resume version performs best | **Resume Versions** — label, store, and link each version to every application |
| No idea why rejections keep happening | **Outcomes** with compensation details, **Reflections** with structured post-mortems |
| Skill gaps identified in interviews slip through the cracks | `skill_gaps` JSON field in Reflections + a dedicated improvement plan |
| Job search feels like searching alone | **Follows**, **Groups**, and a shared **Post** feed |
| No sense of consistent effort | **Streak tracking** and natural **Milestones** reached through real activity |
| Interesting jobs forgotten before applying | **Saved Jobs** — bookmark postings and convert them to applications when ready |
| No visibility into search performance | **Analytics dashboard** — pipeline funnel, response rates, source effectiveness, salary insights |

## Who Is It For?

OfferTracker is for **driven professionals** who treat their job search as a structured project. If you are tired of losing track of your interview notes, repeatedly encountering the same skill gaps without a plan to fix them, or feeling isolated in the job hunt, this platform is for you. It's designed to provide actionable insights rather than just a list of applied jobs.

## Tech Stack (Frontend)

The frontend is a modern, responsive Single Page Application (SPA) designed with a premium, glassmorphism dark-mode aesthetic.

- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS v4 + Vanilla CSS for dynamic glassmorphism effects
- **Routing**: React Router DOM (v7)
- **Icons**: Lucide React
- **Data Visualization**: D3.js (Analytics, Funnel Charts, Activity Heatmaps)

*(Note: The backend is powered by FastAPI and PostgreSQL. Check out the backend repository here: [offertracker-backend](https://github.com/Keerthu-k/offertracker-backend)).*

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- `npm` (Node Package Manager)

### Installation

1. **Clone the repository** and navigate to the project directory:
   ```bash
   git clone https://github.com/Keerthu-k/offertracker-web.git
   cd "OfferTracker Web"
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root of the project to point to your OfferTracker backend API.
   ```env
   VITE_API_BASE=http://127.0.0.1:8000/api/v1
   ```
   *(If your backend is running elsewhere, update the URL accordingly).*

4. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   The application will typically be available at `http://localhost:5173`. Open this URL in your browser to start tracking your offers!

## Contributing

We welcome contributions! Please follow standard pull request workflows to propose changes. Ensure your code satisfies the project's ESLint rules before submitting.
