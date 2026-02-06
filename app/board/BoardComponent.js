"use client";
import { useState, useRef } from "react";

const COLUMNS = [
  { id: "urgent", title: "🔴 URGENT", color: "#DC2626", bg: "#FEF2F2", border: "#FECACA" },
  { id: "todo", title: "📋 TO DO", color: "#D97706", bg: "#FFFBEB", border: "#FDE68A" },
  { id: "inprogress", title: "⚡ IN PROGRESS", color: "#2563EB", bg: "#EFF6FF", border: "#BFDBFE" },
  { id: "blocked", title: "🚧 BLOCKED", color: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE" },
  { id: "done", title: "✅ DONE", color: "#059669", bg: "#F0FDF4", border: "#BBF7D0" },
];

const CATEGORIES = [
  { id: "hubspot", label: "HubSpot CRM", color: "#FF5C35", icon: "🔧" },
  { id: "dashboard", label: "Dashboard", color: "#0EA5E9", icon: "📊" },
  { id: "campaign", label: "QSI Campaign", color: "#8B5CF6", icon: "🎯" },
  { id: "leadstorm", label: "LeadStorm", color: "#F59E0B", icon: "⚡" },
  { id: "linkedin", label: "LinkedIn", color: "#0077B5", icon: "💼" },
  { id: "content", label: "Content", color: "#EC4899", icon: "📝" },
  { id: "tech", label: "Technical", color: "#6366F1", icon: "🔬" },
  { id: "internal", label: "Internal", color: "#64748B", icon: "🤝" },
];

const OWNERS = ["Matt", "Brady", "Brian", "Joachim", "Tim Bryant", "Team", "John Herr"];

const initialTasks = [
  { id: 1, title: "Fix Jeremy Bates deal data accuracy", desc: "Jeremy (IT) showing deals that aren't his in pipeline reports. Find root cause in HubSpot.", col: "urgent", cat: "hubspot", owner: "Matt", due: "ASAP", notes: [] },
  { id: 2, title: "Fix iPad pipeline dropdown bug", desc: "All reps not showing up. Brian getting errors on iPad app and HubSpot URL.", col: "urgent", cat: "hubspot", owner: "Brady", due: "ASAP", notes: [] },
  { id: 3, title: "Fix display names in HubSpot", desc: "Some users showing email addresses instead of proper names.", col: "urgent", cat: "hubspot", owner: "Brady", due: "ASAP", notes: [] },
  { id: 4, title: "Filter USDA Large plants by target states", desc: "Count 500+ employee plants in Great Lakes (MI,OH,IN,IL,WI,MN) + Northeast (PA,NY,NJ,CT,MA,ME,MD,DE). John Herr sent data 2/3.", col: "urgent", cat: "campaign", owner: "Matt", due: "This week", notes: [] },
  { id: 5, title: "Fix report date accuracy", desc: "Brian flagged dates not pulling accurately on reports.", col: "todo", cat: "hubspot", owner: "Matt", due: "This week", notes: [] },
  { id: 6, title: "Build deal naming convention", desc: "Member Company format, QSI/TCS/ZFB/ZWE application prefixes per 2/5 meeting discussion.", col: "todo", cat: "hubspot", owner: "Matt", due: "This week", notes: [] },
  { id: 7, title: "Build co-seller split deal functionality", desc: "When co-seller added, value splits 50/50. Both see and add activity. Ask HS team feasibility.", col: "todo", cat: "hubspot", owner: "Matt", due: "Next week", notes: [] },
  { id: 8, title: "Determine deal stage auto-sync across pipelines", desc: "Can changes in one pipeline sync to owner, co-seller, bidder pipelines? Key question for HS team.", col: "todo", cat: "hubspot", owner: "Brady", due: "Next week", notes: [] },
  { id: 9, title: "Zero-dollar bidder deals question", desc: "Can bidder-shared deals have $0 value? Bidder involvement is service, not sale.", col: "todo", cat: "hubspot", owner: "Brady", due: "Next week", notes: [] },
  { id: 10, title: "Review Aspiration Marketing support proposal", desc: "Joachim's ongoing support options. Determine what to pay for vs. what LeadStorm covers. Need recommendation for Brian.", col: "todo", cat: "hubspot", owner: "Matt", due: "This week", notes: [] },
  { id: 11, title: "Buy vincitreports.com domain", desc: "Centralize dashboard, sales intelligence map, and future tools under custom domain.", col: "todo", cat: "dashboard", owner: "Matt", due: "This week", notes: [] },
  { id: 12, title: "Fix Brady's dashboard error", desc: "Got error when testing from forwarded link. Investigate and resolve.", col: "todo", cat: "dashboard", owner: "Matt", due: "This week", notes: [] },
  { id: 13, title: "Query Small plants if Large count too low", desc: "10-499 employees in same states. Enrich via Clay for employee counts, rank largest to smallest.", col: "todo", cat: "campaign", owner: "Matt", due: "This week", notes: [] },
  { id: 14, title: "Filter FDA dataset by target states", desc: "~327K records. Food-only filter to reduce volume. Process alongside USDA list.", col: "todo", cat: "campaign", owner: "Matt", due: "This week", notes: [] },
  { id: 15, title: "Clay: PepsiCo/Frito-Lay FDA plants list", desc: "All US FDA-regulated plants. Export to Excel sorted by employee count. Share with Greg Ashley.", col: "todo", cat: "campaign", owner: "Matt", due: "Before Wed mtg", notes: [] },
  { id: 16, title: "Confirm FDA list structure with John Herr", desc: "Is there an FDA list structured like USDA with size categories? If not, Clay enrichment needed.", col: "todo", cat: "campaign", owner: "Brady", due: "ASAP", notes: [] },
  { id: 17, title: "Deliver USDA list to Matt Husman", desc: "For contact matching. Matched plants to Matt H. Remaining to Ryan McCormick team.", col: "todo", cat: "campaign", owner: "Brady", due: "After filtering", notes: [] },
  { id: 18, title: "Filter PepsiCo/Frito-Lay assign to Greg Atchley", desc: "Filter from FDA list and assign to Greg. He confirmed plant autonomy on contract cleaning.", col: "todo", cat: "campaign", owner: "Brady", due: "With FDA processing", notes: [] },
  { id: 19, title: "Clarify USDA size category definitions", desc: "Map to headcount. Confirm 500+ = Large. Work with John Herr / Kevin Regan.", col: "todo", cat: "campaign", owner: "Brady", due: "ASAP", notes: [] },
  { id: 20, title: "Compile Pepsi-owned companies list", desc: "All Pepsi entities incl. Frito-Lay, Gatorade for prioritization before 4-person meeting.", col: "todo", cat: "campaign", owner: "Matt", due: "Before Wed mtg", notes: [] },
  { id: 21, title: "Confirm LeadStorm pipeline contacts & seats", desc: "3 pipelines. Chase Outreach = Ryan McCormick. Greg Atchley Outreach = Greg Atchley.", col: "todo", cat: "leadstorm", owner: "Brady", due: "ASAP", notes: [] },
  { id: 22, title: "Configure LeadStorm sequences + HS triggers", desc: "LinkedIn + email steps with HubSpot pipeline push automation.", col: "todo", cat: "leadstorm", owner: "Matt", due: "Before March 1", notes: [] },
  { id: 23, title: "Setup burner email domains", desc: "Consult Tim Bryant on secondary domains (.co/.us). SPF/DKIM/DMARC config.", col: "todo", cat: "leadstorm", owner: "Brady", due: "ASAP", notes: [] },
  { id: 24, title: "Setup burner email accounts for reps", desc: "Integrate with LeadStorm. Depends on domain setup.", col: "todo", cat: "leadstorm", owner: "Tim Bryant", due: "After domains", notes: [] },
  { id: 25, title: "Draft 4-5 email templates for QSI", desc: "Plus LinkedIn outreach plan. Segment USDA vs FDA messaging. Submit for Brian approval.", col: "todo", cat: "leadstorm", owner: "Matt", due: "Before Wed mtg", notes: [] },
  { id: 26, title: "Provide rep email addresses to Matt", desc: "Greg, Ryan, Matt H emails needed for LeadStorm campaign config.", col: "todo", cat: "leadstorm", owner: "Brady", due: "This week", notes: [] },
  { id: 27, title: "LinkedIn makeover: Greg Atchley", desc: "Align to FDA/Frito-Lay/PepsiCo focus. 30-60 min session.", col: "todo", cat: "linkedin", owner: "Matt", due: "Before March 1", notes: [] },
  { id: 28, title: "LinkedIn makeover: Matt Husman", desc: "Standardize branding. 30-60 min session.", col: "todo", cat: "linkedin", owner: "Matt", due: "Before March 1", notes: [] },
  { id: 29, title: "LinkedIn makeover: Ryan McCormick", desc: "Standardize branding. 30-60 min session.", col: "todo", cat: "linkedin", owner: "Matt", due: "Before March 1", notes: [] },
  { id: 30, title: "Prepare Tanner's LinkedIn (future)", desc: "No immediate campaign. Prep for future outreach.", col: "todo", cat: "linkedin", owner: "Matt", due: "After launch", notes: [] },
  { id: 31, title: "Create LinkedIn banner/headline templates", desc: "Standardized templates for consistency by segment.", col: "todo", cat: "linkedin", owner: "Matt", due: "Before March 1", notes: [] },
  { id: 32, title: "Finalize 3 LinkedIn profiles for LeadStorm", desc: "Confirm readiness before launch.", col: "todo", cat: "linkedin", owner: "Brady", due: "Before March 1", notes: [] },
  { id: 33, title: "Share QSI marketing materials & case studies", desc: "QSI-specific, separate from Zee Chemical. Matt needs for content creation.", col: "todo", cat: "content", owner: "Brian", due: "ASAP", notes: [] },
  { id: 34, title: "Build campaign visual map", desc: "Flow, segments, ownership, and content plan for USDA/FDA streams.", col: "todo", cat: "content", owner: "Matt", due: "ASAP", notes: [] },
  { id: 35, title: "Start LinkedIn content pipeline", desc: "Meeting recordings, Competitive Differentiators one-pager, case studies, short expert videos.", col: "todo", cat: "content", owner: "Matt", due: "Ongoing", notes: [] },
  { id: 36, title: "Schedule expert video recordings", desc: "20-45 sec clips with Matt H, Ryan, Greg, Brady. Professional branded background.", col: "todo", cat: "content", owner: "Matt", due: "Start scheduling", notes: [] },
  { id: 37, title: "Adapt QSI Differentiators one-pager", desc: "Originally for Tyson. Adapt for other prospects. Brian sent 2/3.", col: "todo", cat: "content", owner: "Matt", due: "Before March 1", notes: [] },
  { id: 38, title: "Explore USDA API credentials", desc: "USDA unified logon. Assess feasibility for automated data ingestion.", col: "todo", cat: "tech", owner: "Matt", due: "March 1 target", notes: [] },
  { id: 39, title: "Build Clay inspection monitoring table", desc: "Monitor negative inspection classifications in target geographies. Trigger-based workflows.", col: "todo", cat: "tech", owner: "Matt", due: "March 1 target", notes: [] },
  { id: 40, title: "Design violations dashboard", desc: "Visualization with real-time indicators for inspection data.", col: "todo", cat: "tech", owner: "Matt", due: "March 1 target", notes: [] },
  { id: 41, title: "Validate 10-15 sample plants in Clay", desc: "Test Tyson/Cargill entries. Confirm headcount alignment before full run.", col: "todo", cat: "campaign", owner: "Matt", due: "Before full run", notes: [] },
  { id: 42, title: "Brady: Create project summary doc", desc: "Running list of completed and ongoing work. Share proactively with Bob and Jonathan.", col: "todo", cat: "internal", owner: "Brady", due: "This week", notes: [] },
  { id: 43, title: "Brady: Learn Clay for independent reports", desc: "Brian encouraged Clay proficiency to accelerate timelines.", col: "todo", cat: "internal", owner: "Brady", due: "Ongoing", notes: [] },
  { id: 44, title: "Schedule 4-person Frito-Lay meeting", desc: "Brian, Greg, Brady, Matt. Wed next week 11:00 AM CT.", col: "todo", cat: "internal", owner: "Brian", due: "Calendar invite", notes: [] },
  { id: 45, title: "Send meeting recaps to team", desc: "Including Pepsi/Frito-Lay update and John Herr outcomes.", col: "todo", cat: "internal", owner: "Brady", due: "ASAP", notes: [] },
  { id: 46, title: "Coordinate Gatorade Dallas meeting", desc: "Brian/Greg meeting next week. Separate from main campaign.", col: "todo", cat: "internal", owner: "Brian", due: "Next week", notes: [] },
  { id: 47, title: "Reschedule Tanner meeting", desc: "AI and HubSpot discussion. Missed 2/3, Tanner said try next day.", col: "todo", cat: "internal", owner: "Matt", due: "This week", notes: [] },
];

const DragContext = { draggedId: null };

/* PDF Export Utility */
function exportToPDF(tasks, filterCat, filterOwner, searchTerm) {
  const filtered = tasks.filter(t => {
    if (filterCat !== "all" && t.cat !== filterCat) return false;
    if (filterOwner !== "all" && !t.owner.toLowerCase().includes(filterOwner.toLowerCase())) return false;
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      const inNotes = t.notes.some(n => n.text.toLowerCase().includes(s));
      if (!t.title.toLowerCase().includes(s) && !t.desc.toLowerCase().includes(s) && !inNotes) return false;
    }
    return true;
  });

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const timeStr = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

  const activeFilters = [];
  if (filterCat !== "all") {
    const c = CATEGORIES.find(c => c.id === filterCat);
    activeFilters.push("Category: " + (c?.label || filterCat));
  }
  if (filterOwner !== "all") activeFilters.push("Owner: " + filterOwner);
  if (searchTerm) activeFilters.push('Search: "' + searchTerm + '"');

  const colLabel = (id) => {
    const map = { urgent: "URGENT", todo: "TO DO", inprogress: "IN PROGRESS", blocked: "BLOCKED", done: "DONE" };
    return map[id] || id;
  };
  const colColor = (id) => {
    const map = { urgent: "#DC2626", todo: "#D97706", inprogress: "#2563EB", blocked: "#7C3AED", done: "#059669" };
    return map[id] || "#64748B";
  };
  const colBg = (id) => {
    const map = { urgent: "#FEF2F2", todo: "#FFFBEB", inprogress: "#EFF6FF", blocked: "#F5F3FF", done: "#F0FDF4" };
    return map[id] || "#F8FAFC";
  };

  const totalByCol = {};
  COLUMNS.forEach(c => { totalByCol[c.id] = filtered.filter(t => t.col === c.id).length; });
  const ownerCounts = {};
  filtered.forEach(t => { ownerCounts[t.owner] = (ownerCounts[t.owner] || 0) + 1; });
  const totalNotes = filtered.reduce((s, t) => s + t.notes.length, 0);

  let html = '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Vincit Group Task Board - ' + dateStr + '</title>' +
    '<style>' +
    '@media print { @page { size: letter; margin: 0.5in 0.6in; } body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; } .page-break { page-break-before: always; } .no-break { page-break-inside: avoid; } }' +
    '* { box-sizing: border-box; margin: 0; padding: 0; }' +
    'body { font-family: Segoe UI, -apple-system, BlinkMacSystemFont, sans-serif; color: #1e293b; line-height: 1.5; background: #fff; }' +
    '.header { background: linear-gradient(135deg, #0f172a, #1e3a5f); color: #fff; padding: 28px 32px 22px; }' +
    '.header h1 { font-size: 22px; font-weight: 800; margin-bottom: 2px; }' +
    '.header .subtitle { font-size: 12px; color: #94a3b8; }' +
    '.header .date { font-size: 11px; color: #64748B; margin-top: 6px; }' +
    '.filter-badge { display: inline-block; background: rgba(255,255,255,0.12); color: #93c5fd; font-size: 10px; padding: 3px 10px; border-radius: 4px; margin-right: 6px; margin-top: 8px; }' +
    '.summary-bar { display: flex; gap: 0; border-bottom: 2px solid #e2e8f0; }' +
    '.summary-item { flex: 1; text-align: center; padding: 14px 8px; border-right: 1px solid #e2e8f0; }' +
    '.summary-item:last-child { border-right: none; }' +
    '.summary-count { font-size: 24px; font-weight: 800; }' +
    '.summary-label { font-size: 9px; font-weight: 700; letter-spacing: 0.8px; color: #64748B; text-transform: uppercase; margin-top: 2px; }' +
    '.owner-bar { display: flex; gap: 8px; padding: 10px 32px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; flex-wrap: wrap; }' +
    '.owner-chip { font-size: 10px; font-weight: 600; padding: 3px 10px; border-radius: 10px; background: #e2e8f0; color: #475569; }' +
    '.column-section { padding: 20px 32px 8px; }' +
    '.column-header { font-size: 14px; font-weight: 800; padding: 10px 16px; border-radius: 8px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; }' +
    '.column-count { font-size: 12px; font-weight: 700; background: rgba(255,255,255,0.9); padding: 2px 10px; border-radius: 10px; }' +
    '.task-card { border-left: 4px solid #94a3b8; padding: 10px 14px; margin-bottom: 8px; border-radius: 6px; background: #fff; border: 1px solid #e2e8f0; }' +
    '.task-title { font-size: 12.5px; font-weight: 700; color: #1e293b; margin-bottom: 3px; }' +
    '.task-desc { font-size: 11px; color: #64748B; line-height: 1.45; }' +
    '.task-meta { display: flex; gap: 8px; margin-top: 6px; flex-wrap: wrap; align-items: center; }' +
    '.meta-tag { font-size: 9.5px; font-weight: 600; padding: 2px 7px; border-radius: 3px; }' +
    '.note-block { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 6px 10px; margin-top: 6px; }' +
    '.note-text { font-size: 10.5px; color: #475569; line-height: 1.4; }' +
    '.note-time { font-size: 9px; color: #a0aec0; margin-top: 2px; }' +
    '.footer { text-align: center; padding: 16px; font-size: 9px; color: #a0aec0; border-top: 1px solid #e2e8f0; margin-top: 12px; }' +
    '</style></head><body>';

  html += '<div class="header"><h1>Vincit Group Task Board</h1>' +
    '<div class="subtitle">QSI Campaign &middot; HubSpot Rollout &middot; March 1 Launch</div>' +
    '<div class="date">Exported ' + dateStr + ' at ' + timeStr + ' &middot; ' + filtered.length + ' task' + (filtered.length !== 1 ? 's' : '') + (totalNotes > 0 ? ' &middot; ' + totalNotes + ' note' + (totalNotes !== 1 ? 's' : '') : '') + '</div>';
  if (activeFilters.length > 0) activeFilters.forEach(f => { html += '<span class="filter-badge">&#128269; ' + f + '</span>'; });
  html += '</div>';

  html += '<div class="summary-bar">';
  COLUMNS.forEach(col => {
    html += '<div class="summary-item" style="background:' + colBg(col.id) + '"><div class="summary-count" style="color:' + colColor(col.id) + '">' + totalByCol[col.id] + '</div><div class="summary-label">' + colLabel(col.id) + '</div></div>';
  });
  html += '</div>';

  if (Object.keys(ownerCounts).length > 0) {
    html += '<div class="owner-bar">';
    Object.entries(ownerCounts).sort((a, b) => b[1] - a[1]).forEach(([owner, count]) => {
      html += '<span class="owner-chip">&#128100; ' + owner + ': ' + count + '</span>';
    });
    html += '</div>';
  }

  COLUMNS.forEach(col => {
    const colTasks = filtered.filter(t => t.col === col.id);
    if (colTasks.length === 0) return;
    html += '<div class="column-section"><div class="column-header" style="background:' + colBg(col.id) + '; color:' + colColor(col.id) + '; border: 1px solid ' + colColor(col.id) + '22;">' + col.title + ' <span class="column-count" style="color:' + colColor(col.id) + '">' + colTasks.length + '</span></div>';
    colTasks.forEach(task => {
      const cat = CATEGORIES.find(c => c.id === task.cat);
      html += '<div class="task-card no-break" style="border-left-color:' + (cat?.color || '#94a3b8') + '"><div class="task-title">' + task.title + '</div><div class="task-desc">' + task.desc + '</div><div class="task-meta">';
      html += '<span class="meta-tag" style="background:' + cat?.color + '18; color:' + cat?.color + '">' + cat?.icon + ' ' + cat?.label + '</span>';
      html += '<span class="meta-tag" style="background:#F1F5F9; color:#475569">&#128100; ' + task.owner + '</span>';
      if (task.due) html += '<span class="meta-tag" style="background:' + (task.col === 'urgent' ? '#FEE2E2' : '#F1F5F9') + '; color:' + (task.col === 'urgent' ? '#DC2626' : '#64748B') + '">&#128197; ' + task.due + '</span>';
      html += '<span class="meta-tag" style="background:#F1F5F9; color:#94a3b8">#' + task.id + '</span></div>';
      if (task.notes.length > 0) {
        task.notes.forEach(note => {
          html += '<div class="note-block"><div class="note-text">&#128221; ' + note.text.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</div><div class="note-time">' + note.time + '</div></div>';
        });
      }
      html += '</div>';
    });
    html += '</div>';
  });

  html += '<div class="footer">Vincit Group Task Board &middot; Confidential &middot; Generated ' + dateStr + '</div></body></html>';

  const printWindow = window.open('', '_blank', 'width=900,height=700');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => { printWindow.print(); }, 500);
  }
}

