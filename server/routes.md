# Routes

## Auth

- POST /auth/register
- POST /auth/login
- POST /auth/logout
- GET /me

## User

- PATCH /user - update avatar, username, displayName

## Profile

- GET /profile/:username
- PATCH /profile - update banner, bio, location

## Posts

- POST /posts - create a post
- GET /posts - get all posts
    - optional parameters: username, postId
- POST /:postId/like - like a post
- DELETE /:postId/like - unlike a post
- GET /:postId/comments - get all comments for a post with their replies
- POST /:postId/comments - create top-level comment

## Comments

- POST /comments/:commentId/replies - reply to a comment
- POST /comments/:commentId/like - like a comment
- DELETE /comments/:commentId/like - unlike a comment
