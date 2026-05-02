"""
Extracts all questions and answers from PM_Exam_Kit_2025-26_ISDC.pdf
and produces questions.json with MCQ/MTQ + Section C data.
"""
import pdfplumber
import json
import re

PDF_PATH = '/Users/sudu/Downloads/PM_Exam_Kit_2025-26_ISDC.pdf'
OUTPUT_PATH = '/Users/sudu/ANA.PY/questions.json'

# PDF page indices (0-based). content_page = pdf_idx + 1 - 29
SEC_A_Q   = (29, 110)    # PDF 30-111 → content 1-82
SEC_B_Q   = (111, 176)   # PDF 112-177 → content 83-148
SEC_C_Q   = (177, 242)   # PDF 178-243 → content 149-214
SEC_A_ANS = (243, 294)   # PDF 244-295 → content 215-266
SEC_B_ANS = (295, 344)   # PDF 296-345 → content 267-316
SEC_C_ANS = (345, 456)   # PDF 346-457 → content 317-428

# ─────────────────────────────────────────
# Text helpers
# ─────────────────────────────────────────
# Matches running headers / footers produced by pdfplumber
_NOISE_RE = re.compile(
    r'^('
    r'KAPLAN PUBLISHING\s*\d*'
    r'|PM: PERFORMANCE MANAGEMENT'
    r'|P\.\d+'
    r'|KAPLAN\s+\d+'
    r'|\d+\s+KAPLAN.*'
    r'|OBJECTIVE TEST QUESTIONS.*SECTION \d+'
    r'|OBJECTIVE TEST CASE STUDY.*SECTION \d+'
    r'|CONSTRUCTED RESPONSE QUESTIONS.*SECTION \d+'
    r'|ANSWERS TO OBJECTIVE TEST.*SECTION \d+'
    r'|ANSWERS TO CONSTRUCTED.*SECTION \d+'
    r'|Section \d+'
    r')$',
    re.I
)

def clean(text):
    lines = [l for l in text.split('\n') if not _NOISE_RE.match(l.strip())]
    return '\n'.join(lines)

def extract_pages(pdf, start_idx, end_idx):
    return '\n'.join(pdf.pages[i].extract_text() or '' for i in range(start_idx, end_idx + 1))

def norm(s):
    s = re.sub(r'\n{3,}', '\n\n', s)
    s = re.sub(r'[ \t]{2,}', ' ', s)
    return s.strip()

# ─────────────────────────────────────────
# Section A – parse questions
# ─────────────────────────────────────────
KNOWN_CATS_A = {
    'MANAGEMENT INFORMATION SYSTEMS AND DATA ANALYTICS',
    'MANAGEMENT INFORMATION SYSTEMS',
    'USES AND CONTROL OF INFORMATION',
    'BIG DATA AND DATA ANALYTICS',
    'SPECIALIST COST AND MANAGEMENT ACCOUNTING TECHNIQUES',
    'ACTIVITY-BASED COSTING',
    'TARGET COSTING',
    'LIFE-CYCLE COSTING',
    'THROUGHPUT ACCOUNTING',
    'ENVIRONMENTAL ACCOUNTING',
    'DECISION-MAKING TECHNIQUES',
    'RELEVANT COST ANALYSIS',
    'COST VOLUME PROFIT ANALYSIS',
    'LIMITING FACTORS',
    'PRICING DECISIONS',
    'MAKE-OR-BUY AND OTHER SHORT TERM DECISIONS',
    'DEALING WITH RISK AND UNCERTAINTY IN DECISION-MAKING',
    'BUDGETING AND CONTROL',
    'BUDGETARY SYSTEMS AND TYPES OF BUDGET',
    'QUANTITATIVE TECHNIQUES',
    'STANDARD COSTING',
    'MIX AND YIELD VARIANCES',
    'SALES MIX AND QUANTITY VARIANCES',
    'PLANNING AND OPERATIONAL VARIANCES',
    'PERFORMANCE ANALYSIS',
    'PERFORMANCE MEASUREMENT AND CONTROL',
    'PERFORMANCE ANALYSIS IN PRIVATE SECTOR, PUBLIC SECTOR AND NOT-FOR-PROFIT ORGANISATIONS',
    'DIVISIONAL PERFORMANCE AND TRANSFER PRICING',
    'PERFORMANCE ANALYSIS ISSUES IN NOT-FOR-PROFIT ORGANISATIONS AND THE PUBLIC SECTOR',
    'EXTERNAL CONSIDERATIONS AND THE IMPACT ON PERFORMANCE',
}

