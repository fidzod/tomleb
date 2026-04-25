# Tasks

## Backlog
### Feature
- [ ] (#13) Views
- [ ] (#15) Following
- [ ] (#14) Pagination (feeds and comments)
- [ ] (#05) Long form posts
- [ ] (#16) Location tagging on posts
- [ ] (#17) Public vs. friends posts (requires: #15)

### Fix
- [ ] (#08, #server, !) Input validation is missing everywhere (zod?)

### Refactor
- [ ] (#07, #client) Current user is not typed

## In Progress
### Fix
- [ ] (#06, #client, !) Mobile nav incomplete

### Feature
- [ ] (#11) Re-sharing

## Done
### Feature 
- [x] (#04) Comments
- [x] (#10) Likes

### Refactor
- [x] (#12, #server, !) Server is missing types (e.g. for user)
- [x] (#09, #server) Clean up get posts route
- [x] (#03, #server) updateBanner should be integrated into /update 
    - Likewise /updateAvatar should be a part of a /updateUser
- [x] (#02, #server) loggedIn route should really be called /me
- [x] (#01, #server) User profile fields belong in a seperate table
- [x] (#00) Make TASKS.md

