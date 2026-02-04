import { NextResponse } from 'next/server';

const PIPELINE_MAP = {
  '855656590': 'SAM',
  '855678765': 'QSI BDM',
  '852403303': 'Vincit Enterprise',
};

const OWNER_MAP = {
  '87131928': 'Chad Lawrence',
  '87129317': 'Ben Hope',
  '87132088': 'Brian Hales',
  '87184916': 'Greg Atchley',
  '87184498': 'Eric Wilson',
  '87184702': 'Ryan McCormick',
  '87185119': 'Jeremy Bates',
  '87132142': 'Rikki Ford',
  '87238944': 'Shane Calhoun',
  '87420199': 'Matthew Husman',
  '86370196': 'Brady Field',
  '86346498': 'Brian Barker',
  '87468498': 'Phillip Shelton',
  '87131891': 'Tim Bryant',
  '87132015': 'Chris Beavers',
  '87131966': 'Tanner Berryhill',
  '87131930': 'April Englishbey',
  '87184637': 'Joe Reed',
  '85498043': 'Matt Cretzman',
};

const GROUP_MAP = {
  'QSI': 'QSI (Sanitation)',
  'Zee': 'Zee Company (Chemical)',
  'ITG': 'ITG (Engineering)',
  'TCS': 'TCS',
};

const TEAM_LEADERS = {
  'SAM': 'Chad Lawrence',
  'QSI BDM': 'Brady Field',
  'Vincit Enterprise': 'Brian Barker',
};

async function fetchAllDeals(token) {
  const allDeals = [];
  let after = undefined;
  const properties = [
    'dealname', 'amount', 'closedate', 'pipeline', 'dealstage',
    'hubspot_owner_id', 'hs_lastmodifieddate', 'five_day_price',
    'createdate', 'dealtype'
  ];

  while (true) {
    const body = {
      filterGroups: [{
        filters: [{
          propertyName: 'dealstage',
          operator: 'NOT_IN',
          values: ['closedwon', 'closedlost', '1270511191', '1270511192', '1276776733', '1276776734']
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

function getGroup(deal) {
  const name = deal.properties.dealname || '';
  for (const [prefix, group] of Object.entries(GROUP_MAP)) {
    if (name.toLowerCase().includes(prefix.toLowerCase())) return group;
  }
  const team = getTeam(deal);
  if (team === 'SAM') return 'SAM (Strategic Accounts)';
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
      fiveDayPrice: parseFloat(d.properties.five_day_price) || 0,
      closeDate: d.properties.closedate || null,
      stage: d.properties.dealstage || '',
      pipeline: d.properties.pipeline || '',
      ownerId: d.properties.hubspot_owner_id || '',
      owner: getOwnerName(d),
      team: getTeam(d),
      group: getGroup(d),
      lastModified: d.properties.hs_lastmodifieddate || null,
    }));

    const totalPipeline = allDeals.reduce((s, d) => s + d.amount, 0);
    const totalWeeklyRevenue = allDeals.reduce((s, d) => s + d.fiveDayPrice, 0);
    const activeDeals = allDeals.length;
    const avgDealSize = activeDeals > 0 ? totalPipeline / activeDeals : 0;
    const avgWeeklyPerDeal = activeDeals > 0 ? totalWeeklyRevenue / activeDeals : 0;

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

    const ownerMap = {};
    allDeals.forEach(d => {
      if (!ownerMap[d.owner]) {
        ownerMap[d.owner] = { owner: d.owner, team: d.team, totalPipeline: 0, weeklyRevenue: 0, deals: 0, dealList: [] };
      }
      ownerMap[d.owner].totalPipeline += d.amount;
      ownerMap[d.owner].weeklyRevenue += d.fiveDayPrice;
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
    const topByWeekly = [...allDeals].sort((a, b) => b.fiveDayPrice - a.fiveDayPrice).slice(0, 15);

    return NextResponse.json({
      success: true,
      lastUpdated: new Date().toISOString(),
      summary: {
        totalPipeline,
        totalWeeklyRevenue,
        activeDeals,
        avgDealSize,
        avgWeeklyPerDeal,
        atRiskCount,
        atRiskValue,
        dealsNoCloseDate,
        noCloseDateValue,
      },
      pipelineByOwner,
      pipelineByGroup,
      pipelineByCloseDate,
      topDeals,
      topByWeekly,
      noDateDeals: noDateDeals.sort((a, b) => b.amount - a.amount).slice(0, 10),
      allDeals: allDeals.map(d => ({ team: d.team, amount: d.amount, fiveDayPrice: d.fiveDayPrice })),
      teamLeaders: TEAM_LEADERS,
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