def parse_section_a_questions(raw):
    text = clean(raw)
    lines = text.split('\n')

    # Real question line: starts with 1-229, followed by a LETTER (not digit/symbol)
    Q_RE  = re.compile(r'^(\d{1,3})\s+([A-Za-z].{5,})')
    OPT_RE = re.compile(r'^([A-E])\s+(.+)')
    BULL_RE = re.compile(r'^[•\-–]\s*(.+)')

    category = 'General'
    questions = []
    current_q = None
    last_q_num = 0
    state = 'SEEK'

    def flush():
        nonlocal current_q
        if current_q:
            questions.append(current_q)
            current_q = None

    def is_option_line(s):
        return bool(OPT_RE.match(s) and OPT_RE.match(s).group(1) in 'ABCDE')

    for line in lines:
        s = line.strip()
        if not s:
            continue

        # Category header
        if s.upper() in KNOWN_CATS_A:
            category = s.upper()
            continue

        # New question?
        m = Q_RE.match(s)
        if m:
            qnum = int(m.group(1))
            # Must be sequential (small step) and within Section A range
            # max_jump=15 prevents mid-sentence numbers like "100 hours of labour"
            if 1 <= qnum <= 229 and qnum > last_q_num and (qnum - last_q_num) <= 15:
                flush()
                last_q_num = qnum
                current_q = {
                    'category': category,
                    'q_number': qnum,
                    'question_text': m.group(2).strip(),
                    'options': {},
                    'bullet_options': [],
                    'option_style': 'abcd',
                }
                state = 'IN_Q'
                continue

        if current_q is None:
            continue

        if state == 'IN_Q':
            if is_option_line(s):
                om = OPT_RE.match(s)
                current_q['options'][om.group(1)] = om.group(2).strip()
                state = 'IN_OPT'
            elif BULL_RE.match(s):
                current_q['option_style'] = 'bullet'
                current_q['bullet_options'].append(BULL_RE.match(s).group(1).strip())
                state = 'IN_OPT'
            else:
                current_q['question_text'] += ' ' + s

        elif state == 'IN_OPT':
            if is_option_line(s):
                om = OPT_RE.match(s)
                current_q['options'][om.group(1)] = om.group(2).strip()
            elif BULL_RE.match(s):
                current_q['bullet_options'].append(BULL_RE.match(s).group(1).strip())
            else:
                # continuation of last option
                if current_q['options']:
                    last = list(current_q['options'].keys())[-1]
                    current_q['options'][last] += ' ' + s
                elif current_q['bullet_options']:
                    current_q['bullet_options'][-1] += ' ' + s
                else:
                    current_q['question_text'] += ' ' + s

    flush()
    return questions


# ─────────────────────────────────────────
# Section A – parse answers
# ─────────────────────────────────────────
def parse_section_a_answers(raw):
    text = clean(raw)
    lines = text.split('\n')

    Q_NUM_RE = re.compile(r'^(\d{1,3})\s*(.*)')

    answers = {}
    cur_num = None
    cur_ans = ''
    cur_expl = []
    last_num = 0

    def flush():
        if cur_num:
            answers[cur_num] = {
                'correct_answer': cur_ans,
                'explanation': norm('\n'.join(cur_expl)),
            }

    def is_answer_start(rest):
        """Return True if `rest` looks like the start of an answer entry.
        Reject only if it starts with a lowercase letter (mid-sentence continuation).
        """
        if not rest:
            return True   # bare question number — explanation follows
        return not rest[0].islower()

    def extract_answer(rest):
        """Return (correct_answer, leftover_explanation) from rest."""
        if not rest:
            return '', []
        letter_m = re.match(r'^([A-E](?:[,\s]*[A-E])*)\s*(.*)', rest)
        if letter_m:
            ans = re.sub(r'\s+', ' ', letter_m.group(1)).strip().upper()
            tail = letter_m.group(2).strip()
            return ans, [tail] if tail else []
        # Everything else: first logical token is the answer
        return rest, []

    for line in lines:
        s = line.strip()

        m = Q_NUM_RE.match(s)
        if m:
            n = int(m.group(1))
            rest = m.group(2).strip()
            # Must be sequential and within 15 steps
            if 1 <= n <= 229 and n > last_num and (n - last_num) <= 15:
                if is_answer_start(rest):
                    flush()
                    last_num = n
                    cur_num = n
                    cur_ans, cur_expl = extract_answer(rest)
                    continue

        if cur_num is not None:
            cur_expl.append(s)

    flush()
    return answers


