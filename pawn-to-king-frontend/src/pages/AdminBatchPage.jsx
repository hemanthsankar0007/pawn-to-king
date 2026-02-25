import { useCallback, useEffect, useState } from "react";
import {
  deleteAdminBatch,
  getAdminBatchStudents,
  getAdminBatches,
  removeStudentFromAdminBatch
} from "../api/apiService";
import LoadingPanel from "../components/LoadingPanel";
import PageTransition from "../components/PageTransition";
import StatusMessage from "../components/StatusMessage";
import { LEVEL_NAMES } from "../utils/levelUtils";

// ─── Confirmation dialog ──────────────────────────────────────────────────────
function ConfirmDialog({ title, body, onConfirm, onCancel, loading = false }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-gold/25 bg-card p-7 shadow-2xl">
        <h3 className="font-display text-xl text-text">{title}</h3>
        <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-text/70">{body}</p>
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 rounded-xl border border-red-400/50 bg-red-500/10 py-2.5 text-sm font-semibold text-red-300 transition hover:bg-red-500/20 disabled:opacity-50"
          >
            {loading ? "Deleting..." : "Yes, Delete"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border border-gold/30 bg-gold/8 py-2.5 text-sm font-semibold text-gold transition hover:bg-gold/15"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Students modal ───────────────────────────────────────────────────────────
function StudentsModal({ batchId, batchName, onClose, onStudentRemoved }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(null);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const result = await getAdminBatchStudents(batchId);
      setData(result);
    } catch (_err) {
      setError("Failed to load students.");
    } finally {
      setLoading(false);
    }
  }, [batchId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleRemove = async (studentId, studentName) => {
    setRemoving(studentId);
    setError("");
    setSuccessMsg("");
    try {
      await removeStudentFromAdminBatch(batchId, studentId);
      setSuccessMsg(`${studentName} removed from batch.`);
      setData((prev) =>
        prev
          ? { ...prev, students: prev.students.filter((s) => s._id !== studentId) }
          : prev
      );
      onStudentRemoved(batchId);
    } catch (_err) {
      setError("Failed to remove student.");
    } finally {
      setRemoving(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
      <div className="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-2xl border border-gold/25 bg-card shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gold/15 px-6 py-5">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-gold">Batch Students</p>
            <h3 className="mt-1 font-display text-xl text-text">{batchName}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-text/50 transition hover:bg-gold/10 hover:text-gold"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <StatusMessage type="success" text={successMsg} className="mb-3" />
          <StatusMessage type="error" text={error} className="mb-3" />

          {loading ? (
            <LoadingPanel text="Loading students..." />
          ) : !data?.students?.length ? (
            <p className="py-8 text-center text-sm text-text/50">No students assigned to this batch.</p>
          ) : (
            <div className="space-y-2">
              {data.students.map((student) => (
                <div
                  key={student._id}
                  className="flex items-center justify-between rounded-xl border border-gold/10 bg-bg/50 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-text">{student.name}</p>
                    <p className="mt-0.5 text-xs text-text/55">{student.email}</p>
                    <p className="mt-0.5 text-xs text-text/45">
                      Level: {student.currentLevel} · Topic: {student.currentTopic}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={removing === student._id}
                    onClick={() => handleRemove(student._id, student.name)}
                    className="ml-4 shrink-0 rounded-lg border border-red-400/40 bg-red-500/8 px-3 py-1.5 text-xs font-medium text-red-300 transition hover:bg-red-500/18 disabled:opacity-50"
                  >
                    {removing === student._id ? "Removing..." : "Remove"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gold/15 px-6 py-4">
          <p className="text-xs text-text/45">
            Removing a student unassigns them from this batch. Their account remains intact.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Batch card ───────────────────────────────────────────────────────────────
function BatchCard({ batch, onViewStudents, onDelete }) {
  return (
    <article className="flex flex-col rounded-2xl border border-gold/18 bg-card/80 p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="text-xs uppercase tracking-[0.18em] text-gold">{batch.level}</span>
          <h3 className="mt-1 truncate font-display text-xl text-text">{batch.name}</h3>
        </div>
        <span className="shrink-0 rounded-lg border border-gold/25 bg-gold/10 px-2.5 py-1 text-xs font-semibold text-gold">
          {batch.assignedStudentCount ?? 0} students
        </span>
      </div>

      <div className="mt-4 space-y-1.5 text-xs text-text/60">
        <p>
          <span className="text-text/40 uppercase tracking-wider">Schedule:</span>{" "}
          {batch.days?.join(", ")} · {batch.time} ({batch.timezone})
        </p>
        <p className="truncate">
          <span className="text-text/40 uppercase tracking-wider">Meet:</span>{" "}
          <a
            href={batch.meetLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gold/70 hover:text-gold hover:underline"
          >
            {batch.meetLink}
          </a>
        </p>
      </div>

      <div className="mt-5 flex gap-2">
        <button
          type="button"
          onClick={() => onViewStudents(batch)}
          className="flex-1 rounded-xl border border-gold/30 bg-gold/8 py-2 text-sm font-medium text-gold transition hover:bg-gold/15"
        >
          View Students
        </button>
        <button
          type="button"
          onClick={() => onDelete(batch)}
          className="rounded-xl border border-red-400/35 bg-red-500/8 px-4 py-2 text-sm font-medium text-red-300 transition hover:bg-red-500/18"
        >
          Delete
        </button>
      </div>
    </article>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
function AdminBatchPage() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [levelFilter, setLevelFilter] = useState("");

  // Modal state
  const [viewBatch, setViewBatch] = useState(null);

  // Delete confirmation state
  const [deletingBatch, setDeletingBatch] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const loadBatches = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const { batches: list } = await getAdminBatches(levelFilter);
      setBatches(list || []);
    } catch (_err) {
      setError("Failed to load batches.");
    } finally {
      setLoading(false);
    }
  }, [levelFilter]);

  useEffect(() => {
    loadBatches();
  }, [loadBatches]);

  const handleDelete = async () => {
    if (!deletingBatch) return;
    setDeleteLoading(true);
    setDeleteError("");
    try {
      await deleteAdminBatch(deletingBatch._id);
      setBatches((prev) => prev.filter((b) => b._id !== deletingBatch._id));
      setDeletingBatch(null);
    } catch (_err) {
      setDeleteError("Failed to delete batch. Please try again.");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Decrement student count when a student is removed from a batch via the modal
  const handleStudentRemoved = (batchId) => {
    setBatches((prev) =>
      prev.map((b) =>
        String(b._id) === String(batchId)
          ? { ...b, assignedStudentCount: Math.max(0, (b.assignedStudentCount ?? 1) - 1) }
          : b
      )
    );
  };

  const filteredBatches = levelFilter
    ? batches.filter((b) => b.level === levelFilter)
    : batches;

  return (
    <PageTransition className="space-y-6">
      {/* Header */}
      <section className="rounded-2xl border border-gold/20 bg-card/80 p-6 md:p-8">
        <p className="text-xs uppercase tracking-[0.2em] text-gold">Admin</p>
        <h1 className="mt-3 font-display text-3xl text-text">Batch Management</h1>
        <p className="mt-2 text-sm text-text/65">
          View, manage, and delete batches. Deleting a batch removes all scheduled sessions and
          unassigns students — student accounts are never deleted.
        </p>
      </section>

      {/* Level filter pills */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setLevelFilter("")}
          className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
            levelFilter === ""
              ? "bg-gold text-bg"
              : "border border-gold/30 text-text/70 hover:border-gold hover:text-gold"
          }`}
        >
          All
        </button>
        {LEVEL_NAMES.map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => setLevelFilter(name === levelFilter ? "" : name)}
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
              levelFilter === name
                ? "bg-gold text-bg"
                : "border border-gold/30 text-text/70 hover:border-gold hover:text-gold"
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      <StatusMessage type="error" text={error} />

      {/* Batch grid */}
      {loading ? (
        <LoadingPanel text="Loading batches..." />
      ) : filteredBatches.length === 0 ? (
        <div className="rounded-2xl border border-gold/15 bg-card/60 p-10 text-center">
          <p className="text-sm text-text/50">No batches found{levelFilter ? ` for level ${levelFilter}` : ""}.</p>
          <p className="mt-1 text-xs text-text/35">Create batches from the Admin Timetable page.</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filteredBatches.map((batch) => (
            <BatchCard
              key={batch._id}
              batch={batch}
              onViewStudents={(b) => setViewBatch(b)}
              onDelete={(b) => {
                setDeletingBatch(b);
                setDeleteError("");
              }}
            />
          ))}
        </div>
      )}

      {/* Students modal */}
      {viewBatch && (
        <StudentsModal
          batchId={viewBatch._id}
          batchName={viewBatch.name}
          onClose={() => setViewBatch(null)}
          onStudentRemoved={handleStudentRemoved}
        />
      )}

      {/* Delete confirmation */}
      {deletingBatch && (
        <ConfirmDialog
          title={`Delete "${deletingBatch.name}"?`}
          body={`This will permanently delete the batch and all its scheduled sessions.\n\nStudents will be unassigned but their accounts remain intact.${deleteError ? `\n\n⚠ ${deleteError}` : ""}`}
          loading={deleteLoading}
          onConfirm={handleDelete}
          onCancel={() => {
            setDeletingBatch(null);
            setDeleteError("");
          }}
        />
      )}
    </PageTransition>
  );
}

export default AdminBatchPage;
