# 🔐 ARCHITECTURAL SECURITY REMEDIATION PLAN
**Project**: BuildMyBot (pocket-ai-pros)
**Assessment Date**: 2025-11-16
**Severity Levels**: 🔴 CRITICAL | 🟠 HIGH | 🟡 MEDIUM | 🟢 LOW

---

## 📊 EXECUTIVE SUMMARY

**Total Vulnerabilities Found**: 5
- 🔴 **CRITICAL**: 3 (Immediate action required)
- 🟠 **HIGH**: 2 (Address within 24 hours)
- 🟡 **MEDIUM**: 0
- 🟢 **LOW**: 0

**Business Impact**:
- **Data Breach Risk**: HIGH - Production database credentials exposed in source control
- **Financial Risk**: HIGH - Live Stripe payment keys compromised
- **Availability Risk**: MEDIUM - Edge Functions will fail due to missing configuration
- **Compliance Risk**: HIGH - PCI-DSS, GDPR violations if credentials are public

**Estimated Remediation Time**: 2-4 hours (excluding key rotation propagation)

---

## 🔴 CRITICAL SEVERITY ISSUES

### CRITICAL-1: Production Supabase Credentials Exposed in .env.example

**Severity**: 🔴 CRITICAL
**CVSS Score**: 9.8 (Critical)
**Files Affected**:
- `.env.example:9-10`
- `.env:4-5` (should never be committed, but contains same real keys)

**Vulnerability Description**:
Real production Supabase credentials are hardcoded in the repository template file `.env.example`. This means:
1. Anyone cloning the repository gets full database access
2. All forks/copies inherit these credentials
3. Public repositories expose credentials to the internet
4. PR reviews reveal credentials in diffs

**Current Exposed Values**:
```env
VITE_SUPABASE_URL=https://mnklzzundmfwjnfaoqju.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ua2x6enVuZG1md2puZmFvcWp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyOTMxNzAsImV4cCI6MjA3ODg2OTE3MH0._8NrrFTvjF1VmDWFubLOXc4jJ1SC_AM_Z3vkSiuUYnI
```

**Attack Vector**:
```bash
# Attacker scenario:
git clone <your-repo>
cat .env.example
# Attacker now has:
# - Database URL
# - Anon key for API access
# - Can read/write based on RLS policies
# - Can potentially exploit misconfigured RLS
```

**Immediate Actions** (Complete in next 30 minutes):

1. **Rotate Supabase Anon Key**:
   ```
   1. Go to: https://supabase.com/dashboard/project/mnklzzundmfwjnfaoqju/settings/api
   2. Click "Reset anon key" (or regenerate)
   3. Copy new key to your secure password manager
   4. Update .env file locally (DO NOT COMMIT)
   ```

2. **Update .env.example with Placeholders**:
   ```env
   # Replace lines 9-10 in .env.example:
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

3. **Audit Git History**:
   ```bash
   # Check if .env was ever committed
   git log --all --full-history -- .env

   # Check all commits touching .env.example
   git log --all --oneline -- .env.example

   # If found, check if pushed to remote
   git log --all --remotes --oneline -- .env
   ```

4. **If Pushed to Public Repository**:
   - Treat as **DATA BREACH**
   - Follow incident response procedures
   - Audit all database tables for unauthorized access
   - Review Supabase logs for suspicious queries
   - Consider notifying users if PII accessed

**Long-term Prevention**:
- Add pre-commit hook to prevent real credentials:
  ```bash
  # .git/hooks/pre-commit
  #!/bin/sh
  if git diff --cached .env.example | grep -E "mnklzzundmfwjnfaoqju|eyJhbGc"; then
    echo "ERROR: Real credentials detected in .env.example"
    exit 1
  fi
  ```

---

### CRITICAL-2: Missing Server-Side Environment Variables for Edge Functions

**Severity**: 🔴 CRITICAL
**CVSS Score**: 7.5 (High - Availability Impact)
**Files Affected**:
- `.env.example` (missing required variables)
- `supabase/functions/process-reseller-application/index.ts:18-19`
- All Edge Functions that need database access

**Vulnerability Description**:
The Edge Function `process-reseller-application` expects server-side environment variables that are **not documented** in `.env.example`:

```typescript
// supabase/functions/process-reseller-application/index.ts:18-19
const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',           // ❌ NOT in .env.example
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '' // ❌ NOT in .env.example
);
```

**Impact**:
1. Function will initialize with empty strings → all database operations fail
2. Reseller applications cannot be processed
3. Silent failures if error handling is insufficient
4. Production deployments following `.env.example` will break

**Current Behavior**:
```javascript
// What happens when env vars are missing:
createClient('', '') // ← Creates invalid client
  .from('reseller_applications')
  .insert({...}) // ← Returns error: "Invalid URL"
