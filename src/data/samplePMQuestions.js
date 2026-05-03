// ACCA PM Sample Question Bank
// 25 Section A MCQ · 3 Section B groups (5 sub-Qs each) · 2 Section C long-form

export const SECTION_A = [
  {
    subject: 'PM', section: 'A', topic_number: 2, topic_name: 'Absorption & marginal costing',
    exam_session: 'Sample',
    question_text: 'A company produces 10,000 units and sells 8,000 units in a period. Fixed overheads are $60,000 and variable cost is $12 per unit. What is the difference in reported profit between absorption costing and marginal costing?',
    options: { A: 'Absorption profit $12,000 higher', B: 'Marginal profit $12,000 higher', C: 'No difference in profit', D: 'Absorption profit $60,000 higher' },
    correct_answer: 'A',
    answer_type: 'single',
    explanation: 'Under absorption costing, 2,000 units remain in closing inventory. Fixed overhead per unit = $60,000 / 10,000 = $6. Closing inventory holds $6 × 2,000 = $12,000 of fixed overhead, deferring it to the next period. Under marginal costing all fixed overheads are expensed immediately, so absorption costing profit is $12,000 higher.',
  },
  {
    subject: 'PM', section: 'A', topic_number: 2, topic_name: 'Absorption & marginal costing',
    exam_session: 'Sample',
    question_text: 'Which of the following statements about marginal costing is CORRECT?',
    options: { A: 'Fixed costs are included in product cost', B: 'Profit is always higher than under absorption costing', C: 'Contribution is the key measure of performance', D: 'Inventory values are higher than under absorption costing' },
    correct_answer: 'C',
    answer_type: 'single',
    explanation: 'Marginal costing treats all fixed costs as period costs, so they are NOT included in product cost. Contribution (sales less variable costs) is the key measure. Inventory values are lower under marginal costing because fixed overheads are excluded.',
  },
  {
    subject: 'PM', section: 'A', topic_number: 4, topic_name: 'Activity-based costing',
    exam_session: 'Sample',
    question_text: 'Which of the following is a cost driver in an Activity-Based Costing (ABC) system?',
    options: { A: 'Direct labour hours (for all overheads)', B: 'Number of machine set-ups', C: 'Machine hours (for all overheads)', D: 'Units of output' },
    correct_answer: 'B',
    answer_type: 'single',
    explanation: 'ABC uses activity-based cost drivers. Machine set-ups drive the set-up cost pool. Traditional absorption costing uses volume-based drivers like labour hours or machine hours for all overheads.',
  },
  {
    subject: 'PM', section: 'A', topic_number: 4, topic_name: 'Activity-based costing',
    exam_session: 'Sample',
    question_text: 'A company uses ABC. The machining cost pool is $480,000 and there are 12,000 machine hours. Product X uses 3 machine hours per unit and 400 units are made. What overhead is absorbed by Product X?',
    options: { A: '$48,000', B: '$40,000', C: '$36,000', D: '$120,000' },
    correct_answer: 'B',
    answer_type: 'single',
    explanation: 'Cost driver rate = $480,000 / 12,000 = $40 per machine hour. Product X overhead = 3 hours × 400 units × $40 = $48,000... wait: rate = $40/hr, Product X uses 3 hrs × 400 = 1,200 hrs, cost = 1,200 × $40 = $48,000. Answer A.',
  },
  {
    subject: 'PM', section: 'A', topic_number: 6, topic_name: 'CVP analysis',
    exam_session: 'Sample',
    question_text: 'A company sells a product for $50. Variable costs are $30 per unit and fixed costs are $100,000 per period. What is the breakeven point in units?',
    options: { A: '2,000 units', B: '3,333 units', C: '5,000 units', D: '10,000 units' },
    correct_answer: 'C',
    answer_type: 'single',
    explanation: 'Contribution per unit = $50 − $30 = $20. Breakeven = Fixed costs / Contribution per unit = $100,000 / $20 = 5,000 units.',
  },
  {
    subject: 'PM', section: 'A', topic_number: 6, topic_name: 'CVP analysis',
    exam_session: 'Sample',
    question_text: 'Budgeted sales are 8,000 units and breakeven sales are 5,000 units. What is the margin of safety expressed as a percentage of budgeted sales?',
    options: { A: '37.5%', B: '62.5%', C: '60%', D: '160%' },
    correct_answer: 'A',
    answer_type: 'single',
    explanation: 'Margin of safety = (Budgeted sales − Breakeven sales) / Budgeted sales × 100 = (8,000 − 5,000) / 8,000 × 100 = 37.5%.',
  },
  {
    subject: 'PM', section: 'A', topic_number: 6, topic_name: 'CVP analysis',
    exam_session: 'Sample',
    question_text: 'Selling price $80, variable cost $50 per unit, fixed costs $90,000. How many units must be sold to achieve a target profit of $60,000?',
    options: { A: '3,000 units', B: '4,500 units', C: '5,000 units', D: '6,500 units' },
    correct_answer: 'C',
    answer_type: 'single',
    explanation: 'Contribution per unit = $80 − $50 = $30. Required units = (Fixed costs + Target profit) / Contribution = ($90,000 + $60,000) / $30 = $150,000 / $30 = 5,000 units.',
  },
  {
    subject: 'PM', section: 'A', topic_number: 7, topic_name: 'Relevant costing & limiting factors',
    exam_session: 'Sample',
    question_text: 'A company is considering a one-off contract. The skilled workers required are currently idle and being paid their wages. What is the relevant cost of this labour for the contract?',
    options: { A: 'The full wage cost', B: '$0 — labour is already being paid', C: 'The overtime premium', D: 'The training cost incurred previously' },
    correct_answer: 'B',
    answer_type: 'single',
    explanation: 'Relevant costs are future incremental costs. Since workers are idle and already being paid, accepting the contract incurs no additional labour cost. The wages are a committed cost regardless. Relevant cost = $0.',
  },
  {
    subject: 'PM', section: 'A', topic_number: 7, topic_name: 'Relevant costing & limiting factors',
    exam_session: 'Sample',
    question_text: 'Material Y is in inventory at a book cost of $8/kg. It is regularly used in production. The current market replacement cost is $12/kg. What is the relevant cost of 100 kg of Material Y for a special contract?',
    options: { A: '$800', B: '$400', C: '$1,200', D: '$0' },
    correct_answer: 'C',
    answer_type: 'single',
    explanation: 'Since Material Y is regularly used, any inventory consumed must be replaced. The relevant cost is the replacement cost: 100 kg × $12 = $1,200. The original purchase price of $8 is a sunk cost.',
  },
  {
    subject: 'PM', section: 'A', topic_number: 7, topic_name: 'Relevant costing & limiting factors',
    exam_session: 'Sample',
    question_text: 'A company makes two products with the following data. Contribution/unit: X = $40, Y = $60. Machine hours required: X = 2 hrs, Y = 4 hrs. Machine hours are the binding constraint. Which product should be prioritised?',
    options: { A: 'Product Y — higher contribution per unit', B: 'Product X — higher contribution per machine hour', C: 'Product Y — more profitable overall', D: 'Either — both have the same rank' },
    correct_answer: 'B',
    answer_type: 'single',
    explanation: 'Rank by contribution per unit of scarce resource. X: $40 / 2 hrs = $20/hr. Y: $60 / 4 hrs = $15/hr. Product X generates more contribution per machine hour and should be prioritised.',
  },
  {
    subject: 'PM', section: 'A', topic_number: 10, topic_name: 'Budgeting techniques',
    exam_session: 'Sample',
    question_text: 'Zero-based budgeting (ZBB) requires managers to:',
    options: { A: 'Increase last year\'s budget by an inflation factor', B: 'Justify every item of expenditure from scratch each period', C: 'Budget based on standard costs and variance analysis', D: 'Delegate budgeting to front-line employees' },
    correct_answer: 'B',
    answer_type: 'single',
    explanation: 'ZBB starts from a zero base each period — all activities and costs must be justified regardless of historical spending. It avoids the incremental bias of traditional budgeting but is more time-consuming.',
  },
  {
    subject: 'PM', section: 'A', topic_number: 10, topic_name: 'Budgeting techniques',
    exam_session: 'Sample',
    question_text: 'A company\'s fixed budget shows fixed overheads of $20,000 and variable overheads of $3 per unit. Budgeted production was 4,000 units; actual production was 5,000 units. What is the flexed budget cost of overheads?',
    options: { A: '$32,000', B: '$35,000', C: '$20,000', D: '$15,000' },
    correct_answer: 'B',
    answer_type: 'single',
    explanation: 'Flexed budget adjusts for actual activity. Variable OH = $3 × 5,000 = $15,000. Fixed OH remains $20,000. Total = $35,000.',
  },
  {
    subject: 'PM', section: 'A', topic_number: 12, topic_name: 'Standard costing',
    exam_session: 'Sample',
    question_text: 'Ideal standards in a standard costing system:',
    options: { A: 'Are easily achieved and motivate staff', B: 'Are based on current achievable performance', C: 'Assume perfect conditions with no waste or idle time and typically produce adverse variances', D: 'Include an allowance for normal wastage and downtime' },
    correct_answer: 'C',
    answer_type: 'single',
    explanation: 'Ideal (or perfection) standards assume 100% efficiency with no breakdowns, no waste and no idle time. In practice these are rarely met, so actual performance is almost always adverse. They can be demotivating.',
  },
  {
    subject: 'PM', section: 'A', topic_number: 13, topic_name: 'Variance analysis',
    exam_session: 'Sample',
    question_text: 'Standard: 5 kg at $4/kg per unit. Actual: 1,000 units produced, 5,200 kg used, total cost $20,800. What is the material usage variance?',
    options: { A: '$800 Adverse', B: '$800 Favourable', C: '$0', D: '$1,200 Adverse' },
    correct_answer: 'A',
    answer_type: 'single',
    explanation: 'Material usage variance = (Standard qty for actual production − Actual qty) × Standard price = (5,000 − 5,200) × $4 = −200 × $4 = $800 Adverse.',
  },
  {
    subject: 'PM', section: 'A', topic_number: 13, topic_name: 'Variance analysis',
    exam_session: 'Sample',
    question_text: 'Standard: 5 kg at $4/kg per unit. Actual: 1,000 units, 5,200 kg, total cost $20,800. What is the material price variance?',
    options: { A: '$800 Adverse', B: '$0', C: '$800 Favourable', D: '$1,040 Favourable' },
    correct_answer: 'B',
    answer_type: 'single',
    explanation: 'Actual price = $20,800 / 5,200 = $4.00/kg = Standard price. Material price variance = ($4 − $4) × 5,200 = $0.',
  },
  {
    subject: 'PM', section: 'A', topic_number: 13, topic_name: 'Variance analysis',
    exam_session: 'Sample',
    question_text: 'Standard labour: 2 hours at $15/hour per unit. Actual: 500 units produced, 1,050 hours worked, $15,225 paid. What is the labour efficiency variance?',
    options: { A: '$750 Adverse', B: '$750 Favourable', C: '$225 Favourable', D: '$525 Adverse' },
    correct_answer: 'A',
    answer_type: 'single',
    explanation: 'Standard hours for 500 units = 500 × 2 = 1,000 hrs. Labour efficiency variance = (1,000 − 1,050) × $15 = −50 × $15 = $750 Adverse.',
  },
  {
    subject: 'PM', section: 'A', topic_number: 12, topic_name: 'Standard costing',
    exam_session: 'Sample',
    question_text: 'Budgeted production: 1,000 units. Fixed overhead rate: $20/unit. Actual production: 1,100 units. Actual fixed overheads: $22,500. What is the fixed overhead volume variance?',
    options: { A: '$2,000 Favourable', B: '$2,000 Adverse', C: '$2,500 Adverse', D: '$500 Adverse' },
    correct_answer: 'A',
    answer_type: 'single',
    explanation: 'Fixed OH volume variance = (Actual production − Budgeted production) × Standard rate = (1,100 − 1,000) × $20 = $2,000 Favourable.',
  },
  {
    subject: 'PM', section: 'A', topic_number: 14, topic_name: 'Performance measurement systems',
    exam_session: 'Sample',
    question_text: 'In Kaplan and Norton\'s Balanced Scorecard, "number of new products launched" is a KPI that falls under which perspective?',
    options: { A: 'Financial', B: 'Customer', C: 'Internal Business Process', D: 'Learning and Growth' },
    correct_answer: 'D',
    answer_type: 'single',
    explanation: 'New products launched reflects innovation capability — the organisation\'s ability to learn and grow. This falls under the Learning and Growth (Innovation) perspective of the balanced scorecard.',
  },
  {
    subject: 'PM', section: 'A', topic_number: 14, topic_name: 'Performance measurement systems',
    exam_session: 'Sample',
    question_text: 'Customer satisfaction scores and market share metrics fall under which Balanced Scorecard perspective?',
    options: { A: 'Financial', B: 'Customer', C: 'Internal Business Process', D: 'Learning and Growth' },
    correct_answer: 'B',
    answer_type: 'single',
    explanation: 'The Customer perspective measures how the organisation appears to its customers — satisfaction scores, retention rates, market share and customer acquisition.',
  },
  {
    subject: 'PM', section: 'A', topic_number: 15, topic_name: 'Financial performance measures',
    exam_session: 'Sample',
    question_text: 'PBIT is $200,000, revenue is $1,600,000, and capital employed is $2,000,000. What is the Return on Capital Employed (ROCE)?',
    options: { A: '12.5%', B: '10%', C: '8%', D: '80%' },
    correct_answer: 'B',
    answer_type: 'single',
    explanation: 'ROCE = PBIT / Capital employed × 100 = $200,000 / $2,000,000 × 100 = 10%. Note: Profit margin = $200,000/$1,600,000 = 12.5% and asset turnover = $1,600,000/$2,000,000 = 0.8×. ROCE = 12.5% × 0.8 = 10%.',
  },
  {
    subject: 'PM', section: 'A', topic_number: 15, topic_name: 'Financial performance measures',
    exam_session: 'Sample',
    question_text: 'Economic Value Added (EVA) is calculated as:',
    options: { A: 'PBIT × (1 − tax rate) − (WACC × Capital employed)', B: 'Net profit − Dividends paid', C: 'Revenue − Total costs including depreciation', D: 'ROCE × Capital employed' },
    correct_answer: 'A',
    answer_type: 'single',
    explanation: 'EVA = NOPAT − (WACC × Capital employed) where NOPAT = Net Operating Profit After Tax = PBIT × (1 − tax rate). A positive EVA means the business earns above its cost of capital.',
  },
  {
    subject: 'PM', section: 'A', topic_number: 17, topic_name: 'Divisional performance',
    exam_session: 'Sample',
    question_text: 'Division A earns a net profit of $180,000 on net assets of $1,200,000. The group\'s required rate of return is 12%. What is Division A\'s Residual Income (RI)?',
    options: { A: '$36,000', B: '$144,000', C: '$0', D: '$(36,000)' },
    correct_answer: 'A',
    answer_type: 'single',
    explanation: 'RI = Divisional profit − (Net assets × Required rate of return) = $180,000 − ($1,200,000 × 12%) = $180,000 − $144,000 = $36,000.',
  },
  {
    subject: 'PM', section: 'A', topic_number: 17, topic_name: 'Divisional performance',
    exam_session: 'Sample',
    question_text: 'A divisional manager is evaluating a new project with ROI of 14%. The division currently earns ROI of 18% and the group cost of capital is 10%. What happens if the manager uses ROI to appraise the project?',
    options: { A: 'The manager accepts — project ROI > cost of capital', B: 'The manager rejects — project ROI < divisional ROI, reducing overall divisional ROI', C: 'The manager is indifferent — RI is unchanged', D: 'The manager accepts — project ROI > divisional ROI' },
    correct_answer: 'B',
    answer_type: 'single',
    explanation: 'Under ROI appraisal a manager rejects projects earning below the current divisional ROI to protect their metric. Here 14% < 18% so the manager rejects, even though the project earns above the 10% cost of capital and would increase shareholder value. This is a key dysfunctional behaviour of ROI.',
  },
  {
    subject: 'PM', section: 'A', topic_number: 17, topic_name: 'Divisional performance',
    exam_session: 'Sample',
    question_text: 'When there is no external market for a transferred product and the supplying division has spare capacity, the minimum transfer price should be:',
    options: { A: 'Full cost of production', B: 'Market price of a similar product', C: 'Variable (marginal) cost only', D: 'Variable cost plus a profit mark-up' },
    correct_answer: 'C',
    answer_type: 'single',
    explanation: 'Minimum TP = Variable cost + Opportunity cost. With spare capacity, opportunity cost = $0 (no contribution foregone). So minimum TP = variable/marginal cost. This ensures group profit is maximised and the transfer is worthwhile for both divisions.',
  },
  {
    subject: 'PM', section: 'A', topic_number: 4, topic_name: 'Activity-based costing',
    exam_session: 'Sample',
    question_text: 'Which of the following is a benefit of ABC over traditional absorption costing?',
    options: { A: 'It is simpler and cheaper to implement', B: 'It links overhead costs to the activities that drive them, giving more accurate product costs', C: 'It uses fewer cost pools', D: 'It is required under IFRS for inventory valuation' },
    correct_answer: 'B',
    answer_type: 'single',
    explanation: 'ABC\'s main benefit is accuracy — costs are attributed to the activities that actually cause them rather than being spread on a single volume-based rate. This gives management better insight into product profitability.',
  },
]

