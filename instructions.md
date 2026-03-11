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
├── topic-name-overview.html          # Technical (IT pros)
├── topic-name-complete.html          # Beginner-friendly
├── topic-name-script.md              # Video script (optional)
├── topic-name-slides.html            # Video slides (optional)
├── topic-name-linkedin-post.md       # LinkedIn post (optional)
├── json/
│   ├── mcq.json                      # 30+ MCQs (MINIFIED)
│   ├── checklist.json                # Progress (MINIFIED)
│   ├── glossary.json                 # 20+ terms (MINIFIED)
│   └── interview.json                # 25+ Q&A (MINIFIED)
└── images/
    └── *.png
```

**Naming:** `[topic-name]-[type].html` (lowercase, hyphens, 2-4 words max)

---

## HTML Template (Minimal - JavaScript Injects Static Elements)

**Minified template (use as single line):**
```html
<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta name="description" content="[First 155 chars]"><meta name="keywords" content="AWS, [service], cloud, certification"><meta property="og:title" content="[Topic] - AWS Training"><meta property="og:description" content="[Same as description]"><meta property="og:type" content="article"><meta property="og:url" content="https://namrata2709.github.io/Resources/data/notes/[topic]/[file].html"><meta property="og:image" content="https://namrata2709.github.io/Resources/data/notes/[topic]/images/[first-img].png"><link rel="canonical" href="[Same as og:url]"><title>[Topic] - [Type] - AWS Training</title><link rel="stylesheet" href="../../../css/notes-template.css"><script src="../../../js/theme.js"></script></head><body class="[complete-notes OR overview-notes]"><script type="application/ld+json">{"@context":"https://schema.org","@type":"TechArticle","headline":"[Topic]","description":"[First 155 chars]","author":{"@type":"Person","name":"Namrata Mulwani","email":"awslecturenotes@gmail.com"},"datePublished":"[YYYY-MM-DD]","dateModified":"[YYYY-MM-DD]","publisher":{"@type":"Person","name":"Namrata Mulwani"},"mainEntityOfPage":{"@type":"WebPage","@id":"[Full URL]"},"image":"[First diagram URL]","articleSection":"AWS Training","keywords":["AWS","[service]"],"educationalLevel":"Beginner to Intermediate"}</script><div class="note-container"><div class="note-header"><h1>[Title]</h1><p class="note-date">📅 [Month DD, YYYY]</p><div class="version-info"><p><strong>Version:</strong> 1.0</p><p><strong>Last Updated:</strong> [Month DD, YYYY]</p><p><strong>Status:</strong> ✅ Current</p></div></div><div class="note-content"><!-- CONTENT --></div><div class="tags"><span class="tag">AWS</span><span class="tag">[Service]</span></div></div><script defer src="../../../js/notes-template.js"></script></body></html>
```

**JavaScript Auto-Injects:**
- Static meta tags (author, robots, og:site_name, twitter:card, theme-color)
- Breadcrumb navigation + structured data
- Theme toggle button (right side)
- Exam mode toggle (left, complete-notes only)
- Footer (license, copyright, disclaimer)
- Google Analytics
- Interactive scripts (MCQ, Checklist, Glossary, Interview for complete-notes)

**Rules:**
- ❌ NO inline styles/JavaScript, `<style>` tags, localStorage/sessionStorage
- ❌ NO manual breadcrumb, toggles, footer, static meta tags, GA scripts
- ✅ MUST set `class="complete-notes"` OR `class="overview-notes"` on `<body>`
- ✅ Theme.js in `<head>` (immediate load, prevents flash)
- ✅ Notes-template.js at `</body>` with `defer` (non-blocking)
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

| Topic Type | Min Images | Recommended |
|------------|------------|-------------|
| Simple concept | 2-3 | 3-4 |
| Medium concept | 3-4 | 5-6 |
| Complex service | 5-7 | 6-8 |
| Exam-critical | 5-7 | 8-10 |
| Comparison | 2-3 | 3-4 |
| Process/Lifecycle | 3-4 | 4-5 |

**Rule:** 1 image per 2-3 paragraphs. Visual-first approach.

---

## Exam Highlights (Complete Notes Only)

### Two Types:

**1. Sentence Highlights** (`exam-highlight-sentence`) - Complete statements to memorize. **Visible in all modes** (provides context).
Example: `<p><span class="exam-highlight-sentence">S3 bucket names must be globally unique across all AWS accounts</span>.</p>`

**2. Term Highlights** (`exam-highlight-term`) - Key terms/numbers (2-3 words max). **Hidden in Test mode** (hover to reveal - active recall).
Example: `<p>SSH uses port <span class="exam-highlight-term">22</span> for <span class="exam-highlight-term">Linux instances</span>.</p>`

**Density:** Simple: 8-13 total | Medium: 13-20 total | Exam-critical: 20-30 total

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
4. Method 2 (alternative)
5. Verification
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

**Collapsible:** `<details class="collapsible-section"><summary><h2>🔧 Title</h2></summary><div class="section-content"><!-- Content --></div></details>`

---

## Complete Notes: Mandatory End Sections (Exact Order)

**Must appear in this order at end:**

**1. Overall Summary:** `<details class="collapsible-section"><summary><h2>📝 Overall Summary</h2></summary><div class="section-content"><ul><li><strong>Point 1:</strong> Summary</li><!-- 8-10 bullets --></ul></div></details>`

**2. Glossary (JSON):** `<details class="collapsible-section"><summary><h2>📖 Glossary</h2></summary><div class="section-content"><div id="glossaryContainer" data-glossary-source="json/glossary.json"></div></div></details>`

**3. Interview Questions (JSON):** `<details class="collapsible-section"><summary><h2>🎤 Interview Questions</h2></summary><div class="section-content"><p class="interview-intro">📚 Test your understanding with these questions.</p><div class="interview-progress"><p id="interviewProgress">Progress: 0/25 (0%)</p></div><div class="flashcard-navigation"><button onclick="previousInterviewQuestion()" class="nav-btn" id="prevInterviewBtn">← Previous</button><span id="interviewCounter" class="card-counter">1 / 25</span><button onclick="nextInterviewQuestion()" class="nav-btn" id="nextInterviewBtn">Next →</button></div><div class="flashcard-deck" id="interviewContainer" data-interview-source="json/interview.json"></div><div style="margin-top: 2rem; text-align: center;"><button onclick="resetInterviewProgress()" class="quiz-reset-btn">🔄 Reset Progress</button></div></div></details>`

**4. MCQs (JSON):** `<details class="collapsible-section"><summary><h2>📝 Multiple Choice Questions</h2></summary><div class="section-content"><div class="quiz-header-info"><p>📝 Test your knowledge with immediate feedback.</p></div><div class="quiz-navigation"><button onclick="previousQuestion()" class="quiz-nav-btn" id="prevBtn">← Previous</button><div class="quiz-info"><span class="quiz-counter" id="quizCounter">Question 1 of 30</span><span class="quiz-score-display" id="quizScoreDisplay">Score: 0/0 (0%)</span></div><button onclick="nextQuestion()" class="quiz-nav-btn" id="nextBtn">Next →</button></div><div class="quiz-carousel-container" id="quizContainer" data-mcq-source="json/mcq.json"></div><div class="quiz-summary-section"><button onclick="showQuizSummary()" class="quiz-summary-btn">📊 View Summary</button><button onclick="resetEntireQuiz()" class="quiz-reset-btn">🔄 Reset All</button></div></div></details>`

**5. Hands-On Projects:** `<details class="collapsible-section"><summary><h2>💼 Hands-On Projects</h2></summary><div class="section-content"><div class="prerequisites-box"><h4>📋 Prerequisites</h4><ul><li>✅ AWS account</li><li>✅ Knowledge: [topics]</li></ul></div><h3>Project 1: [Name]</h3><div class="info-box"><p><strong>🎯 Objective:</strong> [What you'll build]</p><p><strong>⏱️ Time:</strong> 30-45 min</p><p><strong>💰 Cost:</strong> Free tier</p></div><!-- Step-by-step + verification + cleanup --></div></details>`

**6. Checklist (JSON):** `<details class="collapsible-section"><summary><h2>☑️ Learning Checklist</h2></summary><div class="section-content"><div class="checklist-progress"><p>Progress: <span id="checklistProgress">0/15</span></p><div class="progress-bar"><div class="progress-fill" id="progressFill" style="width: 0%;">0%</div></div></div><div id="checklistContainer" data-checklist-source="json/checklist.json"></div><div style="margin-top: 2rem; text-align: center;"><button onclick="resetChecklist()" class="quiz-reset-btn">🔄 Reset Checklist</button></div></div></details>`

**7. Reflection Questions:** `<details class="collapsible-section"><summary><h2>🤔 Reflection Questions</h2></summary><div class="section-content"><div class="question-block"><h4>1. [Question]</h4><details style="margin-left: 2rem; margin-top: 0.5rem;"><summary style="cursor: pointer; color: var(--accent); font-weight: 600;">💡 Hint</summary><div style="padding: 1rem; background: var(--bg-secondary); margin-top: 0.5rem; border-radius: 6px;"><p>[Hint text]</p></div></details></div><!-- 5-8 questions --></div></details>`

**8. Links & References (ALWAYS LAST):** `<details class="collapsible-section"><summary><h2>🔗 Links & References</h2></summary><div class="section-content"><h3>📚 Official AWS Documentation</h3><table><thead><tr><th>Resource</th><th>Description</th></tr></thead><tbody><tr><td><a href="https://docs.aws.amazon.com/[service]/" target="_blank" rel="noopener noreferrer">[Service] Docs</a></td><td>Official documentation</td></tr></tbody></table><h3>🎓 Recommended Reading</h3><table><!-- Learning resources --></table><h3>🔧 Additional Resources</h3><table><!-- Tools/calculators --></table></div></details>`

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

**Part 1:** `<!DOCTYPE html>...<body class="complete-notes"><div class="note-container"><div class="note-header">...</div><div class="note-content"><!-- Intro + TOC + Sections --><!-- CONTINUES IN PART 2 -->`
Note: Theme.js in HEAD, NO notes-template.js yet

**Part 2+:** `<!-- NO HTML tags, just content --><!-- Continue sections --><!-- CONTINUES IN PART 3 -->`

**Final:** `<!-- Final sections + mandatory end sections --></div><div class="tags">...</div></div><script defer src="../../../js/notes-template.js"></script></body></html>`

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

**Transcripts may be incomplete. Your job: Create COMPLETE notes.**

**Add when:**
- Topic mentioned but not explained
- Critical subtopics skipped
- Best practices not discussed but essential
- Security/cost/troubleshooting missing
- Real-world use cases not provided

**Sources (ONLY):**
1. Official AWS Documentation (docs.aws.amazon.com)
2. AWS Whitepapers
3. AWS Well-Architected Framework
4. AWS Training & Certification
5. AWS FAQs

**Mark added content:**
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

## Overview Notes Requirements

**Overview = Simpler, technical reference for IT pros**

**SKIP:**
- ❌ Exam highlights
- ❌ MCQs, Checklist, Glossary, Interview
- ❌ Projects, Reflection
- ❌ Exam mode toggle

**INCLUDE:**
- ✅ Body class: `overview-notes`
- ✅ Intro (not collapsible)
- ✅ TOC (not collapsible)
- ✅ Topic sections (collapsible)
- ✅ Overall Summary
- ✅ Links & References (LAST)
- ✅ Diagrams (3-5 per topic)

---

## Chat Output Rules

**CRITICAL: Minimal conversation after artifacts**

After creating artifacts:
- ✅ "✅ [filename] created"
- ❌ NO explanations, summaries, descriptions
- Max 1 line per artifact

**Example:**
```
✅ ec2-lifecycle-complete.html created
✅ mcq.json created
✅ checklist.json created
✅ glossary.json created
✅ interview.json created
✅ Image prompts created
```

---

## Generation Workflow

**Pre-Generation:**
1. User provides: Session date, transcript, previous topics
2. Output: Topic list + service dependency check
3. Wait for approval

**Generation Steps:**
1. Overview notes (technical)
2. Complete notes (beginner)
3. JSON files (MCQ, Checklist, Glossary, Interview) - MINIFIED
4. YouTube content (if requested)
5. **Image generation resource (final step)**

---

## Image Generation Resource (Final Step)

**After completing all HTML/JSON files, create separate artifact in Markdown format:**

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

[Continue with specific prompts for all remaining images...]
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
- [ ] Body class: `complete-notes` OR `overview-notes`
- [ ] NO inline styles/JS, breadcrumb, toggles, footer, static meta tags
- [ ] Theme.js in `<head>`, notes-template.js at `</body>` end with `defer`
- [ ] First 2-3 images: only `decoding="async"`
- [ ] Remaining images: `loading="lazy" decoding="async"`
- [ ] Descriptive alt text (10+ words)
- [ ] JSON files MINIFIED
- [ ] Complete notes: All 8 mandatory end sections in order
- [ ] Overview notes: Summary + Links only
- [ ] Natural flow (not template-forced)
- [ ] 3-5+ diagrams per topic
- [ ] Exam highlights: 20-35 per topic (complete only)

---

## Writing Guidelines

### Story Test
"Could I explain this to a friend over coffee?" → If no, rewrite conversationally.

### Visual Test
"Can I visualize this?" → If yes, add diagram.

### "So What?" Test
State "what" + immediately explain "why it matters."

**Example:**
❌ "Security Groups are stateful."
✅ "Security Groups are stateful, meaning return traffic is auto-allowed - no separate rules needed."

### Grandmother Test (Complete)
"Could my grandmother understand?" → If no, add analogy.

### IT Professional Test (Overview)
"Would an IT pro find this useful?" → If no, add technical depth.

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
✅ 1 image per 2-3 paragraphs

---

## Success Criteria

**Good notes:**
- Read like blog post, not manual
- Learn from friend, not textbook
- See concepts, not just read
- Understand why, not just what

**Bad notes:**
- Rigid template
- Technical manual
- Wall of text
- Following formula

---