```

**Remediation Steps**:

1. **Add Server-Side Variables to .env.example**:
   ```env
   # Add after line 66 in .env.example:

   # =============================================================================
   # SUPABASE SERVER-SIDE CONFIGURATION (Edge Functions Only)
   # =============================================================================
   # CRITICAL SECURITY NOTES:
   # 1. These variables are for Supabase Edge Functions (Deno runtime) ONLY
   # 2. NEVER add VITE_ prefix - that exposes them to the browser
   # 3. Set these in: Supabase Dashboard → Edge Functions → Settings → Secrets
   # 4. The service role key has ADMIN access - protect it like a root password
   # =============================================================================

   # Server-side Supabase URL (same as VITE_SUPABASE_URL but without VITE_ prefix)
   SUPABASE_URL=https://your-project-ref.supabase.co

   # Service Role Key - ADMIN ACCESS - NEVER EXPOSE TO CLIENT
   # Get from: https://supabase.com/dashboard/project/<your-ref>/settings/api
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```

2. **Configure in Supabase Dashboard**:
   ```
   1. Go to: https://supabase.com/dashboard/project/mnklzzundmfwjnfaoqju/functions
   2. Click "Edge Functions" → "Settings" → "Secrets"
   3. Add:
      - Key: SUPABASE_URL
        Value: https://mnklzzundmfwjnfaoqju.supabase.co

      - Key: SUPABASE_SERVICE_ROLE_KEY
        Value: <your-service-role-key>
   4. Click "Save"
   ```

3. **Verify Other Edge Functions**:
   ```bash
   # Search for other functions using these vars
   grep -r "Deno.env.get" supabase/functions/

   # Check each function's env requirements
   ```

4. **Add Validation to Edge Functions**:
   ```typescript
   // Add at the top of each Edge Function
   const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
   const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

   if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
     console.error('Missing required environment variables');
     return new Response(
       JSON.stringify({ error: 'Server configuration error' }),
       { status: 500, headers: corsHeaders }
     );
   }
   ```

**Testing**:
```bash
# Local testing with Supabase CLI
supabase functions serve process-reseller-application --env-file .env

