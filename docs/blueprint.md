# TéléBot AI — Bot specification

**Archetype:** custom

**Voice:** professional and conversational — write every user-facing message, button label, error, and empty state in this voice.

A conversational AI assistant for Telegram users offering context-aware responses, text generation, and multilingual support with privacy-focused session management.

> This is the complete contract for the bot. Implement EVERY entry point, flow, feature, integration, and edge case below. The completeness review checks the bot against this document after each build pass.

## Primary audience

- francophone users
- international Telegram users
- individuals needing text assistance

## Success criteria

- Handles 1000+ concurrent conversations with context retention
- Maintains 95% user satisfaction in task completion
- Achieves 90% language detection accuracy

## Entry points

Every feature must be reachable from the bot's command/button surface (button-first; only /start and /help are slash commands).

- **/start** (command, actor: user, command: /start) — Open onboarding menu with language selection and example prompts
- **/help** (command, actor: user, command: /help) — Display available commands and example use cases
- **/restart** (command, actor: user, command: /restart) — Reset conversation context for current chat
- **/summary** (command, actor: user, command: /summary) — Generate summary of current conversation thread
- **Développer** (button, actor: user, callback: expand_response) — Request expanded version of last response
- **Raccourcir** (button, actor: user, callback: shorten_response) — Request condensed version of last response

## Flows

### Onboarding
_Trigger:_ /start

1. Detect user language
2. Display welcome message with example buttons
3. Store initial preferences

_Data touched:_ User, Conversation

### Contextual Chat
_Trigger:_ User message

1. Analyze prompt for context
2. Generate response with detected language
3. Apply content filtering

_Data touched:_ Message, Session

### Settings Management
_Trigger:_ /settings

1. Display language selection
2. Show response length preferences
3. Save user configuration

_Data touched:_ User

## Data entities

Durable data (must survive a restart) uses the toolkit's persistent store, never in-memory maps.

- **User** _(retention: persistent)_ — Telegram user profile with preferences
  - fields: id, display_name, locale, preferred_language, response_style
- **Conversation** _(retention: session)_ — Chat session with context history
  - fields: chat_id, type, message_history
- **Message** _(retention: persistent)_ — Individual message exchange
  - fields: prompt, response, timestamp
- **Session** _(retention: session)_ — Context window of recent exchanges
  - fields: exchange_sequence

## Integrations

- **Telegram** (required) — Bot API messaging and notifications
Call external APIs against their real contract (correct endpoints, ids, params); credentials from env. Do not fake responses.

## Owner controls

- Configure admin notification user ID
- Enable/disable payment subscription feature
- Adjust context window size (default 20 messages)

## Notifications

- Admin error alerts for critical failures
- Weekly usage summary for admin
- User subscription status updates

## Permissions & privacy

- Anonymized usage counters only
- No message content stored for analytics
- Content filtering for abusive prompts

## Edge cases

- Language detection failure fallback to French
- Rate limiting for abusive users
- Context overflow handling in long threads

## Required tests

- End-to-end onboarding flow test
- Context preservation across 20+ messages
- Multilingual response accuracy test

## Assumptions

- Default French fallback language
- Session history limited to 20 messages
- Admin notifications initially disabled
