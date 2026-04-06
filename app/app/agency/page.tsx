"use client";

import { useState, useEffect } from "react";

interface ProductionEntry {
  month: string; // "YYYY-MM"
  amount: string;
}

interface Agent {
  id: string;
  name: string;
  phone: string;
  email: string;
  comp: string;
  compChangedAt: string;
  notes: string;
  status: "active" | "inactive";
  managerId: string; // "" = top-level agent
  productionHistory: ProductionEntry[];
}

interface Recruit {
  id: string;
  name: string;
  phone: string;
  email: string;
  stage: "contacted" | "interested" | "contracting" | "licensed" | "onboarded";
  notes: string;
}

const AGENTS_KEY = "hub_agents";
const RECRUITS_KEY = "hub_recruits";

const STAGES: Recruit["stage"][] = ["contacted", "interested", "contracting", "licensed", "onboarded"];
const STAGE_COLORS: Record<Recruit["stage"], string> = {
  contacted:   "bg-gray-100 text-gray-600",
  interested:  "bg-yellow-100 text-yellow-700",
  contracting: "bg-blue-100 text-blue-700",
  licensed:    "bg-purple-100 text-purple-700",
  onboarded:   "bg-green-100 text-green-700",
};

function load<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function save<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data));
}

function daysSince(dateStr: string): number {
  if (!dateStr) return 0;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
}

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}

