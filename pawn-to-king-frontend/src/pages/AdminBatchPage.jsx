import { useCallback, useEffect, useMemo, useState } from "react";
import {
  deleteAdminBatch,
  getAdminBatchStudents,
  getAdminBatches,
  getAllStudents,
  removeStudentFromAdminBatch,
  updateAdminBatch
} from "../api/apiService";
import LoadingPanel from "../components/LoadingPanel";
import PageTransition from "../components/PageTransition";
import StatusMessage from "../components/StatusMessage";
import { LEVEL_NAMES } from "../utils/levelUtils";

const DAY_OPTIONS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const TIME_ZONE_OPTIONS = [
  "IST (UTC+5:30)",
  "GMT (UTC+0)",
  "EST (UTC-5)",
  "PST (UTC-8)",
  "SGT (UTC+8)",
  "AEST (UTC+10)"
];

const normalizeBatchId = (batchValue) => {
  if (!batchValue) {
    return "";
  }
  if (typeof batchValue === "object") {
    return String(batchValue._id || "");
  }
  return String(batchValue);
};

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
      setData((previous) =>
        previous
          ? {
              ...previous,
              students: previous.students.filter((student) => student._id !== studentId)
            }
          : previous
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
            x
          </button>
        </div>

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
                      Level: {student.currentLevel} | Topic: {student.currentTopic}
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

        <div className="border-t border-gold/15 px-6 py-4">
          <p className="text-xs text-text/45">
            Removing a student unassigns them from this batch. Their account remains intact.
          </p>
        </div>
      </div>
    </div>
  );
}