/* Components */

function NoteItem({ note, onDelete }) {
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "flex-start", padding: "5px 0", borderBottom: "1px solid #f1f5f9" }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11.5, color: "#475569", lineHeight: 1.45, whiteSpace: "pre-wrap" }}>{note.text}</div>
        <div style={{ fontSize: 9.5, color: "#a0aec0", marginTop: 2 }}>{note.time}</div>
      </div>
      <button onClick={(e) => { e.stopPropagation(); onDelete(note.id); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#cbd5e1", fontSize: 14, padding: "0 2px", lineHeight: 1, flexShrink: 0 }}
        onMouseEnter={e => e.currentTarget.style.color = "#ef4444"}
        onMouseLeave={e => e.currentTarget.style.color = "#cbd5e1"}
      >&times;</button>
    </div>
  );
}

function NoteInput({ onAdd }) {
  const [text, setText] = useState("");
  const ref = useRef(null);
  const submit = () => { const t = text.trim(); if (!t) return; onAdd(t); setText(""); ref.current?.focus(); };
  return (
    <div style={{ display: "flex", gap: 4, marginTop: 6 }} onClick={e => e.stopPropagation()}>
      <textarea ref={ref} value={text} onChange={e => setText(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); } }}
        placeholder="Add a note... (Enter to save, Shift+Enter for new line)" rows={1}
        style={{ flex: 1, fontSize: 11, padding: "6px 8px", border: "1px solid #e2e8f0", borderRadius: 6, background: "#f8fafc", color: "#334155", outline: "none", resize: "vertical", minHeight: 30, maxHeight: 100, fontFamily: "inherit", lineHeight: 1.4 }}
        onFocus={e => { e.currentTarget.style.borderColor = "#93c5fd"; e.currentTarget.rows = 2; }}
        onBlur={e => { e.currentTarget.style.borderColor = "#e2e8f0"; if (!text) e.currentTarget.rows = 1; }}
      />
      <button onClick={submit} style={{ background: text.trim() ? "linear-gradient(135deg, #3b82f6, #6366f1)" : "#e2e8f0", color: text.trim() ? "#fff" : "#94a3b8", border: "none", borderRadius: 6, padding: "4px 12px", fontSize: 13, fontWeight: 700, cursor: text.trim() ? "pointer" : "default", transition: "all 0.15s", alignSelf: "flex-end" }}>+</button>
    </div>
  );
}