# Invoke function
curl -X POST http://localhost:54321/functions/v1/process-reseller-application \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","company":"Test Inc"}'
```

---

### CRITICAL-3: Production Stripe Live Key Exposed

**Severity**: 🔴 CRITICAL
**CVSS Score**: 9.1 (Critical - Financial Impact)
**Files Affected**:
- `.env:16` (if ever committed)
- `.env.example:16` (contains template, but verify)

**Vulnerability Description**:
Your `.env` file contains a live Stripe publishable key:
```env
VITE_STRIPE_PUBLIC_KEY="pk_live_51SJs8uEgFdyBUl5u9sBcDheJLNcVaX6PXIrq4IIpuwNpjVrpKOluMVnSrleIgAOdGx7Fq91Zh9044GJ1Rk4NeV0200Nj8rKe0h"
```

While publishable keys are meant to be public (they're sent to browsers), if the `.env` file was ever committed, the repository also contains:
- Your project structure
- Potentially secret keys nearby
- Information that aids targeted attacks

**Risk Assessment**:
- Publishable keys alone: **MEDIUM** risk (intended for client-side)
- Publishable key + source code: **HIGH** risk (reveals integration patterns)
- If secret key also exposed: **CRITICAL** risk (full payment access)

**Immediate Actions**:

1. **Verify .env is NOT in Git History**:
   ```bash
   # Check if .env was ever committed
   git log --all --full-history --oneline -- .env

   # If any results appear:
   git show <commit-hash>:.env
   ```

2. **If .env Was Committed and Contains Stripe Secret Key**:
   ```
   ⚠️  EMERGENCY PROCEDURE:

   1. IMMEDIATELY roll the Stripe secret key:
      https://dashboard.stripe.com/apikeys

   2. Audit all Stripe transactions from exposure time to now:
      https://dashboard.stripe.com/payments

   3. Check for:
      - Unauthorized refunds
      - Suspicious test mode switches
      - Webhook endpoint changes

   4. Contact Stripe support if suspicious activity found
   ```

3. **Update .env.example**:
   ```env
   # Verify line 16 in .env.example is a placeholder:
   VITE_STRIPE_PUBLIC_KEY=pk_live_REPLACE_ME  # ✅ Correct
   # NOT:
   VITE_STRIPE_PUBLIC_KEY=pk_live_51SJs8u... # ❌ Wrong
   ```

4. **Verify .gitignore**:
   ```bash
   # Confirm .env is ignored (it is, but double-check)
   git check-ignore .env
   # Should output: .env

   # If not, add to .gitignore:
   echo ".env" >> .gitignore
   git add .gitignore
   git commit -m "Ensure .env is ignored"
   ```

---

## 🟠 HIGH SEVERITY ISSUES

### HIGH-1: Database Connection String Pattern Exposed

**Severity**: 🟠 HIGH
**CVSS Score**: 6.5 (Medium)
**Files Affected**:
- `.env.example:104`
- `supabase/config.toml:1`

**Vulnerability Description**:
The `.env.example` reveals your production database URL pattern:
```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.mnklzzundmfwjnfaoqju.supabase.co:5432/postgres
```

Additionally, `supabase/config.toml` contains:
```toml
project_id = "mnklzzundmfwjnfaoqju"
```

**Risk**:
- Reveals database host location
- Confirms Supabase infrastructure
- Aids in targeted attacks (e.g., port scanning, Supabase API exploitation)
- Leaks project ID (used in Supabase API endpoints)

**Remediation**:

1. **Sanitize .env.example**:
   ```env
   # Replace line 104:
   DATABASE_URL=postgresql://postgres:[PASSWORD]@db.your-project-ref.supabase.co:5432/postgres
   ```

2. **Evaluate supabase/config.toml**:
   ```toml
   # Option 1: Use placeholder
   project_id = "your-project-id"

   # Option 2: Gitignore it (if config is deployment-specific)
   # Add to .gitignore:
   supabase/config.toml

   # Then create supabase/config.toml.example:
   project_id = "your-project-id"
   ```

3. **Decision Matrix**:
   | Approach | Pros | Cons |
   |----------|------|------|
   | Commit with real project_id | Easy deployment, single source of truth | Reveals Supabase project |
   | Use placeholder | Security through obscurity | Requires manual config per deployment |
   | Gitignore config.toml | Most secure | More setup friction |

**Recommendation**: If deploying to Supabase directly (not self-hosting), the `config.toml` with project_id is required. **Keep it** but understand the tradeoff. Rotate credentials frequently to mitigate risk.

---

### HIGH-2: Build Artifacts May Contain Historical Secrets

**Severity**: 🟠 HIGH
**CVSS Score**: 7.0 (High)
**Files Affected**:
- `dist/` directory (if historically committed)

**Vulnerability Description**:
While `dist/` is currently in `.gitignore`, if it was **ever committed** in the past, those commits contain:
- Compiled JavaScript with environment variables baked in
- Sourcemaps revealing original code structure
- Any secrets present at build time

**Current State**:
- ✅ `dist/` is in `.gitignore` (line 11)
- ❓ Unknown if previously committed

**Investigation Steps**:

```bash
# 1. Check if dist/ was ever tracked
git log --all --full-history --oneline -- dist/

