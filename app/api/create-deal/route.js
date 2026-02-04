import { NextResponse } from 'next/server';

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

    const properties = {
      dealname,
      pipeline: pipeline || 'default',
      dealstage: dealstage || 'appointmentscheduled',
    };

    if (amount) properties.amount = String(amount);
    if (closedate) properties.closedate = closedate;
    if (hubspot_owner_id) properties.hubspot_owner_id = hubspot_owner_id;
    if (deal_type) properties.dealtype = deal_type;
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