function TaskCard({ task, categories, expanded, onToggle, onAddNote, onDeleteNote }) {
  const cat = categories.find(c => c.id === task.cat);
  const isUrgent = task.col === "urgent";
  const nc = task.notes.length;
  return (
    <div draggable
      onDragStart={(e) => { DragContext.draggedId = task.id; e.dataTransfer.effectAllowed = "move"; e.target.style.opacity = "0.4"; }}
      onDragEnd={(e) => { e.target.style.opacity = "1"; }}
      onClick={() => onToggle(task.id)}
      style={{ background: "#fff", borderRadius: 10, padding: "11px 13px", marginBottom: 8, cursor: "grab", borderLeft: "4px solid " + (cat?.color || "#94a3b8"), boxShadow: isUrgent ? "0 0 0 1px rgba(220,38,38,0.12), 0 2px 8px rgba(220,38,38,0.07)" : "0 1px 3px rgba(0,0,0,0.06)", transition: "box-shadow 0.15s, transform 0.15s" }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.1)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = isUrgent ? "0 0 0 1px rgba(220,38,38,0.12), 0 2px 8px rgba(220,38,38,0.07)" : "0 1px 3px rgba(0,0,0,0.06)"; e.currentTarget.style.transform = "none"; }}
    >
      <div style={{ display: "flex", gap: 5, marginBottom: 7, flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: 0.4, background: cat?.color + "14", color: cat?.color, padding: "2px 7px", borderRadius: 4 }}>{cat?.icon} {cat?.label}</span>
        {task.due && <span style={{ fontSize: 10, fontWeight: 500, background: isUrgent ? "#FEE2E2" : "#F1F5F9", color: isUrgent ? "#DC2626" : "#64748B", padding: "2px 6px", borderRadius: 4 }}>&#128197; {task.due}</span>}
        {nc > 0 && !expanded && <span style={{ fontSize: 10, fontWeight: 600, background: "#DBEAFE", color: "#2563EB", padding: "2px 6px", borderRadius: 4 }}>&#128221; {nc}</span>}
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", lineHeight: 1.4, marginBottom: expanded ? 0 : 6 }}>{task.title}</div>
      {expanded && (
        <div style={{ marginTop: 8 }}>
          <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.5, paddingBottom: 8, borderBottom: "1px solid #f1f5f9" }}>{task.desc}</div>
          <div style={{ marginTop: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#334155", letterSpacing: 0.4 }}>NOTES</span>
              {nc > 0 && <span style={{ fontSize: 10, fontWeight: 700, color: "#3b82f6", background: "#EFF6FF", borderRadius: 8, padding: "1px 6px" }}>{nc}</span>}
            </div>
            {nc > 0 && (
              <div style={{ background: "#f8fafc", borderRadius: 8, padding: "4px 10px", marginBottom: 6, maxHeight: 180, overflowY: "auto", border: "1px solid #f1f5f9" }}>
                {task.notes.map(n => <NoteItem key={n.id} note={n} onDelete={(nid) => onDeleteNote(task.id, nid)} />)}
              </div>
            )}
            {nc === 0 && <div style={{ fontSize: 11, color: "#a0aec0", fontStyle: "italic", marginBottom: 4 }}>No notes yet. Add one below.</div>}
            <NoteInput onAdd={(text) => onAddNote(task.id, text)} />
          </div>
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: expanded ? 10 : 0 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: "#475569", background: "#F1F5F9", padding: "2px 8px", borderRadius: 10 }}>&#128100; {task.owner}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {!expanded && nc === 0 && <span style={{ fontSize: 10, color: "#d4d4d8" }} title="Click to add notes">&#128221;</span>}
          <span style={{ fontSize: 10, color: "#d4d4d8" }}>#{task.id}</span>
        </div>
      </div>
    </div>
  );
}

