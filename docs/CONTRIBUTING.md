# Contributing to TaskFlow

Thanks for helping with TaskFlow! This guide explains how our team works.
We follow **GitHub Flow**: there is one `main` branch that must always stay
stable, and every change is made on its own short-lived branch.

## Getting started

1. Clone the repository (see [SETUP.md](SETUP.md)).
2. Open `index.html` in your browser and check that the app works.

## Workflow

1. Update your local `main`:
```bash
   git checkout main && git pull origin main
```
2. Create a branch for your change:
```bash
   git checkout -b feature/short-name
```
3. Make small, focused commits.
4. Push your branch:
```bash
   git push -u origin feature/short-name
```
5. Open a Pull Request into `main` and fill in the PR template.
   Link the related issue with `Closes #<number>`.
6. Ask at least one teammate for a review.
7. Fix feedback by pushing more commits to the same branch.
8. After the PR is merged, delete the branch and pull `main` again.

**Never push directly to `main`.**

## Branch names

Use a prefix and a short, lowercase name with hyphens:

| Prefix | Use for | Example |
|---|---|---|
| `feature/` | new functionality | `feature/search-filter` |
| `fix/` | bug fixes | `fix/save-error` |
| `docs/` | documentation only | `docs/contributing` |
| `refactor/` | code restructuring | `refactor/render-tasks` |
| `chore/` | maintenance | `chore/update-gitignore` |

## Commit messages

Format: `<type>: <short description>`, optionally with a scope:
`<type>(<scope>): <short description>`.

| Type | Meaning |
|---|---|
| `feat` | a new feature |
| `fix` | a bug fix |
| `docs` | documentation changes |
| `style` | formatting or styling, no logic change |
| `refactor` | code restructuring |
| `test` | adding or changing tests |
| `chore` | maintenance tasks |

Example:

```
feat: add search and status filtering logic

Search and the All/Pending/Completed filter work together
and never change the stored tasks.

Closes #13
```

## Pull requests

- Keep each PR small and focused on one thing.
- Explain what you changed and why.
- At least **1 approving review** is required before merging.
- Nobody can approve their own PR.
- Do not approve a PR that still has merge conflicts.

### If your PR has conflicts

1. Bring the latest `main` into your branch:
```bash
   git fetch origin
   git merge origin/main
```
2. Resolve each conflict by hand and keep the work from both sides.
   Never take a whole file from only one side, or you will delete
   your teammates' changes.
3. Test the app again, then push.

## Reviewing

- Be constructive and respectful, focus on code quality and not personal style.
- Ask when something is unclear.
- Test the change locally when possible:
```bash
  git fetch origin pull/<number>/head:pr-<number>
  git checkout pr-<number>
```
- Choose **Comment** for feedback, **Approve** when it is ready,
  **Request changes** when something must be fixed before merging.

## Testing checklist

Before opening a PR, check manually in the browser:

- [ ] Add, edit, complete and delete a task
- [ ] Tasks are still there after reloading the page
- [ ] Search, status and category filters work together
- [ ] The layout works on a small (mobile) screen
- [ ] No errors in the browser console

## Issues

- Use clear titles, for example "Add task priority system".
- Add a label (for example `enhancement`), an assignee and a milestone.
- Describe the problem and list acceptance criteria as a checklist.

## Code guidelines

- Add comments that explain **why**, not only what.
- Always escape user text with `escapeHtml()` before inserting it into HTML.
- Element ids in `index.html` are used by `scripts/app.js`. Do not rename
  them without updating the script.

## Questions

Ask in the team chat or open an issue.
