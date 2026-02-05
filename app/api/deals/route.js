import { NextResponse } from 'next/server';

// ============================================================
// HUBSPOT CONFIGURATION - SOURCE OF TRUTH (Updated 2026-02-05)
// ============================================================

// Pipeline IDs and Labels (CORRECTED to match HubSpot)
const PIPELINE_MAP = {
  '852403303': 'SAM Pipeline',
  '855656590': 'Vincit Enterprise',
  '855678765': 'QSI BDM',
};

// Deal Owners - CORRECTED from HubSpot (22 active owners)
const OWNER_MAP = {
  '26684738': 'Joachim Koch',
  '84509028': 'Brian Barker',
  '86370196': 'Brady Field',
  '86370312': 'Matt Cretzman',
  '87077445': 'Tim Bryant',
  '87129317': 'Chris Beavers',
  '87131928': 'Chad Lawrence',
  '87131988': 'Phillip Shelton',
  '87132040': 'Rikki Ford',
  '87132088': 'Tanner Berryhill',
  '87132142': 'April Englishbey',
  '87173917': 'Jeremy Bates',
  '87184498': 'Ben Hope',
  '87184702': 'Greg Atchley',
  '87184916': 'Eric Wilson',
  '87185119': 'Brian Hales',
  '87238944': 'Shane Calhoun',
  '87331887': 'Ryan McCormick',
  '87420199': 'Matt Husman',
  '87674892': 'Ken Dreyer',
  '87816453': 'Terry Beavers',
  '87856300': 'Ben Bebermeyer',
};

// Stage names for display
const STAGE_NAMES = {
  // SAM Pipeline (852403303)
  '1270511187': 'Qualification',
  '1270511188': 'Plant Surveyed',
  '1270511189': 'Quotes Provided',
  '1270511190': 'Decision Making',
  '1270511191': 'Contract Sent',
  '1270511192': 'Closed Won',
  '1270511193': 'Closed Lost',
  // Vincit Enterprise (855656590)
  '1276813984': 'Qualification',
  '1276813985': 'Plant Surveyed',
  '1276813986': 'Quotes Provided',
  '1276813987': 'Decision Making',
  '1276813988': 'Contract Sent',
  '1276813989': 'Closed Won',
  '1276813990': 'Closed Lost',
  // QSI BDM (855678765)
  '1276776727': 'Qualification',
  '1276776728': 'Plant Surveyed',
  '1276776729': 'Quotes Provided',
  '1276776730': 'Decision Making',
  '1276776731': 'Contract Sent',
  '1276776732': 'Closed Won',
  '1276776733': 'Closed Lost',
};

// Closed stage IDs - ONLY exclude these from active pipeline
const CLOSED_WON_STAGES = ['1270511192', '1276813989', '1276776732'];
const CLOSED_LOST_STAGES = ['1270511193', '1276813990', '1276776733'];
const ALL_CLOSED_STAGES = [...CLOSED_WON_STAGES, ...CLOSED_LOST_STAGES];

const GROUP_MAP = {
  'QSI': 'QSI (Sanitation)',
  'Zee': 'Zee Company (Chemical)',
  'ITG': 'ITG (Engineering)',
  'TCS': 'TCS',
};

async function fetchAllDeals(token) {
  const allDeals = [];
  let after = undefined;
  // Removed five_day_price - property does not exist in HubSpot
  const properties = [
    'dealname', 'amount', 'closedate', 'pipeline', 'dealstage',
    'hubspot_owner_id', 'hs_lastmodifieddate', 'createdate', 'dealtype'
  ];

  while (true) {
    const body = {
      filterGroups: [{
        filters: [{
          propertyName: 'dealstage',
          operator: 'NOT_IN',
          values: ALL_CLOSED_STAGES
        }]
      }],
      properties,
      limit: 100,
      ...(after ? { after } : {}),
    };

    const res = await fetch('https://api.hubapi.com/crm/v3/objects/deals/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || `HubSpot API error: ${res.status}`);
    }

    const data = await res.json();
    allDeals.push(...data.results);

    if (data.paging?.next?.after) {
      after = data.paging.next.after;
    } else {
      break;
    }
  }

  return allDeals;
}

function getTeam(deal) {
  const pipeline = deal.properties.pipeline;
  return PIPELINE_MAP[pipeline] || 'Other';
}

function getOwnerName(deal) {
  return OWNER_MAP[deal.properties.hubspot_owner_id] || 'Unassigned';
}

function getStageName(deal) {
  return STAGE_NAMES[deal.properties.dealstage] || deal.properties.dealstage || 'Unknown';
}

function getGroup(deal) {
  const name = deal.properties.dealname || '';
  for (const [prefix, group] of Object.entries(GROUP_MAP)) {
    if (name.toLowerCase().includes(prefix.toLowerCase())) return group;
  }
  const team = getTeam(deal);
  if (team === 'SAM Pipeline') return 'SAM (Strategic Accounts)';
  if (team === 'Vincit Enterprise') return 'Vincit Enterprise';
  return 'Other';
}