function formatMonth(m: string) {
  const [y, mo] = m.split("-");
  return new Date(Number(y), Number(mo) - 1).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

const EMPTY_AGENT: Omit<Agent, "id"> = {
  name: "", phone: "", email: "", comp: "", compChangedAt: "",
  notes: "", status: "active", managerId: "", productionHistory: [],
};
const EMPTY_RECRUIT: Omit<Recruit, "id"> = {
  name: "", phone: "", email: "", stage: "contacted", notes: "",
};

export default function AgencyPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [recruits, setRecruits] = useState<Recruit[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [selectedRecruit, setSelectedRecruit] = useState<Recruit | null>(null);
  const [addingAgent, setAddingAgent] = useState(false);
  const [addingSubAgentTo, setAddingSubAgentTo] = useState<string | null>(null);
  const [addingRecruit, setAddingRecruit] = useState(false);
  const [agentForm, setAgentForm] = useState(EMPTY_AGENT);
  const [recruitForm, setRecruitForm] = useState(EMPTY_RECRUIT);
  const [editingAgentId, setEditingAgentId] = useState<string | null>(null);
  const [editRecruit, setEditRecruit] = useState(false);
  const [newProdMonth, setNewProdMonth] = useState(currentMonth());
  const [newProdAmount, setNewProdAmount] = useState("");
  const [linkDownlineId, setLinkDownlineId] = useState("");

  useEffect(() => {
    setAgents(load<Agent>(AGENTS_KEY));
    setRecruits(load<Recruit>(RECRUITS_KEY));
  }, []);

  function updateAgents(next: Agent[]) {
    setAgents(next);
    save(AGENTS_KEY, next);
  }

  const selectedAgent = agents.find((a) => a.id === selectedAgentId) ?? null;

  // ── Agents ──────────────────────────────────────────────
  function addAgent(managerId = "") {
    if (!agentForm.name.trim()) return;
    const next = [...agents, { id: crypto.randomUUID(), ...agentForm, managerId }];
    updateAgents(next);
    setAgentForm(EMPTY_AGENT);
    setAddingAgent(false);
    setAddingSubAgentTo(null);
  }

  function saveAgentEdit(updated: Agent) {
    updateAgents(agents.map((a) => a.id === updated.id ? updated : a));
    setEditingAgentId(null);
  }

  function deleteAgent(id: string) {
    // Remove agent and orphan their downline (set managerId to "")
    const next = agents
      .filter((a) => a.id !== id)
      .map((a) => a.managerId === id ? { ...a, managerId: "" } : a);
    updateAgents(next);
    setSelectedAgentId(null);
  }

  function addProductionEntry(agentId: string) {
    if (!newProdAmount.trim()) return;
    const next = agents.map((a) => {
      if (a.id !== agentId) return a;
      const filtered = (a.productionHistory ?? []).filter((e) => e.month !== newProdMonth);
      return { ...a, productionHistory: [...filtered, { month: newProdMonth, amount: newProdAmount }].sort((a, b) => b.month.localeCompare(a.month)) };
    });
    updateAgents(next);
    setNewProdAmount("");
  }

  function removeProdEntry(agentId: string, month: string) {
    const next = agents.map((a) =>
      a.id !== agentId ? a : { ...a, productionHistory: (a.productionHistory ?? []).filter((e) => e.month !== month) }
    );
    updateAgents(next);
  }

  function linkDownline(managerId: string) {
    if (!linkDownlineId) return;
    const next = agents.map((a) => a.id === linkDownlineId ? { ...a, managerId } : a);
    updateAgents(next);
    setLinkDownlineId("");
  }

  // ── Recruits ─────────────────────────────────────────────
  function addRecruit() {
    if (!recruitForm.name.trim()) return;
    const next = [...recruits, { id: crypto.randomUUID(), ...recruitForm }];
    setRecruits(next);
    save(RECRUITS_KEY, next);
    setRecruitForm(EMPTY_RECRUIT);
    setAddingRecruit(false);
  }

  function saveRecruitEdit() {
    if (!selectedRecruit) return;
    const next = recruits.map((r) => r.id === selectedRecruit.id ? selectedRecruit : r);
    setRecruits(next);
    save(RECRUITS_KEY, next);
    setEditRecruit(false);
  }

  function deleteRecruit(id: string) {
    const next = recruits.filter((r) => r.id !== id);
    setRecruits(next);
    save(RECRUITS_KEY, next);
    setSelectedRecruit(null);
  }

  const inp = "border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full";

  // ── Agent Card (reusable) ─────────────────────────────────
  function AgentCard({ agent }: { agent: Agent }) {
    const downlineCount = agents.filter((a) => a.managerId === agent.id).length;
    return (
      <button
        onClick={() => { setSelectedAgentId(agent.id); setEditingAgentId(null); }}
        className="w-full bg-white border border-gray-200 rounded-xl p-4 text-left hover:border-blue-300 hover:shadow-sm transition-all"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm flex items-center justify-center shrink-0">
              {initials(agent.name)}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{agent.name}</p>
              {agent.phone && <p className="text-xs text-gray-400">{agent.phone}</p>}
              {downlineCount > 0 && <p className="text-xs text-blue-500">{downlineCount} downline</p>}
            </div>
          </div>
          <div className="flex items-center gap-4 text-right">
            {agent.comp && <div><p className="text-xs text-gray-400">Comp</p><p className="text-sm font-semibold text-gray-800">{agent.comp}</p></div>}
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${agent.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{agent.status}</span>
          </div>
        </div>
      </button>
    );
  }

  // ── Agent Profile ─────────────────────────────────────────
  if (selectedAgent) {
    const a = selectedAgent;
    const days = daysSince(a.compChangedAt);
    const downline = agents.filter((x) => x.managerId === a.id);
    const availableToLink = agents.filter((x) => x.id !== a.id && x.managerId !== a.id);
    const isEditing = editingAgentId === a.id;

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setSelectedAgentId(null)} className="text-sm text-gray-500 hover:text-gray-800">← Back</button>
          <h2 className="text-xl font-semibold text-gray-900">{a.name}</h2>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${a.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{a.status}</span>
        </div>

        {isEditing ? (
          <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input className={inp} placeholder="Name *" value={a.name} onChange={(e) => setAgents(agents.map((x) => x.id === a.id ? { ...x, name: e.target.value } : x))} />
              <select className={inp} value={a.status} onChange={(e) => setAgents(agents.map((x) => x.id === a.id ? { ...x, status: e.target.value as Agent["status"] } : x))}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <input className={inp} placeholder="Phone" value={a.phone} onChange={(e) => setAgents(agents.map((x) => x.id === a.id ? { ...x, phone: e.target.value } : x))} />
              <input className={inp} placeholder="Email" value={a.email} onChange={(e) => setAgents(agents.map((x) => x.id === a.id ? { ...x, email: e.target.value } : x))} />
              <input className={inp} placeholder="Comp level (e.g. 115%)" value={a.comp} onChange={(e) => setAgents(agents.map((x) => x.id === a.id ? { ...x, comp: e.target.value } : x))} />
              <div className="space-y-1">
                <label className="text-xs text-gray-500">Last comp change date</label>
                <input type="date" className={inp} value={a.compChangedAt?.slice(0, 10) ?? ""} onChange={(e) => setAgents(agents.map((x) => x.id === a.id ? { ...x, compChangedAt: e.target.value } : x))} />
              </div>
            </div>
            <textarea className={`${inp} resize-none`} rows={4} placeholder="Notes" value={a.notes} onChange={(e) => setAgents(agents.map((x) => x.id === a.id ? { ...x, notes: e.target.value } : x))} />
            <div className="flex gap-2">
              <button onClick={() => saveAgentEdit(a)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg">Save</button>
              <button onClick={() => setEditingAgentId(null)} className="px-4 py-2 border border-gray-300 text-gray-600 text-sm rounded-lg hover:bg-gray-50">Cancel</button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <p className="text-xs text-gray-400 uppercase tracking-widest">Comp Level</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{a.comp || "—"}</p>
              </div>
              <div className={`border rounded-xl p-4 ${days > 180 ? "bg-yellow-50 border-yellow-200" : "bg-white border-gray-200"}`}>
                <p className="text-xs text-gray-400 uppercase tracking-widest">Since Last Comp Change</p>
                <p className={`text-2xl font-bold mt-1 ${days > 180 ? "text-yellow-700" : "text-gray-900"}`}>
                  {a.compChangedAt ? `${days}d` : "—"}
                </p>
                {a.compChangedAt && <p className="text-xs text-gray-400 mt-0.5">{new Date(a.compChangedAt).toLocaleDateString()}</p>}
              </div>
            </div>

            {/* Contact */}
            {(a.phone || a.email) && (
              <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-1">
                <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">Contact</p>
                {a.phone && <p className="text-sm"><a href={`tel:${a.phone}`} className="text-gray-700 hover:text-blue-600">{a.phone}</a></p>}
                {a.email && <p className="text-sm"><a href={`mailto:${a.email}`} className="text-gray-700 hover:text-blue-600">{a.email}</a></p>}
              </div>
            )}

            {/* Notes */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">Notes</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{a.notes || <span className="text-gray-400">No notes</span>}</p>
            </div>

            {/* Production Tracker */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
              <p className="text-xs text-gray-400 uppercase tracking-widest">Monthly Production</p>
              <div className="flex gap-2">
                <input type="month" className={inp} value={newProdMonth} onChange={(e) => setNewProdMonth(e.target.value)} />
                <input className={inp} placeholder="Amount (e.g. $8,500)" value={newProdAmount} onChange={(e) => setNewProdAmount(e.target.value)} />
                <button onClick={() => addProductionEntry(a.id)} disabled={!newProdAmount.trim()} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg whitespace-nowrap">Add</button>
              </div>
              {(a.productionHistory ?? []).length === 0 ? (
                <p className="text-sm text-gray-400">No production entries yet.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-gray-400 uppercase tracking-widest border-b border-gray-100">
                      <th className="text-left pb-2">Month</th>
                      <th className="text-right pb-2">Amount</th>
                      <th className="pb-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {(a.productionHistory ?? []).map((e) => (
                      <tr key={e.month} className="border-b border-gray-50">
                        <td className="py-2 text-gray-700">{formatMonth(e.month)}</td>
                        <td className="py-2 text-right font-semibold text-gray-900">{e.amount}</td>
                        <td className="py-2 text-right">
                          <button onClick={() => removeProdEntry(a.id, e.month)} className="text-gray-300 hover:text-red-400 text-lg leading-none">×</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Downline */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
              <p className="text-xs text-gray-400 uppercase tracking-widest">Downline ({downline.length})</p>

              {/* Link existing agent */}
              {availableToLink.length > 0 && (
                <div className="flex gap-2">
                  <select className={inp} value={linkDownlineId} onChange={(e) => setLinkDownlineId(e.target.value)}>
                    <option value="">Link existing agent...</option>
                    {availableToLink.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
                  </select>
                  <button onClick={() => linkDownline(a.id)} disabled={!linkDownlineId} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg whitespace-nowrap">Link</button>
                </div>
              )}

              {/* Add new downline agent */}
              {addingSubAgentTo === a.id ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                  <p className="text-xs font-semibold text-blue-900">New Downline Agent</p>
                  <div className="grid grid-cols-2 gap-3">
                    <input className={inp} placeholder="Name *" value={agentForm.name} onChange={(e) => setAgentForm({ ...agentForm, name: e.target.value })} />
                    <input className={inp} placeholder="Phone" value={agentForm.phone} onChange={(e) => setAgentForm({ ...agentForm, phone: e.target.value })} />
                    <input className={inp} placeholder="Email" value={agentForm.email} onChange={(e) => setAgentForm({ ...agentForm, email: e.target.value })} />
                    <input className={inp} placeholder="Comp level" value={agentForm.comp} onChange={(e) => setAgentForm({ ...agentForm, comp: e.target.value })} />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => addAgent(a.id)} disabled={!agentForm.name.trim()} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg">Save</button>
                    <button onClick={() => setAddingSubAgentTo(null)} className="px-4 py-2 border border-gray-300 text-gray-600 text-sm rounded-lg hover:bg-gray-50">Cancel</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => { setAddingSubAgentTo(a.id); setAgentForm(EMPTY_AGENT); }} className="text-sm text-blue-600 hover:text-blue-700 font-medium">+ Add new downline agent</button>
              )}

              {downline.length === 0 ? (
                <p className="text-sm text-gray-400">No downline agents yet.</p>
              ) : (
                <div className="space-y-2">
                  {downline.map((d) => (
                    <button
                      key={d.id}
                      onClick={() => setSelectedAgentId(d.id)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-left hover:border-blue-300 transition-all flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-semibold text-xs flex items-center justify-center">{initials(d.name)}</div>
                        <span className="text-sm font-medium text-gray-800">{d.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        {d.comp && <span className="text-xs text-gray-500">{d.comp}</span>}
                        <span className={`text-xs px-2 py-0.5 rounded-full ${d.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{d.status}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button onClick={() => setEditingAgentId(a.id)} className="px-4 py-2 border border-gray-300 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50">Edit</button>
              <button onClick={() => deleteAgent(a.id)} className="px-4 py-2 border border-red-200 text-red-500 text-sm font-medium rounded-lg hover:bg-red-50">Delete Agent</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Recruit Profile ───────────────────────────────────────
  if (selectedRecruit) {
    const r = selectedRecruit;
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => { setSelectedRecruit(null); setEditRecruit(false); }} className="text-sm text-gray-500 hover:text-gray-800">← Back</button>
          <h2 className="text-xl font-semibold text-gray-900">{r.name}</h2>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${STAGE_COLORS[r.stage]}`}>{r.stage}</span>
        </div>

        {editRecruit ? (
          <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input className={inp} placeholder="Name *" value={r.name} onChange={(e) => setSelectedRecruit({ ...r, name: e.target.value })} />
              <select className={inp} value={r.stage} onChange={(e) => setSelectedRecruit({ ...r, stage: e.target.value as Recruit["stage"] })}>
                {STAGES.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
              </select>
              <input className={inp} placeholder="Phone" value={r.phone} onChange={(e) => setSelectedRecruit({ ...r, phone: e.target.value })} />
              <input className={inp} placeholder="Email" value={r.email} onChange={(e) => setSelectedRecruit({ ...r, email: e.target.value })} />
            </div>
            <textarea className={`${inp} resize-none`} rows={4} placeholder="Notes" value={r.notes} onChange={(e) => setSelectedRecruit({ ...r, notes: e.target.value })} />
            <div className="flex gap-2">
              <button onClick={saveRecruitEdit} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg">Save</button>
              <button onClick={() => setEditRecruit(false)} className="px-4 py-2 border border-gray-300 text-gray-600 text-sm rounded-lg hover:bg-gray-50">Cancel</button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">Pipeline Stage</p>
                <div className="flex gap-2 flex-wrap">
                  {STAGES.map((s) => (
                    <button key={s} onClick={() => {
                      const updated = { ...r, stage: s };
                      setSelectedRecruit(updated);
                      const next = recruits.map((rec) => rec.id === r.id ? updated : rec);
                      setRecruits(next); save(RECRUITS_KEY, next);
                    }} className={`text-xs px-3 py-1.5 rounded-full font-medium capitalize border transition-colors ${r.stage === s ? STAGE_COLORS[s] + " border-transparent" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              {(r.phone || r.email) && (
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Contact</p>
                  {r.phone && <p className="text-sm"><a href={`tel:${r.phone}`} className="text-gray-700 hover:text-blue-600">{r.phone}</a></p>}
                  {r.email && <p className="text-sm"><a href={`mailto:${r.email}`} className="text-gray-700 hover:text-blue-600">{r.email}</a></p>}
                </div>
              )}
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">Notes</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{r.notes || <span className="text-gray-400">No notes</span>}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEditRecruit(true)} className="px-4 py-2 border border-gray-300 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50">Edit</button>
              <button onClick={() => deleteRecruit(r.id)} className="px-4 py-2 border border-red-200 text-red-500 text-sm font-medium rounded-lg hover:bg-red-50">Delete</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Main List ─────────────────────────────────────────────
  const topLevelAgents = agents.filter((a) => !a.managerId);

  return (
    <div className="space-y-8">
      {/* Agents */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Agency</h2>
            <p className="text-sm text-gray-500 mt-0.5">Your downline agents.</p>
          </div>
          <button onClick={() => { setAddingAgent(true); setAgentForm(EMPTY_AGENT); }} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors">
            + Add Agent
          </button>
        </div>

        {addingAgent && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 space-y-3">
            <p className="text-sm font-semibold text-blue-900">New Agent</p>
            <div className="grid grid-cols-2 gap-3">
              <input className={inp} placeholder="Name *" value={agentForm.name} onChange={(e) => setAgentForm({ ...agentForm, name: e.target.value })} />
              <input className={inp} placeholder="Phone" value={agentForm.phone} onChange={(e) => setAgentForm({ ...agentForm, phone: e.target.value })} />
              <input className={inp} placeholder="Email" value={agentForm.email} onChange={(e) => setAgentForm({ ...agentForm, email: e.target.value })} />
              <input className={inp} placeholder="Comp level (e.g. 115%)" value={agentForm.comp} onChange={(e) => setAgentForm({ ...agentForm, comp: e.target.value })} />
            </div>
            <div className="flex gap-2">
              <button onClick={() => addAgent()} disabled={!agentForm.name.trim()} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg">Save</button>
              <button onClick={() => setAddingAgent(false)} className="px-4 py-2 border border-gray-300 text-gray-600 text-sm rounded-lg hover:bg-gray-50">Cancel</button>
            </div>
          </div>
        )}

        {topLevelAgents.length === 0 && !addingAgent && (
          <div className="bg-white border border-gray-200 rounded-xl p-6 text-sm text-gray-400 text-center">No agents added yet.</div>
        )}

        <div className="space-y-2">
          {topLevelAgents.map((a) => <AgentCard key={a.id} agent={a} />)}
        </div>
      </div>

      {/* Recruits */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Recruits / Pipeline</h3>
            <p className="text-sm text-gray-500 mt-0.5">Prospects you are recruiting.</p>
          </div>
          <button onClick={() => { setAddingRecruit(true); setRecruitForm(EMPTY_RECRUIT); }} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition-colors">
            + Add Recruit
          </button>
        </div>

        {addingRecruit && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-5 space-y-3">
            <p className="text-sm font-semibold text-green-900">New Recruit</p>
            <div className="grid grid-cols-2 gap-3">
              <input className={inp} placeholder="Name *" value={recruitForm.name} onChange={(e) => setRecruitForm({ ...recruitForm, name: e.target.value })} />
              <select className={inp} value={recruitForm.stage} onChange={(e) => setRecruitForm({ ...recruitForm, stage: e.target.value as Recruit["stage"] })}>
                {STAGES.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
              </select>
              <input className={inp} placeholder="Phone" value={recruitForm.phone} onChange={(e) => setRecruitForm({ ...recruitForm, phone: e.target.value })} />
              <input className={inp} placeholder="Email" value={recruitForm.email} onChange={(e) => setRecruitForm({ ...recruitForm, email: e.target.value })} />
            </div>
            <textarea className={`${inp} resize-none`} rows={2} placeholder="Notes" value={recruitForm.notes} onChange={(e) => setRecruitForm({ ...recruitForm, notes: e.target.value })} />
            <div className="flex gap-2">
              <button onClick={addRecruit} disabled={!recruitForm.name.trim()} className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg">Save</button>
              <button onClick={() => setAddingRecruit(false)} className="px-4 py-2 border border-gray-300 text-gray-600 text-sm rounded-lg hover:bg-gray-50">Cancel</button>
            </div>
          </div>
        )}

        {recruits.length === 0 && !addingRecruit && (
          <div className="bg-white border border-gray-200 rounded-xl p-6 text-sm text-gray-400 text-center">No recruits in pipeline yet.</div>
        )}

        {STAGES.map((stage) => {
          const group = recruits.filter((r) => r.stage === stage);
          if (group.length === 0) return null;
          return (
            <div key={stage} className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">{stage} ({group.length})</p>
              {group.map((r) => (
                <button key={r.id} onClick={() => { setSelectedRecruit(r); setEditRecruit(false); }}
                  className="w-full bg-white border border-gray-200 rounded-xl p-4 text-left hover:border-green-300 hover:shadow-sm transition-all flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 font-semibold text-xs flex items-center justify-center">{initials(r.name)}</div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{r.name}</p>
                      {r.phone && <p className="text-xs text-gray-400">{r.phone}</p>}
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${STAGE_COLORS[stage]}`}>{stage}</span>
                </button>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
