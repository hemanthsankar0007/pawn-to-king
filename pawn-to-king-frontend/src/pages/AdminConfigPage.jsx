import { useEffect, useState } from "react";
import { getHomeworkConfigLink, updateHomeworkConfigLink } from "../api/apiService";
import { useAuth } from "../context/AuthContext";
import LoadingPanel from "../components/LoadingPanel";
import PageTransition from "../components/PageTransition";
import StatusMessage from "../components/StatusMessage";

function AdminConfigPage() {
  const { profile } = useAuth();
  const [homeworkLink, setHomeworkLink] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [serverMessage, setServerMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const isAdmin = profile?.user?.role === "admin";

  useEffect(() => {
    let mounted = true;

    const loadConfig = async () => {
      try {
        setLoading(true);
        setErrorMessage("");
        const response = await getHomeworkConfigLink();
        if (!mounted) {
          return;
        }
        setHomeworkLink(response?.link || "");
      } catch (_error) {
        if (mounted) {
          setErrorMessage("Unable to load config right now.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadConfig();

    return () => {
      mounted = false;
    };
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setErrorMessage("");
      const response = await updateHomeworkConfigLink(homeworkLink);
      setHomeworkLink(response?.link || homeworkLink);
      setServerMessage({ type: "success", text: "Homework link updated." });
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || "Unable to update homework link right now.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingPanel text="Loading config..." />;
  }

  if (!isAdmin) {
    return (
      <PageTransition className="rounded-2xl border border-gold/20 bg-card/80 p-6 md:p-8">
        <h1 className="font-display text-2xl">Access denied</h1>
        <p className="mt-3 text-sm text-text/80">Only admins can update platform configuration.</p>
      </PageTransition>
    );
  }

  return (
    <PageTransition className="space-y-6">
      <section className="rounded-2xl border border-gold/20 bg-card/80 p-6 md:p-8">
        <p className="text-xs uppercase tracking-[0.2em] text-gold">Admin Config</p>
        <h1 className="mt-3 font-display text-3xl">Homework Link Settings</h1>
        <p className="mt-3 text-sm text-text/80">
          This link is used for all levels and topics when students click Start Topic.
        </p>
      </section>

      <section className="rounded-2xl border border-gold/20 bg-card/80 p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-sm text-text/80">
            Default Homework Link
            <input
              type="url"
              required
              value={homeworkLink}
              onChange={(event) => setHomeworkLink(event.target.value)}
              placeholder="https://example.com/study-link"
              className="mt-2 w-full rounded-lg border border-gold/25 bg-bg/80 px-3 py-2.5 text-sm text-text outline-none transition-colors focus:border-gold"
            />
          </label>

          <StatusMessage type={serverMessage?.type || "success"} text={serverMessage?.text} />
          <StatusMessage type="error" text={errorMessage} />

          <button
            type="submit"
            disabled={saving}
            className="primary-btn inline-flex min-h-[2.75rem] items-center rounded-lg px-5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </form>
      </section>
    </PageTransition>
  );
}

export default AdminConfigPage;
