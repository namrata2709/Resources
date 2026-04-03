# AWS Training Documentation System 
## Core Philosophy
- **Content drives structure** - Don't force templates
- **Visual-first** - Diagrams > text walls
- **Story-based** - Real analogies, practical examples
- **Natural sections** - Only what fits the topic

---

## File Structure
```
data/notes/topic-name/
├── topic-name-complete.html          # Complete beginner-friendly notes
├── topic-name-script.md              # Video script (optional)
├── topic-name-slides.html            # Video slides (optional)
├── topic-name-linkedin-post.md       # LinkedIn post (optional)
├── json/
│   ├── mcq.json                      # 30+ MCQs (MINIFIED)
│   ├── checklist.json                # Progress (MINIFIED)
│   ├── glossary.json                 # 20+ terms (MINIFIED)
│   └── interview.json                # 25+ Q&A (MINIFIED)
└── images/                           # Flat — no subdirectories, two types:
    ├── *.png                         # Diagrams — generated using GPT-4o prompts
    └── screenshot-*.png              # Screenshots — captured manually by trainer
```

**Two production artifacts (NOT stored in the directory — delivered separately to instructor):**
- `topic-name-image-prompts.md` — GPT-4o prompts used to generate diagram images
- `topic-name-screenshot-guide.md` — instructions for trainer to manually capture each screenshot

**Notes:**
- Both artifact files apply to ALL notes (standard and lab)
- Standard notes: screenshots cover Connection/Setup steps and Hands-On Project steps
- Lab notes: screenshots cover any step — console or CLI — where a screenshot helps student understanding
- Trainer uses these files to produce the actual images and screenshots, then places them in `images/`

**Naming:** `[topic-name]-[type].html` (lowercase, hyphens, 2-4 words max)

---

## HTML Template (Minimal - JavaScript Injects Static Elements)

**Minified template (use as single line):**
```html
<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta name="description" content="[First 155 chars]"><meta name="keywords" content="AWS, [service], cloud, certification"><meta property="og:title" content="[Topic] - AWS Training"><meta property="og:description" content="[Same as description]"><meta property="og:type" content="article"><meta property="og:url" content="https://namrata2709.github.io/Resources/data/notes/[topic]/[file].html"><meta property="og:image" content="https://namrata2709.github.io/Resources/data/notes/[topic]/images/[first-img].png"><link rel="canonical" href="[Same as og:url]"><title>[Topic] - [Type] - AWS Training</title><link rel="stylesheet" href="../../../css/styles.css"><link rel="stylesheet" href="../../../css/notes-template.css"><script src="../../../js/theme.js"></script></head><body class="complete-notes"><script type="application/ld+json">{"@context":"https://schema.org","@type":"TechArticle","headline":"[Topic]","description":"[First 155 chars]","author":{"@type":"Person","name":"Namrata Mulwani","email":"awslecturenotes@gmail.com"},"datePublished":"[YYYY-MM-DD]","dateModified":"[YYYY-MM-DD]","publisher":{"@type":"Person","name":"Namrata Mulwani"},"mainEntityOfPage":{"@type":"WebPage","@id":"[Full URL]"},"image":"[First diagram URL]","articleSection":"AWS Training","keywords":["AWS","[service]"],"educationalLevel":"Beginner to Intermediate"}</script><div class="note-container"><div class="note-header"><h1>[Title]</h1><p class="note-date">📅 [Month DD, YYYY]</p><div class="version-info"><p><strong>Version:</strong> 1.0</p><p><strong>Last Updated:</strong> [Month DD, YYYY]</p><p><strong>Status:</strong> ✅ Current</p></div></div><div class="note-content"><!-- CONTENT --></div><div class="tags"><span class="tag">AWS</span><span class="tag">[Service]</span></div></div><script defer src="../../../js/notes-page.js"></script></body></html>
```

**JavaScript Auto-Injects:**
- Static meta tags (author, robots, og:site_name, twitter:card, theme-color)
- Breadcrumb navigation + structured data
- **Table of Contents** (auto-built from all `h2[id]` and `h3[id]` inside `.note-content`, inserted before the first `h2`)
- Theme toggle button (right side)
- Exam mode toggle (left, complete-notes only)
- Footer (license, copyright, disclaimer)
- Google Analytics
- Interactive scripts (MCQ, Checklist, Glossary, Interview for complete-notes)

**Rules:**
- ❌ NO inline styles/JavaScript, `<style>` tags, localStorage/sessionStorage
- ❌ NO manual breadcrumb, toggles, footer, static meta tags, GA scripts
- ❌ NO hand-written Table of Contents — JS generates it automatically from heading IDs
- ✅ MUST set `class="complete-notes"` on `<body>`
- ✅ Theme.js in `<head>` (immediate load, prevents flash)
- ✅ notes-page.js at `</body>` with `defer` (non-blocking)
- ✅ Use ONLY CSS classes from notes-template.css
- ✅ All HTML MUST be minified (single-line output)

---

## Image Optimization

**CRITICAL: All images need `decoding="async"`. Selective lazy loading based on position.**

**✅ LAZY LOAD** (add `loading="lazy"`): Sections 3+, collapsed `<details>`, bottom of page, requires scroll
**❌ NO LAZY** (omit `loading="lazy"`): First image in Introduction, first 2-3 visible images, small icons (<50KB)

**Examples:**
- Introduction first: `<img src="images/ec2-overview.png" decoding="async" alt="...">`
- Later sections: `<details class="collapsible-section"><img src="images/architecture.png" loading="lazy" decoding="async" alt="..."></details>`

**Impact:** 60-70% faster load, 90% bandwidth savings, Lighthouse +5-10 points

---

## Image Requirements by Topic

Students remember images far better than text. Always aim for the maximum — more images is always better.

| Topic Type | Minimum | Target |
|------------|---------|--------|
| Simple concept | 4 | 6+ |
| Medium concept | 6 | 8+ |
| Complex service | 8 | 10+ |
| Exam-heavy | 10 | 12+ |
| Comparison | 4 | 6+ |
| Process/Lifecycle | 5 | 8+ |

**Rule:** 1 image per 1-2 paragraphs. If you can visualize it, draw it. Never leave a concept image-free if a diagram would help understanding.

