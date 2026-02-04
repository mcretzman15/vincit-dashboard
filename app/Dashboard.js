'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';

// ===== THEME COLORS =====
const THEME = { teal: '#0891b2', gray: '#64748b' };
const COLORS = ['#0891b2', '#22c55e', '#a855f7', '#f59e0b', '#ef4444', '#ec4899', '#3b82f6', '#64748b'];
const TEAM_COLORS = {
  'SAM': '#0891b2',
  'QSI BDM': '#3b82f6',
  'Vincit Enterprise': '#a855f7',
  'Other': '#64748b',
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

// ===== FORM DATA =====
const PARENT_ACCOUNTS = [
  'AFG', 'Ajinomoto', 'Boars Head', 'Bobos', 'Bridgetown Natural Foods',
  'Cargill', 'Case Farms', 'Dole Fresh Vegetables', 'Essentia Protein Solutions',
  'F&G Foodgroup', 'Godshalls', 'Greater Omaha Packing', 'Hello Fresh',
  'Hertzog Beef', 'Intermountain Packing', 'IRCA Group', 'JBS',
  'John Soules Foods', 'Johnsonville', 'Kellys Foods', 'Mars',
  'Monogram', 'Peco Foods', 'Pepperidge Farms', 'Perdue',
  'Producer / Producer Owned Beef', 'Quaker Oats', 'Resers',
  'Simmons', 'Smithfield', 'Sustainable', 'The Deli Source',
  'Trinity Frozen Foods', 'Tyson', 'US Foods Stockyards',
  'Volpi Foods', 'Walmart / Walmart Manufacturing', 'Wayne-Sanderson Farms',
  'Wholestone Foods', 'Other'
];

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS',
  'KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY',
  'NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'
];

const VINCIT_MEMBERS = [
  'QSI-Beef', 'QSI-Pork', 'QSI-Case Ready', 'QSI-Poultry',
  'Zee-Nighttime Sanitation', 'Zee-Intervention', 'Zee-Water & Energy',
  'Zee-F&B Chemicals', 'Zee-GOP', 'TCS', 'ITG (Engineering)', 'Other'
];

const DEAL_OWNERS = [
  { id: '87131928', name: 'Chad Lawrence' },
  { id: '87129317', name: 'Ben Hope' },
  { id: '87132088', name: 'Brian Hales' },
  { id: '87184916', name: 'Greg Atchley' },
  { id: '87184498', name: 'Eric Wilson' },
  { id: '87184702', name: 'Ryan McCormick' },
  { id: '87185119', name: 'Jeremy Bates' },
  { id: '87132142', name: 'Rikki Ford' },
  { id: '87238944', name: 'Shane Calhoun' },
  { id: '87420199', name: 'Matthew Husman' },
  { id: '86370196', name: 'Brady Field' },
  { id: '86346498', name: 'Brian Barker' },
  { id: '87468498', name: 'Phillip Shelton' },
  { id: '87131891', name: 'Tim Bryant' },
  { id: '87132015', name: 'Chris Beavers' },
  { id: '87131966', name: 'Tanner Berryhill' },
  { id: '87131930', name: 'April Englishbey' },
  { id: '87184637', name: 'Joe Reed' },
  { id: '86370312', name: 'Matt Cretzman' },
].sort((a, b) => a.name.localeCompare(b.name));

const PIPELINE_OPTIONS = [
  { id: '852403303', name: 'Vincit Enterprise' },
  { id: '855678765', name: 'QSI BDM' },
  { id: '855656590', name: 'SAM Pipeline' },
  { id: 'default', name: 'Sales Pipeline' },
];

const DEAL_TYPES = ['New Business', 'Cross-Sell', 'Renewal'];

