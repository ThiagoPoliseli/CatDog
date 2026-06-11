---
name: makuco-security-review
description: "Security vulnerability review skill. Use when reviewing code for security issues, validating authentication and authorization controls, checking for injection vulnerabilities, auditing sensitive data handling, or validating compliance with OWASP Top 10. Triggers on: security review, vulnerability check, OWASP, injection, auth review, sensitive data, security audit, secure code, hardcoded secret, XSS, SQL injection, access control."
argument-hint: "Optional: specify a file path, module, or concern to focus on (e.g. 'review auth module', 'check for injection in payment service')"
---

# Skill: Security Review

## Overview

When reviewing code for security, apply this checklist systematically. Every concern must be evaluated — do not skip sections because they seem unlikely. Report every finding with severity, evidence (file + line), and a concrete recommendation.

---

## 1. OWASP Top 10 Checklist

Apply each item to every changed file and any file that the change depends on.

### A01 — Broken Access Control

- Every resource and action has an explicit authorization check.
- No IDOR (Insecure Direct Object Reference): resource identifiers are validated against the requesting user's permissions, not just existence.
- Horizontal privilege escalation is impossible: user A cannot access user B's data.
- Vertical privilege escalation is impossible: low-privilege users cannot reach admin-only operations.
- Access control is enforced server-side; never rely solely on client-side hiding.

### A02 — Cryptographic Failures

- No sensitive data (passwords, tokens, PII, financial data) stored or transmitted in plaintext.
- No hardcoded secrets, passwords, API keys, or tokens anywhere in code or config files.
- Passwords hashed with a strong adaptive algorithm (bcrypt, Argon2, scrypt) — never MD5 or SHA-1.
- Encryption uses strong, current algorithms (AES-256, RSA-2048+, TLS 1.2+).
- Cryptographic keys and secrets are loaded from environment variables or secret vaults — never from the codebase.

### A03 — Injection

- All user-supplied input that reaches a database uses parameterized queries or a safe ORM abstraction — no string interpolation in SQL.
- NoSQL queries do not allow operator injection (`$where`, `$gt` with untrusted input).
- Shell/command execution never concatenates user input directly.
- Template engines have auto-escaping enabled; user input is never rendered as raw HTML without explicit, justified sanitization.
- Log statements never interpolate raw user input (log injection / forged log entries).
- XML/JSON parsers have external entity resolution disabled (XXE prevention).

### A04 — Insecure Design

- Rate limiting is applied to sensitive endpoints (auth, password reset, OTP verification).
- Business logic cannot be bypassed by replaying requests or skipping validation steps.
- Negative flows (cancel, fail, timeout) are explicitly handled and do not leave resources in an inconsistent state.
- Sensitive operations (delete, transfer, promote) require appropriate confirmation or second-factor validation.

### A05 — Security Misconfiguration

- Debug mode, verbose error pages, and stack traces are not exposed to end users.
- Default credentials are not present in any configuration.
- CORS policy is explicit and restrictive — not `*` for credentialed requests.
- Security headers are present where applicable (Content-Security-Policy, X-Frame-Options, etc.).
- No sensitive information in error messages returned to clients.

### A06 — Vulnerable and Outdated Components

