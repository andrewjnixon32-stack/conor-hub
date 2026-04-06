"use client";

import { useState, useEffect } from "react";

interface Carrier {
  id: string;
  name: string;
  writingNumberConor: string;
  writingNumberKylee: string;
  phone: string;
  agentSupport: string;
  website: string;
  agentPortal: string;
  notes: string;
}

const STORAGE_KEY = "hub_carriers";

const DEFAULT_CARRIERS: Carrier[] = [
  { id: "default-1",  name: "Mutual of Omaha",          writingNumberConor: "1135447",     writingNumberKylee: "1262508",    phone: "1-800-775-6000", agentSupport: "1-800-693-6083", website: "www.mutualofomaha.com",    agentPortal: "", notes: "" },
  { id: "default-2",  name: "Aetna",                     writingNumberConor: "",            writingNumberKylee: "GNW6176242", phone: "1-800-872-3862", agentSupport: "1-888-632-3862", website: "www.aetna.com",           agentPortal: "", notes: "" },
  { id: "default-3",  name: "Baltimore Life",             writingNumberConor: "015422DDM",   writingNumberKylee: "",           phone: "", agentSupport: "", website: "www.baltimorelife.com",    agentPortal: "", notes: "" },
  { id: "default-4",  name: "United Home Life",           writingNumberConor: "",            writingNumberKylee: "",           phone: "", agentSupport: "", website: "www.unitedhomelife.com",   agentPortal: "", notes: "" },
  { id: "default-5",  name: "American Home Life",         writingNumberConor: "AMW6017298",  writingNumberKylee: "",           phone: "", agentSupport: "", website: "www.americanhomelife.com", agentPortal: "", notes: "" },
  { id: "default-6",  name: "Legal & General",            writingNumberConor: "ASU10662",    writingNumberKylee: "",           phone: "", agentSupport: "", website: "www.lgamerica.com",        agentPortal: "", notes: "Old agent number: ASU4271" },
  { id: "default-7",  name: "Ameritas",                   writingNumberConor: "AG00264598-02", writingNumberKylee: "",         phone: "", agentSupport: "", website: "www.ameritas.com",         agentPortal: "", notes: "Agency Number: EN00008561 | Term Portal Security Code: 23DFS8F2CBZ71Z94APJMCJ39" },
  { id: "default-8",  name: "Americo",                    writingNumberConor: "SSG221",      writingNumberKylee: "SSG1WZ",     phone: "", agentSupport: "", website: "www.americo.com",          agentPortal: "", notes: "Policy docs: Agent.services@americo.com — before 3pm handled same day, no call needed" },
  { id: "default-9",  name: "Royal Neighbors",            writingNumberConor: "DAZ1",        writingNumberKylee: "",           phone: "", agentSupport: "", website: "www.royalneighbors.org",   agentPortal: "", notes: "" },
  { id: "default-10", name: "Aflac",                      writingNumberConor: "",            writingNumberKylee: "TEW6022330", phone: "", agentSupport: "", website: "www.aflac.com",            agentPortal: "", notes: "" },
  { id: "default-11", name: "Foresters",                  writingNumberConor: "",            writingNumberKylee: "930394",     phone: "", agentSupport: "", website: "www.foresters.com",        agentPortal: "", notes: "" },
  { id: "default-12", name: "Liberty Bankers",            writingNumberConor: "LBL72737WL",  writingNumberKylee: "",           phone: "", agentSupport: "", website: "",                         agentPortal: "", notes: "" },
  { id: "default-13", name: "American Amicable",          writingNumberConor: "1162293",     writingNumberKylee: "",           phone: "", agentSupport: "", website: "",                         agentPortal: "", notes: "Agent PIN: 096126" },
  { id: "default-14", name: "Transamerica",               writingNumberConor: "MLSR134556",  writingNumberKylee: "",           phone: "", agentSupport: "", website: "www.transamerica.com",     agentPortal: "", notes: "" },
  { id: "default-15", name: "CHUBB / Combined",           writingNumberConor: "F89PC",       writingNumberKylee: "",           phone: "", agentSupport: "", website: "",                         agentPortal: "", notes: "" },
  { id: "default-16", name: "SBLI FEX",                   writingNumberConor: "125519",      writingNumberKylee: "",           phone: "", agentSupport: "", website: "",                         agentPortal: "", notes: "" },
  { id: "default-17", name: "Corebridge",                 writingNumberConor: "1M2N4",       writingNumberKylee: "",           phone: "", agentSupport: "", website: "",                         agentPortal: "", notes: "Recruiting Code: 1M2R2 | Primary ID: 2248919106 (all agent codes incl. FFL, AIRE, SSG)" },
  { id: "default-18", name: "Heartland",                  writingNumberConor: "",            writingNumberKylee: "",           phone: "", agentSupport: "", website: "",                         agentPortal: "", notes: "" },
  { id: "default-19", name: "North American",             writingNumberConor: "R9F19",       writingNumberKylee: "",           phone: "", agentSupport: "", website: "",                         agentPortal: "", notes: "" },
  { id: "default-20", name: "KC Life",                    writingNumberConor: "118434S",     writingNumberKylee: "",           phone: "", agentSupport: "", website: "",                         agentPortal: "", notes: "" },
  { id: "default-21", name: "Illinois Mutual",            writingNumberConor: "89594",       writingNumberKylee: "",           phone: "", agentSupport: "", website: "",                         agentPortal: "", notes: "" },
  { id: "default-22", name: "Pekin Life",                 writingNumberConor: "",            writingNumberKylee: "",           phone: "", agentSupport: "", website: "",                         agentPortal: "", notes: "" },
  { id: "default-23", name: "Instabrain",                 writingNumberConor: "21101097H",   writingNumberKylee: "",           phone: "", agentSupport: "", website: "",                         agentPortal: "", notes: "" },
  { id: "default-24", name: "F&G",                        writingNumberConor: "MC613A4000",  writingNumberKylee: "",           phone: "", agentSupport: "", website: "",                         agentPortal: "", notes: "" },
  { id: "default-25", name: "Quility",                    writingNumberConor: "106957",      writingNumberKylee: "",           phone: "", agentSupport: "", website: "",                         agentPortal: "", notes: "For quoting and writing SBLI & LGA | Security Code: 7ZLFYSB7YT5ASQEE8V2LR6MF" },
  { id: "default-26", name: "SBLI Term (Quility)",        writingNumberConor: "106957",      writingNumberKylee: "",           phone: "", agentSupport: "", website: "",                         agentPortal: "", notes: "Written through Quility website" },
  { id: "default-27", name: "UHL",                        writingNumberConor: "L000242730",  writingNumberKylee: "",           phone: "", agentSupport: "", website: "",                         agentPortal: "", notes: "Lenient term for bipolar/diabetes" },
  { id: "default-28", name: "Fearless Shepherds Direct",  writingNumberConor: "",            writingNumberKylee: "",           phone: "", agentSupport: "", website: "",                         agentPortal: "", notes: "" },
  { id: "default-29", name: "Ladder Life",                writingNumberConor: "BXK568999",   writingNumberKylee: "",           phone: "", agentSupport: "", website: "",                         agentPortal: "", notes: "" },
];