# 2. If results appear, check specific files
git log --all --full-history --oneline -- dist/assets/*.js

# 3. View a historical build artifact
git show <commit-hash>:dist/assets/index-*.js | grep -i "supabase\|stripe\|api"
```

**If dist/ Was Found in History**:

**⚠️  CRITICAL REMEDIATION REQUIRED**:

```bash
# OPTION 1: Remove dist/ from all history (DESTRUCTIVE)
# Backup your repo first!
git clone <your-repo> <your-repo-backup>

# Remove dist/ from all commits
git filter-branch --force --index-filter \
  "git rm -rf --cached --ignore-unmatch dist/" \
  --prune-empty --tag-name-filter cat -- --all

# Force push (coordinate with team!)
git push origin --force --all
git push origin --force --tags

# OPTION 2: Use BFG Repo-Cleaner (faster, safer)
# https://rtyley.github.io/bfg-repo-cleaner/
java -jar bfg.jar --delete-folders dist --no-blob-protection
git reflog expire --expire=now --all && git gc --prune=now --aggressive
git push origin --force --all
```

**If Clean (No dist/ in History)**:
- ✅ No action required
- 📋 Document in runbook: "Never commit dist/"
- 🤖 Add pre-commit hook to prevent:
  ```bash
  # .git/hooks/pre-commit
  #!/bin/sh
  if git diff --cached --name-only | grep -q "^dist/"; then
    echo "ERROR: Attempting to commit dist/ directory"
    echo "Run: git reset HEAD dist/"
    exit 1
  fi
  ```

**Deployment Best Practice**:
```yaml
# CI/CD pipeline (e.g., GitHub Actions, Vercel, Netlify)
# Never commit dist/, always build fresh:

build:
  script:
    - npm ci
    - npm run build
  artifacts:
    paths:
      - dist/
    expire_in: 1 hour  # Don't persist artifacts long-term
```

---

## 📋 PRIORITIZED ACTION PLAN

### Phase 1: IMMEDIATE (Next 30 minutes)

| # | Action | File | Severity | Est. Time |
|---|--------|------|----------|-----------|
| 1 | Rotate Supabase anon key | Supabase Dashboard | 🔴 CRITICAL | 5 min |
| 2 | Replace real credentials in `.env.example` | `.env.example:9-10` | 🔴 CRITICAL | 2 min |
| 3 | Check if `.env` is in git history | Terminal | 🔴 CRITICAL | 5 min |
| 4 | Verify Stripe keys not exposed | Git history | 🔴 CRITICAL | 5 min |
| 5 | Update local `.env` with new keys | `.env` | 🔴 CRITICAL | 2 min |

**Commands**:
```bash
# Run these now:
git log --all --full-history --oneline -- .env
git log --all --full-history --oneline -- dist/
git show HEAD:.env.example | grep -i "mnklzzundmfwjnfaoqju"
```

---

### Phase 2: URGENT (Next 2 hours)

| # | Action | File | Severity | Est. Time |
|---|--------|------|----------|-----------|
| 6 | Add server-side env vars to `.env.example` | `.env.example` | 🔴 CRITICAL | 10 min |
| 7 | Configure Edge Function secrets | Supabase Dashboard | 🔴 CRITICAL | 10 min |
| 8 | Test Edge Function with new config | Terminal | 🔴 CRITICAL | 15 min |
| 9 | Sanitize database URL in `.env.example` | `.env.example:104` | 🟠 HIGH | 5 min |
| 10 | Audit git history for dist/ | Terminal | 🟠 HIGH | 20 min |
| 11 | Create pre-commit hooks | `.git/hooks/` | 🟠 HIGH | 15 min |

---

### Phase 3: SHORT-TERM (Next 24 hours)

| # | Action | Severity | Est. Time |
|---|--------|----------|-----------|
| 12 | Review all RLS policies in Supabase | 🟠 HIGH | 30 min |
| 13 | Audit Supabase logs for suspicious activity | 🟠 HIGH | 30 min |
| 14 | Set up secret scanning (e.g., GitGuardian) | 🟡 MEDIUM | 45 min |
| 15 | Document secure deployment process | 🟡 MEDIUM | 60 min |
| 16 | Train team on secrets management | 🟡 MEDIUM | 30 min |

---

### Phase 4: LONG-TERM (Next 30 days)

| # | Action | Severity | Est. Time |
|---|--------|----------|-----------|
| 17 | Implement HashiCorp Vault or AWS Secrets Manager | 🟡 MEDIUM | 8 hours |
| 18 | Set up automated credential rotation | 🟡 MEDIUM | 4 hours |
| 19 | Add security testing to CI/CD | 🟡 MEDIUM | 6 hours |
| 20 | Conduct full security audit | 🟢 LOW | 16 hours |

---

## 🛠️ REMEDIATION SCRIPTS

### Script 1: Sanitize .env.example

```bash
#!/bin/bash
# File: scripts/sanitize-env-example.sh

set -e

echo "🔧 Sanitizing .env.example..."

# Backup original
cp .env.example .env.example.backup

# Replace real Supabase URL with placeholder
sed -i 's|https://mnklzzundmfwjnfaoqju\.supabase\.co|https://your-project-ref.supabase.co|g' .env.example

# Replace real anon key with placeholder
sed -i 's|eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[^"]*|your-anon-key-here|g' .env.example

# Add server-side env vars if not present
if ! grep -q "SUPABASE_SERVICE_ROLE_KEY" .env.example; then
  cat >> .env.example << 'EOF'

# =============================================================================
# SUPABASE SERVER-SIDE CONFIGURATION (Edge Functions Only)
# =============================================================================
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
EOF
fi

echo "✅ .env.example sanitized"
echo "📋 Backup saved to: .env.example.backup"
echo "👀 Review changes: git diff .env.example"
```

---

### Script 2: Pre-commit Hook

```bash
#!/bin/bash
# File: .git/hooks/pre-commit
# Make executable: chmod +x .git/hooks/pre-commit

set -e

echo "🔍 Running pre-commit security checks..."

# Check for .env file
if git diff --cached --name-only | grep -q "^\.env$"; then
  echo "❌ ERROR: Attempting to commit .env file"
  echo "Run: git reset HEAD .env"
  exit 1
fi

# Check for dist/ directory
if git diff --cached --name-only | grep -q "^dist/"; then
  echo "❌ ERROR: Attempting to commit dist/ directory"
  echo "Run: git reset HEAD dist/"
  exit 1
fi

# Check for real credentials in .env.example
if git diff --cached .env.example | grep -qE "mnklzzundmfwjnfaoqju|eyJhbGc"; then
  echo "❌ ERROR: Real credentials detected in .env.example"
  echo "Replace with placeholders before committing"
  exit 1
fi

# Check for Stripe live keys
if git diff --cached | grep -qE "sk_live_|pk_live_[0-9A-Za-z]{99}"; then
  echo "⚠️  WARNING: Possible Stripe live key detected"
  echo "Ensure you're committing placeholders, not real keys"
  read -p "Continue? (y/N) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

echo "✅ Pre-commit checks passed"
```

---

### Script 3: Verify Edge Function Configuration

```bash
#!/bin/bash
# File: scripts/verify-edge-function-config.sh

set -e

PROJECT_ID="mnklzzundmfwjnfaoqju"
FUNCTION_NAME="process-reseller-application"

echo "🔍 Verifying Edge Function configuration..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
  echo "❌ Supabase CLI not installed"
  echo "Install: npm install -g supabase"
  exit 1
fi

# Check local .env file
if [ ! -f .env ]; then
  echo "❌ .env file not found"
  exit 1
fi

# Check for required variables
REQUIRED_VARS=("SUPABASE_URL" "SUPABASE_SERVICE_ROLE_KEY")
for VAR in "${REQUIRED_VARS[@]}"; do
  if ! grep -q "^${VAR}=" .env; then
    echo "❌ Missing required variable: ${VAR}"
    exit 1
  fi
done

echo "✅ Local configuration verified"

# Test function locally
echo "🧪 Testing function locally..."
supabase functions serve $FUNCTION_NAME --env-file .env &
SERVE_PID=$!

sleep 5

# Send test request
curl -X POST http://localhost:54321/functions/v1/$FUNCTION_NAME \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "company": "Test Inc",
    "phone": "555-0100",
    "experience": "5 years",
    "expectedClients": 10
  }' | jq

kill $SERVE_PID

echo "✅ Edge Function test complete"
```

---

## 📊 COMPLIANCE IMPACT

### GDPR (EU General Data Protection Regulation)

| Requirement | Current Status | Impact |
|-------------|---------------|--------|
| Data breach notification (72h) | ⚠️ REQUIRED if credentials public | Article 33 violation |
| Security of processing | ❌ FAILING | Article 32 violation |
| Data protection by design | ❌ FAILING | Article 25 violation |

**Action**: If repository is public or was ever public, **legal review required**.

---

### PCI-DSS (Payment Card Industry Data Security Standard)

| Requirement | Current Status | Impact |
|-------------|---------------|--------|
| Protect stored cardholder data | ⚠️ AT RISK | Requirement 3 |
| Encrypt transmission of cardholder data | ✅ PASSING | Requirement 4 |
| Protect all systems against malware | 🟡 PARTIAL | Requirement 5 |
| Develop and maintain secure systems | ❌ FAILING | Requirement 6 |

**Action**: If Stripe secret key was exposed, **PCI incident response required**.

---

## 🎯 SUCCESS CRITERIA

You will have successfully remediated these vulnerabilities when:

- [ ] No real credentials in `.env.example` (placeholders only)
- [ ] Supabase anon key rotated and new key in use
- [ ] Server-side env vars documented in `.env.example`
- [ ] Edge Function secrets configured in Supabase Dashboard
- [ ] Edge Functions tested and operational
- [ ] Git history audited for exposed secrets
- [ ] Pre-commit hooks installed and tested
- [ ] Database URL sanitized in `.env.example`
- [ ] Team trained on secrets management
- [ ] Documentation updated with security best practices

---

## 📞 SUPPORT & ESCALATION

| Issue Type | Contact | SLA |
|-----------|---------|-----|
| Supabase credentials | security@supabase.com | 4 hours |
| Stripe payment security | https://support.stripe.com | 2 hours |
| General security questions | Your security team | 24 hours |
| Legal/compliance | Your legal counsel | Immediate |

---

## 📚 ADDITIONAL RESOURCES

1. **Supabase Security Best Practices**
   https://supabase.com/docs/guides/platform/going-into-prod#security

2. **Stripe Security**
   https://stripe.com/docs/security

3. **OWASP Secret Management**
   https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html

4. **Git Secrets Prevention**
   https://github.com/awslabs/git-secrets

5. **BFG Repo-Cleaner**
   https://rtyley.github.io/bfg-repo-cleaner/

---

## 📝 CHANGELOG

| Date | Action | Status |
|------|--------|--------|
| 2025-11-16 | Initial security assessment | ⏳ In Progress |
| TBD | Phase 1 remediation complete | ⏳ Pending |
| TBD | Phase 2 remediation complete | ⏳ Pending |
| TBD | Final security verification | ⏳ Pending |

---

**Next Steps**: Begin Phase 1 immediately. Update this document as you complete each action item.
