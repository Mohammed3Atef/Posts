# Beginner React Social App (Full Docs Coverage)

A beginner-friendly social media project built with React + JavaScript using the Route Academy `route-posts` API with responsive Tailwind UI.

## 1) Run locally

```bash
npm install
npm run dev
```

Then open the URL shown by Vite (usually `http://localhost:5173`).

## 2) API base URL

The API URL is hardcoded directly in `src/api/axiosInstance.js`:

`https://route-posts.routemisr.com`

## 3) How auth works

- On login/signup, API returns a token.
- Token is saved in `localStorage` under key `token`.
- `axiosInstance` automatically sends `Authorization: Bearer <token>` on requests.
- `AuthContext` keeps auth state (`token`, `user`, `isAuthenticated`).
- `ProtectedRoute` blocks private pages for logged-out users.

## 4) Main routes

- `/signup` -> Sign up page
- `/login` -> Login page
- `/` -> Home feed (protected)
- `/posts/new` -> Create post (protected)
- `/posts/:postId` -> Post details + comments (protected)
- `/posts/:postId/edit` -> Edit post (protected)
- `/posts/:postId/likes` -> Users who liked a post (protected)
- `/posts/:postId/comments/:commentId/replies` -> Comment replies page (protected)
- `/profile` -> Current user profile (protected)
- `/change-password` -> Update password (protected)
- `/bookmarks` -> Bookmarked posts (protected)
- `/notifications` -> Notifications list/read actions (protected)
- `/suggestions` -> Suggested users (protected)

## 5) Feature coverage

- Auth: signup, signin, profile data, change password, upload photo, suggestions.
- Posts: feed/list, create, update, delete, like, likes list, bookmark, share.
- Comments: list, create, update, delete, like.
- Replies: list and create replies for comments.
- Notifications: list, unread count, mark one read, mark all read.

## 6) Demo account (for testing only)

- Email: `test22test@gmail.com`
- Password: `123123mM@@`

Use this account only as a testing reference while learning.

## 7) Notes for beginners

- Code is intentionally kept simple with hooks and Context API.
- API calls are separated into files inside `src/api`.
- Pages focus on UI + form handling.
- Components keep repeated UI pieces reusable.
- Feedback uses a small custom toast system (no browser alerts).