# ─────────────────────────────────────────
# Section B – parse questions
# ─────────────────────────────────────────
CASE_HEADER_RE = re.compile(
    r'^(\d{3})\s+([A-Z][A-Z\s\'\-,\.&]+?)\s*(?:\(([^)]+)\))?\s*$'
)
SUB_Q_RE = re.compile(r'^(\d)\s+(.{10,})')  # sub-question: 1 digit + ≥10 chars

SECTION_B_CAT_MAP = {
    'SPECIALIST COST': 'Specialist Cost and Management Accounting Techniques',
    'DECISION': 'Decision-Making Techniques',
    'BUDGETING': 'Budgeting and Control',
    'PERFORMANCE MEASUREMENT': 'Performance Measurement and Control',
}

def _b_category(s):
    su = s.upper()
    for k, v in SECTION_B_CAT_MAP.items():
        if su.startswith(k):
            return v
    return None

def parse_section_b_questions(raw):
    text = clean(raw)
    lines = text.split('\n')
    OPT_RE = re.compile(r'^([A-E])\s+(.+)')

    cases = []
    cur = None
    cur_subq = None
    category = ''
    state = 'SEEK'

    def flush_subq():
        if cur_subq and cur:
            cur['questions'].append(cur_subq)

    def flush_case():
        flush_subq()
        if cur:
            cases.append(cur)

    for line in lines:
        s = line.strip()
        if not s:
            continue

        cat = _b_category(s)
        if cat:
            category = cat
            continue

        cm = CASE_HEADER_RE.match(s)
        if cm:
            cnum = int(cm.group(1))
            if 230 <= cnum <= 263:  # only valid Section B cases
                flush_case()
                cur = {
                    'case_number': cnum,
                    'case_name': cm.group(2).strip().title(),
                    'exam_session': cm.group(3) or '',
                    'category': category,
                    'scenario_lines': [],
                    'questions': [],
                }
                cur_subq = None
                state = 'SCENARIO'
                continue

        if cur is None:
            continue

        sqm = SUB_Q_RE.match(s) if state in ('SCENARIO', 'IN_SQ', 'IN_OPT') else None
        if sqm:
            existing = [q['q_number'] for q in cur['questions']]
            if cur_subq:
                existing.append(cur_subq['q_number'])
            next_expected = (max(existing) + 1) if existing else 1
            sn = int(sqm.group(1))
            if sn == next_expected and 1 <= sn <= 5:
                flush_subq()
                cur_subq = {
                    'q_number': sn,
                    'question_text': sqm.group(2).strip(),
                    'options': {},
                }
                state = 'IN_SQ'
                continue

        if state in ('IN_SQ', 'IN_OPT'):
            om = OPT_RE.match(s)
            if om and om.group(1) in 'ABCDE':
                cur_subq['options'][om.group(1)] = om.group(2).strip()
                state = 'IN_OPT'
            elif state == 'IN_OPT' and cur_subq['options']:
                last = list(cur_subq['options'].keys())[-1]
                cur_subq['options'][last] += ' ' + s
            elif state == 'IN_SQ':
                cur_subq['question_text'] += ' ' + s
        elif state == 'SCENARIO':
            cur['scenario_lines'].append(s)

    flush_case()

    for c in cases:
        c['scenario'] = '\n'.join(c['scenario_lines'])
        del c['scenario_lines']
    return cases