function Column({ column, tasks, onDrop, categories, expandedIds, onToggle, onAddNote, onDeleteNote }) {
  const [dragOver, setDragOver] = useState(false);
  return (
    <div
      onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => { e.preventDefault(); setDragOver(false); if (DragContext.draggedId !== null) { onDrop(DragContext.draggedId, column.id); DragContext.draggedId = null; } }}
      style={{ minWidth: 285, maxWidth: 320, flex: "0 0 300px", background: dragOver ? column.color + "0D" : column.bg, borderRadius: 12, border: dragOver ? "2px dashed " + column.color : "1px solid " + column.border, display: "flex", flexDirection: "column", maxHeight: "calc(100vh - 165px)", transition: "background 0.15s, border 0.15s" }}
    >
      <div style={{ padding: "14px 14px 10px", borderBottom: "2px solid " + column.color, display: "flex", justifyContent: "space-between", alignItems: "center", background: column.bg, borderRadius: "12px 12px 0 0" }}>
        <span style={{ fontSize: 13.5, fontWeight: 700, color: column.color, letterSpacing: 0.4 }}>{column.title}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: "#fff", background: column.color, borderRadius: 10, minWidth: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 6px" }}>{tasks.length}</span>
      </div>
      <div style={{ padding: 10, overflowY: "auto", flex: 1, minHeight: 80 }}>
        {tasks.length === 0 && <div style={{ padding: 24, textAlign: "center", color: "#a0aec0", fontSize: 12, fontStyle: "italic", border: "2px dashed #e2e8f0", borderRadius: 8 }}>Drag tasks here</div>}
        {tasks.map(t => <TaskCard key={t.id} task={t} categories={categories} expanded={expandedIds.has(t.id)} onToggle={onToggle} onAddNote={onAddNote} onDeleteNote={onDeleteNote} />)}
      </div>
    </div>
  );
}

