# Altitutor Student Portal

A streamlined student onboarding and management system built with Next.js and Supabase.

## Overview

The Altitutor Student Portal is designed to make student registration and management easier by:

- Allowing students to register and create accounts
- Collecting student and parent information
- Enabling students to select their subjects of interest
- Automatically creating tasks for admins to assign classes
- Seamlessly integrating with the admin backend

## Features

- **User Authentication**: Secure signup and login using Supabase Auth
- **Onboarding Flow**: Multi-step registration process for students
- **Subject Selection**: Students can browse and select subjects
- **Profile Management**: Students can view and update their information
- **Class Assignment**: Admin notification when new students register
- **Dashboard**: Students can see their enrolled subjects and assigned classes

## Tech Stack

- **Frontend**: Next.js with React
- **Styling**: Tailwind CSS
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL
- **Deployment**: Netlify

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/your-username/alti-student.git
cd alti-student
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Set up environment variables
Create a `.env.local` file in the root directory and add:
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

4. Run the development server
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application

## Deployment

This project is configured for deployment on Netlify. Simply connect your GitHub repository to Netlify and it will automatically deploy when changes are pushed to the main branch.

## Project Structure

- `/components`: Reusable UI components
- `/pages`: Next.js pages and routes
- `/pages/onboarding`: Multi-step onboarding flow
- `/utils`: Helper functions and Supabase client
- `/styles`: Global styles and Tailwind configuration

## Database Schema

The database includes the following key tables:

- `students`: Student information and parent details
- `subjects`: Available subjects for selection
- `students_subjects`: Join table linking students to their selected subjects
- `tasks`: Admin tasks created during the onboarding process

## Future Enhancements

- Student billing integration
- SMS/Email notifications
- Schedule viewing
- Homework submission
- Progress tracking

## License

This project is licensed under the MIT License - see the LICENSE file for details.