# ─────────────────────────────────────────
# Section B – parse answers
# ─────────────────────────────────────────
def parse_section_b_answers(raw):
    text = clean(raw)
    lines = text.split('\n')
    OPT_RE = re.compile(r'^([A-E](?:[,\s]*[A-E])*)\s*(.*)')
    SQ_RE = re.compile(r'^(\d)\s+(.+)')

    ans_map = {}
    cur_case = None
    cur_sq = None
    cur_ans = ''
    cur_expl = []

    def flush_sq():
        if cur_case and cur_sq is not None:
            ans_map.setdefault(cur_case, {})[cur_sq] = {
                'correct_answer': cur_ans,
                'explanation': norm('\n'.join(cur_expl)),
            }

    for line in lines:
        s = line.strip()

        cm = CASE_HEADER_RE.match(s)
        if cm:
            cnum = int(cm.group(1))
            if 230 <= cnum <= 263:
                flush_sq()
                cur_case = cnum
                cur_sq = None
                cur_ans = ''
                cur_expl = []
                continue

        if cur_case is None:
            continue

        sqm = SQ_RE.match(s)
        if sqm:
            sn = int(sqm.group(1))
            rest = sqm.group(2).strip()
            # sub-questions are 1-5
            if 1 <= sn <= 5:
                om = OPT_RE.match(rest)
                if om and re.match(r'^[A-E]', rest):
                    flush_sq()
                    cur_sq = sn
                    cur_ans = om.group(1).strip().upper()
                    tail = om.group(2).strip()
                    cur_expl = [tail] if tail else []
                    continue
                # numeric answer e.g. "$6,940"
                elif rest.startswith('$') or re.match(r'^\d[\d,\.]+', rest):
                    flush_sq()
                    cur_sq = sn
                    cur_ans = rest.split()[0]
                    cur_expl = [rest]
                    continue

        if cur_sq is not None and s:
            cur_expl.append(s)

    flush_sq()
    return ans_map


# ─────────────────────────────────────────
# Section C – parse questions
# ─────────────────────────────────────────
SEC_C_CAT_MAP = {
    'DECISION MAKING': 'Decision-Making Techniques',
    'DECISION-MAKING': 'Decision-Making Techniques',
    'BUDGETING AND CONTROL': 'Budgeting and Control',
    'PERFORMANCE MEASUREMENT AND CONTROL': 'Performance Measurement and Control',
}

PART_RE = re.compile(r'^\(([a-z]+)\)\s*(.*)', re.DOTALL)

def parse_section_c_questions(raw):
    text = clean(raw)
    lines = text.split('\n')

    questions = []
    cur = None
    cur_part = None
    req_lines_default = []   # for no-sub-part questions
    category = ''
    state = 'SEEK'

    def flush_part():
        if cur_part and cur:
            cur['parts'].append(cur_part)

    def flush_q():
        nonlocal req_lines_default
        flush_part()
        # If no parts were found but we have default requirement text, create a single part
        if cur and not cur['parts'] and req_lines_default:
            cur['parts'].append({
                'part': '',
                'req_lines': req_lines_default,
            })
        req_lines_default = []
        if cur:
            questions.append(cur)

    for line in lines:
        s = line.strip()
        if not s:
            continue

        for k, v in SEC_C_CAT_MAP.items():
            if s.upper().startswith(k):
                category = v
                break

        cm = CASE_HEADER_RE.match(s)
        if cm:
            qn = int(cm.group(1))
            if 264 <= qn <= 310:
                flush_q()
                cur = {
                    'q_number': qn,
                    'q_name': cm.group(2).strip().title(),
                    'exam_session': cm.group(3) or '',
                    'category': category,
                    'scenario_lines': [],
                    'parts': [],
                }
                cur_part = None
                state = 'SCENARIO'
                continue

        if cur is None:
            continue

        if s.lower().rstrip(':') == 'required':
            state = 'PARTS'
            continue

        if state == 'PARTS':
            pm = PART_RE.match(s)
            if pm:
                flush_part()
                cur_part = {
                    'part': pm.group(1),
                    'req_lines': [pm.group(2).strip()] if pm.group(2).strip() else [],
                }
            elif cur_part:
                cur_part['req_lines'].append(s)
            else:
                req_lines_default.append(s)
        elif state == 'SCENARIO':
            cur['scenario_lines'].append(s)

    flush_q()

    for q in questions:
        q['scenario'] = '\n'.join(q['scenario_lines'])
        del q['scenario_lines']
        for p in q['parts']:
            p['requirement'] = ' '.join(p['req_lines'])
            del p['req_lines']
    return questions


