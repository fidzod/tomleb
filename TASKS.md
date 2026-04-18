# Tasks

## Backlog
### Feature
- [ ] (#11) Re-sharing
- [ ] (#05) Long form posts
- [ ] (#13) Views
- [ ] (#14) Pagination
- [ ] (#15) Following

### Fix
- [ ] (#06, #client) Mobile nav incomplete
- [ ] (#08, #server, !) Input validation is missing everywhere (zod?)

### Refactor
- [ ] (#07, #client) Current user is not typed

## In Progress
- [ ] (#04) Comments
    - UX Flow:
        - Top level comments appear as a flat list below a post.
        - Each comment has a comments button - this is for replies.
        - When you click this button inline reply composer expands
        - (anchored to that comment).
        - Replies to a comment are shown indented once beneath it.
        - Replies to replies do not create further nesting - they
        - append to the same indented thread under the original comment
        - but they are grouped and have a "replying to" label.
    - Routes:
        - GET /posts/?postId= A single post (for post page)
        - GET /posts/:postId/comments Comments for a post with all replies
        - POST /posts/:postId/comments Create a top-level comment
        - POST /posts/comments/:commentId/replies Create a reply
    - Sub Tasks:
        - [x] Server
        - Client
            - [ ] Post page
            - [ ] Show comments
            - [ ] Post comment
            - [ ] Show replies
            - [ ] Post replies

## Done
### Feature 
- [x] (#10) Likes

### Refactor
- [x] (#12, #server, !) Server is missing types (e.g. for user)
- [x] (#09, #server) Clean up get posts route
- [x] (#03, #server) updateBanner should be integrated into /update 
    - Likewise /updateAvatar should be a part of a /updateUser
- [x] (#02, #server) loggedIn route should really be called /me
- [x] (#01, #server) User profile fields belong in a seperate table
- [x] (#00) Make TASKS.md