**When in doubt — add the image.**

---

## 🔶 Highlight System (FINAL - MANDATORY)

**Goal:** Highlights must enable active recall, not decoration.
AI must behave like an exam paper setter, not a note writer.

### 🧠 Core Rule (Non-negotiable)

Before adding ANY highlight, ask:

```
Can this be directly asked in an exam?
```

If YES → highlight | If NO → do not highlight

### 1. Sentence Highlights (`exam-highlight-sentence`)

Use ONLY for:
- Definitions
- Rules / constraints
- Key behaviors
- Important facts that must be remembered exactly

**Test:** If removing this sentence breaks understanding → highlight it

### 2. Term Highlights (`exam-highlight-term`)

Use ONLY for:
- Numbers (ports, limits, durations)
- Keywords (stateful, stateless, region, AZ)
- Short phrases (max 2–3 words)

**Test:** If this can be a one-word or short-answer question → highlight it

⚠️ **CRITICAL RULE: Term MUST be inside a sentence**
- NEVER use term highlight alone
- ALWAYS embed term inside a sentence

✅ Correct:
```html
EC2 runs inside an <span class="exam-highlight-term">Availability Zone</span>.
```

❌ Wrong:
```html
<span class="exam-highlight-term">Availability Zone</span>
```

### 3. Combine for Maximum Recall (REQUIRED PATTERN)

Whenever possible, combine both:

```html
<span class="exam-highlight-sentence">
Security Groups are <span class="exam-highlight-term">stateful</span>, meaning return traffic is automatically allowed.
</span>
```

This ensures:
- sentence = concept
- term = recall trigger

### 4. Placement Rules

- Max 1–2 term highlights per sentence
- Do not highlight entire sentence as a term
- Do not stack multiple sentence highlights together

### 5. Density Control (STRICT)

- Simple topic → 8–13 highlights
- Medium topic → 13–20 highlights
- Exam-heavy topic → 20–30 highlights

**Hard limit:** Do NOT highlight more than 30% of total content

### 6. Priority Order (What to highlight first)

1. Rules / constraints
2. Definitions
3. Key differences
4. Numbers / limits
5. Core concepts

### 7. Anti-Spam Rule

Do NOT highlight:
- Explanations
- Analogies
- Repeated content
- Obvious statements

### 8. Internal Thinking (MANDATORY)

AI must internally convert content into questions:

```
S3 bucket names must be globally unique
→ Can this be asked? YES
→ Highlight
```

```
Think of S3 like a storage box
→ Can this be asked? NO
→ Do not highlight
```

### ⚡ One-line Summary (for AI behavior)

```
Highlight only what can directly appear in an exam, and always embed key terms inside meaningful sentences.
```

**Keyboard:** Alt + E cycles modes (None → Highlight → Test)

---

## Content Structure by Topic Type

### Foundational (e.g., "What is Cloud?")
1. What is it? (simple definition)
2. Why it exists (problem solved)
3. Real-world analogy
4. Core concepts (3-5 points)
5. Diagram (big picture)
6. Benefits
7. Key takeaways

### Service Documentation (e.g., "EC2 Fundamentals")
1. What is this service?
2. Why use it? (use cases)
3. How it works (architecture diagram)
4. Key features/components
5. Pricing overview
6. Common scenarios
7. When to use vs alternatives

### Connection/Setup (e.g., "SSH to EC2")
1. Prerequisites
2. Process overview
3. Method 1 (step-by-step + screenshots)
   - Every console action step must have a screenshot placeholder: `images/screenshot-[action].png`
   - Each screenshot must also have a corresponding entry in `[topic]-screenshot-guide.md`
4. Method 2 (alternative, with screenshots if console steps differ)
5. Verification (screenshot of successful result)
6. Common errors & solutions
7. Security best practices

### Comparison (e.g., "EC2 vs Lambda")
1. Quick summary each option
2. Decision tree (VISUAL - must be image, not table)
3. Side-by-side table
4. Scenario A, B, C (when to use each)
5. Cost comparison

### Process/Lifecycle (e.g., "EC2 States")
1. Overview
2. State/flow diagram (VISUAL centerpiece)
3. Step-by-step explanations
4. Practical implications (costs, decisions)
5. Common transitions

---

## CSS Classes Reference

**Info Boxes:** `<div class="info-box">💡 Important info</div>` | `<div class="highlight-box">⚡ Key point</div>` | `<div class="success-box">✅ Best practice</div>` | `<div class="error-box">❌ Common mistake</div>`

**Images:** `<div class="diagram-container"><img src="images/name.png" [loading="lazy"] decoding="async" alt="Detailed description"><p class="diagram-caption"><em>Figure X: Caption</em></p></div>`

**Professor Images:** `<div class="provided-image"><img src="images/prof-slide.png" loading="lazy" decoding="async" alt="..."><div class="image-note"><p><strong>📸 From Session:</strong> Description</p></div></div>`

**Code:** `<code>inline</code>` | `<pre><code>block</code></pre>`

**Collapsible:** `<details class="collapsible-section"><summary><h2 id="section-slug">🔧 Title</h2></summary><div class="section-content"><!-- Content --></div></details>`

---

## Heading ID Rules (MANDATORY — Bookmark System Depends On This)

The bookmark system in `notes-page.js` injects ⭐ buttons by querying:
```js
document.querySelectorAll('.note-content h2[id], .note-content h3[id]')
```

**If an `h2` or `h3` has no `id`, the bookmark button will NOT be injected for that heading.**

### Rules

**Every `h2` and `h3` inside `.note-content` MUST have a unique `id` attribute.**

✅ Correct — standalone heading:
```html
<h2 id="what-is-ec2">What is EC2?</h2>
<h3 id="ec2-instance-types">Instance Types</h3>
```

✅ Correct — collapsible heading:
```html
<details class="collapsible-section">
  <summary><h2 id="security-groups">🔒 Security Groups</h2></summary>
  <div class="section-content">...</div>
</details>
```

❌ Wrong — missing `id`:
```html
<h2>What is EC2?</h2>
<details class="collapsible-section">
  <summary><h2>🔒 Security Groups</h2></summary>
```

### ID Naming Convention

Convert the heading text to lowercase, replace spaces and special characters with hyphens, strip emojis.

