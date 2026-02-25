import { useEffect, useMemo, useState } from "react";
import {
  assignBatchStudents,
  cancelAdminSession,
  completeAdminSession,
  createAdminBatch,
  generateAdminBatchSessions,
  getAdminBatches,
  getAdminSessions,
  getAllStudents,
  rescheduleAdminSession,
  getAdminWeeklyTimetable
} from "../api/apiService";
import { useAuth } from "../context/AuthContext";
import { LEVEL_NAMES } from "../utils/levelUtils";
import LoadingPanel from "../components/LoadingPanel";
import PageTransition from "../components/PageTransition";
import StatusMessage from "../components/StatusMessage";
import WeeklyTimetableGrid from "../components/WeeklyTimetableGrid";

const DAY_OPTIONS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const TIME_ZONE_OPTIONS = [
  "IST (UTC+5:30)",
  "GMT (UTC+0)",
  "EST (UTC-5)",
  "PST (UTC-8)",
  "SGT (UTC+8)",
  "AEST (UTC+10)"
];

const toDateInputValue = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(date);
};

const normalizeStudentRecord = (student) => {
  const populatedBatch =
    student?.batchId && typeof student.batchId === "object" ? student.batchId : student?.currentBatch || null;
  const normalizedBatchId =
    populatedBatch?._id || (typeof student?.batchId === "string" ? student.batchId : null);

  return {
    ...student,
    batchId: normalizedBatchId ? String(normalizedBatchId) : null,
    currentBatch: populatedBatch
      ? {
          _id: String(populatedBatch._id),
          name: populatedBatch.name,
          level: populatedBatch.level
        }
      : null
  };
};

