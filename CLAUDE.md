# Claude Configuration

This a react application for enhancing vocabulary.

Don't look at the node modules during the planning stage. Only rely on the code. In case you need to know a library behavior search online.

# Workflow

### Git and github
- Use github MCP to make a PR;
- Never include testing plan to Github description;
- Make PR description and commit messages short and concise. Only include what has been changed;
- If you see changes in CLAUDE.md include them to commit. CLAUDE.md is committable and stored inside git

### Component Design
- Keep components extremely simple
- Place all logic in **hooks**, **services**, or **store**
- Cover all the business logic with unit tests
- Keep business logic related to components in hook. User services only for reusable business logic (authentication)

### I8N
- Whenever you add new text to the UI, make sure to add its translation to i18n as well. Avoid displaying untranslated text directly on the screen.

### Unit Testing
- Cover added business logic with unit tests
- Ensure tests pass before committing
- Be pragmatic—focus on testing the core business logic
- Avoid over-testing; keep tests concise and meaningful
- Don't render components in the tests. Focus on testing hooks.

### Async Operations
- Use **Redux Thunk** for async API calls

### Verification
- After finishing a feature, test it in the browser to ensure correct operation
- For sign in use the following credentials: `claude@gmail.com` and `Password1!`

## Testing

Please use playwright MCP to test any feature you are adding. Rely on it and test user to manipulate with browser and test you implementation. Fix when something is broken

## Project commands
- **Test**: `npm test`
- **Build**: `npm run build`
- **Lint**: `npm run lint`
- **Start dev server**: `npm run dev`
- **Start production server**: `npm start` (serves built files)

## Preferences
- Use conventional commit messages
- Auto-format code before committing