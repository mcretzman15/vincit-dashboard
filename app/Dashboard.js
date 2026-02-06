'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';

// ============================================================
// HUBSPOT CONFIGURATION - SOURCE OF TRUTH (Updated 2026-02-06)
// ============================================================

// Pipeline IDs and Labels (CORRECTED to match HubSpot)
const PIPELINE_OPTIONS = [
  { id: '852403303', name: 'SAM Pipeline' },
  { id: '855656590', name: 'Vincit Enterprise' },
  { id: '855678765', name: 'QSI BDM' },
];

// Pipeline ID to Name mapping
const PIPELINE_NAMES = {
  '852403303': 'SAM Pipeline',
  '855656590': 'Vincit Enterprise',
  '855678765': 'QSI BDM',
};

// Deal Stages - CORRECTED labels (same stages across all 3 pipelines)
const STAGE_CONFIG = {
  // SAM Pipeline (852403303)
  '852403303': {
    '1270511187': 'Qualification',
    '1270511188': 'Plant Surveyed',
    '1270511189': 'Quotes Provided',
    '1270511190': 'Decision Making',
    '1270511191': 'Contract Sent',
    '1270511192': 'Closed Won',
    '1270511193': 'Closed Lost',
  },
  // Vincit Enterprise (855656590)
  '855656590': {
    '1276813984': 'Qualification',
    '1276813985': 'Plant Surveyed',
    '1276813986': 'Quotes Provided',
    '1276813987': 'Decision Making',
    '1276813988': 'Contract Sent',
    '1276813989': 'Closed Won',
    '1276813990': 'Closed Lost',
  },
  // QSI BDM (855678765)
  '855678765': {
    '1276776727': 'Qualification',
    '1276776728': 'Plant Surveyed',
    '1276776729': 'Quotes Provided',
    '1276776730': 'Decision Making',
    '1276776731': 'Contract Sent',
    '1276776732': 'Closed Won',
    '1276776733': 'Closed Lost',
  },
};

// Stage options for form (excludes Closed Won/Lost)
const STAGE_OPTIONS = {
  '852403303': [
    { id: '1270511187', name: 'Qualification' },
    { id: '1270511188', name: 'Plant Surveyed' },
    { id: '1270511189', name: 'Quotes Provided' },
    { id: '1270511190', name: 'Decision Making' },
    { id: '1270511191', name: 'Contract Sent' },
  ],
  '855656590': [
    { id: '1276813984', name: 'Qualification' },
    { id: '1276813985', name: 'Plant Surveyed' },
    { id: '1276813986', name: 'Quotes Provided' },
    { id: '1276813987', name: 'Decision Making' },
    { id: '1276813988', name: 'Contract Sent' },
  ],
  '855678765': [
    { id: '1276776727', name: 'Qualification' },
    { id: '1276776728', name: 'Plant Surveyed' },
    { id: '1276776729', name: 'Quotes Provided' },
    { id: '1276776730', name: 'Decision Making' },
    { id: '1276776731', name: 'Contract Sent' },
  ],
};

// Default first stage for each pipeline
const PIPELINE_FIRST_STAGE = {
  '852403303': '1270511187',
  '855656590': '1276813984',
  '855678765': '1276776727',
};

// Flattened stage names for easy lookup
const STAGE_NAMES = {
  '1270511187': 'Qualification', '1270511188': 'Plant Surveyed', '1270511189': 'Quotes Provided',
  '1270511190': 'Decision Making', '1270511191': 'Contract Sent', '1270511192': 'Closed Won', '1270511193': 'Closed Lost',
  '1276813984': 'Qualification', '1276813985': 'Plant Surveyed', '1276813986': 'Quotes Provided',
  '1276813987': 'Decision Making', '1276813988': 'Contract Sent', '1276813989': 'Closed Won', '1276813990': 'Closed Lost',
  '1276776727': 'Qualification', '1276776728': 'Plant Surveyed', '1276776729': 'Quotes Provided',
  '1276776730': 'Decision Making', '1276776731': 'Contract Sent', '1276776732': 'Closed Won', '1276776733': 'Closed Lost',
};

// Closed stage IDs
const CLOSED_WON_STAGES = ['1270511192', '1276813989', '1276776732'];
const CLOSED_LOST_STAGES = ['1270511193', '1276813990', '1276776733'];