function RefreshIcon({ spinning = false }) {
  return (
    <svg
      className={`h-3.5 w-3.5 ${spinning ? "animate-spin" : ""}`}
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function AdminTimetablePage() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [batches, setBatches] = useState([]);
  const [students, setStudents] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [editingSession, setEditingSession] = useState({});
  const [busyAction, setBusyAction] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [serverMessage, setServerMessage] = useState(null);
  const [weeklySlots, setWeeklySlots] = useState([]);
  const [weeklyLoading, setWeeklyLoading] = useState(true);
  const [weeklyGridVisible, setWeeklyGridVisible] = useState(true);

  const [batchForm, setBatchForm] = useState({
    name: "",
    level: "Pawn",
    days: ["Monday", "Wednesday", "Friday"],
    time: "6:00 PM - 7:00 PM",
    timezone: "IST (UTC+5:30)",
    meetLink: "https://meet.google.com/sfq-sdqn-jic?pli=1"
  });

  const [generationForm, setGenerationForm] = useState({
    daysAhead: 30,
    limit: 10
  });

  const isAdmin = profile?.user?.role === "admin";

  const selectedBatch = useMemo(
    () => batches.find((batch) => String(batch._id) === String(selectedBatchId)) || null,
    [batches, selectedBatchId]
  );

  const filteredStudents = useMemo(() => {
    const term = studentSearch.trim().toLowerCase();
    if (!term) {
      return students;
    }

    return students.filter((student) => {
      const name = String(student.name || "").toLowerCase();
      const level = String(student.currentLevel || "").toLowerCase();
      const email = String(student.email || "").toLowerCase();
      const currentBatchName = String(student.currentBatch?.name || "").toLowerCase();
      return (
        name.includes(term) ||
        level.includes(term) ||
        email.includes(term) ||
        currentBatchName.includes(term)
      );
    });
  }, [students, studentSearch]);

  const selectedStudentIdSet = useMemo(
    () => new Set(selectedStudents.map((studentId) => String(studentId))),
    [selectedStudents]
  );

  const studentOptionLabel = (student) => {
    const batchName = student.currentBatch?.name || "Unassigned";
    return `${student.name} - ${student.currentLevel} - ${batchName}`;
  };

  const loadBatches = async () => {
    const response = await getAdminBatches();
    const nextBatches = response?.batches || [];
    setBatches(nextBatches);
    return nextBatches;
  };

  const loadStudents = async () => {
    const response = await getAllStudents();
    const nextStudentsRaw = Array.isArray(response) ? response : response?.students || [];
    const nextStudents = nextStudentsRaw.map((student) => normalizeStudentRecord(student));
    setStudents(nextStudents);
    return nextStudents;
  };

  const loadSessions = async (batchId) => {
    if (!batchId) {
      setSessions([]);
      return;
    }
    const response = await getAdminSessions({ batchId });
    setSessions(response?.sessions || []);
  };

  const loadWeekly = async () => {
    try {
      setWeeklyLoading(true);
      const response = await getAdminWeeklyTimetable();
      setWeeklySlots(response?.slots || []);
    } catch (_error) {
      // Non-fatal — weekly grid just stays empty
      setWeeklySlots([]);
    } finally {
      setWeeklyLoading(false);
    }
  };

  useEffect(() => {
    const loadInitial = async () => {
      try {
        setLoading(true);
        setErrorMessage("");
        const [nextBatches] = await Promise.all([loadBatches(), loadStudents()]);
        if (nextBatches.length > 0) {
          const firstBatchId = String(nextBatches[0]._id);
          setSelectedBatchId(firstBatchId);
          await loadSessions(firstBatchId);
        }
      } catch (_error) {
        setErrorMessage("Unable to load timetable admin panel right now.");
      } finally {
        setLoading(false);
      }
    };

    loadInitial();
    loadWeekly();
  }, []);

  useEffect(() => {
    if (!selectedBatchId) {
      setSelectedStudents([]);
      return;
    }

    const assignedIds = students
      .filter((student) => String(student.batchId || "") === String(selectedBatchId))
      .map((student) => String(student._id));

    setSelectedStudents(assignedIds);
  }, [selectedBatchId, students]);

  const handleBatchDayToggle = (day) => {
    setBatchForm((previous) => {
      const exists = previous.days.includes(day);
      return {
        ...previous,
        days: exists ? previous.days.filter((item) => item !== day) : [...previous.days, day]
      };
    });
  };

  const handleCreateBatch = async (event) => {
    event.preventDefault();
    try {
      setBusyAction("create-batch");
      setErrorMessage("");
      await createAdminBatch(batchForm);
      setServerMessage({ type: "success", text: "Batch created successfully." });
      const nextBatches = await loadBatches();
      if (nextBatches.length > 0) {
        const latestBatch = nextBatches[nextBatches.length - 1];
        setSelectedBatchId(String(latestBatch._id));
        await loadSessions(String(latestBatch._id));
      }
      setBatchForm((previous) => ({ ...previous, name: "" }));
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || "Unable to create batch.");
    } finally {
      setBusyAction("");
    }
  };

  const handleAssignStudents = async () => {
    if (!selectedBatchId) {
      return;
    }

    try {
      setBusyAction("assign-students");
      setErrorMessage("");
      await assignBatchStudents(selectedBatchId, selectedStudents);
      setServerMessage({
        type: "success",
        text: `Student assignment saved (${selectedStudents.length} assigned).`
      });
      await Promise.all([loadBatches(), loadStudents()]);
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || "Unable to assign students.");
    } finally {
      setBusyAction("");
    }
  };

  const handleDropdownStudentSelect = (studentId) => {
    const normalizedId = String(studentId || "").trim();
    if (!normalizedId) {
      return;
    }

    setSelectedStudents((previous) => {
      if (previous.includes(normalizedId)) {
        return previous;
      }
      return [...previous, normalizedId];
    });
  };

  const handleGenerateSessions = async () => {
    if (!selectedBatchId) {
      return;
    }

    try {
      setBusyAction("generate-sessions");
      setErrorMessage("");
      const response = await generateAdminBatchSessions(selectedBatchId, {
        daysAhead: Number(generationForm.daysAhead),
        limit: Number(generationForm.limit)
      });
      setServerMessage({
        type: "success",
        text: response?.message || "Sessions generated successfully."
      });
      await loadSessions(selectedBatchId);
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || "Unable to generate sessions.");
    } finally {
      setBusyAction("");
    }
  };

  const handleSessionStatus = async (sessionId, action) => {
    try {
      setBusyAction(`${action}-${sessionId}`);
      setErrorMessage("");

      if (action === "complete") {
        await completeAdminSession(sessionId);
      } else {
        await cancelAdminSession(sessionId);
      }

      setServerMessage({
        type: "success",
        text: action === "complete" ? "Session marked completed." : "Session cancelled."
      });
      await loadSessions(selectedBatchId);
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || "Unable to update session.");
    } finally {
      setBusyAction("");
    }
  };

  const handleEditSessionField = (sessionId, field, value) => {
    setEditingSession((previous) => ({
      ...previous,
      [sessionId]: {
        ...previous[sessionId],
        [field]: value
      }
    }));
  };

  const getSessionDraft = (session) => {
    const existing = editingSession[session._id];
    if (existing) {
      return existing;
    }
    return {
      date: toDateInputValue(session.date),
      startTime: session.startTime,
      endTime: session.endTime,
      meetLink: session.meetLink
    };
  };

  const handleReschedule = async (session) => {
    const draft = getSessionDraft(session);

    try {
      setBusyAction(`reschedule-${session._id}`);
      setErrorMessage("");
      await rescheduleAdminSession(session._id, {
        date: draft.date,
        startTime: draft.startTime,
        endTime: draft.endTime,
        meetLink: draft.meetLink
      });
      setServerMessage({ type: "success", text: "Session rescheduled." });
      await loadSessions(selectedBatchId);
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || "Unable to reschedule session.");
    } finally {
      setBusyAction("");
    }
  };

  if (loading) {
    return <LoadingPanel text="Loading timetable management..." />;
  }

  if (!isAdmin) {
    return (
      <PageTransition className="rounded-2xl border border-gold/20 bg-card/80 p-6 md:p-8">
        <h1 className="font-display text-2xl">Access denied</h1>
        <p className="mt-3 text-sm text-text/80">Only admins can manage timetable settings.</p>
      </PageTransition>
    );
  }

  return (
    <PageTransition className="space-y-6 text-left">
      <section className="rounded-2xl border border-gold/20 bg-card/80 p-6 md:p-8">
        <p className="text-xs uppercase tracking-[0.2em] text-gold">Admin Timetable</p>
        <h1 className="mt-3 font-display text-[clamp(1.8rem,2.6vw,2.8rem)]">Batch & Session Control</h1>
        <StatusMessage type={serverMessage?.type || "info"} text={serverMessage?.text} className="mt-4" />
        <StatusMessage type="error" text={errorMessage} className="mt-4" />
      </section>

      {/* ─── Weekly Timetable Grid ─── */}
      <section className="rounded-2xl border border-gold/20 bg-card/80 p-6 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-gold/70">Overview</p>
            <h2 className="mt-1 font-display text-2xl text-text">Weekly Timetable</h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={loadWeekly}
              disabled={weeklyLoading}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gold/20 px-3 py-2 text-xs font-semibold text-text/70 transition-all duration-150 hover:border-gold/40 hover:text-text disabled:opacity-40"
            >
              <RefreshIcon spinning={weeklyLoading} />
              Refresh
            </button>
            <button
              type="button"
              onClick={() => setWeeklyGridVisible((v) => !v)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gold/20 px-3 py-2 text-xs font-semibold text-text/70 transition-all duration-150 hover:border-gold/40 hover:text-text"
            >
              {weeklyGridVisible ? "Hide" : "Show"} Grid
            </button>
          </div>
        </div>

        {weeklyGridVisible && (
          <div className="mt-5">
            <WeeklyTimetableGrid slots={weeklySlots} loading={weeklyLoading} />
            {!weeklyLoading && weeklySlots.length > 0 && (
              <p className="mt-2 text-right text-[11px] uppercase tracking-[0.1em] text-text/35">
                {weeklySlots.length} scheduled slot{weeklySlots.length !== 1 ? "s" : ""} across all batches
              </p>
            )}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-gold/20 bg-card/80 p-6 md:p-8">
        <h2 className="font-display text-2xl text-gold">Create Batch</h2>
        <form className="mt-4 grid gap-4 md:grid-cols-2" onSubmit={handleCreateBatch}>
          <label className="text-sm text-text/80">
            Batch Name
            <input
              type="text"
              required
              value={batchForm.name}
              onChange={(event) => setBatchForm((prev) => ({ ...prev, name: event.target.value }))}
              className="mt-2 w-full rounded-lg border border-gold/20 bg-bg/70 px-3 py-2.5 text-sm outline-none focus:border-gold"
            />
          </label>

          <label className="text-sm text-text/80">
            Level
            <select
              value={batchForm.level}
              onChange={(event) => setBatchForm((prev) => ({ ...prev, level: event.target.value }))}
              className="mt-2 w-full rounded-lg border border-gold/20 bg-bg/70 px-3 py-2.5 text-sm outline-none focus:border-gold"
            >
              {LEVEL_NAMES.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm text-text/80">
            Time
            <input
              type="text"
              required
              value={batchForm.time}
              onChange={(event) => setBatchForm((prev) => ({ ...prev, time: event.target.value }))}
              placeholder="6:00 PM - 7:00 PM"
              className="mt-2 w-full rounded-lg border border-gold/20 bg-bg/70 px-3 py-2.5 text-sm outline-none focus:border-gold"
            />
          </label>

          <label className="text-sm text-text/80">
            Timezone
            <select
              value={batchForm.timezone}
              onChange={(event) => setBatchForm((prev) => ({ ...prev, timezone: event.target.value }))}
              className="mt-2 w-full rounded-lg border border-gold/20 bg-bg/70 px-3 py-2.5 text-sm outline-none focus:border-gold"
            >
              {TIME_ZONE_OPTIONS.map((zone) => (
                <option key={zone} value={zone}>
                  {zone}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm text-text/80 md:col-span-2">
            Meet Link
            <input
              type="url"
              required
              value={batchForm.meetLink}
              onChange={(event) => setBatchForm((prev) => ({ ...prev, meetLink: event.target.value }))}
              className="mt-2 w-full rounded-lg border border-gold/20 bg-bg/70 px-3 py-2.5 text-sm outline-none focus:border-gold"
            />
          </label>

          <div className="md:col-span-2">
            <p className="mb-2 text-sm text-text/80">Days</p>
            <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {DAY_OPTIONS.map((day) => (
                <label
                  key={day}
                  className="inline-flex items-center gap-2 rounded-lg border border-gold/20 bg-bg/55 px-3 py-2 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={batchForm.days.includes(day)}
                    onChange={() => handleBatchDayToggle(day)}
                    className="accent-gold"
                  />
                  {day}
                </label>
              ))}
            </div>
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={busyAction === "create-batch"}
              className="primary-btn inline-flex min-h-[2.75rem] items-center rounded-lg px-5 text-sm font-semibold disabled:opacity-60"
            >
              {busyAction === "create-batch" ? "Creating..." : "Create Batch"}
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-2xl border border-gold/20 bg-card/80 p-6 md:p-8">
        <h2 className="font-display text-2xl text-gold">Manage Batch</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="text-sm text-text/80">
            Select Batch
            <select
              value={selectedBatchId}
              onChange={async (event) => {
                const nextBatchId = event.target.value;
                setSelectedBatchId(nextBatchId);
                await Promise.all([loadSessions(nextBatchId), loadStudents()]);
              }}
              className="mt-2 w-full rounded-lg border border-gold/20 bg-bg/70 px-3 py-2.5 text-sm outline-none focus:border-gold"
            >
              {batches.length === 0 ? <option value="">No batches available</option> : null}
              {batches.map((batch) => (
                <option key={batch._id} value={batch._id}>
                  {batch.name} ({batch.level})
                </option>
              ))}
            </select>
          </label>

          <div className="rounded-lg border border-gold/15 bg-bg/45 p-3 text-sm text-text/75">
            {selectedBatch ? (
              <>
                <p className="font-semibold text-text">
                  {selectedBatch.name} - {selectedBatch.level}
                </p>
                <p className="mt-1">
                  {selectedBatch.days.join(", ")} | {selectedBatch.time} ({selectedBatch.timezone})
                </p>
                <p className="mt-1 text-xs uppercase tracking-[0.12em] text-gold/85">
                  Assigned Students: {selectedStudents.length}
                </p>
              </>
            ) : (
              <p>Select a batch to manage timetable and students.</p>
            )}
          </div>
        </div>

        {selectedBatch ? (
          <>
            <div className="mt-6">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h3 className="font-display text-xl">Assign Students</h3>
                  <p className="mt-1 text-xs uppercase tracking-[0.12em] text-text/60">
                    Source of truth: student.batchId
                  </p>
                </div>
                <div className="rounded-lg border border-gold/20 bg-bg/55 px-3 py-2 text-right">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-text/60">Selected</p>
                  <p className="font-display text-lg text-gold">{selectedStudents.length}</p>
                </div>
              </div>

              <label className="mt-4 block text-sm text-text/80">
                Select Student (Dropdown)
                <select
                  value=""
                  onChange={(event) => handleDropdownStudentSelect(event.target.value)}
                  className="mt-2 w-full rounded-lg border border-gold/20 bg-bg/70 px-3 py-2.5 text-sm outline-none transition-colors focus:border-gold"
                >
                  <option value="">Choose a student</option>
                  {students.map((student) => (
                    <option key={student._id} value={String(student._id)}>
                      {studentOptionLabel(student)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="mt-4 block text-sm text-text/80">
                Search Students
                <input
                  type="text"
                  value={studentSearch}
                  onChange={(event) => setStudentSearch(event.target.value)}
                  placeholder="Search by name, level, email, or current batch"
                  className="mt-2 w-full rounded-lg border border-gold/20 bg-bg/70 px-3 py-2.5 text-sm outline-none transition-colors focus:border-gold"
                />
              </label>

              <p className="mt-2 text-xs text-text/60">
                Showing {filteredStudents.length} of {students.length} students.
              </p>

              <div className="mt-3 max-h-[28rem] overflow-y-auto pr-1">
                {filteredStudents.length === 0 ? (
                  <p className="rounded-lg border border-gold/15 bg-bg/55 px-3 py-3 text-sm text-text/70">
                    No students found for this search.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {filteredStudents.map((student) => {
                      const studentId = String(student._id);
                      const currentBatchId = student.batchId ? String(student.batchId) : "";
                      const isChecked = selectedStudentIdSet.has(studentId);
                      const inAnotherBatch =
                        Boolean(currentBatchId) && currentBatchId !== String(selectedBatchId);

                      return (
                        <label
                          key={student._id}
                          className={`flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 text-sm transition-all duration-200 ${
                            isChecked
                              ? "border-gold/45 bg-gold/10 shadow-[0_0_0_1px_rgba(212,175,55,0.15)]"
                              : "border-gold/15 bg-bg/55 hover:border-gold/30"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(event) => {
                              setSelectedStudents((previous) => {
                                if (event.target.checked) {
                                  return [...new Set([...previous, studentId])];
                                }
                                return previous.filter((item) => item !== studentId);
                              });
                            }}
                            className="mt-0.5 h-4 w-4 accent-gold"
                          />

                          <div className="min-w-0 flex-1">
                            <p className="truncate font-semibold text-text">{student.name}</p>
                            <p className="mt-0.5 text-xs text-text/65">
                              Level: {student.currentLevel} | Topic: {student.currentTopic}
                            </p>
                            <p className="mt-0.5 text-xs text-text/65">
                              Current Batch: {student.currentBatch?.name || "Unassigned"}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            {inAnotherBatch ? (
                              <span
                                className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-amber-300/60 bg-amber-300/10 text-xs text-amber-300"
                                title="Assigned to another batch. Selecting will reassign."
                              >
                                !
                              </span>
                            ) : null}
                            {isChecked ? (
                              <span className="rounded-full border border-gold/40 bg-gold/12 px-2 py-0.5 text-[11px] uppercase tracking-[0.08em] text-gold">
                                Selected
                              </span>
                            ) : null}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleAssignStudents}
                disabled={busyAction === "assign-students"}
                className="secondary-btn mt-4 inline-flex min-h-[2.6rem] items-center rounded-lg px-4 text-xs font-semibold disabled:opacity-60"
              >
                {busyAction === "assign-students" ? "Saving..." : "Save Student Assignment"}
              </button>
            </div>

            <div className="mt-8">
              <h3 className="font-display text-xl">Generate Next Sessions</h3>
              <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <label className="text-sm text-text/80">
                  Days Ahead
                  <input
                    type="number"
                    min="1"
                    max="90"
                    value={generationForm.daysAhead}
                    onChange={(event) =>
                      setGenerationForm((prev) => ({ ...prev, daysAhead: event.target.value }))
                    }
                    className="mt-2 w-full rounded-lg border border-gold/20 bg-bg/70 px-3 py-2.5 text-sm outline-none focus:border-gold"
                  />
                </label>
                <label className="text-sm text-text/80">
                  Session Count
                  <input
                    type="number"
                    min="8"
                    max="12"
                    value={generationForm.limit}
                    onChange={(event) => setGenerationForm((prev) => ({ ...prev, limit: event.target.value }))}
                    className="mt-2 w-full rounded-lg border border-gold/20 bg-bg/70 px-3 py-2.5 text-sm outline-none focus:border-gold"
                  />
                </label>
              </div>
              <button
                type="button"
                onClick={handleGenerateSessions}
                disabled={busyAction === "generate-sessions"}
                className="primary-btn mt-4 inline-flex min-h-[2.7rem] items-center rounded-lg px-4 text-xs font-semibold disabled:opacity-60"
              >
                {busyAction === "generate-sessions" ? "Generating..." : "Generate Sessions"}
              </button>
            </div>
          </>
        ) : null}
      </section>

      <section className="rounded-2xl border border-gold/20 bg-card/80 p-6 md:p-8">
        <h2 className="font-display text-2xl text-gold">Sessions</h2>
        {sessions.length === 0 ? (
          <p className="mt-3 text-sm text-text/70">No sessions available for this batch yet.</p>
        ) : (
          <div className="mt-4 space-y-4">
            {sessions.map((session) => {
              const draft = getSessionDraft(session);
              return (
                <article key={session._id} className="rounded-xl border border-gold/15 bg-bg/50 p-4 text-left">
                  <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
                    <div>
                      <p className="text-xs uppercase tracking-[0.14em] text-gold">{formatDate(session.date)}</p>
                      <h3 className="mt-1 font-display text-xl">Topic {session.topic}</h3>
                      <p className="mt-1 text-sm text-text/80">
                        {session.startTime} - {session.endTime}
                      </p>
                      <p className="mt-1 text-xs uppercase tracking-[0.12em] text-text/60">
                        Status: {session.status}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleSessionStatus(session._id, "complete")}
                        disabled={busyAction === `complete-${session._id}`}
                        className="primary-btn inline-flex min-h-[2.4rem] items-center rounded-lg px-3 text-xs font-semibold disabled:opacity-60"
                      >
                        Complete
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSessionStatus(session._id, "cancel")}
                        disabled={busyAction === `cancel-${session._id}`}
                        className="secondary-btn inline-flex min-h-[2.4rem] items-center rounded-lg px-3 text-xs font-semibold disabled:opacity-60"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                    <label className="text-xs text-text/70">
                      Date
                      <input
                        type="date"
                        value={draft.date}
                        onChange={(event) => handleEditSessionField(session._id, "date", event.target.value)}
                        className="mt-1 w-full rounded-lg border border-gold/20 bg-bg/70 px-2 py-2 text-xs outline-none focus:border-gold"
                      />
                    </label>
                    <label className="text-xs text-text/70">
                      Start Time
                      <input
                        type="text"
                        value={draft.startTime}
                        onChange={(event) =>
                          handleEditSessionField(session._id, "startTime", event.target.value)
                        }
                        className="mt-1 w-full rounded-lg border border-gold/20 bg-bg/70 px-2 py-2 text-xs outline-none focus:border-gold"
                      />
                    </label>
                    <label className="text-xs text-text/70">
                      End Time
                      <input
                        type="text"
                        value={draft.endTime}
                        onChange={(event) => handleEditSessionField(session._id, "endTime", event.target.value)}
                        className="mt-1 w-full rounded-lg border border-gold/20 bg-bg/70 px-2 py-2 text-xs outline-none focus:border-gold"
                      />
                    </label>
                    <label className="text-xs text-text/70">
                      Meet Link
                      <input
                        type="url"
                        value={draft.meetLink}
                        onChange={(event) => handleEditSessionField(session._id, "meetLink", event.target.value)}
                        className="mt-1 w-full rounded-lg border border-gold/20 bg-bg/70 px-2 py-2 text-xs outline-none focus:border-gold"
                      />
                    </label>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleReschedule(session)}
                    disabled={busyAction === `reschedule-${session._id}`}
                    className="secondary-btn mt-4 inline-flex min-h-[2.5rem] items-center rounded-lg px-4 text-xs font-semibold disabled:opacity-60"
                  >
                    {busyAction === `reschedule-${session._id}` ? "Saving..." : "Reschedule Session"}
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </PageTransition>
  );
}

export default AdminTimetablePage;
