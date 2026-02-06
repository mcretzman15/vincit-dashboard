"use client";
import { useState, useRef, useEffect, useCallback } from "react";

const COLUMNS = [
  { id: "urgent", title: "\ud83d\udd34 URGENT", color: "#DC2626", bg: "#FEF2F2", border: "#FECACA" },
  { id: "todo", title: "\ud83d\udccb TO DO", color: "#D97706", bg: "#FFFBEB", border: "#FDE68A" },
  { id: "inprogress", title: "\u26a1 IN PROGRESS", color: "#2563EB", bg: "#EFF6FF", border: "#BFDBFE" },
  { id: "blocked", title: "\ud83d\udea7 BLOCKED", color: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE" },
  { id: "done", title: "\u2705 DONE", color: "#059669", bg: "#F0FDF4", border: "#BBF7D0" },
];

const CATEGORIES = [
  { id: "hubspot", label: "HubSpot CRM", color: "#FF5C35", icon: "\ud83d\udd27" },
  { id: "dashboard", label: "Dashboard", color: "#0EA5E9", icon: "\ud83d\udcca" },
  { id: "campaign", label: "QSI Campaign", color: "#8B5CF6", icon: "\ud83c\udfaf" },
  { id: "leadstorm", label: "LeadStorm", color: "#F59E0B", icon: "\u26a1" },
  { id: "linkedin", label: "LinkedIn", color: "#0077B5", icon: "\ud83d\udcbc" },
  { id: "content", label: "Content", color: "#EC4899", icon: "\ud83d\udcdd" },
  { id: "tech", label: "Technical", color: "#6366F1", icon: "\ud83d\udd2c" },
  { id: "internal", label: "Internal", color: "#64748B", icon: "\ud83e\udd1d" },
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

const initialLinks = [
  { id: 1, title: "Vincit Executive Dashboard", url: "https://vincit-dashboard.vercel.app", cat: "dashboard" },
  { id: 2, title: "HubSpot Portal", url: "https://app.hubspot.com", cat: "hubspot" },
  { id: 3, title: "Clay Workspace", url: "https://app.clay.com", cat: "campaign" },
  { id: 4, title: "LeadStorm Platform", url: "https://app.leadstorm.ai", cat: "leadstorm" },
  { id: 5, title: "Vincit Kanban Repo", url: "https://github.com/mcretzman15/vincit-kanban", cat: "tech" },
  { id: 6, title: "Vincit Dashboard Repo", url: "https://github.com/mcretzman15/vincit-dashboard", cat: "tech" },
];

const STORAGE_KEYS = { tasks: "vincit_kanban_tasks", links: "vincit_kanban_links", history: "vincit_kanban_history" };
const COLUMN_NAMES = {}; COLUMNS.forEach(c => { COLUMN_NAMES[c.id] = c.title.replace(/^[^\s]+\s/, ""); });

function formatTimestamp(ts) {
  const d = new Date(ts); const now = new Date(); const diff = now - d;
  if (diff < 60000) return "Just now";
  if (diff < 3600000) return Math.floor(diff / 60000) + "m ago";
  if (diff < 86400000) return Math.floor(diff / 3600000) + "h ago";
  if (diff < 172800000) return "Yesterday";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) + " at " + d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function getActionIcon(a) {
  return { task_moved: "\u2194\ufe0f", task_completed: "\u2705", task_created: "\u2795", note_added: "\ud83d\uddd2", note_deleted: "\ud83d\uddd1", link_added: "\ud83d\udd17", link_deleted: "\u274c", task_reopened: "\ud83d\udd04", board_reset: "\ud83d\uddd8" }[a] || "\ud83d\udccc";
}
function getActionColor(a) {
  return { task_moved: "#3b82f6", task_completed: "#059669", task_created: "#8b5cf6", note_added: "#0ea5e9", note_deleted: "#94a3b8", link_added: "#f59e0b", link_deleted: "#ef4444", task_reopened: "#d97706", board_reset: "#64748b" }[a] || "#64748b";
}

const DragContext = { draggedId: null };

function Overlay({ children, onClose }) {
  return (<div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20 }}>
    <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 520 }}>{children}</div>
  </div>);
}