// Stage colors for visual display
const STAGE_COLORS = {
  'Qualification': '#64748b',
  'Plant Surveyed': '#3b82f6',
  'Quotes Provided': '#8b5cf6',
  'Decision Making': '#f59e0b',
  'Contract Sent': '#22c55e',
};

// ===== THEME COLORS =====
const THEME = { teal: '#0891b2', gray: '#64748b' };
const COLORS = ['#0891b2', '#22c55e', '#a855f7', '#f59e0b', '#ef4444', '#ec4899', '#3b82f6', '#64748b'];
const TEAM_COLORS = {
  'SAM Pipeline': '#0891b2', 'SAM': '#0891b2', 'QSI BDM': '#3b82f6', 'Vincit Enterprise': '#a855f7', 'Other': '#64748b',
};

// ===== FORMATTERS =====
const formatCurrency = (val) => {
  if (!val) return '$0';
  if (val >= 1e6) return `$${(val / 1e6).toFixed(1)}M`;
  if (val >= 1e3) return `$${(val / 1e3).toFixed(0)}K`;
  return `$${val.toLocaleString()}`;
};
const formatDate = (val) => {
  if (!val) return 'TBD';
  return new Date(val).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};
const getStageName = (stageId) => STAGE_NAMES[stageId] || stageId;
const getPipelineName = (pipelineId) => PIPELINE_NAMES[pipelineId] || pipelineId;

// ===== FORM DATA =====
const PARENT_ACCOUNTS = [
  'AFG', 'Ajinomoto', 'Boars Head', 'Bob Evans', 'Bobos', 'Brakebush', 'Bridgetown Natural Foods',
  'Campbells', 'Cargill', 'Case Farms', 'Dole', 'Don Panchos', 'Essentia', 'F&G Foodgroup',
  'Filet of Chicken', 'Gatorade', 'Godshalls', 'Grandmas Cookies', 'Greater Omaha Packing',
  'Hello Fresh', 'Hertzog', 'House of Raeford', 'Ingredion', 'Intermountain Packing', 'IRCA Group',
  'JBS', 'John Soules Foods', 'Johnsonville', 'Kellys Foods', 'Lincoln Premium Poultry', 'Mars',
  'Mastronardi Produce', 'Monogram', 'Newlyweds Foods', 'Peco Foods', 'Pepperidge Farms', 'Perdue',
  'Pilgrims', 'Producer Owned Beef', 'Quaker Oats', 'Resers', 'Salmons Meat', 'Simmons',
  'Smart Chicken', 'Smithfield', 'Sugar Creek Foods', 'Sustainable', 'The Deli Source',
  'Trinity Frozen Foods', 'Tyson', 'US Foods Stockyards', 'Volpi Foods', 'Walmart',
  'Wayne-Sanderson', 'Wholestone Foods', 'Other'
].sort();

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS',
  'KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY',
  'NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'
];

const VINCIT_MEMBERS = [
  'QSI', 'QSI-Beef', 'QSI-Pork', 'QSI-Case Ready', 'QSI-Poultry',
  'ZEE', 'ZEE F&B', 'ZEE W&E', 'ZEE Intervention', 'ZEE-GOP',
  'TCS', 'ITG', 'Other'
];

// Deal Owners - CORRECTED from HubSpot (removed Matt Cretzman per Brady call 2/6)
const DEAL_OWNERS = [
  { id: '87132142', name: 'April Englishbey' },
  { id: '87856300', name: 'Ben Bebermeyer' },
  { id: '87184498', name: 'Ben Hope' },
  { id: '86370196', name: 'Brady Field' },
  { id: '84509028', name: 'Brian Barker' },
  { id: '87185119', name: 'Brian Hales' },
  { id: '87131928', name: 'Chad Lawrence' },
  { id: '87129317', name: 'Chris Beavers' },
  { id: '87184916', name: 'Eric Wilson' },
  { id: '87184702', name: 'Greg Atchley' },
  { id: '87173917', name: 'Jeremy Bates' },
  { id: '26684738', name: 'Joachim Koch' },
  { id: '87674892', name: 'Ken Dreyer' },
  { id: '87420199', name: 'Matt Husman' },
  { id: '87131988', name: 'Phillip Shelton' },
  { id: '87132040', name: 'Rikki Ford' },
  { id: '87331887', name: 'Ryan McCormick' },
  { id: '87238944', name: 'Shane Calhoun' },
  { id: '87132088', name: 'Tanner Berryhill' },
  { id: '87816453', name: 'Terry Beavers' },
  { id: '87077445', name: 'Tim Bryant' },
];