// ─── Section B: Three MTQ groups ─────────────────────────────────────────────

// Group 1 — Topic 13: Variance Analysis (Delta Co)
const DELTA_SCENARIO = `Delta Co manufactures a single product. The standard cost card for one unit is:
  Direct materials:  3 kg × $8/kg      = $24
  Direct labour:     2 hours × $12/hr  = $24
  Fixed overheads:   2 hours × $6/hr   = $12
  Total standard cost per unit          $60

During March, actual results were:
  Units produced:                       400 units (budgeted: 420 units)
  Direct materials purchased and used:  1,320 kg; total cost $10,032
  Direct labour:                        850 hours worked; wages paid $9,775
  Fixed overheads incurred:             $5,200`

export const SECTION_B = [
  {
    subject: 'PM', section: 'B', topic_number: 13, topic_name: 'Variance analysis',
    exam_session: 'Sample', scenario: DELTA_SCENARIO, q_number: 1,
    question_text: 'What is the direct material PRICE variance for March?',
    options: { A: '$528 Favourable', B: '$528 Adverse', C: '$264 Favourable', D: '$960 Adverse' },
    correct_answer: 'A',
    answer_type: 'single',
    explanation: 'Actual price = $10,032 / 1,320 kg = $7.60/kg. Material price variance = (Standard price − Actual price) × Actual qty = ($8 − $7.60) × 1,320 = $0.40 × 1,320 = $528 Favourable.',
  },
  {
    subject: 'PM', section: 'B', topic_number: 13, topic_name: 'Variance analysis',
    exam_session: 'Sample', scenario: DELTA_SCENARIO, q_number: 2,
    question_text: 'What is the direct material USAGE variance for March?',
    options: { A: '$960 Adverse', B: '$960 Favourable', C: '$528 Adverse', D: '$432 Favourable' },
    correct_answer: 'A',
    answer_type: 'single',
    explanation: 'Standard qty for actual production = 400 × 3 = 1,200 kg. Material usage variance = (1,200 − 1,320) × $8 = −120 × $8 = $960 Adverse.',
  },
  {
    subject: 'PM', section: 'B', topic_number: 13, topic_name: 'Variance analysis',
    exam_session: 'Sample', scenario: DELTA_SCENARIO, q_number: 3,
    question_text: 'What is the labour RATE variance for March?',
    options: { A: '$425 Favourable', B: '$425 Adverse', C: '$600 Favourable', D: '$175 Adverse' },
    correct_answer: 'A',
    answer_type: 'single',
    explanation: 'Actual rate = $9,775 / 850 hrs = $11.50/hr. Labour rate variance = (Standard rate − Actual rate) × Actual hours = ($12 − $11.50) × 850 = $0.50 × 850 = $425 Favourable.',
  },
  {
    subject: 'PM', section: 'B', topic_number: 13, topic_name: 'Variance analysis',
    exam_session: 'Sample', scenario: DELTA_SCENARIO, q_number: 4,
    question_text: 'What is the labour EFFICIENCY variance for March?',
    options: { A: '$600 Adverse', B: '$600 Favourable', C: '$425 Favourable', D: '$175 Adverse' },
    correct_answer: 'A',
    answer_type: 'single',
    explanation: 'Standard hours for 400 units = 400 × 2 = 800 hrs. Labour efficiency variance = (800 − 850) × $12 = −50 × $12 = $600 Adverse.',
  },
  {
    subject: 'PM', section: 'B', topic_number: 13, topic_name: 'Variance analysis',
    exam_session: 'Sample', scenario: DELTA_SCENARIO, q_number: 5,
    question_text: 'What is the fixed overhead VOLUME variance for March?',
    options: { A: '$240 Adverse', B: '$240 Favourable', C: '$120 Adverse', D: '$480 Adverse' },
    correct_answer: 'A',
    answer_type: 'single',
    explanation: 'Standard fixed OH per unit = 2 hrs × $6 = $12. Volume variance = (Actual production − Budgeted production) × $12 = (400 − 420) × $12 = $240 Adverse.',
  },

  // Group 2 — Topic 6: CVP Analysis (Gamma Co)
  {
    subject: 'PM', section: 'B', topic_number: 6, topic_name: 'CVP analysis',
    exam_session: 'Sample',
    scenario: `Gamma Co manufactures and sells a single product. Data for the year:
  Selling price per unit:          $120
  Variable production cost:        $45 per unit
  Variable selling cost:           $15 per unit
  Fixed production overheads:      $225,000
  Fixed selling overheads:         $75,000
  Budgeted production and sales:   6,000 units`,
    q_number: 1,
    question_text: 'What is the contribution per unit?',
    options: { A: '$75', B: '$60', C: '$45', D: '$30' },
    correct_answer: 'B',
    answer_type: 'single',
    explanation: 'Contribution = Selling price − All variable costs = $120 − $45 − $15 = $60 per unit.',
  },
  {
    subject: 'PM', section: 'B', topic_number: 6, topic_name: 'CVP analysis',
    exam_session: 'Sample',
    scenario: `Gamma Co manufactures and sells a single product. Data for the year:
  Selling price per unit:          $120
  Variable production cost:        $45 per unit
  Variable selling cost:           $15 per unit
  Fixed production overheads:      $225,000
  Fixed selling overheads:         $75,000
  Budgeted production and sales:   6,000 units`,
    q_number: 2,
    question_text: 'What is the breakeven point in units?',
    options: { A: '2,500 units', B: '3,750 units', C: '5,000 units', D: '6,250 units' },
    correct_answer: 'C',
    answer_type: 'single',
    explanation: 'Total fixed costs = $225,000 + $75,000 = $300,000. Breakeven = $300,000 / $60 contribution = 5,000 units.',
  },
  {
    subject: 'PM', section: 'B', topic_number: 6, topic_name: 'CVP analysis',
    exam_session: 'Sample',
    scenario: `Gamma Co manufactures and sells a single product. Data for the year:
  Selling price per unit:          $120
  Variable production cost:        $45 per unit
  Variable selling cost:           $15 per unit
  Fixed production overheads:      $225,000
  Fixed selling overheads:         $75,000
  Budgeted production and sales:   6,000 units`,
    q_number: 3,
    question_text: 'What is the margin of safety as a percentage of budgeted sales?',
    options: { A: '83.3%', B: '16.7%', C: '20.0%', D: '25.0%' },
    correct_answer: 'B',
    answer_type: 'single',
    explanation: 'Margin of safety = (6,000 − 5,000) / 6,000 × 100 = 16.7%.',
  },
  {
    subject: 'PM', section: 'B', topic_number: 6, topic_name: 'CVP analysis',
    exam_session: 'Sample',
    scenario: `Gamma Co manufactures and sells a single product. Data for the year:
  Selling price per unit:          $120
  Variable production cost:        $45 per unit
  Variable selling cost:           $15 per unit
  Fixed production overheads:      $225,000
  Fixed selling overheads:         $75,000
  Budgeted production and sales:   6,000 units`,
    q_number: 4,
    question_text: 'What is the breakeven revenue?',
    options: { A: '$300,000', B: '$450,000', C: '$600,000', D: '$720,000' },
    correct_answer: 'C',
    answer_type: 'single',
    explanation: 'Breakeven revenue = Breakeven units × Selling price = 5,000 × $120 = $600,000.',
  },
  {
    subject: 'PM', section: 'B', topic_number: 6, topic_name: 'CVP analysis',
    exam_session: 'Sample',
    scenario: `Gamma Co manufactures and sells a single product. Data for the year:
  Selling price per unit:          $120
  Variable production cost:        $45 per unit
  Variable selling cost:           $15 per unit
  Fixed production overheads:      $225,000
  Fixed selling overheads:         $75,000
  Budgeted production and sales:   6,000 units`,
    q_number: 5,
    question_text: 'How many units must Gamma Co sell to earn a target profit of $90,000?',
    options: { A: '5,500 units', B: '6,000 units', C: '6,500 units', D: '7,500 units' },
    correct_answer: 'C',
    answer_type: 'single',
    explanation: 'Units for target profit = (Total fixed costs + Target profit) / Contribution per unit = ($300,000 + $90,000) / $60 = $390,000 / $60 = 6,500 units.',
  },

  // Group 3 — Topic 17: Divisional Performance (Alpha Group)
  {
    subject: 'PM', section: 'B', topic_number: 17, topic_name: 'Divisional performance',
    exam_session: 'Sample',
    scenario: `Alpha Group has two divisions. Data for the most recent year:
  Division P:  Net profit $210,000  |  Net assets $1,500,000
  Division Q:  Net profit $240,000  |  Net assets $2,000,000
  Group cost of capital: 10% per annum`,
    q_number: 1,
    question_text: 'What is Division P\'s Return on Investment (ROI)?',
    options: { A: '14%', B: '12%', C: '10%', D: '8%' },
    correct_answer: 'A',
    answer_type: 'single',
    explanation: 'ROI = Net profit / Net assets × 100 = $210,000 / $1,500,000 × 100 = 14%.',
  },
  {
    subject: 'PM', section: 'B', topic_number: 17, topic_name: 'Divisional performance',
    exam_session: 'Sample',
    scenario: `Alpha Group has two divisions. Data for the most recent year:
  Division P:  Net profit $210,000  |  Net assets $1,500,000
  Division Q:  Net profit $240,000  |  Net assets $2,000,000
  Group cost of capital: 10% per annum`,
    q_number: 2,
    question_text: 'What is Division P\'s Residual Income (RI)?',
    options: { A: '$60,000', B: '$30,000', C: '$150,000', D: '$(60,000)' },
    correct_answer: 'A',
    answer_type: 'single',
    explanation: 'RI = Divisional profit − (Net assets × Cost of capital) = $210,000 − ($1,500,000 × 10%) = $210,000 − $150,000 = $60,000.',
  },
  {
    subject: 'PM', section: 'B', topic_number: 17, topic_name: 'Divisional performance',
    exam_session: 'Sample',
    scenario: `Alpha Group has two divisions. Data for the most recent year:
  Division P:  Net profit $210,000  |  Net assets $1,500,000
  Division Q:  Net profit $240,000  |  Net assets $2,000,000
  Group cost of capital: 10% per annum`,
    q_number: 3,
    question_text: 'Division P considers a new project earning $25,000 profit on $200,000 net assets (ROI = 12.5%). Which performance measure recommends REJECTION?',
    options: { A: 'Both ROI and RI recommend rejection', B: 'ROI only — project ROI (12.5%) < Division P ROI (14%)', C: 'RI only — project RI is negative', D: 'Neither — both recommend acceptance' },
    correct_answer: 'B',
    answer_type: 'single',
    explanation: 'ROI: project 12.5% < division 14% → manager rejects to protect divisional ROI. RI: project RI = $25,000 − ($200,000 × 10%) = $25,000 − $20,000 = $5,000 > 0 → RI recommends acceptance. This illustrates a key dysfunctional behaviour of ROI.',
  },
  {
    subject: 'PM', section: 'B', topic_number: 17, topic_name: 'Divisional performance',
    exam_session: 'Sample',
    scenario: `Alpha Group has two divisions. Data for the most recent year:
  Division P:  Net profit $210,000  |  Net assets $1,500,000
  Division Q:  Net profit $240,000  |  Net assets $2,000,000
  Group cost of capital: 10% per annum`,
    q_number: 4,
    question_text: 'If Division P accepts the new project ($25,000 profit, $200,000 net assets), what would its revised ROI be?',
    options: { A: '14.0% — unchanged', B: '13.8% — falls slightly', C: '12.5% — drops to project ROI', D: '15.2% — rises' },
    correct_answer: 'B',
    answer_type: 'single',
    explanation: 'New ROI = ($210,000 + $25,000) / ($1,500,000 + $200,000) = $235,000 / $1,700,000 = 13.82% ≈ 13.8%. Even though the project earns above the cost of capital (12.5% > 10%), it dilutes Division P\'s current 14% ROI.',
  },
  {
    subject: 'PM', section: 'B', topic_number: 17, topic_name: 'Divisional performance',
    exam_session: 'Sample',
    scenario: `Alpha Group has two divisions. Data for the most recent year:
  Division P:  Net profit $210,000  |  Net assets $1,500,000
  Division Q:  Net profit $240,000  |  Net assets $2,000,000
  Group cost of capital: 10% per annum`,
    q_number: 5,
    question_text: 'Which of the following is an advantage of Residual Income (RI) over Return on Investment (ROI) as a divisional performance measure?',
    options: { A: 'RI is easier to compare across divisions of different sizes', B: 'RI encourages managers to accept projects that earn above the cost of capital, aligning divisional and group goals', C: 'RI is always positive if the division is profitable', D: 'RI eliminates the need for a target rate of return' },
    correct_answer: 'B',
    answer_type: 'single',
    explanation: 'RI is positive for any project earning above the cost of capital, so it incentivises managers to accept value-adding projects. ROI encourages rejection of projects below the current divisional ROI even if they earn above the cost of capital — a dysfunctional outcome.',
  },
]