| Heading Text | Correct `id` |
|---|---|
| `🔒 Security Groups` | `security-groups` |
| `EC2 Instance Types` | `ec2-instance-types` |
| `📝 Overall Summary` | `overall-summary` |
| `Step 1: Launch Instance` | `step-1-launch-instance` |

### Scope

- ✅ Apply to ALL `h2` and `h3` inside `.note-content`
- ✅ Apply inside `<summary>` tags (collapsible sections)
- ✅ Apply inside `<details>` section content if an h3 exists there
- ❌ Do NOT apply to `h1` (page title — already unique)
- ❌ Do NOT apply to `h4` (not targeted by bookmark system)

---

## Complete Notes: Mandatory End Sections (Exact Order)

**Must appear in this order at end:**

**1. Overall Summary:** `<details class="collapsible-section"><summary><h2 id="overall-summary">📝 Overall Summary</h2></summary><div class="section-content"><ul><li><strong>Point 1:</strong> Summary</li><!-- 8-10 bullets --></ul></div></details>`

**2. Glossary (JSON):** `<details class="collapsible-section"><summary><h2 id="glossary">📖 Glossary</h2></summary><div class="section-content"><div id="glossaryContainer" data-glossary-source="json/glossary.json"></div></div></details>`

**3. Interview Questions (JSON):** `<details class="collapsible-section"><summary><h2 id="interview-questions">🎤 Interview Questions</h2></summary><div class="section-content"><p class="interview-intro">📚 Test your understanding with these questions.</p><div class="interview-progress"><p id="interviewProgress">Progress: 0/25 (0%)</p></div><div class="flashcard-navigation"><button onclick="previousInterviewQuestion()" class="nav-btn" id="prevInterviewBtn">← Previous</button><span id="interviewCounter" class="card-counter">1 / 25</span><button onclick="nextInterviewQuestion()" class="nav-btn" id="nextInterviewBtn">Next →</button></div><div class="flashcard-deck" id="interviewContainer" data-interview-source="json/interview.json"></div><div style="margin-top: 2rem; text-align: center;"><button onclick="resetInterviewProgress()" class="quiz-reset-btn">🔄 Reset Progress</button></div></div></details>`

**4. MCQs (JSON):** `<details class="collapsible-section"><summary><h2 id="multiple-choice-questions">📝 Multiple Choice Questions</h2></summary><div class="section-content"><div class="quiz-header-info"><p>📝 Test your knowledge with immediate feedback.</p></div><div class="quiz-navigation"><button onclick="previousQuestion()" class="quiz-nav-btn" id="prevBtn">← Previous</button><div class="quiz-info"><span class="quiz-counter" id="quizCounter">Question 1 of 30</span><span class="quiz-score-display" id="quizScoreDisplay">Score: 0/0 (0%)</span></div><button onclick="nextQuestion()" class="quiz-nav-btn" id="nextBtn">Next →</button></div><div class="quiz-carousel-container" id="quizContainer" data-mcq-source="json/mcq.json"></div><div class="quiz-summary-section"><button onclick="showQuizSummary()" class="quiz-summary-btn">📊 View Summary</button><button onclick="resetEntireQuiz()" class="quiz-reset-btn">🔄 Reset All</button></div></div></details>`

**5. Hands-On Projects:** `<details class="collapsible-section"><summary><h2 id="hands-on-projects">💼 Hands-On Projects</h2></summary><div class="section-content"><div class="prerequisites-box"><h4>📋 Prerequisites</h4><ul><li>✅ AWS account</li><li>✅ Knowledge: [topics]</li></ul></div><h3 id="project-1-name">Project 1: [Name]</h3><div class="info-box"><p><strong>🎯 Objective:</strong> [What you'll build]</p><p><strong>⏱️ Time:</strong> 30-45 min</p><p><strong>💰 Cost:</strong> Free tier</p></div><ol><li><p>[Step instruction]</p><div class="diagram-container"><img src="images/screenshot-[step-name].png" loading="lazy" decoding="async" alt="Screenshot showing [exactly what is visible]: [key fields, buttons, or state]"><p class="diagram-caption"><em>📸 Screenshot: [What to look for]</em></p></div></li></ol><!-- Verification + Cleanup --></div></details>`

**Screenshot rules for Hands-On Projects:**
- Every step that involves a console action MUST have a corresponding screenshot placeholder
- Screenshot filename format: `screenshot-[descriptive-action].png` (e.g., `screenshot-launch-instance.png`)
- Use `diagram-container` wrapper — same class as diagrams, no separate class
- Alt text must describe exactly what the screenshot shows: which fields, buttons, or state is visible
- Caption prefixed with 📸 to visually distinguish from diagram captions

**6. Checklist (JSON):** `<details class="collapsible-section"><summary><h2 id="learning-checklist">☑️ Learning Checklist</h2></summary><div class="section-content"><div class="checklist-progress"><p>Progress: <span id="checklistProgress">0/15</span></p><div class="progress-bar"><div class="progress-fill" id="progressFill" style="width: 0%;">0%</div></div></div><div id="checklistContainer" data-checklist-source="json/checklist.json"></div><div style="margin-top: 2rem; text-align: center;"><button onclick="resetChecklist()" class="quiz-reset-btn">🔄 Reset Checklist</button></div></div></details>`

**7. Reflection Questions:** `<details class="collapsible-section"><summary><h2 id="reflection-questions">🤔 Reflection Questions</h2></summary><div class="section-content"><div class="question-block"><h4>1. [Question]</h4><details style="margin-left: 2rem; margin-top: 0.5rem;"><summary style="cursor: pointer; color: var(--accent); font-weight: 600;">💡 Hint</summary><div style="padding: 1rem; background: var(--bg-secondary); margin-top: 0.5rem; border-radius: 6px;"><p>[Hint text]</p></div></details></div><!-- 5-8 questions --></div></details>`

**8. Links & References (ALWAYS LAST):** `<details class="collapsible-section"><summary><h2 id="links-references">🔗 Links & References</h2></summary><div class="section-content"><h3 id="official-aws-docs">📚 Official AWS Documentation</h3><table><thead><tr><th>Resource</th><th>Description</th></tr></thead><tbody><tr><td><a href="https://docs.aws.amazon.com/[service]/" target="_blank" rel="noopener noreferrer">[Service] Docs</a></td><td>Official documentation</td></tr></tbody></table><h3 id="recommended-reading">🎓 Recommended Reading</h3><table><!-- Learning resources --></table><h3 id="additional-resources">🔧 Additional Resources</h3><table><!-- Tools/calculators --></table></div></details>`