# ─────────────────────────────────────────
# Section C – parse answers
# ─────────────────────────────────────────
_MARKING_SCHEME_RE = re.compile(r'ACCA\s*Marking\s*scheme', re.I)

def parse_section_c_answers(raw):
    text = clean(raw)
    lines = text.split('\n')

    ans_map = {}
    cur_q = None
    cur_part = None
    cur_lines = []
    in_marking_scheme = False
    default_lines = []   # for answers without sub-parts

    def flush_part():
        if cur_q and cur_part is not None:
            key = cur_part if cur_part else ''
            existing = ans_map.setdefault(cur_q, {}).get(key, '')
            new_content = norm('\n'.join(cur_lines))
            if len(new_content) > len(existing):
                ans_map[cur_q][key] = new_content

    def flush_default():
        """Save content that had no part label."""
        if cur_q and default_lines:
            content = norm('\n'.join(default_lines))
            if content and '' not in ans_map.get(cur_q, {}):
                ans_map.setdefault(cur_q, {})[''] = content

    for line in lines:
        s = line.strip()

        # Marking scheme marker: stop accumulating part answers
        if _MARKING_SCHEME_RE.match(s):
            flush_part()
            flush_default()
            cur_part = None
            cur_lines = []
            in_marking_scheme = True
            continue

        # Case header
        cm = CASE_HEADER_RE.match(s)
        if cm:
            qn = int(cm.group(1))
            if 264 <= qn <= 310:
                flush_part()
                flush_default()
                cur_q = qn
                cur_part = None
                cur_lines = []
                default_lines = []
                in_marking_scheme = False
                continue

        if cur_q is None or in_marking_scheme:
            continue

        # Part label
        pm = PART_RE.match(s)
        if pm:
            flush_part()
            cur_part = pm.group(1)
            cur_lines = [pm.group(2).strip()] if pm.group(2).strip() else []
            continue

        # Content accumulation
        if cur_part is not None:
            cur_lines.append(s)
        else:
            default_lines.append(s)

    flush_part()
    flush_default()
    return ans_map