export async function GET() {
  const token = process.env.HUBSPOT_ACCESS_TOKEN;
  if (!token) {
    return NextResponse.json({ success: false, error: 'HubSpot token not configured' }, { status: 500 });
  }

  try {
    const deals = await fetchAllDeals(token);

    const allDeals = deals.map(d => ({
      id: d.id,
      name: d.properties.dealname || 'Unnamed',
      amount: parseFloat(d.properties.amount) || 0,
      closeDate: d.properties.closedate || null,
      stageId: d.properties.dealstage || '',
      stage: getStageName(d),
      pipeline: d.properties.pipeline || '',
      ownerId: d.properties.hubspot_owner_id || '',
      owner: getOwnerName(d),
      team: getTeam(d),
      group: getGroup(d),
      lastModified: d.properties.hs_lastmodifieddate || null,
    }));

    const totalPipeline = allDeals.reduce((s, d) => s + d.amount, 0);
    const activeDeals = allDeals.length;
    const avgDealSize = activeDeals > 0 ? totalPipeline / activeDeals : 0;

    const noDateDeals = allDeals.filter(d => !d.closeDate);
    const dealsNoCloseDate = noDateDeals.length;
    const noCloseDateValue = noDateDeals.reduce((s, d) => s + d.amount, 0);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const atRiskDeals = allDeals.filter(d =>
      d.amount > 100000 && d.lastModified && new Date(d.lastModified) < thirtyDaysAgo
    );
    const atRiskCount = atRiskDeals.length;
    const atRiskValue = atRiskDeals.reduce((s, d) => s + d.amount, 0);

    // Pipeline by Stage aggregation
    const stageMap = {};
    allDeals.forEach(d => {
      const stageName = d.stage;
      if (!stageMap[stageName]) stageMap[stageName] = { stage: stageName, totalPipeline: 0, deals: 0 };
      stageMap[stageName].totalPipeline += d.amount;
      stageMap[stageName].deals += 1;
    });
    const pipelineByStage = Object.values(stageMap).sort((a, b) => {
      // Sort by stage progression order
      const stageOrder = ['Qualification', 'Plant Surveyed', 'Quotes Provided', 'Decision Making', 'Contract Sent'];
      return stageOrder.indexOf(a.stage) - stageOrder.indexOf(b.stage);
    });

    const ownerMap = {};
    allDeals.forEach(d => {
      if (!ownerMap[d.owner]) {
        ownerMap[d.owner] = { owner: d.owner, team: d.team, totalPipeline: 0, deals: 0, dealList: [] };
      }
      ownerMap[d.owner].totalPipeline += d.amount;
      ownerMap[d.owner].deals += 1;
      ownerMap[d.owner].dealList.push(d);
    });
    const pipelineByOwner = Object.values(ownerMap).sort((a, b) => b.totalPipeline - a.totalPipeline);

    const groupMap = {};
    allDeals.forEach(d => {
      if (!groupMap[d.group]) groupMap[d.group] = { group: d.group, totalPipeline: 0, deals: 0 };
      groupMap[d.group].totalPipeline += d.amount;
      groupMap[d.group].deals += 1;
    });
    const pipelineByGroup = Object.values(groupMap).sort((a, b) => b.totalPipeline - a.totalPipeline);

    const dateMap = {};
    allDeals.forEach(d => {
      if (!d.closeDate) {
        if (!dateMap['No Date']) dateMap['No Date'] = { month: 'No Date', pipeline: 0, deals: 0 };
        dateMap['No Date'].pipeline += d.amount;
        dateMap['No Date'].deals += 1;
      } else {
        const date = new Date(d.closeDate);
        const monthKey = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        if (!dateMap[monthKey]) dateMap[monthKey] = { month: monthKey, pipeline: 0, deals: 0, sortDate: date };
        dateMap[monthKey].pipeline += d.amount;
        dateMap[monthKey].deals += 1;
      }
    });
    const pipelineByCloseDate = Object.values(dateMap).sort((a, b) => {
      if (a.month === 'No Date') return 1;
      if (b.month === 'No Date') return -1;
      return (a.sortDate || 0) - (b.sortDate || 0);
    });

    const topDeals = [...allDeals].sort((a, b) => b.amount - a.amount).slice(0, 15);

    return NextResponse.json({
      success: true,
      lastUpdated: new Date().toISOString(),
      summary: {
        totalPipeline,
        activeDeals,
        avgDealSize,
        atRiskCount,
        atRiskValue,
        dealsNoCloseDate,
        noCloseDateValue,
      },
      pipelineByOwner,
      pipelineByGroup,
      pipelineByStage,
      pipelineByCloseDate,
      topDeals,
      noDateDeals: noDateDeals.sort((a, b) => b.amount - a.amount).slice(0, 10),
      allDeals: allDeals.map(d => ({ id: d.id, team: d.team, amount: d.amount, stage: d.stage, stageId: d.stageId })),
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
