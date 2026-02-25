import { useEffect, useState, useCallback } from "react";
import PageTransition from "../components/PageTransition";
import StatusMessage from "../components/StatusMessage";
import { getAdminCurriculumTopics, updateTopicHomeworkLink } from "../api/apiService";
import { LEVEL_NAMES } from "../utils/levelUtils";

function TopicRow({ topic, onSaved }) {
  const [link, setLink] = useState(topic.homeworkLink || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const hasCustomLink = Boolean(topic.homeworkLink);
  const isDirty = link !== (topic.homeworkLink || "");

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateTopicHomeworkLink(topic._id, link);
      onSaved(topic._id, link.trim() || null);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <tr className="border-t border-gold/10 hover:bg-gold/5 transition">
      {/* Number */}
      <td className="w-12 px-4 py-3 text-center text-xs font-bold text-gold/60">
        {topic.orderNumber}
      </td>

      {/* Title */}
      <td className="px-4 py-3 text-sm text-text">
        <div className="flex items-center gap-2">
          <span>{topic.title}</span>
          <span
            className={`inline-block h-2 w-2 rounded-full flex-shrink-0 ${
              hasCustomLink ? "bg-green-400" : "bg-gold/40"
            }`}
            title={hasCustomLink ? "Custom link set" : "Using default"}
          />
        </div>
      </td>

      {/* Link input */}
      <td className="px-4 py-3">
        <input
          type="url"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="https://lichess.org/study/…"
          className="w-full rounded-lg border border-gold/20 bg-bg/70 px-3 py-1.5 text-xs outline-none transition focus:border-gold placeholder:text-text/30"
        />
      </td>

      {/* Save button */}
      <td className="w-24 px-4 py-3 text-right">
        <button
          onClick={handleSave}
          disabled={saving || !isDirty}
          className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
            saved
              ? "border-green-500/40 bg-green-500/10 text-green-400"
              : isDirty
              ? "border-gold bg-gold/10 text-gold hover:border-gold-hover hover:text-gold-hover"
              : "border-gold/15 bg-transparent text-text/30 cursor-not-allowed"
          }`}
        >
          {saving ? "…" : saved ? "Saved" : "Save"}
        </button>
      </td>
    </tr>
  );
}

function AdminCurriculumPage() {
  const [selectedLevel, setSelectedLevel] = useState("Pawn");
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchTopics = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getAdminCurriculumTopics(selectedLevel);
      setTopics(data.topics || []);
    } catch {
      setError("Failed to load topics.");
    } finally {
      setLoading(false);
    }
  }, [selectedLevel]);

  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  const handleSaved = (id, newLink) => {
    setTopics((prev) =>
      prev.map((t) => (t._id === id ? { ...t, homeworkLink: newLink } : t))
    );
  };

  const customCount = topics.filter((t) => t.homeworkLink).length;

  return (
    <PageTransition className="space-y-6">
      {/* Header */}
      <section className="rounded-2xl border border-gold/20 bg-card/80 p-6 md:p-8">
        <p className="text-xs uppercase tracking-[0.2em] text-gold">Admin</p>
        <h1 className="mt-3 font-display text-3xl">Curriculum Manager</h1>
        <p className="mt-2 text-sm text-text/70">
          Set a custom homework link per topic. Students see it instantly — no restart needed.
        </p>
      </section>

      {/* Level selector */}
      <section className="rounded-2xl border border-gold/20 bg-card/80 p-5">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-xs uppercase tracking-wider text-text/60">Select Level</p>
          <div className="flex flex-wrap gap-2">
            {LEVEL_NAMES.map((lvl) => (
              <button
                key={lvl}
                onClick={() => setSelectedLevel(lvl)}
                className={`rounded-lg border px-4 py-1.5 text-xs font-semibold transition ${
                  selectedLevel === lvl
                    ? "border-gold bg-gold/15 text-gold"
                    : "border-gold/20 text-text/60 hover:border-gold/50 hover:text-gold"
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Topics table */}
      <section className="rounded-2xl border border-gold/20 bg-card/80 overflow-hidden">
        {/* Table header */}
        <div className="flex items-center justify-between border-b border-gold/10 px-5 py-4">
          <div>
            <p className="text-sm font-semibold text-text">{selectedLevel} — Topics</p>
            <p className="mt-0.5 text-xs text-text/50">
              {customCount} custom / {topics.length} total
              {" · "}
              <span className="inline-flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-green-400 inline-block" /> Custom
              </span>
              {" · "}
              <span className="inline-flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-gold/40 inline-block" /> Default
              </span>
            </p>
          </div>
        </div>

        <StatusMessage type="error" text={error} />

        {loading ? (
          <div className="px-5 py-10 text-center text-sm text-text/50">Loading topics…</div>
        ) : topics.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-text/50">
            No topics found for {selectedLevel}. Run the seed script first.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gold/10 bg-bg/30">
                  <th className="px-4 py-2.5 text-center text-xs uppercase tracking-wider text-text/40">#</th>
                  <th className="px-4 py-2.5 text-xs uppercase tracking-wider text-text/40">Topic</th>
                  <th className="px-4 py-2.5 text-xs uppercase tracking-wider text-text/40">Homework Link</th>
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {topics.map((topic) => (
                  <TopicRow key={topic._id} topic={topic} onSaved={handleSaved} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </PageTransition>
  );
}

export default AdminCurriculumPage;
