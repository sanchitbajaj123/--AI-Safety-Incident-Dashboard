import React, { useState, useEffect } from "react";
import "./IncidentDashboard.css";

type Severity = "Low" | "Medium" | "High";

interface Incident {
  id: number;
  title: string;
  description: string;
  severity: Severity;
  reported_at: string;
}

interface FormData {
  title: string;
  description: string;
  severity: Severity;
}

const mockIncidents: Incident[] = [
  {
    id: 1,
    title: "Biased Recommendation Algorithm",
    description: "Algorithm consistently favored certain demographics...",
    severity: "Medium",
    reported_at: "2025-03-15T10:00:00Z",
  },
  {
    id: 2,
    title: "LLM Hallucination in Critical Info",
    description: "LLM provided incorrect safety procedure information...",
    severity: "High",
    reported_at: "2025-04-01T14:30:00Z",
  },
  {
    id: 3,
    title: "Minor Data Leak via Chatbot",
    description: "Chatbot inadvertently exposed non-sensitive user metadata...",
    severity: "Low",
    reported_at: "2025-03-20T09:15:00Z",
  },
];

const IncidentDashboard: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>(mockIncidents);
  const [modalOpen, setModalOpen] = useState(false);
  const [filterSeverity, setFilterSeverity] = useState<Severity | "All">("All");
  const [expandedIncidentId, setExpandedIncidentId] = useState<number | null>(null);
  const [form, setForm] = useState<FormData>({ title: "", description: "", severity: "Low" });
  const [sortOrder, setSortOrder] = useState<"Newest First" | "Oldest First">("Newest First");

  useEffect(() => {
    const stored = localStorage.getItem("newIncidents");
    if (stored) {
      const newOnes: Incident[] = JSON.parse(stored);
      setIncidents([...mockIncidents, ...newOnes]);
    }
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      alert("Please fill all fields!");
      return;
    }
    const newIncident: Incident = {
      id: Date.now(),
      ...form,
      reported_at: new Date().toISOString(),
    };
    const stored = localStorage.getItem("newIncidents");
    const updated = stored ? [...JSON.parse(stored), newIncident] : [newIncident];
    localStorage.setItem("newIncidents", JSON.stringify(updated));
    setIncidents((prev) => [...prev, newIncident]);
    setForm({ title: "", description: "", severity: "Low" });
    setModalOpen(false);
  };

  const filteredIncidents = filterSeverity === "All"
    ? incidents
    : incidents.filter((inc) => inc.severity === filterSeverity);

  const toggleDescription = (id: number) => {
    setExpandedIncidentId(prev => (prev === id ? null : id));
  };

  const handleSortChange = (order: "Newest First" | "Oldest First") => {
    setSortOrder(order);
  };

  const sortedIncidents = filteredIncidents.sort((a, b) => {
    const dateA = new Date(a.reported_at).getTime();
    const dateB = new Date(b.reported_at).getTime();
    return sortOrder === "Newest First" ? dateB - dateA : dateA - dateB;
  });

  const getSeverityEmoji = (severity: Severity) => {
    switch (severity) {
      case "Low": return "🟢";
      case "Medium": return "🟠";
      case "High": return "🔴";
      default: return "";
    }
  };

  return (
    <div className="dashboard">
      <h1 className="dashboard-title">🛡️ AI Safety Incident Dashboard</h1>

      <div className="top-controls">
        <div className="filter-container">
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value as Severity | "All")}
          >
            <option value="All">🎯 All</option>
            <option value="Low">🟢 Low</option>
            <option value="Medium">🟠 Medium</option>
            <option value="High">🔴 High</option>
          </select>
        </div>

        <button className="report-btn" onClick={() => setModalOpen(true)}>
          📝 Report
        </button>

        <div className="sort-container">
          <select
            value={sortOrder}
            onChange={(e) => handleSortChange(e.target.value as "Newest First" | "Oldest First")}
          >
            <option value="Newest First">⏳ Newest</option>
            <option value="Oldest First">🕰️ Oldest</option>
          </select>
        </div>
      </div>

      <div className="incident-list">
        {sortedIncidents.map((incident) => (
          <div key={incident.id} className="incident-card glass">
            <div className="incident-header">
              <h2>{getSeverityEmoji(incident.severity)} {incident.title}</h2>
              <button className="view-btn" onClick={() => toggleDescription(incident.id)}>
                {expandedIncidentId === incident.id ? "Hide Description" : "View Description"}
              </button>
            </div>
            <p><strong>Severity:</strong> {getSeverityEmoji(incident.severity)} {incident.severity}</p>
            <p><strong>Reported:</strong> {new Date(incident.reported_at).toLocaleString()}</p>
            {expandedIncidentId === incident.id && (
              <p className="description">{incident.description}</p>
            )}
          </div>
        ))}
      </div>

      {modalOpen && (
        <>
          <div className="overlay"></div>
          <div className="modal glass">
            <button className="close-btn" onClick={() => setModalOpen(false)}>×</button>
            <h2>Report New Incident</h2>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                name="title"
                placeholder="Incident Title"
                value={form.title}
                onChange={handleInput}
                required
              />
              <textarea
                name="description"
                placeholder="Description"
                value={form.description}
                onChange={handleInput}
                required
              />
              <select name="severity" value={form.severity} onChange={handleInput}>
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
              <button type="submit" className="submit-btn">Submit</button>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default IncidentDashboard;