---

## JSON Formats (ALL MINIFIED)

### MCQ (json/mcq.json) - 30+ questions
```json
{"questions":[{"id":1,"question":"What is EC2?","options":[{"letter":"A","text":"Storage"},{"letter":"B","text":"Compute"},{"letter":"C","text":"Database"},{"letter":"D","text":"Network"}],"correctAnswer":"B","difficulty":"basic","explanation":{"correct":"EC2 is Elastic Compute Cloud - virtual servers.","why":"A is S3, C is RDS, D is VPC."}}]}
```
- Q1-12: `"difficulty":"basic"`
- Q13-24: `"difficulty":"intermediate"`
- Q25-30+: `"difficulty":"advanced"`

### Checklist (json/checklist.json)
```json
{"categories":[{"id":"concepts","title":"📚 Concepts Mastered","items":[{"id":"concept-1","text":"Understand EC2 basics"}]},{"id":"skills","title":"🛠️ Skills Acquired","items":[{"id":"skill-1","text":"Launch instances"}]},{"id":"exam","title":"🎓 Exam Ready","items":[{"id":"exam-1","text":"Answer EC2 questions"}]}]}
```

### Glossary (json/glossary.json) - 20+ terms
```json
{"terms":[{"term":"EC2","definition":"Virtual server service","example":"Like renting a cloud computer"}]}
```

### Interview (json/interview.json) - 25+ questions
```json
{"questions":[{"id":1,"question":"What is EC2?","answer":"EC2 provides virtual servers...","difficulty":"fundamental","category":"concepts"},{"id":11,"question":"Troubleshoot connectivity issue","answer":"(Situation) Server unreachable. (Task) Restore in 30min. (Action) Checked security groups, added SSH rule. (Result) Fixed in 8min.","difficulty":"application","category":"scenarios"}]}
```
- Q1-10: `"difficulty":"fundamental"`, `"category":"concepts"`
- Q11-20: `"difficulty":"application"`, `"category":"scenarios"` (use STAR)
- Q21-25+: `"difficulty":"advanced"`, `"category":"architecture"`

---

## Multi-Part Generation

**Split when:** Content reaches 90% artifact limit (~180k chars)

**Part 1:** `<!DOCTYPE html>...<body class="complete-notes"><div class="note-container"><div class="note-header">...</div><div class="note-content"><!-- Intro + Sections --><!-- CONTINUES IN PART 2 -->`
Note: Theme.js in HEAD, NO notes-page.js yet

**Part 2+:** `<!-- NO HTML tags, just content --><!-- Continue sections --><!-- CONTINUES IN PART 3 -->`

**Final:** `<!-- Final sections + mandatory end sections --></div><div class="tags">...</div></div><script defer src="../../../js/notes-page.js"></script></body></html>`

**Rules:** Split at topic boundaries | No "Part X" messages | Merged = valid HTML

---

## Copyright Hard Limits (NON-NEGOTIABLE)

**From ANY external source (web search, docs):**

### Limit 1: Quote Length
**15+ words = SEVERE VIOLATION**
- ✅ Max 14 words per quote
- Extract key phrase OR paraphrase entirely

### Limit 2: One Quote Per Source
**2+ quotes from same source = SEVERE VIOLATION**
- After one quote, that source is CLOSED
- All additional content MUST be paraphrased

### Limit 3: Never Reproduce
**NEVER quote:**
- ❌ Song lyrics (not even one line)
- ❌ Poems (not even one stanza)
- ❌ Haikus (complete works)
- ❌ Full article paragraphs

### Limit 4: Default to Paraphrasing
**Quotes = rare exceptions**
- Most content should be fully paraphrased
- Use own voice, teaching style
- Only quote when absolutely necessary

**Self-Check:**
1. Quote 15+ words? → VIOLATION
2. Already quoted this source? → VIOLATION
3. Using mostly quotes? → WRONG approach
4. My own voice? → Should sound like teaching

---

## Topic Inclusion Rules

**Include ALL professor topics:**
- ✅ Technical (AWS services, architecture, commands)
- ✅ Non-technical (interview prep, career advice, exam tips, study strategies, soft skills, resume tips, salary negotiation)

**Treat non-technical as MAJOR topics** - Full sections with same detail as technical content.

---

## Complete Missing Information

**The transcript is a starting point, not a limit. Your job is always to produce 100% complete, beginner-friendly notes — regardless of how much the transcript covers.**

### Core Philosophy

The transcript may be 5%, 50%, or 90% complete. It does not matter. The output must always be the same: **comprehensive, detailed notes** that a complete beginner can learn from without needing any other resource.

**If the transcript only mentions a topic by name → write full notes on it.**
**If the transcript skips best practices → add them.**
**If the transcript has no examples → create practical ones.**
**If the transcript is empty → write everything from scratch using AWS docs.**

### What "Beginner-Friendly but Pro-Level" Means

- Explain every concept as if the reader has never seen it before
- Use analogies and real-world comparisons for every abstract idea
- Never assume prior knowledge of AWS — always define terms on first use
- BUT do not oversimplify — include the full depth: edge cases, limits, gotchas, architecture decisions, cost implications, security considerations
- A beginner should finish reading and feel like an expert on that topic

### How Much to Add

There is no maximum. Always err on the side of adding more:

| Transcript Coverage | Expected AI Contribution |
|---|---|
| 0–20% | Write nearly everything from AWS docs |
| 20–50% | Expand every point 3–5x with depth and examples |
| 50–80% | Fill all gaps, add all missing subtopics |
| 80–100% | Still add best practices, edge cases, exam tips |

**The transcript is never an excuse for thin notes.**

### What to Always Add (Regardless of Transcript)

For every AWS service topic, always include even if not mentioned:
- Full service definition + what problem it solves
- How it works internally (architecture)
- All key features and configuration options
- Pricing model and free tier details
- Security best practices
- Common use cases with real examples
- What NOT to use it for (limits and anti-patterns)
- Comparison with similar services
- Troubleshooting common issues
- Exam-relevant facts and traps

