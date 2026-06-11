# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

## Seeding test data

To create 5 test users with profiles, recipes, posts, batches, readings, and follow relationships:

1. Copy `.env.local` and add your **Supabase service_role key**:
   ```sh
   cp .env.local .env.local
   # Edit .env.local and replace `your-service-role-key-here` with the real key
   ```
   > Get the key from Supabase Dashboard → Project Settings → API → `service_role` key.

2. Apply the follows table migration to Supabase:
   ```sh
   npx supabase db push
   # Or run the SQL manually in the SQL Editor:
   # supabase/migrations/20240611_add_follows.sql
   ```

3. Run the seed script:
   ```sh
   node scripts/seed-test-data.mjs
   ```

4. Log in with any of the created accounts:
   - `hoppy.brewer@example.com` / `TestPass123!`
   - `kombucha.queen@example.com` / `TestPass123!`
   - `mead.master@example.com` / `TestPass123!`
   - `sourdough.sam@example.com` / `TestPass123!`
   - `cider.sid@example.com` / `TestPass123!`