function loadCarriers(): Carrier[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_CARRIERS;
  } catch {
    return DEFAULT_CARRIERS;
  }
}

function saveCarriers(carriers: Carrier[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(carriers));
}

const EMPTY: Omit<Carrier, "id"> = {
  name: "", writingNumberConor: "", writingNumberKylee: "",
  phone: "", agentSupport: "", website: "", agentPortal: "", notes: "",
};

export default function CarriersPage() {
  const [carriers, setCarriers] = useState<Carrier[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Omit<Carrier, "id">>(EMPTY);
  const [adding, setAdding] = useState(false);
  const [newForm, setNewForm] = useState<Omit<Carrier, "id">>(EMPTY);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setCarriers(loadCarriers());
  }, []);

  function updateCarriers(next: Carrier[]) {
    setCarriers(next);
    saveCarriers(next);
  }

  function startEdit(c: Carrier) {
    setEditingId(c.id);
    setEditForm({ ...c });
  }

  function saveEdit() {
    if (!editingId || !editForm.name.trim()) return;
    updateCarriers(carriers.map((c) => (c.id === editingId ? { id: c.id, ...editForm } : c)));
    setEditingId(null);
  }

  function deleteCarrier(id: string) {
    updateCarriers(carriers.filter((c) => c.id !== id));
  }

  function addCarrier() {
    if (!newForm.name.trim()) return;
    updateCarriers([...carriers, { id: crypto.randomUUID(), ...newForm }]);
    setNewForm(EMPTY);
    setAdding(false);
  }

  const filtered = carriers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  function FormFields({ form, setForm }: { form: Omit<Carrier, "id">; setForm: (f: Omit<Carrier, "id">) => void }) {
    const inp = "border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
    return (
      <div className="space-y-3">
        <input className={`w-full ${inp}`} placeholder="Carrier name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <div className="grid grid-cols-2 gap-3">
          <input className={inp} placeholder="Conor's writing number" value={form.writingNumberConor} onChange={(e) => setForm({ ...form, writingNumberConor: e.target.value })} />
          <input className={inp} placeholder="Kylee's writing number" value={form.writingNumberKylee} onChange={(e) => setForm({ ...form, writingNumberKylee: e.target.value })} />
          <input className={inp} placeholder="Main phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <input className={inp} placeholder="Agent support line" value={form.agentSupport} onChange={(e) => setForm({ ...form, agentSupport: e.target.value })} />
          <input className={inp} placeholder="Website" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
          <input className={inp} placeholder="Agent portal URL" value={form.agentPortal} onChange={(e) => setForm({ ...form, agentPortal: e.target.value })} />
        </div>
        <input className={`w-full ${inp}`} placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Carriers & Writing Info</h2>
          <p className="text-sm text-gray-500 mt-1">Carrier contacts and writing numbers.</p>
        </div>
        <button
          onClick={() => { setAdding(true); setNewForm(EMPTY); }}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          + Add Carrier
        </button>
      </div>

      <input
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Search carriers..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {adding && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 space-y-4">
          <p className="text-sm font-semibold text-blue-900">New Carrier</p>
          <FormFields form={newForm} setForm={setNewForm} />
          <div className="flex gap-2">
            <button onClick={addCarrier} disabled={!newForm.name.trim()} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg">Save</button>
            <button onClick={() => setAdding(false)} className="px-4 py-2 border border-gray-300 text-gray-600 text-sm rounded-lg hover:bg-gray-50">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {filtered.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-8">No carriers found.</p>
        )}
        {filtered.map((c) =>
          editingId === c.id ? (
            <div key={c.id} className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 space-y-4">
              <FormFields form={editForm} setForm={setEditForm} />
              <div className="flex gap-2">
                <button onClick={saveEdit} disabled={!editForm.name.trim()} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg">Save</button>
                <button onClick={() => setEditingId(null)} className="px-4 py-2 border border-gray-300 text-gray-600 text-sm rounded-lg hover:bg-gray-50">Cancel</button>
              </div>
            </div>
          ) : (
            <div key={c.id} className="bg-white border border-gray-200 rounded-xl p-5 space-y-2.5">
              <div className="flex items-start justify-between gap-4">
                <p className="text-base font-semibold text-gray-900">{c.name}</p>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => startEdit(c)} className="px-3 py-1.5 text-xs font-medium border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">Edit</button>
                  <button onClick={() => deleteCarrier(c.id)} className="px-3 py-1.5 text-xs font-medium border border-red-200 rounded-lg text-red-500 hover:bg-red-50">Delete</button>
                </div>
              </div>

              {(c.writingNumberConor || c.writingNumberKylee) && (
                <div className="flex gap-4">
                  {c.writingNumberConor && (
                    <div>
                      <p className="text-xs text-gray-400">Conor</p>
                      <p className="text-sm font-mono font-medium text-gray-800">{c.writingNumberConor}</p>
                    </div>
                  )}
                  {c.writingNumberKylee && (
                    <div>
                      <p className="text-xs text-gray-400">Kylee</p>
                      <p className="text-sm font-mono font-medium text-gray-800">{c.writingNumberKylee}</p>
                    </div>
                  )}
                </div>
              )}

              {(c.phone || c.agentSupport || c.website) && (
                <div className="flex flex-wrap gap-x-6 gap-y-0.5 text-sm text-gray-600">
                  {c.phone && <span><span className="text-gray-400 text-xs mr-1">Main</span><a href={`tel:${c.phone}`} className="hover:text-blue-600">{c.phone}</a></span>}
                  {c.agentSupport && <span><span className="text-gray-400 text-xs mr-1">Agent Support</span><a href={`tel:${c.agentSupport}`} className="hover:text-blue-600">{c.agentSupport}</a></span>}
                  {c.website && <span><span className="text-gray-400 text-xs mr-1">Web</span><a href={c.website.startsWith("http") ? c.website : `https://${c.website}`} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">{c.website}</a></span>}
                </div>
              )}

              {c.agentPortal && (
                <a href={c.agentPortal.startsWith("http") ? c.agentPortal : `https://${c.agentPortal}`} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full hover:bg-blue-100 transition-colors">
                  Agent Portal →
                </a>
              )}

              {c.notes && <p className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">{c.notes}</p>}
            </div>
          )
        )}
      </div>
    </div>
  );
}