- No newly introduced dependency has a known critical CVE (verify against the project's lock file and any configured SCA tool).
- Dependencies are pinned to specific versions — no `*` or `latest` in production manifests.
- Flag any dependency that was not present before the change and document its purpose.

### A07 — Identification and Authentication Failures

- Session tokens have sufficient entropy and are invalidated on logout and privilege change.
- Password reset flows are time-limited, single-use, and do not leak user existence via different responses.
- Multi-factor authentication is not accidentally bypassed by the change.
- JWT claims (exp, iss, aud) are validated; the `none` algorithm is rejected.
- Authentication state is not stored in client-controllable storage without integrity protection.

### A08 — Software and Data Integrity Failures

- Deserialization of untrusted input does not instantiate arbitrary objects.
- File uploads validate type by content (magic bytes), not just extension or MIME header.
- Integrity of externally fetched resources (CDN, webhooks) is verified where feasible.

### A09 — Security Logging and Monitoring Failures

- Security-relevant events are logged: auth success/failure, privilege changes, access denied, data mutations on sensitive entities.
- Logs do not contain PII, passwords, tokens, or secrets.
- Log entries include enough context (timestamp, user id, IP, operation) to support incident investigation.
- Logging failures do not silently swallow errors.

### A10 — Server-Side Request Forgery (SSRF)

- URLs constructed from user input are validated against an explicit allowlist of schemes and hosts.
- Internal metadata endpoints (cloud provider IMDS, localhost, 169.254.x.x) are unreachable via user-controlled URLs.
- DNS rebinding mitigations are in place if the application resolves user-supplied hostnames.

---

## 2. Secure Coding Patterns

### Input Validation

- Validate at every system boundary (HTTP endpoints, message consumers, file parsers, webhook receivers).
- Use allowlists over denylists: define what is valid, reject everything else.
- Reject or truncate inputs that exceed expected length, type, or range.
- Never trust data that comes from the client, even if it was sent by your own frontend.

### Output Encoding

- HTML output: encode for the specific context (HTML body, attribute, JS, CSS, URL).
- JSON APIs: use structured serialization — never build JSON by string concatenation.
- URLs: percent-encode dynamic values; validate scheme before redirecting.

### Secrets Management

- Secrets are read from environment variables or a secret manager at runtime.
- Secrets are never logged, included in error messages, or serialized into responses.
- `.env` files with real secrets are never committed; `.env.example` contains only placeholder values.

### Error Handling

- Catch blocks do not swallow exceptions silently — log with context, then rethrow or convert.
- Error responses to clients contain a reference ID, not an internal stack trace or database error.
- All error paths release acquired resources (connections, locks, file handles).

### Least Privilege

- Code requests only the permissions it needs (DB roles, IAM policies, OS file permissions).
- Temporary elevated permissions are revoked immediately after use.

---

## 3. Review Procedure

Follow this order for every security review:

1. **Identify trust boundaries** — find every point where data crosses a trust boundary: HTTP handler, message consumer, file read, inter-service call, DB query, external API call.
2. **Check A03 (Injection) at every boundary** — this is the highest-frequency vulnerability class.
3. **Check A01 (Access Control)** — every handler must have an explicit auth/authz check before processing data.
4. **Check A02 (Cryptographic Failures)** — scan for hardcoded secrets, plaintext storage, and weak algorithms.
5. **Check A05 (Misconfiguration)** — look for debug flags, verbose error output, and permissive CORS.
6. **Check remaining OWASP items** — A04, A07, A08, A09, A10, A06.
7. **Check Secure Coding Patterns** — input validation, output encoding, secrets management, error handling, least privilege.
8. **Compile findings** — for each finding, record: severity, OWASP reference (if applicable), file + line, description, and recommendation.

---

## 4. Severity Classification

| Severity   | Criteria                                                                                             |
|------------|------------------------------------------------------------------------------------------------------|
| **Critical** | Directly exploitable: allows data exfiltration, auth bypass, code execution, or privilege escalation without prerequisites. Must be fixed before the task is closed. |
| **Major**    | Security weakness requiring specific conditions to exploit, or a control gap that reduces defense-in-depth. Must be fixed before the task is closed. |
| **Minor**    | Hardening improvement that reduces attack surface without a direct exploitation path. Should be fixed but does not block task closure. |
| **Suggestion** | Best practice not currently violated; recommended to improve long-term security posture. |

---

## 5. Reporting Format

For each finding, produce a table row in the following format:

| # | Severity | File | Line | OWASP | Description | Recommendation |
|---|----------|------|------|-------|-------------|----------------|
| 1 | critical | `src/auth/login.ts` | L42 | A03 | User input interpolated directly into SQL query | Use parameterized query via the ORM |
| 2 | major | `src/api/users.ts` | L18 | A01 | No authorization check before returning user data | Add `requireRole('admin')` guard before handler |

If no findings exist in a category, write: `No findings for [category].`

---

*Based on: OWASP Top 10 (2021), OWASP Secure Coding Practices Quick Reference Guide, and OWASP Application Security Verification Standard (ASVS) v4.*