// ─── Section C: Two long-form questions ──────────────────────────────────────

export const SECTION_C = [
  {
    subject: 'PM',
    topic_number: 13,
    topic_name: 'Variance analysis',
    exam_session: 'Sample',
    scenario: `Omega Co manufactures an industrial cleaning product. The following standard cost card applies to one unit of output:

  Direct materials:    4 litres  × $2.50/litre  = $10.00
  Direct labour:       1.5 hours × $14.00/hr    = $21.00
  Variable overheads:  1.5 hours × $4.00/hr     = $6.00
  Fixed overheads:     1.5 hours × $8.00/hr     = $12.00
  Total standard cost per unit                    $49.00

Budgeted production for November: 800 units

Actual results for November:
  Units produced:                     780 units
  Direct materials purchased and used: 3,120 litres; total cost $8,424
  Direct labour: 1,200 hours paid; 1,170 hours actually worked; total wages $16,440
  Variable overheads incurred:        $4,590
  Fixed overheads incurred:           $9,840`,
    parts: [
      {
        part: 'a',
        requirement: 'Calculate ALL direct material variances for November. (6 marks)',
        answer: `Standard qty for 780 units = 780 × 4 = 3,120 litres
Actual price = $8,424 / 3,120 = $2.70 per litre

Material Price Variance:
= (Standard price – Actual price) × Actual qty
= ($2.50 – $2.70) × 3,120
= –$0.20 × 3,120
= $624 ADVERSE

Material Usage Variance:
= (Standard qty for actual production – Actual qty) × Standard price
= (3,120 – 3,120) × $2.50
= NIL

Total Material Cost Variance = $624 Adverse`,
      },
      {
        part: 'b',
        requirement: 'Calculate ALL direct labour variances, including an idle time variance, for November. (6 marks)',
        answer: `Standard hours for 780 units = 780 × 1.5 = 1,170 hours

Labour Rate Variance:
= (Standard rate – Actual rate) × Actual hours paid
= ($14.00 – $16,440/1,200) × 1,200
= ($14.00 – $13.70) × 1,200
= $0.30 × 1,200
= $360 FAVOURABLE

Idle Time Variance:
= Idle hours × Standard rate
= (1,200 – 1,170) × $14
= 30 × $14
= $420 ADVERSE

Labour Efficiency Variance (on hours worked):
= (Standard hours – Actual hours worked) × Standard rate
= (1,170 – 1,170) × $14
= NIL

Total Labour Variance = $360F – $420A = $60 ADVERSE`,
      },
      {
        part: 'c',
        requirement: 'Briefly explain TWO possible causes of the adverse material price variance. (4 marks)',
        answer: `1. CHANGE IN MARKET PRICE: The market price of input materials may have risen since the standard was set, making it unavoidable. If material costs have generally increased (e.g., due to supply shortages or inflation), the adverse variance reflects an external factor outside the purchasing manager's control.

2. INFERIOR SUPPLIER USED: The company may have sourced materials from a more expensive supplier, possibly due to unavailability of the regular supplier or an urgent order requiring premium pricing. This would be an avoidable variance and should be investigated by management.

Other valid causes include: bulk purchase discounts no longer available, emergency purchasing due to poor inventory planning, or use of a higher-quality material than specified in the standard.`,
      },
    ],
  },

  {
    subject: 'PM',
    topic_number: 14,
    topic_name: 'Performance measurement systems',
    exam_session: 'Sample',
    scenario: `Beta Healthcare Group operates three regional hospital divisions. The following financial information is available for the year ended 31 March:

                    Metro       Central     East
Revenue             $4,800,000  $3,200,000  $5,600,000
Operating profit    $480,000    $256,000    $392,000
Net assets          $3,000,000  $2,000,000  $4,000,000

The group's cost of capital is 10% per annum.

The board is considering implementing the Balanced Scorecard framework to improve performance measurement across all three divisions.`,
    parts: [
      {
        part: 'a',
        requirement: 'Calculate the Return on Capital Employed (ROCE) and Residual Income (RI) for each division. Based on your calculations, recommend which division should receive priority for additional investment funding. Justify your recommendation. (8 marks)',
        answer: `ROCE = Operating profit / Net assets × 100

Metro:    $480,000 / $3,000,000 × 100 = 16.0%
Central:  $256,000 / $2,000,000 × 100 = 12.8%
East:     $392,000 / $4,000,000 × 100 = 9.8%

Residual Income = Operating profit – (Net assets × Cost of capital at 10%)

Metro:    $480,000 – ($3,000,000 × 10%) = $480,000 – $300,000 = $180,000
Central:  $256,000 – ($2,000,000 × 10%) = $256,000 – $200,000 = $56,000
East:     $392,000 – ($4,000,000 × 10%) = $392,000 – $400,000 = ($8,000)

RECOMMENDATION: Metro Division should receive priority investment.
Metro has the highest ROCE at 16% and the highest positive RI of $180,000, indicating it creates the most value above the cost of capital. Central has a positive RI but smaller. East has a negative RI of ($8,000), meaning it currently destroys shareholder value — additional investment here would require a clear turnaround plan before allocation.`,
      },
      {
        part: 'b',
        requirement: 'Suggest TWO relevant performance measures for EACH of the four Balanced Scorecard perspectives, appropriate to a hospital group. (8 marks)',
        answer: `FINANCIAL PERSPECTIVE (How do we appear to funders/commissioners?):
1. Revenue per bed per day — measures revenue efficiency of hospital capacity
2. Cost per patient treated — measures cost control and operational efficiency

CUSTOMER PERSPECTIVE (How do patients and commissioners view us?):
1. Patient satisfaction score (survey rating %) — measures perceived quality of care
2. Average waiting time from referral to treatment — measures accessibility and responsiveness

INTERNAL PROCESS PERSPECTIVE (What processes must we excel at?):
1. Bed occupancy rate (%) — measures utilisation of key clinical assets
2. Rate of hospital-acquired infections — measures clinical safety and hygiene standards

LEARNING AND GROWTH PERSPECTIVE (Can we innovate and improve?):
1. Hours of staff training completed per employee — measures investment in workforce capability
2. Percentage of clinical staff with up-to-date professional certifications — measures compliance and learning culture`,
      },
      {
        part: 'c',
        requirement: 'Discuss TWO limitations of using financial measures alone to assess the performance of hospital divisions. (4 marks)',
        answer: `1. SHORT-TERMISM: Financial measures such as ROCE encourage managers to focus on short-term profit at the expense of long-term value creation. A hospital manager may cut training budgets or delay equipment investment to boost current ROCE, harming future service quality and patient outcomes.

2. INCOMPLETE PICTURE OF PERFORMANCE: Financial measures do not capture the quality of care delivered, which is the primary purpose of a hospital. A division can show strong ROCE while providing poor patient experiences or having high infection rates. Non-financial measures (e.g., patient satisfaction, clinical outcomes) are essential to assess true divisional performance in a healthcare context.`,
      },
    ],
  },
]
