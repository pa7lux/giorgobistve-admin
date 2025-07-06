# Giorgobistve Admin Panel

A lightweight headless CRUD admin panel for managing Georgian lyrics in the [giorgobistve repository](https://github.com/pa7lux/giorgobistve).

## Features

- **GitHub OAuth Authentication**: Secure login with GitHub
- **Contributor Authorization**: Only repository contributors can access the admin panel
- **CRUD Operations**: Create, read, update, and delete lyrics files
- **WYSIWYG Editor**: Rich text editing with TipTap
- **Markdown Support**: Pure markdown mode available
- **Auto-Index Management**: Automatically updates `public/lyrics/index.json`
- **Publish Workflow**: Commit changes directly to the repository

## Tech Stack

- **Next.js 14**: React framework with App Router
- **TipTap**: WYSIWYG editor for rich text editing
- **Radix UI**: Modern, accessible UI components
- **NextAuth.js**: Authentication with GitHub OAuth
- **Octokit**: GitHub API client
- **Tailwind CSS**: Utility-first CSS framework

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the root directory:

```env
# GitHub OAuth App credentials
GITHUB_ID=Iv23liPsnEXPMtS6TqRF
GITHUB_SECRET=e87baa92cf71f04a370def938f2b800b251c7184

# NextAuth configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-please-change-this-in-production

# Target repository
GITHUB_OWNER=pa7lux
GITHUB_REPO=giorgobistve
```

### 3. GitHub App Setup

The GitHub App is already configured with the following credentials:
- **App ID**: 1466688
- **Client ID**: Iv23liPsnEXPMtS6TqRF
- **Owner**: @pa7lux

### 4. Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the admin panel.

## Usage

### Authentication

1. Click "Sign in with GitHub" on the homepage
2. Authorize the GitHub App
3. The system will check if you're a contributor to the giorgobistve repository
4. If you're not a contributor, you'll see a "Contact the admin" message

### Managing Lyrics

#### Creating a New Song

1. Click "Create New Song" button
2. Fill in the metadata:
   - **ID**: Unique identifier (e.g., "alilo")
   - **Title**: Song title in Georgian (e.g., "ალილო")
   - **Title (Latin)**: Romanized title (e.g., "Alilo")
   - **Description**: Brief description of the song
3. Write the lyrics content using either:
   - **WYSIWYG Editor**: Rich text editor with formatting tools
   - **Markdown**: Pure markdown syntax
   - **Preview**: See how the content will look
4. Click "Create" to save the song

#### Editing an Existing Song

1. Click the edit icon (pencil) on any song card
2. Modify the content using the WYSIWYG or markdown editor
3. Click "Save" to update the file

#### Deleting a Song

1. Click the delete icon (trash) on any song card
2. Confirm the deletion
3. The file will be removed and the index.json updated automatically

### Publishing Changes

After making any changes (create, update, or delete), click the "Publish Changes" button to commit your changes to the repository.

## File Structure

```
giorgobistve-admin/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/
│   │   └── github/
│   │       ├── contributors/
│   │       └── lyrics/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── admin/
│   │   ├── AdminPanel.tsx
│   │   ├── LyricsEditor.tsx
│   │   └── LyricsForm.tsx
│   ├── auth/
│   │   └── AuthGuard.tsx
│   └── providers/
│       └── AuthProvider.tsx
├── types/
│   └── next-auth.d.ts
├── package.json
└── README.md
```

## API Routes

- `/api/auth/[...nextauth]`: NextAuth.js authentication endpoints
- `/api/github/contributors`: Check if user is a repository contributor
- `/api/github/lyrics`: Get all lyrics files and index
- `/api/github/lyrics/[filename]`: CRUD operations for individual files

## How It Works

1. **Authentication**: Users authenticate with GitHub OAuth
2. **Authorization**: System checks if user is in the contributors list
3. **File Management**: API routes handle GitHub API calls for file operations
4. **Index Management**: When files are created/deleted, `index.json` is automatically updated
5. **Live Updates**: Changes are reflected immediately in the UI

## Security

- Only repository contributors can access the admin panel
- All API calls are authenticated using GitHub tokens
- File operations are performed using the user's GitHub permissions

## Development

To extend the admin panel:

1. **Add new API routes** in `app/api/`
2. **Create new components** in `components/`
3. **Update types** in `types/`
4. **Modify styles** in `app/globals.css`

## Deployment

The application can be deployed to any platform that supports Next.js:

- Vercel (recommended)
- Netlify
- Railway
- Self-hosted

Make sure to update the `NEXTAUTH_URL` environment variable for production deployments.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is part of the giorgobistve repository and follows the same licensing terms. 