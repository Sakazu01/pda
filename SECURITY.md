# Security policy

## Supported versions

| Version | Supported |
|---|---|
| 1.x | ✅ |

## Reporting a vulnerability

Please report privately through [GitHub Security Advisories](https://github.com/Sakazu01/pda/security/advisories/new). Do not open a public issue.

Include:

- what an attacker can do (for example "a crafted `.json` runs script when opened");
- the smallest file or steps that reproduce it;
- browser and version.

You'll get a reply within 7 days. Valid reports are fixed in a patch release and credited in the changelog unless you prefer otherwise.

## Scope

In scope: script execution from imported files, pasted content, or AI output; API key exposure; writes outside the chosen project folder; CSP bypasses.

Out of scope: issues that need a malicious browser extension or a compromised machine, and an AI provider's own handling of prompts you send it.

How PDA defends itself is described in [docs/security.md](docs/security.md).