function EditBatchModal({ batch, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: batch.name || "",
    level: batch.level || "Pawn",
    days: Array.isArray(batch.days) ? batch.days : [],
    time: batch.time || "",
    timezone: batch.timezone || "IST (UTC+5:30)",
    meetLink: batch.meetLink || ""
  });
  const [students, setStudents] = useState([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadStudents = async () => {
      try {
        setLoadingStudents(true);
        setError("");
        const response = await getAllStudents();
        const nextStudents = Array.isArray(response) ? response : response?.students || [];
        if (!mounted) {
          return;
        }
        setStudents(nextStudents);

        const assignedIds = nextStudents
          .filter((student) => normalizeBatchId(student.batchId) === String(batch._id))
          .map((student) => String(student._id));
        setSelectedStudentIds(assignedIds);
      } catch (_error) {
        if (!mounted) {
          return;
        }
        setError("Unable to load students for batch editing.");
      } finally {
        if (mounted) {
          setLoadingStudents(false);
        }
      }
    };

    loadStudents();

    return () => {
      mounted = false;
    };
  }, [batch._id]);

  const filteredStudents = useMemo(() => {
    const query = studentSearch.trim().toLowerCase();
    if (!query) {
      return students;
    }

    return students.filter((student) => {
      const currentBatchName =
        typeof student.batchId === "object" && student.batchId ? String(student.batchId.name || "") : "";
      return (
        String(student.name || "").toLowerCase().includes(query) ||
        String(student.email || "").toLowerCase().includes(query) ||
        String(student.currentLevel || "").toLowerCase().includes(query) ||
        currentBatchName.toLowerCase().includes(query)
      );
    });
  }, [studentSearch, students]);

  const toggleDay = (dayName) => {
    setForm((previous) => ({
      ...previous,
      days: previous.days.includes(dayName)
        ? previous.days.filter((day) => day !== dayName)
        : [...previous.days, dayName]
    }));
  };

  const toggleStudent = (studentId) => {
    const normalizedId = String(studentId);
    setSelectedStudentIds((previous) =>
      previous.includes(normalizedId)
        ? previous.filter((id) => id !== normalizedId)
        : [...previous, normalizedId]
    );
  };

  const handleSave = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      setError("");
      const response = await updateAdminBatch(batch._id, {
        ...form,
        studentIds: selectedStudentIds
      });
      onSaved(response?.batch || null);
    } catch (requestError) {
      const backendErrors = requestError?.response?.data?.errors;
      if (Array.isArray(backendErrors) && backendErrors.length > 0) {
        setError(backendErrors.join(" "));
      } else {
        setError(requestError?.response?.data?.message || "Unable to update batch.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 px-4 py-6 backdrop-blur-sm">
      <div className="flex max-h-[92vh] w-full max-w-5xl flex-col rounded-2xl border border-gold/25 bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-gold/15 px-6 py-5">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-gold">Edit Batch</p>
            <h3 className="mt-1 font-display text-xl text-text">{batch.name}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-text/50 transition hover:bg-gold/10 hover:text-gold disabled:opacity-50"
            aria-label="Close"
          >
            x
          </button>
        </div>

        <form className="flex-1 overflow-y-auto px-6 py-5" onSubmit={handleSave}>
          <StatusMessage type="error" text={error} className="mb-3" />

          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-xs uppercase tracking-[0.12em] text-text/65">
              Batch Name
              <input
                type="text"
                value={form.name}
                onChange={(event) =>
                  setForm((previous) => ({ ...previous, name: event.target.value }))
                }
                className="mt-2 w-full rounded-lg border border-gold/25 bg-bg/80 px-3 py-2 text-sm outline-none focus:border-gold"
                required
              />
            </label>

            <label className="text-xs uppercase tracking-[0.12em] text-text/65">
              Level
              <select
                value={form.level}
                onChange={(event) =>
                  setForm((previous) => ({ ...previous, level: event.target.value }))
                }
                className="mt-2 w-full rounded-lg border border-gold/25 bg-bg/80 px-3 py-2 text-sm outline-none focus:border-gold"
                required
              >
                {LEVEL_NAMES.map((levelName) => (
                  <option key={levelName} value={levelName}>
                    {levelName}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-xs uppercase tracking-[0.12em] text-text/65">
              Schedule Time
              <input
                type="text"
                value={form.time}
                onChange={(event) =>
                  setForm((previous) => ({ ...previous, time: event.target.value }))
                }
                placeholder="6:00 PM - 7:00 PM"
                className="mt-2 w-full rounded-lg border border-gold/25 bg-bg/80 px-3 py-2 text-sm outline-none focus:border-gold"
                required
              />
            </label>

            <label className="text-xs uppercase tracking-[0.12em] text-text/65">
              Time Zone
              <select
                value={form.timezone}
                onChange={(event) =>
                  setForm((previous) => ({ ...previous, timezone: event.target.value }))
                }
                className="mt-2 w-full rounded-lg border border-gold/25 bg-bg/80 px-3 py-2 text-sm outline-none focus:border-gold"
                required
              >
                {TIME_ZONE_OPTIONS.map((timezone) => (
                  <option key={timezone} value={timezone}>
                    {timezone}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="mt-4 block text-xs uppercase tracking-[0.12em] text-text/65">
            Meeting Link
            <input
              type="url"
              value={form.meetLink}
              onChange={(event) =>
                setForm((previous) => ({ ...previous, meetLink: event.target.value }))
              }
              className="mt-2 w-full rounded-lg border border-gold/25 bg-bg/80 px-3 py-2 text-sm outline-none focus:border-gold"
              required
            />
          </label>

          <div className="mt-4">
            <p className="text-xs uppercase tracking-[0.12em] text-text/65">Class Days</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {DAY_OPTIONS.map((dayName) => {
                const selected = form.days.includes(dayName);
                return (
                  <button
                    key={dayName}
                    type="button"
                    onClick={() => toggleDay(dayName)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                      selected
                        ? "border-gold bg-gold/15 text-gold"
                        : "border-gold/25 text-text/75 hover:border-gold hover:text-gold"
                    }`}
                  >
                    {dayName}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-gold/20 bg-bg/40 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs uppercase tracking-[0.14em] text-gold">Students</p>
              <p className="text-xs text-text/60">Selected: {selectedStudentIds.length}</p>
            </div>

            <input
              type="text"
              value={studentSearch}
              onChange={(event) => setStudentSearch(event.target.value)}
              placeholder="Search students by name, email, level, or current batch"
              className="mt-3 w-full rounded-lg border border-gold/25 bg-bg/80 px-3 py-2 text-sm outline-none focus:border-gold"
            />

            <div className="mt-3 max-h-64 space-y-2 overflow-y-auto pr-1">
              {loadingStudents ? (
                <LoadingPanel text="Loading students..." />
              ) : filteredStudents.length === 0 ? (
                <p className="rounded-lg border border-gold/10 bg-bg/30 px-3 py-2 text-sm text-text/55">
                  No students found for this search.
                </p>
              ) : (
                filteredStudents.map((student) => {
                  const studentId = String(student._id);
                  const currentBatchId = normalizeBatchId(student.batchId);
                  const currentBatchName =
                    typeof student.batchId === "object" && student.batchId
                      ? String(student.batchId.name || "")
                      : "";
                  const selected = selectedStudentIds.includes(studentId);
                  const inThisBatch = currentBatchId === String(batch._id);
                  const movingFromAnotherBatch =
                    selected && Boolean(currentBatchId) && !inThisBatch;

                  return (
                    <label
                      key={studentId}
                      className="flex cursor-pointer items-start justify-between gap-3 rounded-lg border border-gold/10 bg-bg/35 px-3 py-2.5 hover:border-gold/25"
                    >
                      <div className="flex items-start gap-2">
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => toggleStudent(studentId)}
                          className="mt-1 h-4 w-4 accent-gold"
                        />
                        <div>
                          <p className="text-sm font-medium text-text">{student.name}</p>
                          <p className="text-xs text-text/55">{student.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gold">{student.currentLevel}</p>
                        <p
                          className={`text-[11px] ${
                            movingFromAnotherBatch ? "text-amber-300" : "text-text/45"
                          }`}
                        >
                          {currentBatchName
                            ? movingFromAnotherBatch
                              ? `Will move from ${currentBatchName}`
                              : inThisBatch
                                ? "Already in this batch"
                                : currentBatchName
                            : "Unassigned"}
                        </p>
                      </div>
                    </label>
                  );
                })
              )}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving}
              className="primary-btn inline-flex min-h-[2.75rem] items-center rounded-lg px-5 text-sm font-semibold disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="secondary-btn inline-flex min-h-[2.75rem] items-center rounded-lg px-5 text-sm font-semibold disabled:opacity-60"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function BatchCard({ batch, onViewStudents, onEdit, onDelete }) {
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
          {batch.days?.join(", ")} | {batch.time} ({batch.timezone})
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
        <div className="flex w-28 flex-col gap-2">
          <button
            type="button"
            onClick={() => onEdit(batch)}
            className="rounded-xl border border-gold/35 bg-gold/10 py-2 text-xs font-semibold text-gold transition hover:bg-gold/20"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(batch)}
            className="rounded-xl border border-red-400/35 bg-red-500/8 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-500/18"
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}

function AdminBatchPage() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [levelFilter, setLevelFilter] = useState("");
  const [viewBatch, setViewBatch] = useState(null);
  const [editBatch, setEditBatch] = useState(null);
  const [deletingBatch, setDeletingBatch] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const loadBatches = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getAdminBatches(levelFilter);
      setBatches(response?.batches || []);
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
    if (!deletingBatch) {
      return;
    }

    setDeleteLoading(true);
    setDeleteError("");
    try {
      await deleteAdminBatch(deletingBatch._id);
      setBatches((previous) => previous.filter((batch) => batch._id !== deletingBatch._id));
      setSuccessMessage(`Batch "${deletingBatch.name}" deleted successfully.`);
      setDeletingBatch(null);
    } catch (_err) {
      setDeleteError("Failed to delete batch. Please try again.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleStudentRemoved = (batchId) => {
    setBatches((previous) =>
      previous.map((batch) =>
        String(batch._id) === String(batchId)
          ? { ...batch, assignedStudentCount: Math.max(0, (batch.assignedStudentCount ?? 1) - 1) }
          : batch
      )
    );
  };

  const handleBatchSaved = async (updatedBatch) => {
    if (updatedBatch?._id) {
      setBatches((previous) =>
        previous.map((batch) =>
          String(batch._id) === String(updatedBatch._id) ? { ...batch, ...updatedBatch } : batch
        )
      );
    } else {
      await loadBatches();
    }

    setEditBatch(null);
    setSuccessMessage("Batch updated successfully.");
  };

  const filteredBatches = levelFilter ? batches.filter((batch) => batch.level === levelFilter) : batches;

  return (
    <PageTransition className="space-y-6">
      <section className="rounded-2xl border border-gold/20 bg-card/80 p-6 md:p-8">
        <p className="text-xs uppercase tracking-[0.2em] text-gold">Admin</p>
        <h1 className="mt-3 font-display text-3xl text-text">Batch Management</h1>
        <p className="mt-2 text-sm text-text/65">
          View, edit, manage, and delete batches. You can update batch name, schedule, meeting
          link, and student assignment from this page.
        </p>
      </section>

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

      <StatusMessage type="success" text={successMessage} />
      <StatusMessage type="error" text={error} />

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
              onViewStudents={(item) => {
                setSuccessMessage("");
                setViewBatch(item);
              }}
              onEdit={(item) => {
                setSuccessMessage("");
                setEditBatch(item);
              }}
              onDelete={(item) => {
                setSuccessMessage("");
                setDeletingBatch(item);
                setDeleteError("");
              }}
            />
          ))}
        </div>
      )}

      {viewBatch && (
        <StudentsModal
          batchId={viewBatch._id}
          batchName={viewBatch.name}
          onClose={() => setViewBatch(null)}
          onStudentRemoved={handleStudentRemoved}
        />
      )}

      {editBatch && (
        <EditBatchModal
          batch={editBatch}
          onClose={() => setEditBatch(null)}
          onSaved={handleBatchSaved}
        />
      )}

      {deletingBatch && (
        <ConfirmDialog
          title={`Delete "${deletingBatch.name}"?`}
          body={`This will permanently delete the batch and all its scheduled sessions.\n\nStudents will be unassigned but their accounts remain intact.${deleteError ? `\n\nWarning: ${deleteError}` : ""}`}
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
