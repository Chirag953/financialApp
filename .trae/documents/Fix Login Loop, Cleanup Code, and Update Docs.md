I will fix the persistent admin login loop by ensuring cookies are correctly set for your environment and cleaning up the codebase.

### **1. Fix Login Loop & Cookie Security**
- **Update `src/app/api/auth/login/route.ts`**: 
  - Explicitly set cookie path to `/` to ensure it's readable on all routes.
  - Relax the `secure` flag to allow login on local HTTP environments (fixing the "cookie drop" issue).
  - Set `SameSite` to `Lax` for better compatibility.

### **2. Remove Unused Code**
- **Clean `src/lib/auth.ts`**: Remove the unused `login`, `logout`, and `updateSession` functions, as these operations are now handled by the API routes.
- **Verify Middleware**: Ensure no conflicting `middleware.ts` exists (since you are using `proxy.ts`).

### **3. Update Documentation**
- **Update `ISSUE_TRACKING.md`**: Record the final login fix and code cleanup.
- **Update `docs/prd.md`**: Update the "Project Structure" section to reflect the actual file layout (renaming `middleware.ts` to `proxy.ts` and correcting the auth route structure).
