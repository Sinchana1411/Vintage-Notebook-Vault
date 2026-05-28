import { VintageWorkspaceData } from '../types';

export const INITIAL_WORKSPACE: VintageWorkspaceData = {
  version: '1.0.0',
  folders: [
    {
      id: 'ca-folder-fr',
      name: '📝 CA Final: Financial Reporting (FR)',
      section: 'text',
      createdAt: Date.now() - 500000
    },
    {
      id: 'ca-folder-afm',
      name: '📈 CA Final: Advanced Financial Management (AFM)',
      section: 'text',
      createdAt: Date.now() - 400000
    },
    {
      id: 'ca-folder-audit',
      name: '🔍 CA Final: Advanced Auditing & Professional Ethics',
      section: 'text',
      createdAt: Date.now() - 300000
    },
    {
      id: 'ca-folder-dt',
      name: '💼 CA Final: Direct Taxation & International Tax',
      section: 'text',
      createdAt: Date.now() - 200000
    },
    {
      id: 'ca-folder-idt',
      name: '🚛 CA Final: Indirect Tax Laws (GST & Customs)',
      section: 'text',
      createdAt: Date.now() - 100000
    },
    {
      id: 'ca-folder-sketches',
      name: '🎨 Study Sketches & Diagrams',
      section: 'handwriting',
      createdAt: Date.now() - 50000
    }
  ],
  notebooks: [
    {
      id: 'nb-fr-notes',
      folderId: 'ca-folder-fr',
      name: 'FR Ind AS Master Key Notes',
      section: 'text',
      createdAt: Date.now() - 480000,
      coverColor: '#8c2522',
      coverStyle: 'leather',
      coverLabel: 'brass_plate'
    },
    {
      id: 'nb-afm-notes',
      folderId: 'ca-folder-afm',
      name: 'AFM Valuation & Formula Ledger',
      section: 'text',
      createdAt: Date.now() - 380000,
      coverColor: '#1e3557',
      coverStyle: 'linen',
      coverLabel: 'classic'
    },
    {
      id: 'nb-audit-notes',
      folderId: 'ca-folder-audit',
      name: 'Standards on Auditing Master Summary',
      section: 'text',
      createdAt: Date.now() - 280000,
      coverColor: '#2e4f3f',
      coverStyle: 'velvet',
      coverLabel: 'vintage'
    },
    {
      id: 'nb-dt-notes',
      folderId: 'ca-folder-dt',
      name: 'Direct Tax Assessment Companion',
      section: 'text',
      createdAt: Date.now() - 180000,
      coverColor: '#5d4037',
      coverStyle: 'leather',
      coverLabel: 'brass_plate'
    },
    {
      id: 'nb-drawings',
      folderId: 'ca-folder-sketches',
      name: 'Accounts & Portfolios Calligraphy',
      section: 'handwriting',
      createdAt: Date.now() - 45000,
      coverColor: '#b5823c',
      coverStyle: 'marbled',
      coverLabel: 'vintage'
    }
  ],
  chapters: [
    {
      id: 'ch-fr-1',
      notebookId: 'nb-fr-notes',
      name: 'Chapter 1: Ind AS 115 Revenue Master',
      createdAt: Date.now() - 470000,
      order: 1
    },
    {
      id: 'ch-fr-2',
      notebookId: 'nb-fr-notes',
      name: 'Chapter 2: Ind AS 103 Business Combinations',
      createdAt: Date.now() - 460000,
      order: 2
    },
    {
      id: 'ch-afm-1',
      notebookId: 'nb-afm-notes',
      name: 'Chapter 1: Portfolio Risk & Pricing Models',
      createdAt: Date.now() - 370000,
      order: 1
    },
    {
      id: 'ch-afm-2',
      notebookId: 'nb-afm-notes',
      name: 'Chapter 2: Forex Derivatives Control',
      createdAt: Date.now() - 365000,
      order: 2
    },
    {
      id: 'ch-audit-1',
      notebookId: 'nb-audit-notes',
      name: 'Chapter 1: Professional Ethics & SA Overview',
      createdAt: Date.now() - 270000,
      order: 1
    },
    {
      id: 'ch-dt-1',
      notebookId: 'nb-dt-notes',
      name: 'Chapter 1: Profits & Gains of Business (PGBP)',
      createdAt: Date.now() - 170000,
      order: 1
    },
    {
      id: 'ch-draw-1',
      notebookId: 'nb-drawings',
      name: 'Diagrams & T-Accounts',
      createdAt: Date.now() - 40000,
      order: 1
    }
  ],
  notepapers: [
    {
      id: 'p-fr-indas115',
      chapterId: 'ch-fr-1',
      title: 'Ind AS 115: Five-Step Revenue Model',
      createdAt: Date.now() - 465000,
      paperStyle: 'ruled',
      pageSize: 'Letter',
      hasMargin: true,
      formattedHtml: `
        <h2 style="font-family: 'Playfair Display', serif; font-size: 24px; color: #8c2522; margin-bottom: 12px; font-weight: bold; border-b: 1px solid #ebdcb9; padding-bottom: 4px;">Ind AS 115 - Revenue from Contracts with Customers</h2>
        <p style="font-family: 'EB Garamond', serif; font-size: 16px; color: #333; line-height: 1.8; margin-bottom: 12px;">
          The core principle of Ind AS 115 is that an entity recognizes revenue to depict the transfer of promised goods or services to customers in an amount that reflects the consideration to which the entity expects to be entitled in exchange for those goods or services.
        </p>
        <p style="font-family: 'EB Garamond', serif; font-size: 16px; color: #333; line-height: 1.8; margin-bottom: 12px;">
          The standard has established a robust <strong>5-Step Framework</strong> for revenue recognition:
        </p>
        <ol style="font-family: 'EB Garamond', serif; font-size: 15px; color: #4a3728; line-height: 1.8; margin-left: 20px; margin-bottom: 15px; list-style-type: decimal;">
          <li><strong>Identify the contract</strong> with the customer (agreement of rights, terms, payment, and commercial substance).</li>
          <li><strong>Identify separate performance obligations</strong> in the contract (distinct promises to transfer goods/services).</li>
          <li><strong>Determine the overall transaction price</strong> (considering variable consideration, significant financing components, and non-cash items).</li>
          <li><strong>Allocate the transaction price</strong> to the separate performance obligations based on relative stand-alone selling prices.</li>
          <li><strong>Recognize revenue</strong> when (or as) the entity satisfies a performance obligation (over time or at a point in time).</li>
        </ol>
        <p style="font-family: 'EB Garamond', serif; font-size: 16px; color: #333; line-height: 1.8;">
          <em>Key CA Exam Tip:</em> Always check if variable consideration is subject to constraints (only recognize to the extent that it is highly probable that a significant reversal in the cumulative revenue recognized will not occur).
        </p>
      `,
      tables: [
        {
          headers: ['Step Name', 'Primary Focus Area', 'Relevant Ind AS Clauses'],
          rows: [
            ['Step 2: Identify POs', 'Distinct criteria: Capable of being distinct & distinct within contract', 'Ind AS 115.22 - Paragraphs 27 to 30'],
            ['Step 3: Trans Price', 'Variable Consideration / Non-cash assets / Financing elements', 'Ind AS 115.47 - Paragraphs 50 to 59'],
            ['Step 5: Rev Recognition', 'Control Transfer (Benefits, risks, possession, right to payment)', 'Ind AS 115.31 - Paragraphs 35 to 38']
          ],
          styleConfig: {
            borderStyle: 'solid',
            borderColor: 'vintage-maroon',
            zebraBanded: true,
            headerBg: 'vintage-maroon',
            headerBold: true
          }
        }
      ],
      charts: [
        {
          title: 'Direct Allocation of Standing Selling Price vs Bundle Value',
          type: 'bar',
          labels: ['S-A Price Unit A', 'S-A Price Unit B', 'Aggregated Price', 'Contract Allocation A', 'Contract Allocation B'],
          values: [120, 80, 200, 105, 70]
        }
      ],
      shapes: []
    },
    {
      id: 'p-fr-indas103',
      chapterId: 'ch-fr-2',
      title: 'Ind AS 103: Business Combinations & Goodwill',
      createdAt: Date.now() - 455000,
      paperStyle: 'ruled',
      pageSize: 'Letter',
      hasMargin: true,
      formattedHtml: `
        <h2 style="font-family: 'Playfair Display', serif; font-size: 24px; color: #8c2522; margin-bottom: 12px; font-weight: bold; border-b: 1px solid #ebdcb9; padding-bottom: 4px;">Ind AS 103 - Accounting for Business Combinations</h2>
        <p style="font-family: 'EB Garamond', serif; font-size: 16px; color: #333; line-height: 1.8; margin-bottom: 12px;">
          Business combinations are accounted for using the <strong>Acquisition Method</strong> under Ind AS 103. This requires:
        </p>
        <ul style="font-family: 'EB Garamond', serif; font-size: 15px; color: #4a3728; line-height: 1.8; margin-left: 20px; margin-bottom: 15px; list-style-type: disc;">
          <li>Identifying the <strong>Acquirer</strong> (legal entity acquiring control).</li>
          <li>Determining the <strong>Acquisition Date</strong> (the date on which control is transferred).</li>
          <li>Recognizing and measuring the identifiable assets acquired, liabilities assumed, and any Non-Controlling Interest (NCI).</li>
          <li>Recognizing and measuring <strong>Goodwill</strong> or a <strong>Gain on Bargain Purchase</strong> (Capital Reserve).</li>
        </ul>
        <p style="font-family: 'EB Garamond', serif; font-size: 16px; color: #333; line-height: 1.8; margin-bottom: 12px;">
          Goodwill formula is calculated as follows:<br/>
          <strong style="color: #8c2522;">Goodwill = Purchase Consideration + Fair Value of NCI + FV of previously held interest - Fair Value of Net Identifiable Assets</strong>
        </p>
      `,
      tables: [
        {
          headers: ['Acquisition Component', 'Fair Value Method', 'Proportionate Share Method'],
          rows: [
            ['Purchase Consideration', 'Fair Value at acquisition date', 'Fair Value at acquisition date'],
            ['Non-Controlling Interest (NCI)', 'Fair value (Full Goodwill Model)', 'Proportionate share of Net Assets (Partial Goodwill)'],
            ['Goodwill treatment', 'Tested annually for impairment', 'Tested annually for impairment']
          ]
        }
      ],
      charts: [],
      shapes: []
    },
    {
      id: 'p-afm-capm',
      chapterId: 'ch-afm-1',
      title: 'CAPM: Capital Asset Pricing Model Core Formula',
      createdAt: Date.now() - 365000,
      paperStyle: 'grid',
      pageSize: 'A4',
      hasMargin: true,
      formattedHtml: `
        <h2 style="font-family: 'Playfair Display', serif; font-size: 24px; color: #1e3557; margin-bottom: 12px; font-weight: bold; border-b: 1px solid #ebdcb9; padding-bottom: 4px;">Capital Asset Pricing Model (CAPM)</h2>
        <p style="font-family: 'EB Garamond', serif; font-size: 16px; color: #333; line-height: 1.8; margin-bottom: 12px;">
          In Advanced Financial Management (AFM), the Capital Asset Pricing Model defines the relationship between systematic risk and expected return for assets, particularly stocks.
        </p>
        <div style="background-color: #f7f9fc; border-left: 4px solid #1e3557; padding: 12px; font-family: monospace; font-size: 14px; margin-bottom: 15px;">
          Expected Return [Ke] = Rf + Beta * [Rm - Rf]
        </div>
        <p style="font-family: 'EB Garamond', serif; font-size: 15px; color: #333; line-height: 1.8;">
          Where:<br/>
          • <strong>Rf</strong> = Risk-Free Rate of Return (e.g. Government Bonds Yield)<br/>
          • <strong>Beta (β)</strong> = Systematic Risk indicator of the security compared to market index<br/>
          • <strong>Rm - Rf</strong> = Equity Risk Premium (ERP) representing compensation for market volatility
        </p>
      `,
      tables: [
        {
          headers: ['Securities Pool', 'Beta Coeff (β)', 'Required Return (Ke @ Rf=6%, Rm=14%)'],
          rows: [
            ['High Tech Growth Core', '1.40', '17.20% (6% + 1.40 * 8%)'],
            ['Consumer Staples Shield', '0.75', '12.00% (6% + 0.75 * 8%)'],
            ['Market Benchmark Index', '1.00', '14.00% (Line-value with Rm)']
          ],
          styleConfig: {
            borderStyle: 'dashed',
            borderColor: 'vintage-ink-blue',
            headerBg: 'vintage-ink-blue',
            headerTextColor: 'vintage-cream'
          }
        }
      ],
      charts: [
        {
          title: 'Systematic Risk Beta vs Target Portfolio Ke Return',
          type: 'line',
          labels: ['Beta 0.0', 'Beta 0.5', 'Beta 1.0', 'Beta 1.5', 'Beta 2.0'],
          values: [6.0, 10.0, 14.0, 18.0, 22.0]
        }
      ],
      shapes: []
    },
    {
      id: 'p-audit-sa240',
      chapterId: 'ch-audit-1',
      title: 'SA 240: Auditors Responsibilities Relating to Fraud',
      createdAt: Date.now() - 265000,
      paperStyle: 'ruled',
      pageSize: 'Letter',
      hasMargin: true,
      formattedHtml: `
        <h2 style="font-family: 'Playfair Display', serif; font-size: 24px; color: #3b5220; margin-bottom: 12px; font-weight: bold; border-b: 1px solid #ebdcb9; padding-bottom: 4px;">SA 240 - The Auditor's Responsibility Relating to Fraud</h2>
        <p style="font-family: 'EB Garamond', serif; font-size: 16px; color: #333; line-height: 1.8; margin-bottom: 12px;">
          SA 240 mandates that an auditor conducting an audit in accordance with SAs is responsible for obtaining reasonable assurance that the financial statements taken as a whole are free from material misstatement, whether caused by fraud or error.
        </p>
        <p style="font-family: 'EB Garamond', serif; font-size: 15px; color: #3b5220; line-weight: 1.8; font-weight: bold; margin-bottom: 6px;">
          The Fraud Triangle consists of:
        </p>
        <ul style="font-family: 'EB Garamond', serif; font-size: 15px; color: #333; line-height: 1.8; margin-left: 20px; list-style-type: square; margin-bottom: 15px;">
          <li><strong>Incentive or Pressure:</strong> Board targets, debt covenants, or earnings pressure.</li>
          <li><strong>Opportunity:</strong> Weak internal controls, complex transactions, or ineffective override checks.</li>
          <li><strong>Rationalization:</strong> Believing the fraud is temporary or justified based on salary inequalities.</li>
        </ul>
        <p style="font-family: 'EB Garamond', serif; font-size: 16px; color: #333; line-height: 1.8;">
          <em>Audit Response:</em> Maintain professional skepticism throughout the audit. Conduct inquiries of management, perform analytical procedures, and review journal entries for unusual postings.
        </p>
      `,
      tables: [
        {
          headers: ['Fraud Risk Factors', 'Specific Example Indicators', 'Key Testing Action'],
          rows: [
            ['Management Override', 'Manual journal adjustments close to reporting date', 'Use GAT/CAAT tools to filter high value weekend entries'],
            ['Control Deficiency', 'Lack of oversight on cash receipts or complex inventories', 'Direct physical audit observation & surprise segment counts'],
            ['Earning Benchmarks', 'Aggressive revenue growth curves alongside declining cash flows', 'Strict cut-off ledger audits and delivery note reconciliations']
          ]
        }
      ],
      charts: [],
      shapes: []
    },
    {
      id: 'p-drawings-1',
      chapterId: 'ch-draw-1',
      title: 'T-Account Double Entry Skeleton Sketch',
      createdAt: Date.now() - 35000,
      paperStyle: 'grid',
      pageSize: 'A4',
      hasMargin: true,
      drawingsData: ''
    }
  ],
  documents: [
    {
      id: 'doc-ca-annex1',
      folderId: 'ca-folder-idt',
      title: 'GST Levy & Chargeability Annexure.txt',
      createdAt: Date.now() - 95000,
      fileType: 'txt',
      fileUrl: `ANNEXURE CGST ACT SECTION 9 - CHARGEABILITY SUMMARY:

1. CGST shall be levied on all intra-State supplies of goods or services or both, except on the supply of alcoholic liquor for human consumption, on the value determined under section 15 and at such rates, not exceeding twenty per cent., as may be notified by the Government on the recommendations of the Council.

2. Chargeability arises at the Time of Supply (Section 12 & 13) and Place of Supply (IGST Section 10 to 13).

3. Reverse Charge Mechanism (RCM): Section 9(3) notifies categories of goods/services where the recipient of supply pays the tax. Section 9(4) mandates tax liability on specified registered recipients acquiring goods/services from unregistered suppliers.

4. E-Commerce Operators (ECO): Section 9(5) specifies passenger transport, housekeeping, and accommodation services where the E-Commerce giant stands liable as the legal supplier.`,
      annotations: '',
      pageSize: 'Letter',
      paperStyle: 'ruled',
      hasMargin: true
    }
  ]
};
