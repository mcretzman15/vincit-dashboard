import { NextResponse } from 'next/server';

// First stage ID for each pipeline (entry/default stage)
const PIPELINE_FIRST_STAGE = {
  '852403303': '1270511187',   // Vincit Enterprise → first stage
  '855656590': '1276813984',   // SAM Pipeline → first stage
  '855678765': '1276776727',   // QSI BDM → first stage
  'default': 'appointmentscheduled', // Sales Pipeline (HubSpot default)
};

// Map display deal type labels to HubSpot internal values
const DEAL_TYPE_MAP = {
  'New Business': 'newbusiness',
  'Existing Business': 'existingbusiness',
  'Cross-Sell': 'newbusiness',
  'Renewal': 'existingbusiness',
};

export async function POST(request) {
  const token = process.env.HUBSPOT_ACCESS_TOKEN;
  if (!token) {
    return NextResponse.json({ error: 'HubSpot token not configured' }, { status: 500 });
  }

  try {
    const {
      dealname,
      amount,
      closedate,
      pipeline,
      dealstage,
      hubspot_owner_id,
      deal_type,
      vincit_member_company,
      parent_account,
      city,
      state,
      notes,
    } = await request.json();

    if (!dealname) {
      return NextResponse.json({ error: 'Deal name is required' }, { status: 400 });
    }

    // Resolve pipeline and stage
    const resolvedPipeline = pipeline || '852403303';
    const resolvedStage = dealstage || PIPELINE_FIRST_STAGE[resolvedPipeline] || '1270511187';

    // Resolve deal type to HubSpot internal value
    const resolvedDealType = deal_type ? (DEAL_TYPE_MAP[deal_type] || deal_type.toLowerCase().replace(/\s+/g, '')) : undefined;

    const properties = {
      dealname,
      pipeline: resolvedPipeline,
      dealstage: resolvedStage,
    };

    if (amount) properties.amount = String(amount);
    if (closedate) properties.closedate = closedate;
    if (hubspot_owner_id) properties.hubspot_owner_id = hubspot_owner_id;
    if (resolvedDealType) properties.dealtype = resolvedDealType;
    if (notes) properties.description = notes;

    const response = await fetch('https://api.hubapi.com/crm/v3/objects/deals', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ properties }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('HubSpot error:', data);
      return NextResponse.json(
        { error: 'HubSpot API error', details: data.message || JSON.stringify(data) },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      dealId: data.id,
      dealname: data.properties.dealname,
      message: `Deal "${data.properties.dealname}" created successfully`,
    });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}