const OWNER_NAMES = Object.fromEntries(DEAL_OWNERS.map(o => [o.id, o.name]));
const getOwnerName = (ownerId) => OWNER_NAMES[ownerId] || 'Unassigned';
const DEAL_TYPES = [
  { value: 'newbusiness', label: 'New Business' },
  { value: 'existingbusiness', label: 'Existing Business' },
];
const HUBSPOT_URL = 'https://app.hubspot.com/contacts/48aborz70/deals/board/view/all/';

// ===== NEW DEAL FORM COMPONENT =====
function NewDealForm() {
  const [form, setForm] = useState({
    parentAccount: '', city: '', state: '', vincitMember: '', application: '',
    pipeline: '852403303', dealstage: '1270511187', dealType: 'newbusiness', ownerId: '',
    amount: '', closeDate: '', notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  // Updated deal name formula: Company / City, State / Servicing Company / Application
  const generatedName = useMemo(() => {
    const parts = [];
    if (form.parentAccount) parts.push(form.parentAccount);
    if (form.city && form.state) parts.push(`${form.city}, ${form.state}`);
    else if (form.city) parts.push(form.city);
    if (form.vincitMember) parts.push(form.vincitMember);
    if (form.application) parts.push(form.application);
    return parts.join(' / ');
  }, [form.parentAccount, form.city, form.state, form.vincitMember, form.application]);

  const currentStageOptions = useMemo(() => {
    return STAGE_OPTIONS[form.pipeline] || STAGE_OPTIONS['852403303'];
  }, [form.pipeline]);

  const isValid = form.parentAccount && form.city && form.state && form.vincitMember && form.application && form.ownerId;

  const handleChange = (field, value) => {
    setForm(prev => {
      const newForm = { ...prev, [field]: value };
      if (field === 'pipeline') {
        newForm.dealstage = PIPELINE_FIRST_STAGE[value] || PIPELINE_FIRST_STAGE['852403303'];
      }
      return newForm;
    });
    if (result) setResult(null);
  };

  const handleSubmit = async () => {
    if (!isValid || submitting) return;
    setSubmitting(true);
    setResult(null);

    const payload = {
      dealname: generatedName,
      amount: form.amount ? Number(form.amount) : undefined,
      closedate: form.closeDate || undefined,
      pipeline: form.pipeline,
      dealstage: form.dealstage,
      hubspot_owner_id: form.ownerId,
      deal_type: form.dealType,
      vincit_member_company: form.vincitMember,
      parent_account: form.parentAccount,
      city: form.city,
      state: form.state,
      application: form.application,
      notes: form.notes || undefined,
    };

    try {
      const res = await fetch('/api/create-deal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setResult({ type: 'success', message: `Deal created: "${data.dealname}" (ID: ${data.dealId})` });
        setForm({
          parentAccount: '', city: '', state: '', vincitMember: '', application: '',
          pipeline: '852403303', dealstage: '1270511187', dealType: 'newbusiness', ownerId: '',
          amount: '', closeDate: '', notes: '',
        });
      } else {
        setResult({ type: 'error', message: data.error + (data.details ? ': ' + data.details : '') });
      }
    } catch (err) {
      setResult({ type: 'error', message: 'Network error: ' + err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const selectClass = 'w-full bg-slate-700/50 border border-slate-600 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500';
  const inputClass = 'w-full bg-slate-700/50 border border-slate-600 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 placeholder-slate-400';

  return (
    <div className="max-w-2xl mx-auto">
      {generatedName && (
        <div className="bg-teal-500/10 border-2 border-teal-500 rounded-xl p-4 mb-6">
          <div className="text-xs font-semibold text-teal-400 uppercase tracking-wider mb-1">Auto-Generated Deal Name</div>
          <div className="text-lg font-bold text-teal-300">{generatedName}</div>
        </div>
      )}

      {result && (
        <div className={`rounded-xl p-4 mb-6 border-2 font-semibold text-sm ${
          result.type === 'success'
            ? 'bg-green-500/10 border-green-500 text-green-300'
            : 'bg-red-500/10 border-red-500 text-red-300'
        }`}>
          {result.type === 'success' ? '\u2705 ' : '\u274C '}{result.message}
        </div>
      )}

      {/* Account & Location */}
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 mb-6">
        <h3 className="text-lg font-semibold text-white mb-4">Account & Location</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-300 mb-2">Parent Account <span className="text-red-400">*</span></label>
            <select value={form.parentAccount} onChange={e => handleChange('parentAccount', e.target.value)} className={selectClass}>
              <option value="">Select account...</option>
              {PARENT_ACCOUNTS.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">City <span className="text-red-400">*</span></label>
            <input type="text" value={form.city} onChange={e => handleChange('city', e.target.value)} placeholder="e.g. Amarillo" className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">State <span className="text-red-400">*</span></label>
            <select value={form.state} onChange={e => handleChange('state', e.target.value)} className={selectClass}>
              <option value="">Select...</option>
              {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Service Details */}
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 mb-6">
        <h3 className="text-lg font-semibold text-white mb-4">Service Details</h3>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Servicing Company <span className="text-red-400">*</span></label>
            <select value={form.vincitMember} onChange={e => handleChange('vincitMember', e.target.value)} className={selectClass}>
              <option value="">Select servicing company...</option>
              {VINCIT_MEMBERS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Application <span className="text-red-400">*</span></label>
            <input type="text" value={form.application} onChange={e => handleChange('application', e.target.value)}
              placeholder="e.g. D7, Water cooling tower, Wastewater, Beef processing"
              className={inputClass} />
            <p className="text-xs text-slate-500 mt-1">Type the specific application or service being provided</p>
          </div>
        </div>
      </div>

      {/* Deal Details */}
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 mb-6">
        <h3 className="text-lg font-semibold text-white mb-4">Deal Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Pipeline</label>
            <select value={form.pipeline} onChange={e => handleChange('pipeline', e.target.value)} className={selectClass}>
              {PIPELINE_OPTIONS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Deal Stage</label>
            <select value={form.dealstage} onChange={e => handleChange('dealstage', e.target.value)} className={selectClass}>
              {currentStageOptions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Deal Type</label>
            <select value={form.dealType} onChange={e => handleChange('dealType', e.target.value)} className={selectClass}>
              {DEAL_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Deal Owner <span className="text-red-400">*</span></label>
            <select value={form.ownerId} onChange={e => handleChange('ownerId', e.target.value)} className={selectClass}>
              <option value="">Select owner...</option>
              {DEAL_OWNERS.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Deal Amount ($)</label>
            <input type="number" value={form.amount} onChange={e => handleChange('amount', e.target.value)} placeholder="e.g. 1500000" className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Expected Close Date</label>
            <input type="date" value={form.closeDate} onChange={e => handleChange('closeDate', e.target.value)} className={inputClass} />
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 mb-6">
        <h3 className="text-lg font-semibold text-white mb-4">Notes (Optional)</h3>
        <textarea value={form.notes} onChange={e => handleChange('notes', e.target.value)} rows={3}
          placeholder="Any context about this deal..." className={inputClass + ' resize-y'} />
      </div>

      {/* Submit */}
      <button onClick={handleSubmit} disabled={!isValid || submitting}
        className={`w-full py-4 text-base font-bold rounded-xl transition-all ${
          isValid && !submitting
            ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white hover:from-teal-500 hover:to-cyan-500 shadow-lg shadow-teal-500/20 cursor-pointer'
            : 'bg-slate-600 text-slate-400 cursor-not-allowed'
        }`}>
        {submitting ? 'Creating Deal in HubSpot...' : 'Create Deal in HubSpot'}
      </button>

      {!isValid && (
        <p className="text-center text-xs text-slate-500 mt-2">
          Fill in all required fields (*) to enable submission
        </p>
      )}
    </div>
  );
}

// ===== MAIN DASHBOARD =====
export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const [expandedOwners, setExpandedOwners] = useState({});
  const [activeTab, setActiveTab] = useState('pipeline');

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/deals');
      const json = await res.json();
      if (json.success) { setData(json); setError(null); }
      else { setError(json.error || 'Failed to fetch data'); }
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = useMemo(() => {
    if (!data) return null;
    if (activeFilter === 'All') return data;
    const owners = data.pipelineByOwner.filter(o => o.team === activeFilter);
    const deals = data.allDeals.filter(d => d.team === activeFilter);
    const totalPipeline = deals.reduce((s, d) => s + d.amount, 0);
    return {
      ...data, pipelineByOwner: owners, allDeals: deals,
      summary: { ...data.summary, totalPipeline, activeDeals: deals.length, avgDealSize: deals.length > 0 ? totalPipeline / deals.length : 0 },
      topDeals: data.topDeals.filter(d => d.team === activeFilter),
    };
  }, [data, activeFilter]);

  const toggleOwner = (owner) => { setExpandedOwners(prev => ({ ...prev, [owner]: !prev[owner] })); };

  const filterCounts = useMemo(() => {
    if (!data) return {};
    return {
      All: data.allDeals?.length || 0,
      'SAM Pipeline': data.allDeals?.filter(d => d.team === 'SAM Pipeline' || d.team === 'SAM').length || 0,
      'QSI BDM': data.allDeals?.filter(d => d.team === 'QSI BDM').length || 0,
      'Vincit Enterprise': data.allDeals?.filter(d => d.team === 'Vincit Enterprise').length || 0,
    };
  }, [data]);

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-teal-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <div className="text-white text-xl">Loading HubSpot data...</div>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center bg-red-500/10 border border-red-500/50 rounded-xl p-8 max-w-md">
          <div className="text-4xl mb-4">{'\u26A0\uFE0F'}</div>
          <div className="text-white text-xl mb-2">Error Loading Data</div>
          <div className="text-slate-400 mb-4">{error}</div>
          <button onClick={fetchData} className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition">Retry</button>
        </div>
      </div>
    );
  }

  const summary = filtered?.summary || {};
  const pipelineByOwner = filtered?.pipelineByOwner || [];
  const pipelineByGroup = data?.pipelineByGroup || [];
  const pipelineByStage = data?.pipelineByStage || [];
  const pipelineByCloseDate = data?.pipelineByCloseDate || [];
  const topDeals = filtered?.topDeals || [];
  const noDateDeals = data?.noDateDeals || [];

  const barChartData = pipelineByOwner.slice(0, 8).map(o => ({
    name: o.owner.split(' ')[1] || o.owner.split(' ')[0], pipeline: o.totalPipeline / 1e6, fullName: o.owner,
  }));
  const pieData = pipelineByGroup.map((g, i) => ({ name: g.group, value: g.totalPipeline, color: COLORS[i % COLORS.length] }));
  const lineData = pipelineByCloseDate.filter(d => d.month !== 'No Date').map(d => ({
    month: d.month.replace(' 2026', '').replace(' 2025', ''), pipeline: d.pipeline / 1e6, deals: d.deals,
  }));
  const stageBarData = pipelineByStage.map(s => ({
    name: s.stage.replace(' ', '\n'), shortName: s.stage.split(' ')[0], pipeline: s.totalPipeline / 1e6,
    deals: s.deals, fullName: s.stage, color: STAGE_COLORS[s.stage] || THEME.gray,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* HEADER */}
      <header className="bg-slate-900/80 backdrop-blur border-b border-slate-700/50 sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-teal-500 text-white px-3 py-1.5 rounded-lg font-bold text-lg tracking-wider">V</div>
              <div>
                <div className="text-teal-400 text-sm font-medium tracking-wider">VINCIT GROUP</div>
                <div className="text-slate-400 text-xs">Chemical {'\u2022'} Sanitation {'\u2022'} Engineering</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-white font-semibold">Sales Pipeline Executive Report</div>
              <div className="text-slate-400 text-sm flex items-center justify-end gap-2">
                {data?.lastUpdated && (
                  <>
                    <span>{new Date(data.lastUpdated).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                    <span className="flex items-center gap-1 text-green-400">
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />HubSpot Live Data
                    </span>
                  </>
                )}
              </div>
            </div>
            <button onClick={fetchData} disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white text-sm transition disabled:opacity-50">
              <span className={loading ? 'animate-spin' : ''}>{'\u21BB'}</span> Refresh
            </button>
          </div>
        </div>
      </header>

      {/* TAB BAR + PIPELINE FILTERS */}
      <div className="bg-slate-900/50 border-b border-slate-700/50">
        <div className="max-w-[1600px] mx-auto px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="flex gap-1 bg-slate-800/80 rounded-xl p-1 border border-slate-700/50 mr-4">
              {[{ key: 'pipeline', label: '\uD83D\uDCCA Pipeline' }, { key: 'newdeal', label: '\u2795 New Deal' }].map(tab => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  className={`py-2 px-4 rounded-lg text-sm font-semibold transition-all ${
                    activeTab === tab.key ? 'bg-teal-500 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-700'
                  }`}>{tab.label}</button>
              ))}
            </div>
            {activeTab === 'pipeline' && (
              <>
                {['All', 'SAM Pipeline', 'QSI BDM', 'Vincit Enterprise'].map(f => (
                  <button key={f} onClick={() => setActiveFilter(f)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                      activeFilter === f ? 'bg-white text-slate-900' : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
                    }`}>
                    {f}
                    <span className={`px-2 py-0.5 rounded-full text-xs ${activeFilter === f ? 'bg-slate-200 text-slate-700' : 'bg-slate-600 text-slate-300'}`}>
                      {filterCounts[f] || 0}
                    </span>
                  </button>
                ))}
                <a href={HUBSPOT_URL} target="_blank" rel="noopener noreferrer"
                  className="ml-auto flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-orange-500/20 text-orange-300 hover:bg-orange-500/30 border border-orange-500/30 transition-all">
                  {'\uD83D\uDD17'} View Deals in HubSpot
                </a>
              </>
            )}
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main className="max-w-[1600px] mx-auto px-6 py-6">
        {activeTab === 'newdeal' ? (
          <NewDealForm />
        ) : (
          <>
            {/* KPI CARDS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-teal-500/20"><span className="text-teal-400 text-lg">$</span></div>
                  <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">Total Pipeline</span>
                </div>
                <div className="text-3xl font-bold text-teal-400">{formatCurrency(summary.totalPipeline)}</div>
                <div className="text-sm text-slate-400">Annual contract value</div>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-green-500/20"><span className="text-green-400 text-lg">{'\u25CF'}</span></div>
                  <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">Active Deals</span>
                </div>
                <div className="text-3xl font-bold text-green-400">{summary.activeDeals || 0}</div>
                <div className="text-sm text-slate-400">In pipeline currently</div>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-purple-500/20"><span className="text-purple-400 text-lg">{'\u2197'}</span></div>
                  <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">Avg Deal Size</span>
                </div>
                <div className="text-3xl font-bold text-purple-400">{formatCurrency(summary.avgDealSize)}</div>
                <div className="text-sm text-slate-400">Per opportunity</div>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-amber-500/20"><span className="text-amber-400 text-lg">{'\u26A0'}</span></div>
                  <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">No Close Date</span>
                </div>
                <div className="text-3xl font-bold text-amber-400">{summary.dealsNoCloseDate || 0}</div>
                <div className="text-sm text-slate-400">{formatCurrency(summary.noCloseDateValue)} at risk</div>
              </div>
            </div>

            {/* AT RISK BANNER */}
            {activeFilter === 'All' && summary.atRiskCount > 0 && (
              <div className="mb-6 bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-orange-500/20 rounded-lg"><span className="text-orange-400 text-2xl">{'\u26A0'}</span></div>
                  <div>
                    <div className="text-orange-300 font-semibold">High-Value Deals Requiring Immediate Attention</div>
                    <div className="text-slate-400 text-sm">{summary.atRiskCount} deals with no recent logged activity may be at risk of stalling.</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400 uppercase tracking-wider">At Risk Value</div>
                  <div className="text-3xl font-bold text-red-400">{formatCurrency(summary.atRiskValue)}</div>
                </div>
              </div>
            )}

            {/* CHARTS ROW */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-slate-400">{'\uD83D\uDC65'}</span>
                  <h2 className="text-lg font-semibold text-white">Pipeline by Deal Owner</h2>
                </div>
                <div className="text-xs text-slate-500 mb-3">Top performers by total pipeline value</div>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={barChartData}>
                    <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}M`} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: 8 }} labelStyle={{ color: '#fff' }}
                      formatter={v => [`$${v.toFixed(1)}M`, 'Pipeline']} labelFormatter={(label, payload) => payload[0]?.payload?.fullName || label} />
                    <Bar dataKey="pipeline" fill={THEME.teal} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-slate-400">{'\u25CE'}</span>
                  <h2 className="text-lg font-semibold text-white">Pipeline by Business Group</h2>
                </div>
                <div className="text-xs text-slate-500 mb-3">Revenue distribution across divisions</div>
                <div className="flex items-center">
                  <ResponsiveContainer width="60%" height={220}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={2} dataKey="value">
                        {pieData.map((entry, i) => <Cell key={`cell-${i}`} fill={entry.color} />)}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: 8 }} formatter={v => [formatCurrency(v), 'Pipeline']} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="w-[40%] space-y-2">
                    {pieData.slice(0, 7).map((e, i) => (
                      <div key={`legend-${i}`} className="flex items-center gap-2 text-sm">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: e.color }} />
                        <span className="text-slate-400 truncate">{e.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* PIPELINE BY STAGE */}
            <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-slate-400">{'\uD83D\uDCCA'}</span>
                <h2 className="text-lg font-semibold text-white">Pipeline by Deal Stage</h2>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={stageBarData} layout="vertical">
                  <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}M`} />
                  <YAxis type="category" dataKey="shortName" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: 8 }} labelStyle={{ color: '#fff' }}
                    formatter={(v, name, props) => [`$${v.toFixed(1)}M (${props.payload.deals} deals)`, 'Pipeline']}
                    labelFormatter={(label, payload) => payload[0]?.payload?.fullName || label} />
                  <Bar dataKey="pipeline" radius={[0, 4, 4, 0]}>
                    {stageBarData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* CLOSE DATE CHART */}
            <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-slate-400">{'\uD83D\uDCC5'}</span>
                <h2 className="text-lg font-semibold text-white">Pipeline by Expected Close Date (2026)</h2>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={lineData}>
                  <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}M`} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: 8 }} formatter={v => [`$${v.toFixed(1)}M`, 'Pipeline']} />
                  <Line type="monotone" dataKey="pipeline" stroke={THEME.teal} strokeWidth={2} dot={{ fill: THEME.teal }} />
                </LineChart>
              </ResponsiveContainer>
              {summary.dealsNoCloseDate > 0 && (
                <div className="mt-3 bg-orange-500/10 border border-orange-500/30 rounded-lg px-4 py-2 text-sm text-orange-300">
                  {'\u26A0'} {summary.dealsNoCloseDate} deals ({formatCurrency(summary.noCloseDateValue)}) have no expected close date set
                </div>
              )}
            </div>

            {/* TOP DEALS TABLE */}
            <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-slate-400">{'\uD83C\uDFC6'}</span>
                <h2 className="text-lg font-semibold text-white">Top 10 Highest-Value Deals</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-3 px-3 text-slate-400 font-medium">#</th>
                      <th className="text-left py-3 px-3 text-slate-400 font-medium">Deal</th>
                      <th className="text-right py-3 px-3 text-slate-400 font-medium">Amount</th>
                      <th className="text-left py-3 px-3 text-slate-400 font-medium">Stage</th>
                      <th className="text-left py-3 px-3 text-slate-400 font-medium">Owner</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topDeals.slice(0, 10).map((deal, i) => (
                      <tr key={deal.id || i} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                        <td className="py-3 px-3 text-slate-500">{i + 1}</td>
                        <td className="py-3 px-3 text-white font-medium">{deal.name}</td>
                        <td className="py-3 px-3 text-right text-teal-400 font-semibold">{formatCurrency(deal.amount)}</td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-1 rounded-full text-xs font-medium" style={{
                            backgroundColor: (STAGE_COLORS[deal.stage] || THEME.gray) + '20',
                            color: STAGE_COLORS[deal.stage] || THEME.gray
                          }}>{deal.stage}</span>
                        </td>
                        <td className="py-3 px-3 text-slate-300">{deal.owner}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* OWNER CARDS */}
            <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-slate-400">{'\uD83D\uDC65'}</span>
                <h2 className="text-lg font-semibold text-white">Pipeline by Deal Owner</h2>
              </div>
              {pipelineByOwner.map((owner, idx) => (
                <div key={owner.owner} className="mb-2">
                  <button onClick={() => toggleOwner(owner.owner)}
                    className="w-full flex items-center justify-between p-4 bg-slate-700/30 hover:bg-slate-700/50 rounded-lg transition">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                        style={{ backgroundColor: TEAM_COLORS[owner.team] || THEME.gray }}>
                        {owner.owner.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="text-left">
                        <div className="text-white font-medium">{owner.owner}</div>
                        <div className="text-slate-400 text-xs">{owner.team} {'\u2022'} {owner.deals} deals</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-teal-400 font-bold">{formatCurrency(owner.totalPipeline)}</div>
                      <span className="text-slate-400">{expandedOwners[owner.owner] ? '\u25B2' : '\u25BC'}</span>
                    </div>
                  </button>
                  {expandedOwners[owner.owner] && owner.dealList && (
                    <div className="ml-4 mt-1 border-l-2 border-slate-600 pl-4">
                      {owner.dealList.sort((a, b) => b.amount - a.amount).map((deal, i) => (
                        <div key={deal.id || i} className="flex items-center justify-between py-2 border-b border-slate-700/30 text-sm">
                          <div className="flex-1 text-white truncate mr-4">{deal.name}</div>
                          <div className="flex items-center gap-3">
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{
                              backgroundColor: (STAGE_COLORS[deal.stage] || THEME.gray) + '20',
                              color: STAGE_COLORS[deal.stage] || THEME.gray
                            }}>{deal.stage}</span>
                            <div className="text-teal-400 font-semibold w-20 text-right">{formatCurrency(deal.amount)}</div>
                            <div className={`text-xs w-24 text-right ${deal.closeDate ? 'text-slate-400' : 'text-red-400 font-medium'}`}>
                              {deal.closeDate ? formatDate(deal.closeDate).replace(', 2026', '').replace(', 2025', '') : 'TBD'}
                            </div>
                          </div>
                        </div>
                      ))}
                      <div className="p-3 bg-slate-700/50 flex justify-end gap-6 text-sm">
                        <span className="text-slate-400">Total:</span>
                        <span className="font-bold text-white">{formatCurrency(owner.totalPipeline)}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* NO CLOSE DATE DEALS */}
            {noDateDeals.length > 0 && (
              <div className="bg-slate-800/50 rounded-xl p-5 border border-orange-500/30 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-orange-400">{'\u26A0'}</span>
                  <h2 className="text-lg font-semibold text-orange-300">Deals Without Close Date</h2>
                  <span className="text-xs text-slate-400">Top {noDateDeals.length} by value</span>
                </div>
                <div className="space-y-2">
                  {noDateDeals.map((deal, i) => (
                    <div key={deal.id || i} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg text-sm">
                      <div className="text-white font-medium truncate flex-1 mr-4">{deal.name}</div>
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{
                          backgroundColor: (STAGE_COLORS[deal.stage] || THEME.gray) + '20',
                          color: STAGE_COLORS[deal.stage] || THEME.gray
                        }}>{deal.stage}</span>
                        <div className="text-teal-400 font-semibold">{formatCurrency(deal.amount)}</div>
                        <div className="text-slate-400 text-xs">{deal.owner}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FOOTER */}
            <footer className="bg-slate-900/50 rounded-xl p-8 text-center border border-slate-700/50">
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className="bg-teal-500 text-white px-3 py-1 rounded-lg font-bold text-xl">V</div>
                <span className="text-teal-400 text-xl font-semibold tracking-wider">VINCIT GROUP</span>
              </div>
              <div className="text-slate-400 italic mb-4">&quot;To Conquer&quot; — Reaching Full Potential Together</div>
              <div className="text-slate-500 text-sm">
                Data sourced from HubSpot CRM {'\u2022'} Report generated {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </div>
              <div className="text-slate-600 text-xs mt-1">Seven Brands {'\u2022'} One Vision {'\u2022'} Chemical, Sanitation & Engineering Excellence</div>
              <div className="mt-4 pt-4 border-t border-slate-700/50 text-slate-500 text-xs uppercase tracking-wider">
                Confidential — Executive Use Only
              </div>
            </footer>
          </>
        )}
      </main>
    </div>
  );
}