export default function VincitBoard() {
  const [tasks, setTasks] = useState(initialTasks);
  const [filterCat, setFilterCat] = useState("all");
  const [filterOwner, setFilterOwner] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedIds, setExpandedIds] = useState(new Set());

  const handleDrop = (taskId, newCol) => { setTasks(prev => prev.map(t => t.id === taskId ? { ...t, col: newCol } : t)); };
  const toggleExpand = (id) => { setExpandedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; }); };
  const handleAddNote = (taskId, text) => {
    const now = new Date();
    const time = now.toLocaleDateString("en-US", { month: "short", day: "numeric" }) + " at " + now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, notes: [...t.notes, { id: Date.now(), text, time }] } : t));
  };
  const handleDeleteNote = (taskId, noteId) => { setTasks(prev => prev.map(t => t.id === taskId ? { ...t, notes: t.notes.filter(n => n.id !== noteId) } : t)); };

  const filtered = tasks.filter(t => {
    if (filterCat !== "all" && t.cat !== filterCat) return false;
    if (filterOwner !== "all" && !t.owner.toLowerCase().includes(filterOwner.toLowerCase())) return false;
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      const inNotes = t.notes.some(n => n.text.toLowerCase().includes(s));
      if (!t.title.toLowerCase().includes(s) && !t.desc.toLowerCase().includes(s) && !inNotes) return false;
    }
    return true;
  });

  const totalByCol = {};
  COLUMNS.forEach(c => { totalByCol[c.id] = tasks.filter(t => t.col === c.id).length; });
  const totalNotes = tasks.reduce((s, t) => s + t.notes.length, 0);

  return (
    <div style={{ fontFamily: "'DM Sans', 'Segoe UI', -apple-system, sans-serif", background: "linear-gradient(145deg, #0f172a 0%, #1a2744 40%, #0f172a 100%)", minHeight: "100vh", color: "#e2e8f0" }}>
      <div style={{ padding: "14px 22px 12px", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(15,23,42,0.85)", backdropFilter: "blur(16px)", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19, fontWeight: 800, color: "#fff", boxShadow: "0 2px 12px rgba(99,102,241,0.3)" }}>V</div>
            <div>
              <h1 style={{ margin: 0, fontSize: 19, fontWeight: 800, letterSpacing: -0.5, color: "#f8fafc" }}>Vincit Group Task Board</h1>
              <p style={{ margin: 0, fontSize: 11, color: "#94a3b8", letterSpacing: 0.3 }}>
                QSI Campaign &bull; HubSpot Rollout &bull; March 1 Launch
                {totalNotes > 0 && <> &bull; <span style={{ color: "#60a5fa" }}>{totalNotes} note{totalNotes !== 1 ? "s" : ""}</span></>}
              </p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
            <button onClick={() => exportToPDF(tasks, filterCat, filterOwner, searchTerm)}
              style={{ background: "linear-gradient(135deg, #ef4444, #dc2626)", border: "none", borderRadius: 8, padding: "7px 14px", color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, boxShadow: "0 2px 8px rgba(239,68,68,0.25)", transition: "all 0.15s", letterSpacing: 0.3 }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 4px 14px rgba(239,68,68,0.35)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(239,68,68,0.25)"; }}
              title="Export current view to PDF (respects active filters)"
            >&#128196; Export PDF</button>
            {COLUMNS.map(col => (
              <div key={col.id} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: "5px 12px", border: "1px solid " + col.color + "30", textAlign: "center", minWidth: 56 }}>
                <div style={{ fontSize: 17, fontWeight: 800, color: col.color }}>{totalByCol[col.id]}</div>
                <div style={{ fontSize: 9, color: "#94a3b8", fontWeight: 600, letterSpacing: 0.5 }}>
                  {col.id === "urgent" ? "URGENT" : col.id === "todo" ? "TO DO" : col.id === "inprogress" ? "ACTIVE" : col.id === "blocked" ? "BLOCKED" : "DONE"}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap", alignItems: "center" }}>
          <input type="text" placeholder="&#128269; Search tasks & notes..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "7px 12px", color: "#e2e8f0", fontSize: 12, outline: "none", width: 190 }} />
          <select value={filterCat} onChange={e => setFilterCat(e.target.value)} style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "7px 10px", color: "#e2e8f0", fontSize: 12, cursor: "pointer" }}>
            <option value="all">All Categories</option>
            {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
          </select>
          <select value={filterOwner} onChange={e => setFilterOwner(e.target.value)} style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "7px 10px", color: "#e2e8f0", fontSize: 12, cursor: "pointer" }}>
            <option value="all">All Owners</option>
            {OWNERS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
          <div style={{ display: "flex", gap: 4 }}>
            {CATEGORIES.map(c => {
              const count = filtered.filter(t => t.cat === c.id).length;
              if (count === 0) return null;
              return (
                <button key={c.id} onClick={() => setFilterCat(filterCat === c.id ? "all" : c.id)}
                  style={{ background: filterCat === c.id ? c.color + "30" : "rgba(255,255,255,0.03)", border: filterCat === c.id ? "1px solid " + c.color + "55" : "1px solid rgba(255,255,255,0.06)", borderRadius: 6, padding: "4px 8px", color: filterCat === c.id ? c.color : "#94a3b8", fontSize: 10, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 3, transition: "all 0.15s" }}>{c.icon} {count}</button>
              );
            })}
          </div>
          {(filterCat !== "all" || filterOwner !== "all" || searchTerm) && (
            <button onClick={() => { setFilterCat("all"); setFilterOwner("all"); setSearchTerm(""); }}
              style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 6, padding: "4px 10px", color: "#f87171", fontSize: 10, fontWeight: 600, cursor: "pointer" }}>&times; Clear</button>
          )}
        </div>
      </div>
      <div style={{ display: "flex", gap: 12, padding: "14px 18px", overflowX: "auto", minHeight: "calc(100vh - 165px)", alignItems: "flex-start" }}>
        {COLUMNS.map(col => (
          <Column key={col.id} column={col} tasks={filtered.filter(t => t.col === col.id)} onDrop={handleDrop} categories={CATEGORIES} expandedIds={expandedIds} onToggle={toggleExpand} onAddNote={handleAddNote} onDeleteNote={handleDeleteNote} />
        ))}
      </div>
    </div>
  );
}