### Sources (ONLY)
1. Official AWS Documentation (docs.aws.amazon.com)
2. AWS Whitepapers
3. AWS Well-Architected Framework
4. AWS Training & Certification
5. AWS FAQs

### Mark Added Content
```html
<div class="info-box">
    <p>According to AWS documentation, [paraphrased content].</p>
    <p><strong>📚 Source:</strong> <a href="..." target="_blank" rel="noopener noreferrer">AWS [Service] Docs</a></p>
</div>
```

---

## YouTube Content (Optional - Only When Requested)

**Generate ONLY if user explicitly asks.**

### Video Script ([topic]-script.md)
**Structure:**
- Video metadata (title, description, tags, thumbnail)
- INTRO (0:00-1:00)
- SECTION 1-4 with timing
- OUTRO (final minute)
- Production notes (B-roll, on-screen text, pacing)

**Skip "Hands-On Demo" section if theory-only.**

### Video Slideshow ([topic]-slides.html)
**Requirements:**
- 10-15 slides
- Each element has `data-order` for animation
- Links to video-slides.css and video-slides.js
- Press Enter/Space/→ to advance
- Keyboard controls hint

**Slide types:**
1. Title card
2. Learning objectives
3. Definition + analogy
4. Architecture diagram
5. Key features
6. Use cases
7. Demo transition (skip if theory-only)
8. Common mistakes
9. Exam tips
10. Best practices
11. Summary
12. Call to action

---

## LinkedIn Post (Optional - Only When Requested)

**Generate ONLY if user explicitly asks.**

**Format ([topic]-linkedin-post.md):**
- Main post (1300 chars max, first 150 visible)
- Variations (short, with stats, question format)
- Engagement tips (hashtags, timing, tags)

**Structure:**
- Attention-grabbing opening
- 2-3 sentences on problem
- 3-4 bullet points (key learnings)
- Call to action + links
- 5-10 hashtags

---

## Lab Notes Requirements

**Triggered ONLY when user says "lab" or "lab notes" in their request.**

### Key Distinction: Lab vs Standard Notes

| | Standard Notes | Lab Notes |
|---|---|---|
| **Primary purpose** | Teach theory with light practice | Hands-on skill building through tasks |
| **Content ratio** | ~80% theory, ~20% hands-on | ~20% theory, ~80% tasks |
| **Hands-On Projects** | End section — light console projects | Called "Real-World Projects" — same depth, built into the lab body |
| **Structure** | Concept-based sections | Theory intro → Tasks → Optional extended tasks → Real-world projects |
| **Code blocks** | Minimal | Extensive — every command shown in full |
| **Screenshots** | Connection/Setup steps and Hands-On Project steps | Any step — console or CLI — where a screenshot helps student understanding |

**Real-World Projects and Hands-On Projects are the same thing — different name, different placement. Both have the same depth.**

---

### Lab Content Structure

```
Lab Overview (not collapsible — always visible)
What You Will Accomplish (not collapsible)
Background / Theory (collapsible — enough context to understand the lab)
Prerequisites (collapsible)
Personal Account Setup (collapsible — optional, only if explicitly requested)

[Tasks — user defines what these are]
  Each task is its own collapsible section
  Tasks can be console, CLI, scripting, or a mix — depends on the lab topic

[Extended Tasks] (optional — only if user explicitly requests with specific focus e.g. "add AWS CLI tasks", "add debugging tasks", "add Linux tasks")
  Each extended task is its own collapsible section

[Real-World Projects] (optional — only if user explicitly requests)
  Each project is its own collapsible section
  Same depth as Hands-On Projects in standard notes

[All 8 mandatory end sections in standard order]
```

---

### Task Writing Rules

**Steps:**
- Always `<ol>` — never prose paragraphs for procedural steps
- Every console UI element in `<code>` tags: `<code>Create bucket</code>`, `<code>Upload</code>`
- Every CLI command shown in full inside `<pre><code>` blocks — never truncated

**Screenshots:**
- Add a screenshot placeholder whenever it would help the student — there is no rule restricting this to console only
- If a CLI output, a terminal result, or a console state would help a student verify they are on the right track — add it
- Screenshot filename format: `screenshot-[descriptive-action].png`
- Use `diagram-container` wrapper with 📸 caption prefix

```html
<div class="diagram-container"><img src="images/screenshot-[action].png" loading="lazy" decoding="async" alt="[Exact description of what is visible]"><p class="diagram-caption"><em>Figure N: 📸 [Caption]</em></p></div>
```

**Cost alerts — required before any billable step:**
```html
<div class="error-box"><p>💰 <strong>Cost Note:</strong> [What triggers charge and approximate cost]</p></div>
```

**Cleanup — mandatory in every lab, never omit:**
- Cover: delete objects → delete resources → confirm no ongoing charges
- Can be its own task or a section at the end depending on lab structure

---

### Optional Sections (Explicit Request Only)

**Extended Tasks:**
- ❌ Not generated by default
- ✅ Only if user explicitly requests with a specific focus — e.g. "add AWS CLI tasks", "add debugging tasks", "add Linux CLI tasks", "add troubleshooting tasks"
- The focus the user requests defines what the extended tasks cover — do not guess or add generic ones

**Real-World Projects:**
- ❌ Not generated by default
- ✅ Only if user explicitly asks: "include projects" or "include real-world projects"
- Same structure and depth as Hands-On Projects in standard notes

**Personal Account Setup:**
- ❌ Not generated by default
- ✅ Only if user explicitly asks: "include personal account setup"
- Goes before the first task, always marked with:

```html
<div class="info-box"><p>⚠️ <strong>Note:</strong> This section covers personal AWS account setup only. It is <strong>not exam content</strong> and will not appear in assessments.</p></div>
```

---

### Theory in Labs

Labs include theory but keep it brief:
- Background section — just enough to understand why you are doing each task
- Inline context at the start of each task — 1-2 sentences connecting the task to real use
- No long concept walls — deep theory belongs in standard notes for that topic

---

### What Labs Do NOT Have

- ❌ No Hands-On Projects end section — Real-World Projects serve that purpose and live in the lab body
- ❌ No long standalone theory sections