function AddTaskModal({ onClose, onAdd, categories, owners }) {
  const [title, setTitle] = useState(""); const [desc, setDesc] = useState(""); const [cat, setCat] = useState("hubspot");
  const [owner, setOwner] = useState("Matt"); const [col, setCol] = useState("todo"); const [due, setDue] = useState("");
  const titleRef = useRef(null); useEffect(() => { titleRef.current?.focus(); }, []);
  const submit = () => { if (!title.trim()) return; onAdd({ title: title.trim(), desc: desc.trim(), cat, owner, col, due: due.trim() || null }); onClose(); };
  const inputStyle = { width: "100%", boxSizing: "border-box", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "9px 12px", fontSize: 13, color: "#1e293b", outline: "none", fontFamily: "inherit" };
  const labelStyle = { fontSize: 11, fontWeight: 700, color: "#64748b", letterSpacing: 0.5, marginBottom: 4, display: "block" };
  const selectStyle = { ...inputStyle, cursor: "pointer", appearance: "none", backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%2394a3b8' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10z'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center", paddingRight: 28 };
  return (
    <Overlay onClose={onClose}>
      <div style={{ background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 25px 50px rgba(0,0,0,0.25)" }}>
        <div style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", padding: "18px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 16, fontWeight: 800, color: "#fff", letterSpacing: -0.3 }}>{"\u2795"} New Task</span>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 8, width: 32, height: 32, color: "#fff", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>{"\u00d7"}</button>
        </div>
        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
          <div><label style={labelStyle}>TASK TITLE *</label><input ref={titleRef} value={title} onChange={e => setTitle(e.target.value)} placeholder="What needs to get done?" style={inputStyle} onKeyDown={e => { if (e.key === "Enter") submit(); }} onFocus={e => e.target.style.borderColor = "#93c5fd"} onBlur={e => e.target.style.borderColor = "#e2e8f0"} /></div>
          <div><label style={labelStyle}>DESCRIPTION</label><textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Details, context, links..." rows={3} style={{ ...inputStyle, resize: "vertical", minHeight: 60, maxHeight: 160, lineHeight: 1.5 }} onFocus={e => e.target.style.borderColor = "#93c5fd"} onBlur={e => e.target.style.borderColor = "#e2e8f0"} /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div><label style={labelStyle}>CATEGORY</label><select value={cat} onChange={e => setCat(e.target.value)} style={selectStyle}>{categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}</select></div>
            <div><label style={labelStyle}>OWNER</label><select value={owner} onChange={e => setOwner(e.target.value)} style={selectStyle}>{owners.map(o => <option key={o} value={o}>{o}</option>)}</select></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div><label style={labelStyle}>COLUMN</label><select value={col} onChange={e => setCol(e.target.value)} style={selectStyle}>{COLUMNS.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}</select></div>
            <div><label style={labelStyle}>DUE</label><input value={due} onChange={e => setDue(e.target.value)} placeholder="e.g. This week, ASAP" style={inputStyle} onFocus={e => e.target.style.borderColor = "#93c5fd"} onBlur={e => e.target.style.borderColor = "#e2e8f0"} /></div>
          </div>
        </div>
        <div style={{ padding: "14px 24px 20px", display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button onClick={onClose} style={{ padding: "9px 20px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
          <button onClick={submit} disabled={!title.trim()} style={{ padding: "9px 24px", borderRadius: 8, border: "none", background: title.trim() ? "linear-gradient(135deg, #3b82f6, #8b5cf6)" : "#e2e8f0", color: title.trim() ? "#fff" : "#94a3b8", fontSize: 13, fontWeight: 700, cursor: title.trim() ? "pointer" : "default", boxShadow: title.trim() ? "0 2px 8px rgba(99,102,241,0.3)" : "none", transition: "all 0.15s" }}>Create Task</button>
        </div>
      </div>
    </Overlay>
  );
}

function LinksPanel({ links, onAdd, onDelete, categories, onClose }) {
  const [adding, setAdding] = useState(false); const [title, setTitle] = useState(""); const [url, setUrl] = useState(""); const [cat, setCat] = useState("tech");
  const titleRef = useRef(null); useEffect(() => { if (adding) titleRef.current?.focus(); }, [adding]);
  const submit = () => { if (!title.trim() || !url.trim()) return; let finalUrl = url.trim(); if (!/^https?:\/\//i.test(finalUrl)) finalUrl = "https://" + finalUrl; onAdd({ title: title.trim(), url: finalUrl, cat }); setTitle(""); setUrl(""); setCat("tech"); setAdding(false); };
  const inputStyle = { width: "100%", boxSizing: "border-box", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "8px 12px", fontSize: 12, color: "#1e293b", outline: "none", fontFamily: "inherit" };
  const selectStyle = { ...inputStyle, cursor: "pointer", appearance: "none", backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%2394a3b8' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10z'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center", paddingRight: 28 };
  return (
    <Overlay onClose={onClose}>
      <div style={{ background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 25px 50px rgba(0,0,0,0.25)", maxHeight: "80vh", display: "flex", flexDirection: "column" }}>
        <div style={{ background: "linear-gradient(135deg, #f59e0b, #ef4444)", padding: "18px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <span style={{ fontSize: 16, fontWeight: 800, color: "#fff", letterSpacing: -0.3 }}>{"\ud83d\udd17"} Important Links</span>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 8, width: 32, height: 32, color: "#fff", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>{"\u00d7"}</button>
        </div>
        <div style={{ padding: "16px 24px", overflowY: "auto", flex: 1 }}>
          {links.length === 0 && <div style={{ textAlign: "center", color: "#94a3b8", fontSize: 13, padding: 20, fontStyle: "italic" }}>No links saved yet.</div>}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {links.map(link => { const c = categories.find(x => x.id === link.cat); return (
              <div key={link.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "#f8fafc", borderRadius: 10, border: "1px solid #f1f5f9", transition: "all 0.15s" }} onMouseEnter={e => { e.currentTarget.style.background = "#eef2ff"; e.currentTarget.style.borderColor = "#c7d2fe"; }} onMouseLeave={e => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.borderColor = "#f1f5f9"; }}>
                <span style={{ fontSize: 20, flexShrink: 0 }}>{c?.icon || "\ud83d\udd17"}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <a href={link.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", textDecoration: "none", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} onMouseEnter={e => e.target.style.color = "#3b82f6"} onMouseLeave={e => e.target.style.color = "#1e293b"}>{link.title}</a>
                  <div style={{ fontSize: 10, color: "#94a3b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: 1 }}>{link.url}</div>
                </div>
                <span style={{ fontSize: 9, fontWeight: 600, color: c?.color || "#64748b", background: (c?.color || "#64748b") + "14", padding: "3px 7px", borderRadius: 4, flexShrink: 0, letterSpacing: 0.3 }}>{c?.label || "Other"}</span>
                <button onClick={() => onDelete(link.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#d4d4d8", fontSize: 16, padding: "2px 4px", flexShrink: 0, lineHeight: 1 }} onMouseEnter={e => e.target.style.color = "#ef4444"} onMouseLeave={e => e.target.style.color = "#d4d4d8"}>{"\u00d7"}</button>
              </div>
            ); })}
          </div>
          {!adding ? (
            <button onClick={() => setAdding(true)} style={{ width: "100%", marginTop: 12, padding: "10px 0", borderRadius: 10, border: "2px dashed #d4d4d8", background: "transparent", color: "#94a3b8", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.15s" }} onMouseEnter={e => { e.target.style.borderColor = "#93c5fd"; e.target.style.color = "#3b82f6"; e.target.style.background = "#eff6ff"; }} onMouseLeave={e => { e.target.style.borderColor = "#d4d4d8"; e.target.style.color = "#94a3b8"; e.target.style.background = "transparent"; }}>+ Add Link</button>
          ) : (
            <div style={{ marginTop: 12, padding: 16, background: "#fafbff", border: "1px solid #e2e8f0", borderRadius: 12, display: "flex", flexDirection: "column", gap: 10 }}>
              <input ref={titleRef} value={title} onChange={e => setTitle(e.target.value)} placeholder="Link title" style={inputStyle} onKeyDown={e => { if (e.key === "Enter") submit(); if (e.key === "Escape") setAdding(false); }} />
              <input value={url} onChange={e => setUrl(e.target.value)} placeholder="URL" style={inputStyle} onKeyDown={e => { if (e.key === "Enter") submit(); if (e.key === "Escape") setAdding(false); }} />
              <select value={cat} onChange={e => setCat(e.target.value)} style={selectStyle}>{categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}</select>
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button onClick={() => { setAdding(false); setTitle(""); setUrl(""); }} style={{ padding: "7px 16px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
                <button onClick={submit} disabled={!title.trim() || !url.trim()} style={{ padding: "7px 18px", borderRadius: 8, border: "none", background: (title.trim() && url.trim()) ? "linear-gradient(135deg, #f59e0b, #ef4444)" : "#e2e8f0", color: (title.trim() && url.trim()) ? "#fff" : "#94a3b8", fontSize: 12, fontWeight: 700, cursor: (title.trim() && url.trim()) ? "pointer" : "default" }}>Save Link</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Overlay>
  );
}

function HistoryPanel({ history, onClose, onClear }) {
  const [filter, setFilter] = useState("all");
  const actionTypes = [{ id: "all", label: "All Activity" }, { id: "task_moved", label: "Moves" }, { id: "task_completed", label: "Completed" }, { id: "task_created", label: "Created" }, { id: "note_added", label: "Notes" }, { id: "link_added", label: "Links" }];
  const filtered = filter === "all" ? history : history.filter(h => h.action === filter || (filter === "link_added" && h.action === "link_deleted") || (filter === "note_added" && h.action === "note_deleted"));

  return (
    <Overlay onClose={onClose}>
      <div style={{ background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 25px 50px rgba(0,0,0,0.25)", maxHeight: "85vh", display: "flex", flexDirection: "column", maxWidth: 560 }}>
        <div style={{ background: "linear-gradient(135deg, #059669, #0ea5e9)", padding: "18px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <div>
            <span style={{ fontSize: 16, fontWeight: 800, color: "#fff", letterSpacing: -0.3 }}>{"\ud83d\udcdc"} Activity History</span>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.75)", marginTop: 2 }}>{history.length} total actions {"\u2022"} All changes auto-saved</div>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 8, width: 32, height: 32, color: "#fff", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>{"\u00d7"}</button>
        </div>
        <div style={{ padding: "10px 24px", background: "#f0fdf4", borderBottom: "1px solid #bbf7d0", display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#059669", display: "inline-block" }}></span>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#059669" }}>All changes saved to this browser</span>
          <span style={{ fontSize: 10, color: "#64748b", marginLeft: "auto" }}>Data persists across sessions</span>
        </div>
        <div style={{ padding: "10px 24px 0", display: "flex", gap: 4, flexWrap: "wrap", flexShrink: 0 }}>
          {actionTypes.map(at => (<button key={at.id} onClick={() => setFilter(at.id)} style={{ padding: "5px 12px", borderRadius: 6, border: "none", fontSize: 11, fontWeight: 600, cursor: "pointer", background: filter === at.id ? "#0ea5e920" : "#f1f5f9", color: filter === at.id ? "#0ea5e9" : "#64748b", transition: "all 0.15s" }}>{at.label}</button>))}
        </div>
        <div style={{ padding: "12px 24px 16px", overflowY: "auto", flex: 1 }}>
          {filtered.length === 0 && (<div style={{ textAlign: "center", padding: "40px 20px" }}><div style={{ fontSize: 40, marginBottom: 10 }}>{"\ud83d\udcdc"}</div><div style={{ fontSize: 14, fontWeight: 600, color: "#475569" }}>No activity yet</div><div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>Move tasks, add notes, and complete items to see history here.</div></div>)}
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {filtered.map((entry, i) => {
              const prevEntry = filtered[i + 1];
              const showDateDivider = prevEntry && new Date(entry.ts).toDateString() !== new Date(prevEntry.ts).toDateString();
              return (
                <div key={entry.id}>
                  <div style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "9px 12px", borderRadius: 8, transition: "background 0.1s" }} onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <span style={{ width: 30, height: 30, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, background: getActionColor(entry.action) + "12", flexShrink: 0, marginTop: 1 }}>{getActionIcon(entry.action)}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, color: "#1e293b", lineHeight: 1.45 }}>
                        <span style={{ fontWeight: 700 }}>{entry.taskTitle || entry.detail}</span>
                        {entry.action === "task_moved" && entry.from && entry.to && <span style={{ fontWeight: 400, color: "#64748b" }}> moved from <span style={{ fontWeight: 600, color: "#3b82f6" }}>{entry.from}</span> to <span style={{ fontWeight: 600, color: "#3b82f6" }}>{entry.to}</span></span>}
                        {entry.action === "task_completed" && <span style={{ fontWeight: 400, color: "#059669" }}> marked complete {"\u2705"}</span>}
                        {entry.action === "task_reopened" && <span style={{ fontWeight: 400, color: "#d97706" }}> reopened from Done</span>}
                        {entry.action === "task_created" && <span style={{ fontWeight: 400, color: "#64748b" }}> created in <span style={{ fontWeight: 600 }}>{entry.to || "TO DO"}</span></span>}
                        {entry.action === "note_added" && <span style={{ fontWeight: 400, color: "#64748b" }}> — note added</span>}
                        {entry.action === "note_deleted" && <span style={{ fontWeight: 400, color: "#64748b" }}> — note removed</span>}
                        {entry.action === "link_added" && <span style={{ fontWeight: 400, color: "#64748b" }}> — link saved</span>}
                        {entry.action === "link_deleted" && <span style={{ fontWeight: 400, color: "#64748b" }}> — link removed</span>}
                      </div>
                      {entry.notePreview && <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2, fontStyle: "italic", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>"{entry.notePreview}"</div>}
                      <div style={{ fontSize: 10, color: "#cbd5e1", marginTop: 3 }}>{formatTimestamp(entry.ts)}</div>
                    </div>
                  </div>
                  {showDateDivider && (<div style={{ padding: "8px 12px 4px", display: "flex", alignItems: "center", gap: 8, margin: "4px 0" }}><div style={{ flex: 1, height: 1, background: "#e2e8f0" }} /><span style={{ fontSize: 10, fontWeight: 600, color: "#94a3b8", letterSpacing: 0.5 }}>{new Date(prevEntry.ts).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</span><div style={{ flex: 1, height: 1, background: "#e2e8f0" }} /></div>)}
                </div>
              );
            })}
          </div>
        </div>
        {history.length > 0 && (
          <div style={{ padding: "12px 24px", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
            <span style={{ fontSize: 11, color: "#94a3b8" }}>Showing {filtered.length} of {history.length} entries</span>
            <button onClick={onClear} style={{ padding: "6px 14px", borderRadius: 6, border: "1px solid #fecaca", background: "#fff", color: "#ef4444", fontSize: 11, fontWeight: 600, cursor: "pointer", transition: "all 0.15s" }} onMouseEnter={e => { e.target.style.background = "#fef2f2"; }} onMouseLeave={e => { e.target.style.background = "#fff"; }}>Clear History</button>
          </div>
        )}
      </div>
    </Overlay>
  );
}

function NoteItem({ note, onDelete }) {
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "flex-start", padding: "5px 0", borderBottom: "1px solid #f1f5f9" }}>
      <div style={{ flex: 1 }}><div style={{ fontSize: 11.5, color: "#475569", lineHeight: 1.45, whiteSpace: "pre-wrap" }}>{note.text}</div><div style={{ fontSize: 9.5, color: "#a0aec0", marginTop: 2 }}>{note.time}</div></div>
      <button onClick={(e) => { e.stopPropagation(); onDelete(note.id); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#cbd5e1", fontSize: 14, padding: "0 2px", lineHeight: 1, flexShrink: 0 }} onMouseEnter={e => e.currentTarget.style.color = "#ef4444"} onMouseLeave={e => e.currentTarget.style.color = "#cbd5e1"}>{"\u00d7"}</button>
    </div>
  );
}

function NoteInput({ onAdd }) {
  const [text, setText] = useState(""); const ref = useRef(null);
  const submit = () => { const t = text.trim(); if (!t) return; onAdd(t); setText(""); ref.current?.focus(); };
  return (
    <div style={{ display: "flex", gap: 4, marginTop: 6 }} onClick={e => e.stopPropagation()}>
      <textarea ref={ref} value={text} onChange={e => setText(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); } }} placeholder="Add a note... (Enter to save)" rows={1} style={{ flex: 1, fontSize: 11, padding: "6px 8px", border: "1px solid #e2e8f0", borderRadius: 6, background: "#f8fafc", color: "#334155", outline: "none", resize: "vertical", minHeight: 30, maxHeight: 100, fontFamily: "inherit", lineHeight: 1.4 }} onFocus={e => { e.currentTarget.style.borderColor = "#93c5fd"; e.currentTarget.rows = 2; }} onBlur={e => { e.currentTarget.style.borderColor = "#e2e8f0"; if (!text) e.currentTarget.rows = 1; }} />
      <button onClick={submit} style={{ background: text.trim() ? "linear-gradient(135deg, #3b82f6, #6366f1)" : "#e2e8f0", color: text.trim() ? "#fff" : "#94a3b8", border: "none", borderRadius: 6, padding: "4px 12px", fontSize: 13, fontWeight: 700, cursor: text.trim() ? "pointer" : "default", transition: "all 0.15s", alignSelf: "flex-end" }}>+</button>
    </div>
  );
}

function TaskCard({ task, categories, expanded, onToggle, onAddNote, onDeleteNote }) {
  const cat = categories.find(c => c.id === task.cat); const isUrgent = task.col === "urgent"; const nc = task.notes.length;
  return (
    <div draggable onDragStart={(e) => { DragContext.draggedId = task.id; e.dataTransfer.effectAllowed = "move"; e.target.style.opacity = "0.4"; }} onDragEnd={(e) => { e.target.style.opacity = "1"; }} onClick={() => onToggle(task.id)} style={{ background: "#fff", borderRadius: 10, padding: "11px 13px", marginBottom: 8, cursor: "grab", borderLeft: "4px solid " + (cat?.color || "#94a3b8"), boxShadow: isUrgent ? "0 0 0 1px rgba(220,38,38,0.12), 0 2px 8px rgba(220,38,38,0.07)" : "0 1px 3px rgba(0,0,0,0.06)", transition: "box-shadow 0.15s, transform 0.15s" }} onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.1)"; e.currentTarget.style.transform = "translateY(-1px)"; }} onMouseLeave={e => { e.currentTarget.style.boxShadow = isUrgent ? "0 0 0 1px rgba(220,38,38,0.12), 0 2px 8px rgba(220,38,38,0.07)" : "0 1px 3px rgba(0,0,0,0.06)"; e.currentTarget.style.transform = "none"; }}>
      <div style={{ display: "flex", gap: 5, marginBottom: 7, flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: 0.4, background: cat?.color + "14", color: cat?.color, padding: "2px 7px", borderRadius: 4 }}>{cat?.icon} {cat?.label}</span>
        {task.due && <span style={{ fontSize: 10, fontWeight: 500, background: isUrgent ? "#FEE2E2" : "#F1F5F9", color: isUrgent ? "#DC2626" : "#64748B", padding: "2px 6px", borderRadius: 4 }}>{"\ud83d\udcc5"} {task.due}</span>}
        {nc > 0 && !expanded && <span style={{ fontSize: 10, fontWeight: 600, background: "#DBEAFE", color: "#2563EB", padding: "2px 6px", borderRadius: 4 }}>{"\ud83d\uddd2"} {nc}</span>}
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", lineHeight: 1.4, marginBottom: expanded ? 0 : 6 }}>{task.title}</div>
      {expanded && (
        <div style={{ marginTop: 8 }}>
          <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.5, paddingBottom: 8, borderBottom: "1px solid #f1f5f9" }}>{task.desc}</div>
          <div style={{ marginTop: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}><span style={{ fontSize: 11, fontWeight: 700, color: "#334155", letterSpacing: 0.4 }}>NOTES</span>{nc > 0 && <span style={{ fontSize: 10, fontWeight: 700, color: "#3b82f6", background: "#EFF6FF", borderRadius: 8, padding: "1px 6px" }}>{nc}</span>}</div>
            {nc > 0 && (<div style={{ background: "#f8fafc", borderRadius: 8, padding: "4px 10px", marginBottom: 6, maxHeight: 180, overflowY: "auto", border: "1px solid #f1f5f9" }}>{task.notes.map(n => <NoteItem key={n.id} note={n} onDelete={(nid) => onDeleteNote(task.id, nid)} />)}</div>)}
            {nc === 0 && <div style={{ fontSize: 11, color: "#a0aec0", fontStyle: "italic", marginBottom: 4 }}>No notes yet. Add one below.</div>}
            <NoteInput onAdd={(text) => onAddNote(task.id, text)} />
          </div>
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: expanded ? 10 : 0 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: "#475569", background: "#F1F5F9", padding: "2px 8px", borderRadius: 10 }}>{"\ud83d\udc64"} {task.owner}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>{!expanded && nc === 0 && <span style={{ fontSize: 10, color: "#d4d4d8" }} title="Click to add notes">{"\ud83d\uddd2"}</span>}<span style={{ fontSize: 10, color: "#d4d4d8" }}>#{task.id}</span></div>
      </div>
    </div>
  );
}

function Column({ column, tasks, onDrop, categories, expandedIds, onToggle, onAddNote, onDeleteNote }) {
  const [dragOver, setDragOver] = useState(false);
  return (
    <div onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={(e) => { e.preventDefault(); setDragOver(false); if (DragContext.draggedId !== null) { onDrop(DragContext.draggedId, column.id); DragContext.draggedId = null; } }} style={{ minWidth: 285, maxWidth: 320, flex: "0 0 300px", background: dragOver ? column.color + "0D" : column.bg, borderRadius: 12, border: dragOver ? "2px dashed " + column.color : "1px solid " + column.border, display: "flex", flexDirection: "column", maxHeight: "calc(100vh - 165px)", transition: "background 0.15s, border 0.15s" }}>
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
  const [links, setLinks] = useState(initialLinks);
  const [history, setHistory] = useState([]);
  const [filterCat, setFilterCat] = useState("all");
  const [filterOwner, setFilterOwner] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [showAddTask, setShowAddTask] = useState(false);
  const [showLinks, setShowLinks] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [saveFlash, setSaveFlash] = useState(false);

  useEffect(() => {
    try {
      const st = localStorage.getItem(STORAGE_KEYS.tasks); if (st) { const p = JSON.parse(st); if (Array.isArray(p) && p.length > 0) setTasks(p); }
      const sl = localStorage.getItem(STORAGE_KEYS.links); if (sl) { const p = JSON.parse(sl); if (Array.isArray(p)) setLinks(p); }
      const sh = localStorage.getItem(STORAGE_KEYS.history); if (sh) { const p = JSON.parse(sh); if (Array.isArray(p)) setHistory(p); }
    } catch (e) { console.warn("Failed to load from localStorage:", e); }
    setHydrated(true);
  }, []);

  useEffect(() => { if (!hydrated) return; try { localStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify(tasks)); } catch (e) {} }, [tasks, hydrated]);
  useEffect(() => { if (!hydrated) return; try { localStorage.setItem(STORAGE_KEYS.links, JSON.stringify(links)); } catch (e) {} }, [links, hydrated]);
  useEffect(() => { if (!hydrated) return; try { localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(history)); } catch (e) {} }, [history, hydrated]);

  const flashSave = useCallback(() => { setSaveFlash(true); setTimeout(() => setSaveFlash(false), 1200); }, []);
  const addHistory = useCallback((entry) => { setHistory(prev => [{ id: Date.now() + Math.random(), ts: Date.now(), ...entry }, ...prev].slice(0, 500)); flashSave(); }, [flashSave]);

  const handleDrop = (taskId, newCol) => {
    setTasks(prev => {
      const task = prev.find(t => t.id === taskId); if (!task || task.col === newCol) return prev;
      const fromName = COLUMN_NAMES[task.col] || task.col; const toName = COLUMN_NAMES[newCol] || newCol;
      if (newCol === "done" && task.col !== "done") addHistory({ action: "task_completed", taskTitle: task.title, from: fromName, to: toName });
      else if (task.col === "done" && newCol !== "done") addHistory({ action: "task_reopened", taskTitle: task.title, from: fromName, to: toName });
      else addHistory({ action: "task_moved", taskTitle: task.title, from: fromName, to: toName });
      return prev.map(t => t.id === taskId ? { ...t, col: newCol } : t);
    });
  };
  const toggleExpand = (id) => setExpandedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const handleAddNote = (taskId, text) => {
    const now = new Date(); const time = now.toLocaleDateString("en-US", { month: "short", day: "numeric" }) + " at " + now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    setTasks(prev => { const task = prev.find(t => t.id === taskId); if (task) addHistory({ action: "note_added", taskTitle: task.title, notePreview: text.substring(0, 80) }); return prev.map(t => t.id === taskId ? { ...t, notes: [...t.notes, { id: Date.now(), text, time }] } : t); });
  };
  const handleDeleteNote = (taskId, noteId) => { setTasks(prev => { const task = prev.find(t => t.id === taskId); if (task) addHistory({ action: "note_deleted", taskTitle: task.title }); return prev.map(t => t.id === taskId ? { ...t, notes: t.notes.filter(n => n.id !== noteId) } : t); }); };
  const handleAddTask = ({ title, desc, cat, owner, col, due }) => { const maxId = tasks.reduce((max, t) => Math.max(max, t.id), 0); addHistory({ action: "task_created", taskTitle: title, to: COLUMN_NAMES[col] || col }); setTasks(prev => [...prev, { id: maxId + 1, title, desc: desc || "", col, cat, owner, due, notes: [] }]); };
  const handleAddLink = ({ title, url, cat }) => { const maxId = links.reduce((max, l) => Math.max(max, l.id), 0); addHistory({ action: "link_added", taskTitle: title, detail: url }); setLinks(prev => [...prev, { id: maxId + 1, title, url, cat }]); };
  const handleDeleteLink = (id) => { const link = links.find(l => l.id === id); if (link) addHistory({ action: "link_deleted", taskTitle: link.title }); setLinks(prev => prev.filter(l => l.id !== id)); };
  const handleClearHistory = () => { setHistory([]); };

  const filtered = tasks.filter(t => {
    if (filterCat !== "all" && t.cat !== filterCat) return false;
    if (filterOwner !== "all" && !t.owner.toLowerCase().includes(filterOwner.toLowerCase())) return false;
    if (searchTerm) { const s = searchTerm.toLowerCase(); const inNotes = t.notes.some(n => n.text.toLowerCase().includes(s)); if (!t.title.toLowerCase().includes(s) && !t.desc.toLowerCase().includes(s) && !inNotes) return false; }
    return true;
  });
  const totalByCol = {}; COLUMNS.forEach(c => { totalByCol[c.id] = tasks.filter(t => t.col === c.id).length; });
  const totalNotes = tasks.reduce((s, t) => s + t.notes.length, 0);
  const completedCount = tasks.filter(t => t.col === "done").length;

  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.tagName === "SELECT") return;
      if (e.key === "n" || e.key === "N") { e.preventDefault(); setShowAddTask(true); }
      if (e.key === "l" || e.key === "L") { e.preventDefault(); setShowLinks(true); }
      if (e.key === "h" || e.key === "H") { e.preventDefault(); setShowHistory(true); }
    };
    window.addEventListener("keydown", handler); return () => window.removeEventListener("keydown", handler);
  }, []);

  const actionBtnStyle = (bg, shadow) => ({ padding: "8px 16px", borderRadius: 10, border: "none", background: bg, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", boxShadow: shadow, display: "flex", alignItems: "center", gap: 6, transition: "all 0.15s", letterSpacing: 0.2 });

  return (
    <div style={{ fontFamily: "'DM Sans', 'Segoe UI', -apple-system, sans-serif", background: "linear-gradient(145deg, #0f172a 0%, #1a2744 40%, #0f172a 100%)", minHeight: "100vh", color: "#e2e8f0" }}>
      {showAddTask && <AddTaskModal onClose={() => setShowAddTask(false)} onAdd={handleAddTask} categories={CATEGORIES} owners={OWNERS} />}
      {showLinks && <LinksPanel links={links} onAdd={handleAddLink} onDelete={handleDeleteLink} categories={CATEGORIES} onClose={() => setShowLinks(false)} />}
      {showHistory && <HistoryPanel history={history} onClose={() => setShowHistory(false)} onClear={handleClearHistory} />}

      <div style={{ padding: "14px 22px 12px", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(15,23,42,0.85)", backdropFilter: "blur(16px)", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19, fontWeight: 800, color: "#fff", boxShadow: "0 2px 12px rgba(99,102,241,0.3)" }}>V</div>
            <div>
              <h1 style={{ margin: 0, fontSize: 19, fontWeight: 800, letterSpacing: -0.5, color: "#f8fafc" }}>Vincit Group Task Board</h1>
              <p style={{ margin: 0, fontSize: 11, color: "#94a3b8", letterSpacing: 0.3, display: "flex", alignItems: "center", gap: 4 }}>
                QSI Campaign {"\u2022"} HubSpot Rollout {"\u2022"} March 1 Launch
                {totalNotes > 0 && <> {"\u2022"} <span style={{ color: "#60a5fa" }}>{totalNotes} note{totalNotes !== 1 ? "s" : ""}</span></>}
                {completedCount > 0 && <> {"\u2022"} <span style={{ color: "#34d399" }}>{completedCount} done</span></>}
                <span style={{ marginLeft: 6, fontSize: 10, fontWeight: 600, padding: "1px 8px", borderRadius: 4, background: saveFlash ? "#05966920" : "transparent", color: saveFlash ? "#059669" : "transparent", transition: "all 0.3s" }}>{saveFlash ? "\u2713 Saved" : ""}</span>
              </p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <button onClick={() => setShowAddTask(true)} style={actionBtnStyle("linear-gradient(135deg, #3b82f6, #8b5cf6)", "0 2px 12px rgba(99,102,241,0.35)")} onMouseEnter={e => e.currentTarget.style.transform = "translateY(-1px)"} onMouseLeave={e => e.currentTarget.style.transform = "none"} title="Shortcut: N">{"\u2795"} <span>New Task</span></button>
            <button onClick={() => setShowLinks(true)} style={actionBtnStyle("linear-gradient(135deg, #f59e0b, #ef4444)", "0 2px 12px rgba(245,158,11,0.35)")} onMouseEnter={e => e.currentTarget.style.transform = "translateY(-1px)"} onMouseLeave={e => e.currentTarget.style.transform = "none"} title="Shortcut: L">{"\ud83d\udd17"} <span>Links</span> <span style={{ background: "rgba(255,255,255,0.25)", borderRadius: 6, padding: "1px 6px", fontSize: 10, fontWeight: 800 }}>{links.length}</span></button>
            <button onClick={() => setShowHistory(true)} style={actionBtnStyle("linear-gradient(135deg, #059669, #0ea5e9)", "0 2px 12px rgba(5,150,105,0.35)")} onMouseEnter={e => e.currentTarget.style.transform = "translateY(-1px)"} onMouseLeave={e => e.currentTarget.style.transform = "none"} title="Shortcut: H">{"\ud83d\udcdc"} <span>History</span> {history.length > 0 && <span style={{ background: "rgba(255,255,255,0.25)", borderRadius: 6, padding: "1px 6px", fontSize: 10, fontWeight: 800 }}>{history.length}</span>}</button>
            <div style={{ display: "flex", gap: 6 }}>
              {COLUMNS.map(col => (<div key={col.id} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: "5px 12px", border: "1px solid " + col.color + "30", textAlign: "center", minWidth: 56 }}><div style={{ fontSize: 17, fontWeight: 800, color: col.color }}>{totalByCol[col.id]}</div><div style={{ fontSize: 9, color: "#94a3b8", fontWeight: 600, letterSpacing: 0.5 }}>{col.id === "urgent" ? "URGENT" : col.id === "todo" ? "TO DO" : col.id === "inprogress" ? "ACTIVE" : col.id === "blocked" ? "BLOCKED" : "DONE"}</div></div>))}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap", alignItems: "center" }}>
          <input type="text" placeholder={"\ud83d\udd0d Search tasks & notes..."} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "7px 12px", color: "#e2e8f0", fontSize: 12, outline: "none", width: 190 }} />
          <select value={filterCat} onChange={e => setFilterCat(e.target.value)} style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "7px 10px", color: "#e2e8f0", fontSize: 12, cursor: "pointer" }}><option value="all">All Categories</option>{CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}</select>
          <select value={filterOwner} onChange={e => setFilterOwner(e.target.value)} style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "7px 10px", color: "#e2e8f0", fontSize: 12, cursor: "pointer" }}><option value="all">All Owners</option>{OWNERS.map(o => <option key={o} value={o}>{o}</option>)}</select>
          <div style={{ display: "flex", gap: 4 }}>
            {CATEGORIES.map(c => { const count = filtered.filter(t => t.cat === c.id).length; if (count === 0) return null; return <button key={c.id} onClick={() => setFilterCat(filterCat === c.id ? "all" : c.id)} style={{ background: filterCat === c.id ? c.color + "30" : "rgba(255,255,255,0.03)", border: filterCat === c.id ? "1px solid " + c.color + "55" : "1px solid rgba(255,255,255,0.06)", borderRadius: 6, padding: "4px 8px", color: filterCat === c.id ? c.color : "#94a3b8", fontSize: 10, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 3, transition: "all 0.15s" }}>{c.icon} {count}</button>; })}
          </div>
          {(filterCat !== "all" || filterOwner !== "all" || searchTerm) && (<button onClick={() => { setFilterCat("all"); setFilterOwner("all"); setSearchTerm(""); }} style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 6, padding: "4px 10px", color: "#f87171", fontSize: 10, fontWeight: 600, cursor: "pointer" }}>{"\u2715"} Clear</button>)}
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, padding: "14px 18px", overflowX: "auto", minHeight: "calc(100vh - 165px)", alignItems: "flex-start" }}>
        {COLUMNS.map(col => (<Column key={col.id} column={col} tasks={filtered.filter(t => t.col === col.id)} onDrop={handleDrop} categories={CATEGORIES} expandedIds={expandedIds} onToggle={toggleExpand} onAddNote={handleAddNote} onDeleteNote={handleDeleteNote} />))}
      </div>
    </div>
  );
}