# ─────────────────────────────────────────
# Assemble JSON
# ─────────────────────────────────────────
def build_json(pdf):
    print("Extracting pages…")
    raw_aq  = extract_pages(pdf, *SEC_A_Q)
    raw_bq  = extract_pages(pdf, *SEC_B_Q)
    raw_cq  = extract_pages(pdf, *SEC_C_Q)
    raw_aa  = extract_pages(pdf, *SEC_A_ANS)
    raw_ba  = extract_pages(pdf, *SEC_B_ANS)
    raw_ca  = extract_pages(pdf, *SEC_C_ANS)

    print("Parsing Section A questions…")
    a_qs  = parse_section_a_questions(raw_aq)
    print(f"  {len(a_qs)} questions")

    print("Parsing Section A answers…")
    a_ans = parse_section_a_answers(raw_aa)
    print(f"  {len(a_ans)} answers")

    print("Parsing Section B questions…")
    b_cases = parse_section_b_questions(raw_bq)
    print(f"  {len(b_cases)} cases, {sum(len(c['questions']) for c in b_cases)} sub-questions")

    print("Parsing Section B answers…")
    b_ans = parse_section_b_answers(raw_ba)
    print(f"  {len(b_ans)} cases answered")

    print("Parsing Section C questions…")
    c_qs  = parse_section_c_questions(raw_cq)
    print(f"  {len(c_qs)} questions")

    print("Parsing Section C answers…")
    c_ans = parse_section_c_answers(raw_ca)
    print(f"  {len(c_ans)} questions answered")

    # ── Section A → grouped by category ─────────────────────────────
    from collections import OrderedDict
    a_groups = OrderedDict()
    for q in a_qs:
        a_groups.setdefault(q['category'], []).append(q)

    mcq_mtq = []
    t_num = 1
    for cat, qs in a_groups.items():
        topic_qs = []
        for q in qs:
            n = q['q_number']
            ans = a_ans.get(n, {})
            opts = dict(q['options'])
            if q.get('option_style') == 'bullet':
                for i, b in enumerate(q['bullet_options']):
                    opts[chr(65 + i)] = b
            topic_qs.append({
                'q_number': n,
                'question_text': norm(q['question_text']),
                'options': opts or None,
                'correct_answer': ans.get('correct_answer', ''),
                'explanation': ans.get('explanation', ''),
            })

        mcq_mtq.append({
            'topic_number': t_num,
            'topic_name': cat.title(),
            'section': 'A',
            'scenario': None,
            'questions': topic_qs,
        })
        t_num += 1

    # ── Section B → each case is a topic ────────────────────────────
    for case in b_cases:
        cn = case['case_number']
        c_ans_map = b_ans.get(cn, {})
        topic_qs = []
        for sq in case['questions']:
            sq_ans = c_ans_map.get(sq['q_number'], {})
            topic_qs.append({
                'q_number': sq['q_number'],
                'question_text': norm(sq['question_text']),
                'options': sq['options'] or None,
                'correct_answer': sq_ans.get('correct_answer', ''),
                'explanation': sq_ans.get('explanation', ''),
            })
        mcq_mtq.append({
            'topic_number': cn,
            'topic_name': case['case_name'],
            'section': 'B',
            'exam_session': case['exam_session'],
            'category': case['category'],
            'scenario': norm(case['scenario']),
            'questions': topic_qs,
        })

    # ── Section C ────────────────────────────────────────────────────
    section_c = []
    for q in c_qs:
        qn = q['q_number']
        qans = c_ans.get(qn, {})
        parts = []
        for p in q['parts']:
            parts.append({
                'part': p['part'],
                'requirement': p['requirement'],
                'answer': qans.get(p['part'], ''),
            })
        for pl, at in qans.items():
            if not any(p['part'] == pl for p in parts):
                parts.append({'part': pl, 'requirement': '', 'answer': at})
        section_c.append({
            'topic_number': qn,
            'topic_name': q['q_name'],
            'exam_session': q['exam_session'],
            'category': q['category'],
            'scenario': norm(q['scenario']),
            'parts': parts,
        })

    total_mcq_mtq = sum(len(t['questions']) for t in mcq_mtq)
    return {
        'metadata': {
            'subject': 'ACCA PM - Performance Management',
            'source': 'Kaplan Exam Kit 2025-26 ISDC',
            'section_a_standalone_questions': len(a_qs),
            'section_b_case_studies': len(b_cases),
            'section_b_sub_questions': sum(len(c['questions']) for c in b_cases),
            'total_mcq_mtq_questions': total_mcq_mtq,
            'total_section_c_questions': len(section_c),
        },
        'mcq_mtq': mcq_mtq,
        'section_c': section_c,
    }


if __name__ == '__main__':
    print(f"Opening {PDF_PATH}")
    with pdfplumber.open(PDF_PATH) as pdf:
        print(f"PDF: {len(pdf.pages)} pages")
        data = build_json(pdf)

    with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    m = data['metadata']
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"  Section A standalone MCQs    : {m['section_a_standalone_questions']}")
    print(f"  Section B case studies       : {m['section_b_case_studies']}")
    print(f"  Section B sub-questions      : {m['section_b_sub_questions']}")
    print(f"  Total MCQ/MTQ questions      : {m['total_mcq_mtq_questions']}")
    print(f"  Section C long-form          : {m['total_section_c_questions']}")
    print(f"\n  Saved → {OUTPUT_PATH}")
    print("=" * 60)