// ===== NEW DEAL FORM COMPONENT (styled for slate-900 theme) =====
function NewDealForm() {
  const [form, setForm] = useState({
    parentAccount: '', city: '', state: '', vincitMember: '',
    pipeline: '852403303', dealType: 'New Business', ownerId: '',
    amount: '', closeDate: '', notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const generatedName = useMemo(() => {
    if (!form.parentAccount || !form.city || !form.state || !form.vincitMember) return '';
    return `${form.parentAccount} - ${form.city}, ${form.state} - ${form.vincitMember}`;
  }, [form.parentAccount, form.city, form.state, form.vincitMember]);

  const isValid = form.parentAccount && form.city && form.state && form.vincitMember && form.ownerId;

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
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
      hubspot_owner_id: form.ownerId,
      deal_type: form.dealType,
      vincit_member_company: form.vincitMember,
      parent_account: form.parentAccount,
      city: form.city,
      state: form.state,
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
          parentAccount: '', city: '', state: '', vincitMember: '',
          pipeline: '852403303', dealType: 'New Business', ownerId: '',
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
          {result.type === 'success' ? '✅ ' : '❌ '}{result.message}
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

      {/* Vincit Member Company */}
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 mb-6">
        <h3 className="text-lg font-semibold text-white mb-4">Vincit Member Company</h3>
        <label className="block text-sm font-medium text-slate-300 mb-2">Servicing Group <span className="text-red-400">*</span></label>
        <select value={form.vincitMember} onChange={e => handleChange('vincitMember', e.target.value)} className={selectClass}>
          <option value="">Select servicing group...</option>
          {VINCIT_MEMBERS.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
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
            <label className="block text-sm font-medium text-slate-300 mb-2">Deal Type</label>
            <select value={form.dealType} onChange={e => handleChange('dealType', e.target.value)} className={selectClass}>
              {DEAL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="md:col-span-2">
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
      if (json.success) {
        setData(json);
        setError(null);
      } else {
        setError(json.error || 'Failed to fetch data');
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Filtered data based on pipeline filter
  const filtered = useMemo(() => {
    if (!data) return null;
    if (activeFilter === 'All') return data;

    const owners = data.pipelineByOwner.filter(o => o.team === activeFilter);
    const deals = data.allDeals.filter(d => d.team === activeFilter);
    const totalPipeline = deals.reduce((s, d) => s + d.amount, 0);
    const totalWeeklyRevenue = deals.reduce((s, d) => s + d.fiveDayPrice, 0);

    return {
      ...data,
      pipelineByOwner: owners,
      allDeals: deals,
      summary: {
        ...data.summary,
        totalPipeline,
        totalWeeklyRevenue,
        activeDeals: deals.length,
        avgDealSize: deals.length > 0 ? totalPipeline / deals.length : 0,
      },
      topDeals: data.topDeals.filter(d => d.team === activeFilter),
      topByWeekly: data.topByWeekly.filter(d => d.team === activeFilter),
    };
  }, [data, activeFilter]);

  const toggleOwner = (owner) => {
    setExpandedOwners(prev => ({ ...prev, [owner]: !prev[owner] }));
  };

  // Pipeline filter counts
  const filterCounts = useMemo(() => {
    if (!data) return {};
    return {
      All: data.allDeals?.length || 0,
      SAM: data.allDeals?.filter(d => d.team === 'SAM').length || 0,
      'QSI BDM': data.allDeals?.filter(d => d.team === 'QSI BDM').length || 0,
      'Vincit Enterprise': data.allDeals?.filter(d => d.team === 'Vincit Enterprise').length || 0,
    };
  }, [data]);

  // Loading state
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

  // Error state
  if (error && !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center bg-red-500/10 border border-red-500/50 rounded-xl p-8 max-w-md">
          <div className="text-4xl mb-4">⚠️</div>
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
  const pipelineByCloseDate = data?.pipelineByCloseDate || [];
  const topDeals = filtered?.topDeals || [];
  const topByWeekly = filtered?.topByWeekly || [];
  const noDateDeals = data?.noDateDeals || [];

  // Chart data
  const barChartData = pipelineByOwner.slice(0, 8).map(o => ({
    name: o.owner.split(' ')[1] || o.owner.split(' ')[0],
    pipeline: o.totalPipeline / 1e6,
    fullName: o.owner,
  }));

  const pieData = pipelineByGroup.map((g, i) => ({
    name: g.group,
    value: g.totalPipeline,
    color: COLORS[i % COLORS.length],
  }));

  const lineData = pipelineByCloseDate
    .filter(d => d.month !== 'No Date')
    .map(d => ({
      month: d.month.replace(' 2026', '').replace(' 2025', ''),
      pipeline: d.pipeline / 1e6,
      deals: d.deals,
    }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* ===== HEADER ===== */}
      <header className="bg-slate-900/80 backdrop-blur border-b border-slate-700/50 sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-teal-500 text-white px-3 py-1.5 rounded-lg font-bold text-lg tracking-wider">V</div>
              <div>
                <div className="text-teal-400 text-sm font-medium tracking-wider">VINCIT GROUP</div>
                <div className="text-slate-400 text-xs">Chemical • Sanitation • Engineering</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-white font-semibold">Sales Pipeline Executive Report</div>
              <div className="text-slate-400 text-sm flex items-center justify-end gap-2">
                {data?.lastUpdated && (
                  <>
                    <span>{new Date(data.lastUpdated).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                    <span className="flex items-center gap-1 text-green-400">
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      HubSpot Live Data
                    </span>
                  </>
                )}
              </div>
            </div>
            <button onClick={fetchData} disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white text-sm transition disabled:opacity-50">
              <span className={loading ? 'animate-spin' : ''}>↻</span> Refresh
            </button>
          </div>
        </div>
      </header>

      {/* ===== TAB BAR + PIPELINE FILTERS ===== */}
      <div className="bg-slate-900/50 border-b border-slate-700/50">
        <div className="max-w-[1600px] mx-auto px-6 py-3">
          <div className="flex items-center gap-3">
            {/* Tab Switcher */}
            <div className="flex gap-1 bg-slate-800/80 rounded-xl p-1 border border-slate-700/50 mr-4">
              {[
                { key: 'pipeline', label: '📊 Pipeline' },
                { key: 'newdeal', label: '➕ New Deal' },
              ].map(tab => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  className={`py-2 px-4 rounded-lg text-sm font-semibold transition-all ${
                    activeTab === tab.key
                      ? 'bg-teal-500 text-white shadow-lg'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700'
                  }`}>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Pipeline Filters (only show on pipeline tab) */}
            {activeTab === 'pipeline' && (
              <>
                {['All', 'SAM', 'QSI BDM', 'Vincit Enterprise'].map(f => (
                  <button key={f} onClick={() => setActiveFilter(f)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                      activeFilter === f
                        ? 'bg-white text-slate-900'
                        : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
                    }`}>
                    {f}
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      activeFilter === f ? 'bg-slate-200 text-slate-700' : 'bg-slate-600 text-slate-300'
                    }`}>
                      {filterCounts[f] || 0}
                    </span>
                  </button>
                ))}
                {activeFilter !== 'All' && data?.teamLeaders?.[activeFilter] && (
                  <div className="ml-auto text-sm text-slate-400">
                    Team Leader: <span className="text-white font-medium">{data.teamLeaders[activeFilter]}</span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* ===== MAIN CONTENT ===== */}
      <main className="max-w-[1600px] mx-auto px-6 py-6">

        {/* ===== NEW DEAL TAB ===== */}
        {activeTab === 'newdeal' ? (
          <NewDealForm />
        ) : (
          <>
            {/* ===== KPI CARDS ===== */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
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
                  <div className="p-2 rounded-lg bg-green-500/20"><span className="text-green-400 text-lg">●</span></div>
                  <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">Active Deals</span>
                </div>
                <div className="text-3xl font-bold text-green-400">{summary.activeDeals || 0}</div>
                <div className="text-sm text-slate-400">In pipeline currently</div>
              </div>

              <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-amber-500/20"><span className="text-amber-400 text-lg">◷</span></div>
                  <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">Weekly Revenue</span>
                </div>
                <div className="text-3xl font-bold text-amber-400">{formatCurrency(summary.totalWeeklyRevenue)}</div>
                <div className="text-sm text-slate-400">5-Day Price total</div>
                <div className="mt-2 inline-block px-2 py-1 rounded text-xs font-medium bg-amber-500/20 text-amber-400">
                  {formatCurrency(summary.totalWeeklyRevenue / 5)}/day
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-purple-500/20"><span className="text-purple-400 text-lg">↗</span></div>
                  <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">Avg Deal Size</span>
                </div>
                <div className="text-3xl font-bold text-purple-400">{formatCurrency(summary.avgDealSize)}</div>
                <div className="text-sm text-slate-400">Per opportunity</div>
              </div>

              <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-blue-500/20"><span className="text-blue-400 text-lg">⏱</span></div>
                  <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">Avg Weekly/Deal</span>
                </div>
                <div className="text-3xl font-bold text-blue-400">{formatCurrency(summary.avgWeeklyPerDeal)}</div>
                <div className="text-sm text-slate-400">5-Day Price avg</div>
              </div>
            </div>

            {/* ===== AT RISK BANNER ===== */}
            {activeFilter === 'All' && summary.atRiskCount > 0 && (
              <div className="mb-6 bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-orange-500/20 rounded-lg"><span className="text-orange-400 text-2xl">⚠</span></div>
                  <div>
                    <div className="text-orange-300 font-semibold">High-Value Deals Requiring Immediate Attention</div>
                    <div className="text-slate-400 text-sm">{summary.atRiskCount} deals with no recent logged activity may be at risk of stalling. Recommend immediate outreach within 48 hours.</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400 uppercase tracking-wider">At Risk Value</div>
                  <div className="text-3xl font-bold text-red-400">{formatCurrency(summary.atRiskValue)}</div>
                </div>
              </div>
            )}

            {/* ===== CHARTS ROW ===== */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Pipeline by Deal Owner */}
              <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-slate-400">👥</span>
                  <h2 className="text-lg font-semibold text-white">Pipeline by Deal Owner</h2>
                </div>
                <div className="text-xs text-slate-500 mb-3">Top performers by total pipeline value</div>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={barChartData}>
                    <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}M`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: 8 }}
                      labelStyle={{ color: '#fff' }}
                      formatter={v => [`$${v.toFixed(1)}M`, 'Pipeline']}
                      labelFormatter={(label, payload) => payload[0]?.payload?.fullName || label}
                    />
                    <Bar dataKey="pipeline" fill={THEME.teal} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Pipeline by Business Group */}
              <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-slate-400">◎</span>
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

            {/* ===== CLOSE DATE CHART ===== */}
            <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-slate-400">📅</span>
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
                  ⚠️ {summary.dealsNoCloseDate} deals totaling {formatCurrency(summary.noCloseDateValue)} have no close date set — recommend qualification review
                </div>
              )}
            </div>

            {/* ===== TOP 10 LISTS ===== */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Top 10 by Annual Value */}
              <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-slate-400">↗</span>
                  <h2 className="text-lg font-semibold text-white">Top 10 by Annual Value</h2>
                </div>
                <div className="space-y-2">
                  {(activeFilter === 'All' ? data?.topDeals : topDeals)?.slice(0, 10).map((deal, i) => (
                    <div key={`top-annual-${deal.id || i}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-700/30">
                      <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white">{i + 1}</div>
                      <div className="flex-1 min-w-0"><div className="text-sm text-white truncate">{deal.name}</div></div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-teal-400">{formatCurrency(deal.amount)}</div>
                        <div className="text-xs text-slate-500">{formatCurrency(deal.fiveDayPrice)}/wk</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top 10 by Weekly Revenue */}
              <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-slate-400">⏱</span>
                  <h2 className="text-lg font-semibold text-white">Top 10 by Weekly Revenue</h2>
                </div>
                <div className="space-y-2">
                  {(activeFilter === 'All' ? data?.topByWeekly : topByWeekly)?.slice(0, 10).map((deal, i) => (
                    <div key={`top-weekly-${deal.id || i}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-700/30">
                      <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white">{i + 1}</div>
                      <div className="flex-1 min-w-0"><div className="text-sm text-white truncate">{deal.name}</div></div>
                      <div className="text-sm font-semibold text-amber-400">{formatCurrency(deal.fiveDayPrice)}/wk</div>
                      <div className="px-2 py-0.5 rounded text-xs font-medium"
                        style={{ backgroundColor: `${TEAM_COLORS[deal.team] || THEME.gray}30`, color: TEAM_COLORS[deal.team] || THEME.gray }}>
                        {deal.owner?.split(' ')[1] || deal.owner?.split(' ')[0]}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ===== NO DATE DEALS ===== */}
            {activeFilter === 'All' && noDateDeals.length > 0 && (
              <div className="bg-red-500/5 rounded-xl p-5 border border-red-500/30 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-red-400">⚠</span>
                  <h2 className="text-lg font-semibold text-white">At Risk (No Date)</h2>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs text-slate-400 uppercase tracking-wider p-2 border-b border-slate-700/50">
                  <div>Deal</div><div className="text-right">Annual</div><div className="text-right">5-Day</div>
                </div>
                {noDateDeals.slice(0, 8).map((deal, i) => (
                  <div key={`no-date-${deal.id || i}`} className="grid grid-cols-3 gap-2 p-2 border-b border-slate-700/30 items-center">
                    <div className="text-sm text-white truncate">{deal.name}</div>
                    <div className="text-right text-sm font-semibold text-red-400">{formatCurrency(deal.amount)}</div>
                    <div className="text-right">
                      <span className="px-2 py-1 rounded text-xs font-medium bg-red-500/20 text-red-300">{formatCurrency(deal.fiveDayPrice)}/wk</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ===== OWNER DETAIL TABLE ===== */}
            <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-slate-400">👥</span>
                <h2 className="text-lg font-semibold text-white">Pipeline by Deal Owner — Performance & Weekly Revenue</h2>
              </div>
              <div className="text-xs text-slate-500 mb-4">Click a row to expand and see all deals</div>

              <div className="grid grid-cols-12 gap-2 p-3 bg-slate-700/30 rounded-lg text-xs text-slate-400 uppercase tracking-wider font-medium mb-3">
                <div className="col-span-3">Sales Rep</div>
                <div className="col-span-2 text-right">Pipeline</div>
                <div className="col-span-2 text-right">Weekly (5-Day)</div>
                <div className="col-span-1 text-center">Deals</div>
                <div className="col-span-2 text-right">Avg Deal</div>
                <div className="col-span-2 text-right">Share</div>
              </div>

              {pipelineByOwner.map((owner, idx) => {
                const expanded = expandedOwners[owner.owner];
                const noDateCount = owner.dealList?.filter(d => !d.closeDate).length || 0;
                const share = summary.totalPipeline > 0 ? ((owner.totalPipeline / summary.totalPipeline) * 100).toFixed(1) : 0;

                return (
                  <div key={`owner-${owner.owner}-${idx}`} className="mb-3">
                    <div onClick={() => toggleOwner(owner.owner)}
                      className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all ${
                        expanded ? 'bg-slate-700 border-l-4' : 'bg-slate-800/50 hover:bg-slate-700/50 border-l-4 border-transparent'
                      }`}
                      style={{ borderLeftColor: expanded ? (TEAM_COLORS[owner.team] || THEME.teal) : 'transparent' }}>

                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                          style={{ backgroundColor: TEAM_COLORS[owner.team] || THEME.teal }}>
                          {owner.owner.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-white">{owner.owner}</div>
                          <div className="text-sm text-slate-400">{owner.deals} deals</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className="text-xs text-slate-400 uppercase">Pipeline</div>
                          <div className="font-bold text-white">{formatCurrency(owner.totalPipeline)}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-slate-400 uppercase">5-Day</div>
                          <div className="font-semibold text-slate-300">{formatCurrency(owner.weeklyRevenue)}</div>
                        </div>
                        <div className="text-right min-w-[60px]">
                          <div className="text-xs text-slate-400 uppercase">Share</div>
                          <div className="font-semibold text-slate-300">{share}%</div>
                        </div>
                        {noDateCount > 0 && (
                          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-medium">
                            ⚠ {noDateCount}
                          </div>
                        )}
                        <span className="text-slate-400">{expanded ? '▲' : '▼'}</span>
                      </div>
                    </div>

                    {expanded && owner.dealList && (
                      <div className="mt-2 bg-slate-800/30 rounded-xl overflow-hidden border border-slate-700/50">
                        <div className="grid grid-cols-12 gap-2 p-3 bg-slate-700/30 text-xs text-slate-400 uppercase tracking-wider font-medium">
                          <div className="col-span-4">Deal</div>
                          <div className="col-span-2 text-right">Annual</div>
                          <div className="col-span-2 text-right">5-Day</div>
                          <div className="col-span-2 text-center">Stage</div>
                          <div className="col-span-2 text-center">Close Date</div>
                        </div>
                        {owner.dealList.sort((a, b) => b.amount - a.amount).map((deal, di) => {
                          const noDate = !deal.closeDate;
                          return (
                            <div key={`deal-${deal.id || di}`} className={`grid grid-cols-12 gap-2 p-3 border-t border-slate-700/30 items-center ${noDate ? 'bg-red-500/5' : ''}`}>
                              <div className="col-span-4 text-sm text-white truncate flex items-center gap-2">
                                {deal.name}{noDate && <span className="text-red-400">⚠</span>}
                              </div>
                              <div className="col-span-2 text-right text-sm font-medium text-white">{formatCurrency(deal.amount)}</div>
                              <div className="col-span-2 text-right text-sm text-slate-400">{formatCurrency(deal.fiveDayPrice)}/wk</div>
                              <div className="col-span-2 text-center">
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-slate-600/50 text-slate-300">
                                  {deal.stage?.substring(0, 8) || 'N/A'}
                                </span>
                              </div>
                              <div className={`col-span-2 text-center text-sm ${deal.closeDate ? 'text-slate-400' : 'text-red-400 font-medium'}`}>
                                {deal.closeDate ? formatDate(deal.closeDate).replace(', 2026', '').replace(', 2025', '') : 'TBD'}
                              </div>
                            </div>
                          );
                        })}
                        <div className="p-3 bg-slate-700/50 flex justify-end gap-6 text-sm">
                          <span className="text-slate-400">Total:</span>
                          <span className="font-bold text-white">{formatCurrency(owner.totalPipeline)}</span>
                          <span className="text-slate-400">{formatCurrency(owner.weeklyRevenue)}/wk</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* ===== FOOTER ===== */}
            <footer className="bg-slate-900/50 rounded-xl p-8 text-center border border-slate-700/50">
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className="bg-teal-500 text-white px-3 py-1 rounded-lg font-bold text-xl">V</div>
                <span className="text-teal-400 text-xl font-semibold tracking-wider">VINCIT GROUP</span>
              </div>
              <div className="text-slate-400 italic mb-4">&quot;To Conquer&quot; — Reaching Full Potential Together</div>
              <div className="text-slate-500 text-sm">
                Data sourced from HubSpot CRM • Report generated {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </div>
              <div className="text-slate-600 text-xs mt-1">Seven Brands • One Vision • Chemical, Sanitation & Engineering Excellence</div>
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
