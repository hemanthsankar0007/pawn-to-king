import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getBonusMaterials } from "../api/apiService";
import LoadingPanel from "../components/LoadingPanel";
import EmptyStateCard from "../components/EmptyStateCard";
import PageTransition from "../components/PageTransition";
import StatusMessage from "../components/StatusMessage";

function BonusPage() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [warning, setWarning] = useState("");

  useEffect(() => {
    const loadMaterials = async () => {
      try {
        setLoading(true);
        setWarning("");
        const response = await getBonusMaterials();
        setMaterials(response.materials || []);
      } catch (_requestError) {
        setWarning("Bonus resources are temporarily unavailable.");
        setMaterials([]);
      } finally {
        setLoading(false);
      }
    };

    loadMaterials();
  }, []);

  if (loading) {
    return <LoadingPanel text="Loading bonus resources..." />;
  }

  return (
    <PageTransition className="space-y-5">
      <section className="rounded-2xl border border-gold/20 bg-card/80 p-6 md:p-8">
        <p className="text-xs uppercase tracking-[0.2em] text-gold">Bonus</p>
        <h1 className="mt-3 font-display text-3xl">Exclusive PDF Resources</h1>
      </section>

      <StatusMessage type="warning" text={warning} />

      <section className="grid gap-4 md:grid-cols-2">
        {materials.map((material, index) => (
          <motion.article
            key={material._id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            className="glass-card soft-hover rounded-xl p-5"
          >
            <h2 className="font-display text-2xl text-gold">{material.title}</h2>
            <p className="mt-3 text-sm text-text/80">{material.description}</p>
            <a
              href={material.fileUrl}
              target="_blank"
              rel="noreferrer"
              className="primary-btn mt-5 inline-block rounded-lg px-4 py-2 text-sm font-semibold"
            >
              Download PDF
            </a>
          </motion.article>
        ))}
      </section>

      {!materials.length && !warning && (
        <EmptyStateCard
          title="No Bonus Resources"
          text="New downloadable PDFs will appear here as they are published."
        />
      )}
    </PageTransition>
  );
}

export default BonusPage;