---

## Screenshot Guide Format (All Notes — Always Required)

**Every set of notes always produces `[topic]-screenshot-guide.md`.** This file is a production artifact delivered to the trainer — it is not stored in the `images/` directory.

- **Standard notes:** one entry per screenshot placeholder in Connection/Setup sections and Hands-On Projects
- **Lab notes:** one entry per screenshot placeholder across all tasks — console or CLI, wherever a screenshot was added to help student understanding

**File:** `[topic]-screenshot-guide.md`

**Structure:**
```markdown
# Screenshot Guide - [Topic Name]
**Total Screenshots:** [Number]
**Type:** Standard Notes / Lab Notes

---

## Screenshot 1: [Descriptive Name]
**Filename:** `screenshot-[descriptive-name].png`
**Used In:** [Project 1 / Task N] — Step [N]
**Console Location:** [Service] → [Menu path] → [Page name]
**When to Capture:** [Before/after which action, what state the resource should be in]
**Frame Should Show:**
- [Specific field, button, or result visible]
- [Any value to highlight or call out]
- [What NOT to include, e.g., "crop out account ID"]

---

## Screenshot 2: [Descriptive Name]
...
```

---

## Generation Workflow

**Pre-Generation:**
1. User provides: Session date, transcript, previous topics
2. Output: Topic list + service dependency check
3. Wait for approval

**Generation Steps (Standard Notes):**
1. Complete notes
2. JSON files (MCQ, Checklist, Glossary, Interview) - MINIFIED
3. YouTube content (if requested)
4. `[topic]-screenshot-guide.md` — screenshot capture instructions for Hands-On Project steps
5. `[topic]-image-prompts.md` — GPT-4o prompts for all diagrams **(mandatory last step)**

**Generation Steps (Lab Notes):**
1. Complete notes (task-based structure)
2. JSON files (MCQ, Checklist, Glossary, Interview) - MINIFIED
3. `[topic]-screenshot-guide.md` — screenshot capture instructions for all task steps
4. `[topic]-image-prompts.md` — GPT-4o prompts for diagrams only **(mandatory last step)**

**Output Format After Each Artifact (STRICT — NO EXCEPTIONS):**

After creating each artifact, respond with ONLY this exact format — nothing else:
```
✅ [filename] created
```

After ALL artifacts are done, respond with ONLY this exact summary — nothing else:
```
✅ [filename] created
✅ [filename] created
✅ [filename] created
✅ [filename] created
✅ [filename] created
```

❌ NEVER add after any artifact:
- Explanations of what was created
- Summaries of content
- "Here's what I included..."
- "Let me know if you want changes"
- Any sentence that is not `✅ [filename] created`

---

## Image Generation Resource (Mandatory Last Step)

**After ALL HTML and JSON files are complete, produce these two artifacts in this order:**

**Step 1 — Screenshot Guide** (`[topic]-screenshot-guide.md`):
- Produced first so trainer can start capturing screenshots while diagrams are being generated
- Standard notes: one entry per screenshot placeholder in Connection/Setup and Hands-On Projects
- Lab notes: one entry per screenshot placeholder across all tasks — wherever a screenshot was added to help student understanding
- This file is delivered to the trainer — NOT stored in `images/`

**Step 2 — Image Prompts** (`[topic]-image-prompts.md`):
- GPT-4o prompts for all diagrams only — never includes screenshots
- Trainer uses these prompts to generate diagram images via GPT-4o
- This file is delivered to the trainer — NOT stored in `images/`
- Produced last because diagram content depends on knowing all sections

**Model:** Use GPT-4o image generation (NOT DALL-E)

**Structure:**
```markdown
# Image Generation Prompts - [Topic Name]
**Total Images:** [Number]
**Model:** GPT-4o

---

## Image 1: [Descriptive Name]
**Filename:** `[topic-name]-[description].png`
**Used In:** [Section name]
**Purpose:** [What diagram illustrates]

**GPT-4o Prompt:**
```
You are a technical diagram generator. Create EXACTLY this layout with NO deviations.

