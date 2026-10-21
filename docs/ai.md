# AI generate

Every canvas has a **Buat dengan AI** button. Describe what you want in plain words.

## Which diagram?

The **Jenis diagram** select defaults to **Otomatis**:

1. A keyword intent map checks the prompt first ("tabel", "relasi" → ERD; "alur bisnis", "approval" → BPMN; "deploy", "server" → deployment…).
2. If nothing matches clearly, the model classifies the prompt and returns `{type, reason}`.
3. PDA says which type it chose and why, so a wrong guess is easy to correct.

You can also pick the type yourself.

## Where results go

| Mode | Behaviour |
|---|---|
| **Di sebelah hasil sebelumnya** (default) | The new diagram is placed to the right of what is already on the canvas. Earlier work is never replaced |
| **Proyek baru terpisah** | Starts a new project |

Ctrl+Z undoes one generation.

## Quality rules

Prompts are type-specific and ask for structured JSON, never markup. Graph prompts ask for: 7 to 14 nodes, main flow left to right (actor first, data stores last), 2 to 4 named zones, a short `sub` per node (technology or responsibility), edge labels of at most 3 words, consistent naming, and no orphan nodes. Output is validated (known shape types, safe IDs, label length), sanitized, and laid out before rendering.

## Models

Open **AI** in the top bar.

| Provider | Notes |
|---|---|
| Claude (built-in) | Available when PDA runs inside Claude. No key needed |
| OpenAI, Anthropic, Gemini, Groq, OpenRouter, DeepSeek | Paste your key. It is called straight from the browser |
| Ollama, LM Studio | Local and free. Allow CORS for the page (`OLLAMA_ORIGINS=*`) |
| Any OpenAI-compatible endpoint | Must be `https://` (or `http://localhost`) |

Keys stay in `sessionStorage` unless you tick **Ingat kunci di browser ini**.