DIAGRAM TYPE: AWS Architecture Diagram
CANVAS: 1200x800px, solid white background (#FFFFFF)
OUTPUT FORMAT: PNG

REQUIRED ELEMENTS (EXACT POSITIONS):

1. TITLE (x=600, y=30, centered):
   - Text: "[Exact Title]"
   - Font: Arial Bold, 24pt, color #232F3E (AWS dark)

2. MAIN COMPONENT (x=400, y=250, width=400, height=200):
   - Rectangle: #FF9900 (AWS orange), 3px border
   - Label inside: "[Component Name]"
   - Font: Arial, 18pt, centered, color #FFFFFF
   - Sub-elements inside:
     * "[Detail 1]" at relative position (50, 60)
     * "[Detail 2]" at relative position (50, 120)

3. LEFT COMPONENT (x=150, y=300, width=150, height=100):
   - Rectangle: #3F8624 (green), 2px border
   - Label: "[Component Name]"
   - Icon: Simple cloud shape above text

4. RIGHT COMPONENT (x=900, y=300, width=150, height=100):
   - Rectangle: #0073BB (blue), 2px border
   - Label: "[Component Name]"
   - Icon: Simple server rectangle above text

5. ARROWS (EXACT PATHS):
   - Arrow 1: From (300, 350) to (400, 350)
     * Style: Solid black line, 3px width
     * Arrowhead: Filled triangle, 15px
     * Label above: "[Action/Data]" (12pt, centered on arrow)
   
   - Arrow 2: From (800, 350) to (900, 350)
     * Style: Solid black line, 3px width
     * Arrowhead: Filled triangle, 15px
     * Label above: "[Action/Data]" (12pt, centered on arrow)

6. LEGEND (x=50, y=700, if needed):
   - Small boxes with labels explaining colors
   - Format: [Color box 20x20px] [Label text]

STYLE CONSTRAINTS:
- All rectangles: Rounded corners 8px radius
- All text: Arial font family ONLY
- All icons: Simple, flat, monochrome
- Line widths: 2-3px consistently
- No shadows, gradients, or 3D effects
- No decorative elements
- White background MUST be visible around all elements
- Minimum 30px padding from canvas edges

COLOR PALETTE (USE ONLY THESE):
- AWS Orange: #FF9900
- AWS Dark: #232F3E
- Green: #3F8624
- Blue: #0073BB
- Black: #000000
- White: #FFFFFF

CRITICAL RULES:
- Follow coordinates EXACTLY as specified
- Do NOT add creative embellishments
- Do NOT change colors
- Do NOT add extra elements
- Do NOT modify layout
- Use ONLY specified fonts and sizes
```

---

## Image 2: Decision Tree - [Name]
**Filename:** `[name]-decision-tree.png`
**Used In:** [Section]
**Purpose:** [Description]

**GPT-4o Prompt:**
```
You are a flowchart generator. Create EXACTLY this decision tree with NO deviations.

DIAGRAM TYPE: Decision Tree Flowchart
CANVAS: 1200x800px, solid white background (#FFFFFF)
OUTPUT FORMAT: PNG

REQUIRED ELEMENTS (EXACT POSITIONS):

1. TITLE (x=600, y=30, centered):
   - Text: "[Decision Topic]"
   - Font: Arial Bold, 24pt, color #000000

2. START NODE (x=600, y=100):
   - Shape: Rounded rectangle (150x60px, 30px radius)
   - Color: #0073BB (blue), 3px border, white fill
   - Text: "START"
   - Font: Arial Bold, 16pt, centered, color #000000

3. FIRST DECISION (x=600, y=220):
   - Shape: Diamond (200x120px)
   - Color: #FF9900 (orange), 3px border, white fill
   - Text (centered, multi-line):
     * Line 1: "[Question]"
     * Line 2: "[Condition?]"
   - Font: Arial Bold, 14pt, color #000000

4. LEFT BRANCH (from decision to x=300, y=400):
   - Arrow: Solid black, 3px width, arrowhead 15px
   - Label on arrow: "NO" or "[Condition]"
   - Font: Arial, 12pt, color #CC0000 (red)

5. RIGHT BRANCH (from decision to x=900, y=400):
   - Arrow: Solid black, 3px width, arrowhead 15px
   - Label on arrow: "YES" or "[Condition]"
   - Font: Arial, 12pt, color #3F8624 (green)

6. SECOND LEVEL DECISIONS (if needed):
   - LEFT DECISION (x=300, y=400):
     * Diamond shape (180x100px)
     * Same orange color and style
     * Text: "[Sub-question]"
   
   - RIGHT DECISION (x=900, y=400):
     * Diamond shape (180x100px)
     * Same orange color and style
     * Text: "[Sub-question]"

7. RESULT NODES (y=600):
   - Shape: Rounded rectangles (180x80px, 10px radius)
   - Color: #3F8624 (green), 3px border, white fill
   - Positions: Distributed evenly based on number of results
   - Text: "[Solution/Result]"
   - Font: Arial, 14pt, centered, color #000000
   - Each preceded by "✓" symbol

8. CONNECTING ARROWS:
   - All arrows: Black, solid, 3px width
   - Arrowheads: Filled triangles, 15px
   - Labels: 12pt Arial, positioned just above arrow path

STYLE CONSTRAINTS:
- Diamond shapes: EXACTLY 45-degree angles
- All corners on rectangles: Consistently rounded
- Arrow labels: Never overlap with shapes
- All text: Horizontally centered within shapes
- Vertical spacing: Consistent 150px between levels
- No shadows, gradients, or decorative elements
- White background visible around all elements
- Minimum 30px padding from edges

COLOR PALETTE (USE ONLY THESE):
- Start: #0073BB (blue)
- Decisions: #FF9900 (orange)
- Results: #3F8624 (green)
- Arrows/Text: #000000 (black)
- Labels: #CC0000 (red for NO), #3F8624 (green for YES)

CRITICAL RULES:
- Use ONLY specified coordinates
- Do NOT add creative elements
- Do NOT change colors or fonts
- Do NOT modify diamond shape geometry
- Follow arrow paths EXACTLY as described
- All diamonds must be perfect 45-degree rhombi
```

---

## Image 3: State Diagram - [Name]
**Filename:** `[name]-state-diagram.png`
**Used In:** [Section]
**Purpose:** [Description]

**GPT-4o Prompt:**
```
You are a state diagram generator. Create EXACTLY this state transition diagram.

DIAGRAM TYPE: State Transition Diagram
CANVAS: 1200x800px, solid white background (#FFFFFF)
OUTPUT FORMAT: PNG

REQUIRED ELEMENTS (EXACT POSITIONS):

1. TITLE (x=600, y=30, centered):
   - Text: "[State Diagram Title]"
   - Font: Arial Bold, 24pt, color #232F3E

2. STATES (rounded rectangles, 200x100px, 20px radius):
   - STATE 1 (x=200, y=200):
     * Border: 3px solid #FF9900 (orange)
     * Fill: White
     * Text: "[State Name]"
     * Subtext: "[Description]"
     * Font: Arial Bold 16pt for name, Regular 12pt for description
   
   - STATE 2 (x=600, y=200):
     * Border: 3px solid #0073BB (blue)
     * Fill: White
     * Text: "[State Name]"
     * Subtext: "[Description]"
   
   - STATE 3 (x=1000, y=200):
     * Border: 3px solid #3F8624 (green)
     * Fill: White
     * Text: "[State Name]"
     * Subtext: "[Description]"
   
   [Continue for all states with specific positions...]

3. TRANSITIONS (curved arrows between states):
   - TRANSITION 1-2:
     * From: (400, 250) [right edge of STATE 1]
     * To: (600, 250) [left edge of STATE 2]
     * Style: Curved arrow, 3px black line
     * Curve: Slight upward arc (30px above straight line)
     * Label above: "[Trigger/Action]" (12pt Arial)
   
   - TRANSITION 2-3:
     * From: (800, 250) [right edge of STATE 2]
     * To: (1000, 250) [left edge of STATE 3]
     * Style: Curved arrow, 3px black line
     * Curve: Slight downward arc (30px below straight line)
     * Label below: "[Trigger/Action]" (12pt Arial)
   
   [Specify ALL transitions with exact coordinates...]

4. SELF-TRANSITIONS (if any):
   - Loop above STATE X at (x, y-80):
     * Circular arc starting and ending at top of state
     * Arrow at end
     * Label: "[Self-trigger]"

5. INITIAL STATE INDICATOR (x=100, y=250):
   - Filled circle: 20px diameter, black
   - Arrow to first state: 3px solid black line

6. FINAL STATE INDICATOR (if applicable):
   - Double-circle: Outer 30px, inner 20px, black borders
   - Position: After last state

STYLE CONSTRAINTS:
- All state boxes: Same size (200x100px)
- All arrows: 3px width consistently
- Arrowheads: Filled triangles, 15px
- Curved arrows: Smooth bezier curves, no sharp angles
- Labels: Never overlap with arrows or states
- Text centering: Perfect horizontal and vertical alignment
- No shadows, gradients, or 3D effects

COLOR MEANINGS:
- Orange states: Initial/starting states
- Blue states: Intermediate/processing states
- Green states: Final/completed states
- Black arrows: All transitions

CRITICAL RULES:
- States MUST be exact specified dimensions
- Arrow curves MUST follow specified paths
- Do NOT add decorative elements
- Use ONLY specified colors
- All coordinates MUST be exact
- No creative interpretation allowed
```

**Image Types Required:**
1. Architecture diagrams (service overview, detailed internals, data flow)
2. Decision trees (when to use what, configuration choices)
3. State diagrams (lifecycle transitions, process flows)
4. Comparison charts (side-by-side service features)
5. Network diagrams (VPC layouts, security group flows)
6. Process workflows (step-by-step procedures)

**Naming Convention:** `[topic-name]-[descriptive-purpose].png` (lowercase, hyphens only)

**Critical Image Prompt Rules:**
- ✅ Specify EXACT coordinates (x, y positions)
- ✅ Specify EXACT sizes (width, height in pixels)
- ✅ Specify EXACT colors (hex codes only)
- ✅ Specify EXACT fonts (family, size, weight)
- ✅ Specify EXACT arrow paths (start, end, curve direction)
- ✅ Use "EXACTLY", "MUST", "CRITICAL RULES" language
- ✅ State "NO deviations", "NO creative elements"
- ❌ Never leave positioning to model's discretion
- ❌ Never use vague terms like "somewhere", "around", "near"
- ❌ Never allow color/font choices to model

---

## Prerequisites Check

**CRITICAL: Only reference services/concepts already taught in previous sessions.**

**Before generating notes:**
1. Review list of previous session topics provided by user
2. Check all references in content against this list
3. Flag any dependencies not yet covered

**Examples:**
- ✅ "Configure Security Groups (covered in Session 3)"
- ❌ "Set up Auto Scaling" (if not taught yet)
- ✅ "Use VPC from earlier setup"
- ❌ "Configure CloudFront distribution" (if future topic)

**For Projects:**
- Only use taught AWS services
- Only assume knowledge from prior sessions
- Explicitly state prerequisites at project start
- Link back to relevant sessions for review

**If prerequisite missing:**
- Add brief explanation inline
- OR note it as "Future topic - will cover in detail later"
- OR suggest user review specific prior session

---

## Quality Checklist

**Before delivery:**
- [ ] HTML minified (single-line)
- [ ] Body class: `complete-notes`
- [ ] NO inline styles/JS, breadcrumb, toggles, footer, static meta tags
- [ ] Theme.js in `<head>`, notes-page.js at `</body>` end with `defer`
- [ ] First 2-3 images: only `decoding="async"`
- [ ] Remaining images: `loading="lazy" decoding="async"`
- [ ] Descriptive alt text (10+ words)
- [ ] JSON files MINIFIED
- [ ] Complete notes: All 8 mandatory end sections in order
- [ ] Natural flow (not template-forced)
- [ ] Images: hit or exceed the Target count from the Image Requirements table — more is always better
- [ ] Exam highlights: 8–13 (simple) / 13–20 (medium) / 20–30 (exam-heavy), max 30% of content
- [ ] Every `h2` and `h3` inside `.note-content` has a unique `id` attribute (required for bookmark system)
- [ ] `[topic]-screenshot-guide.md` produced — one entry per screenshot placeholder in the HTML (standard: Connection/Setup + Hands-On Projects; lab: all tasks wherever screenshots were added)
- [ ] `[topic]-image-prompts.md` produced last — covers all diagrams, no screenshots included
- [ ] Hands-On Project steps use `<ol>` with screenshot placeholder after each console action

**Additionally for lab notes:**
- [ ] Lab Overview and What You Will Accomplish are not collapsible
- [ ] Theory is brief — just enough context for the tasks
- [ ] Steps use `<ol>` — never prose paragraphs
- [ ] Every CLI command shown in full inside `<pre><code>`
- [ ] Screenshots added wherever they help student understanding (console or CLI)
- [ ] Cost alert box present before any billable step
- [ ] Cleanup covered — no ongoing charges left after lab
- [ ] No Hands-On Projects end section (Real-World Projects live in the lab body if requested)
- [ ] Extended Tasks only if explicitly requested with a specific focus
- [ ] Real-World Projects only if explicitly requested
- [ ] Personal Account Setup only if explicitly requested

---

## Writing Guidelines

### Story Test
"Could I explain this to a friend over coffee?" → If no, rewrite conversationally.

### Visual Test
"Can I visualize this?" → If yes, add a diagram. When in doubt, add it anyway — students remember images far better than text.

### "So What?" Test
State "what" + immediately explain "why it matters."

**Example:**
❌ "Security Groups are stateful."
✅ "Security Groups are stateful, meaning return traffic is auto-allowed - no separate rules needed."

### Grandmother Test
"Could my grandmother understand?" → If no, add analogy.

---

## Common Mistakes to Avoid

❌ Template-driven (forcing sections)
❌ Text walls (no visual breaks)
❌ Assuming knowledge
❌ Generic examples
❌ Missing visuals

✅ Content-driven structure
✅ Diagram → List → Table → Code flow
✅ Explain prerequisites
✅ Specific, practical examples
✅ 1 image per 1-2 paragraphs

---

## Success Criteria

**Good notes:**
- Read like blog post, not manual
- Learn from friend, not textbook
- See concepts, not just read
- Understand why, not just what

**Bad notes:**
- Rigid template
- Following formula
- Wall of text
- Technical manual