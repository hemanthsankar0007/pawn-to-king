import { useEffect, useMemo, useState } from "react";
import {
  approveAdminApplication,
  getAdminApplications,
  getAdminBatches,
  getAdminStudents,
  rejectAdminApplication,
  resetAdminStudentPassword,
  unlockAdminStudentNextLevel,
  updateAdminStudentLevel,
  updateAdminStudentTopic
} from "../api/apiService";
import { useAuth } from "../context/AuthContext";
import { LEVEL_NAMES } from "../utils/levelUtils";
import LoadingPanel from "../components/LoadingPanel";
import PageTransition from "../components/PageTransition";
import StatusMessage from "../components/StatusMessage";

function AdminPage() {
  const { profile } = useAuth();
  const [applications, setApplications] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentLevelFilter, setStudentLevelFilter] = useState("All");
  const [fieldState, setFieldState] = useState({});
  const [serverMessage, setServerMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [busyId, setBusyId] = useState("");
  const [batches, setBatches] = useState([]);
  const [pendingApproval, setPendingApproval] = useState(null);
  const [approvalForm, setApprovalForm] = useState({
    level: "",
    batchId: "",
    finalDays: [],
    finalTime: "",
    finalTimezone: ""
  });
  const [approvalPassword, setApprovalPassword] = useState("");
  const [approvalBusy, setApprovalBusy] = useState(false);

  const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const TIMEZONE_OPTIONS = [
    "IST (UTC+5:30)",
    "GMT (UTC+0)",
    "EST (UTC-5)",
    "PST (UTC-8)",
    "SGT (UTC+8)",
    "AEST (UTC+10)"
  ];

  const isAdmin = profile?.user?.role === "admin";

  const saveFieldState = (studentId, patch) => {
    setFieldState((previous) => ({
      ...previous,
      [studentId]: {
        ...previous[studentId],
        ...patch
      }
    }));
  };

  const fetchBatches = async () => {
    try {
      const response = await getAdminBatches();
      setBatches(response?.batches || []);
    } catch (_error) {
      // non-critical; batches list just stays empty
    }
  };

  const fetchApplications = async () => {
    const response = await getAdminApplications("pending");
    setApplications(response?.applications || []);
  };

  const fetchStudents = async (level = "All") => {
    const response = await getAdminStudents(level);
    const nextStudents = response?.students || [];
    setStudents(nextStudents);

    setFieldState((previous) => {
      const merged = { ...previous };
      nextStudents.forEach((student) => {
        merged[student._id] = {
          level: previous[student._id]?.level || student.currentLevel,
          topic: previous[student._id]?.topic || String(student.currentTopic)
        };
      });
      return merged;
    });
  };

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        setErrorMessage("");
        await Promise.all([fetchApplications(), fetchStudents(studentLevelFilter), fetchBatches()]);
      } catch (_error) {
        setErrorMessage("Unable to load admin dashboard right now.");
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  useEffect(() => {
    if (loading) {
      return;
    }

    const reloadStudents = async () => {
      try {
        await fetchStudents(studentLevelFilter);
      } catch (_error) {
        setErrorMessage("Unable to load students right now.");
      }
    };

    reloadStudents();
  }, [studentLevelFilter]);

  const openApprovalModal = (application) => {
    const firstSlot = application.preferredTimeSlots?.[0];
    const defaultTime = firstSlot ? `${firstSlot.start} \u2013 ${firstSlot.end}` : "";
    setApprovalForm({
      level: application.assignedLevel,
      batchId: "",
      finalDays: application.preferredDays || [],
      finalTime: defaultTime,
      finalTimezone: application.timeZone || ""
    });
    setApprovalPassword("");
    setPendingApproval(application);
  };

  const handleApprovalSubmit = async () => {
    if (!pendingApproval) return;
    try {
      setApprovalBusy(true);
      setErrorMessage("");
      const response = await approveAdminApplication(pendingApproval._id, {
        level: approvalForm.level,
        batchId: approvalForm.batchId || null,
        finalDays: approvalForm.finalDays,
        finalTime: approvalForm.finalTime,
        finalTimezone: approvalForm.finalTimezone
      });
      const tempPwd = response?.temporaryPassword || "generated";
      setApprovalPassword(tempPwd);
      setServerMessage({
        type: "success",
        text: `Student created. Temporary password: ${tempPwd}`
      });
      setPendingApproval(null);
      await Promise.all([fetchApplications(), fetchStudents(studentLevelFilter)]);
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || "Unable to approve application.");
    } finally {
      setApprovalBusy(false);
    }
  };

  const handleReject = async (applicationId) => {
    try {
      setBusyId(`reject-${applicationId}`);
      setErrorMessage("");
      await rejectAdminApplication(applicationId);
      setServerMessage({ type: "info", text: "Application rejected." });
      await fetchApplications();
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || "Unable to reject application.");
    } finally {
      setBusyId("");
    }
  };

  const handleLevelUpdate = async (studentId) => {
    try {
      setBusyId(`level-${studentId}`);
      setErrorMessage("");
      const level = fieldState[studentId]?.level;
      await updateAdminStudentLevel(studentId, level);
      setServerMessage({ type: "success", text: "Student level updated." });
      await fetchStudents(studentLevelFilter);
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || "Unable to update level.");
    } finally {
      setBusyId("");
    }
  };

  const handleUnlockLevel = async (studentId) => {
    try {
      setBusyId(`unlock-${studentId}`);
      setErrorMessage("");
      await unlockAdminStudentNextLevel(studentId);
      setServerMessage({ type: "success", text: "Next level unlocked." });
      await fetchStudents(studentLevelFilter);
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || "Unable to unlock next level.");
    } finally {
      setBusyId("");
    }
  };

  const handleTopicUpdate = async (studentId) => {
    try {
      setBusyId(`topic-${studentId}`);
      setErrorMessage("");
      const topic = Number(fieldState[studentId]?.topic);
      await updateAdminStudentTopic(studentId, topic);
      setServerMessage({ type: "success", text: "Current topic updated." });
      await fetchStudents(studentLevelFilter);
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || "Unable to update topic.");
    } finally {
      setBusyId("");
    }
  };

  const handleResetPassword = async (studentId) => {
    try {
      setBusyId(`password-${studentId}`);
      setErrorMessage("");
      const response = await resetAdminStudentPassword(studentId);
      setServerMessage({
        type: "warning",
        text: `Password reset. Temporary password: ${response?.temporaryPassword || "generated"}`
      });
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || "Unable to reset password.");
    } finally {
      setBusyId("");
    }
  };

  const levelOptions = useMemo(() => ["All", ...LEVEL_NAMES], []);

  if (loading) {
    return <LoadingPanel text="Loading admin dashboard..." />;
  }

  if (!isAdmin) {
    return (
      <PageTransition className="rounded-2xl border border-gold/20 bg-card/80 p-6 md:p-8">
        <h1 className="font-display text-2xl">Access denied</h1>
        <p className="mt-3 text-sm text-text/80">Only admins can access this panel.</p>
      </PageTransition>
    );
  }

  return (
    <PageTransition className="space-y-6">
      <section className="rounded-2xl border border-gold/20 bg-card/80 p-6 md:p-8">
        <p className="text-xs uppercase tracking-[0.2em] text-gold">Admin Panel</p>
        <h1 className="mt-3 font-display text-3xl">Applications & Student Management</h1>
        <StatusMessage
          type={serverMessage?.type || "info"}
          text={serverMessage?.text}
          className="mt-4"
        />
        <StatusMessage type="error" text={errorMessage} className="mt-4" />
      </section>

      <section className="rounded-2xl border border-gold/20 bg-card/80 p-6 md:p-8">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-2xl">Pending Applications</h2>
          <span className="rounded-full border border-gold/35 px-3 py-1 text-xs text-gold">
            {applications.length} Pending
          </span>
        </div>

        {applications.length === 0 ? (
          <p className="mt-4 text-sm text-text/75">No pending applications.</p>
        ) : (
          <div className="mt-5 space-y-4">
            {applications.map((application) => (
              <article
                key={application._id}
                className="rounded-xl border border-gold/20 bg-bg/40 p-4 md:p-5"
              >
                <div className="grid gap-2 text-sm text-text/80 md:grid-cols-2">
                  <p>
                    <span className="text-text/60">Name:</span> {application.fullName}
                  </p>
                  <p>
                    <span className="text-text/60">Email:</span> {application.email}
                  </p>
                  <p>
                    <span className="text-text/60">Age:</span> {application.age}
                  </p>
                  <p>
                    <span className="text-text/60">Phone:</span> {application.phone}
                  </p>
                  <p>
                    <span className="text-text/60">Chess.com:</span>{" "}
                    {application.chessComRating ?? "N/A"}
                  </p>
                  <p>
                    <span className="text-text/60">FIDE:</span> {application.fideRating ?? "N/A"}
                  </p>
                  <p>
                    <span className="text-text/60">Assigned Level:</span>{" "}
                    <span className="font-semibold text-gold">{application.assignedLevel}</span>
                  </p>
                  <p>
                    <span className="text-text/60">Applied:</span>{" "}
                    {new Date(application.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="mt-3 rounded-lg border border-gold/15 bg-bg/30 p-3 text-sm">
                    <p className="mb-2 text-xs uppercase tracking-wider text-gold">Preferred Schedule</p>
                    <div className="grid gap-1.5 sm:grid-cols-3">
                      <div>
                        <p className="text-xs text-text/55">Days</p>
                        <p className="text-text/90">
                          {application.preferredDays?.length > 0
                            ? application.preferredDays.join(", ")
                            : <span className="italic text-text/40">Not provided</span>}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-text/55">Time Slots</p>
                        {application.preferredTimeSlots?.length > 0
                          ? application.preferredTimeSlots.map((slot, idx) => (
                              <p key={idx} className="text-text/90">
                                {slot.start} &ndash; {slot.end}
                              </p>
                            ))
                          : <p className="italic text-text/40">Not provided</p>}
                      </div>
                      <div>
                        <p className="text-xs text-text/55">Timezone</p>
                        <p className="text-text/90">
                          {application.timeZone || <span className="italic text-text/40">Not provided</span>}
                        </p>
                      </div>
                    </div>
                  </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => openApprovalModal(application)}
                    className="primary-btn inline-flex min-h-[2.75rem] items-center rounded-lg px-4 text-xs font-semibold"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReject(application._id)}
                    disabled={busyId === `reject-${application._id}`}
                    className="secondary-btn inline-flex min-h-[2.75rem] items-center rounded-lg px-4 text-xs font-semibold disabled:opacity-60"
                  >
                    {busyId === `reject-${application._id}` ? "Rejecting..." : "Reject"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-gold/20 bg-card/80 p-6 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-2xl">Students</h2>
          <label className="flex items-center gap-2 text-sm text-text/75">
            Filter by Level
            <select
              value={studentLevelFilter}
              onChange={(event) => setStudentLevelFilter(event.target.value)}
              className="rounded-lg border border-gold/25 bg-bg/80 px-3 py-2 text-sm outline-none focus:border-gold"
            >
              {levelOptions.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-gold/20 text-left text-text/70">
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Level</th>
                <th className="px-3 py-2">Topic</th>
                <th className="px-3 py-2">Rating</th>
                <th className="px-3 py-2">Progress</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student._id} className="border-b border-gold/10 align-top">
                  <td className="px-3 py-3">
                    <p className="font-medium text-text">{student.name}</p>
                    <p className="text-xs text-text/60">{student.email}</p>
                  </td>
                  <td className="px-3 py-3">
                    <p className="font-semibold text-gold">{student.currentLevel}</p>
                    <select
                      value={fieldState[student._id]?.level || student.currentLevel}
                      onChange={(event) =>
                        saveFieldState(student._id, { level: event.target.value })
                      }
                      className="mt-2 w-full rounded-lg border border-gold/25 bg-bg/80 px-2 py-1.5 text-xs outline-none focus:border-gold"
                    >
                      {LEVEL_NAMES.map((level) => (
                        <option key={level} value={level}>
                          {level}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => handleLevelUpdate(student._id)}
                      disabled={busyId === `level-${student._id}`}
                      className="secondary-btn mt-2 inline-flex min-h-[2.2rem] items-center rounded-lg px-3 text-xs disabled:opacity-60"
                    >
                      Set Level
                    </button>
                  </td>
                  <td className="px-3 py-3">
                    <p>{student.currentTopic}</p>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={fieldState[student._id]?.topic || String(student.currentTopic)}
                      onChange={(event) =>
                        saveFieldState(student._id, { topic: event.target.value })
                      }
                      className="mt-2 w-full rounded-lg border border-gold/25 bg-bg/80 px-2 py-1.5 text-xs outline-none focus:border-gold"
                    />
                    <button
                      type="button"
                      onClick={() => handleTopicUpdate(student._id)}
                      disabled={busyId === `topic-${student._id}`}
                      className="secondary-btn mt-2 inline-flex min-h-[2.2rem] items-center rounded-lg px-3 text-xs disabled:opacity-60"
                    >
                      Update Topic
                    </button>
                  </td>
                  <td className="px-3 py-3">{student.chessRating ?? "N/A"}</td>
                  <td className="px-3 py-3">{student.progressPercentage}%</td>
                  <td className="space-y-2 px-3 py-3">
                    <button
                      type="button"
                      onClick={() => handleUnlockLevel(student._id)}
                      disabled={busyId === `unlock-${student._id}`}
                      className="primary-btn inline-flex min-h-[2.2rem] w-full items-center justify-center rounded-lg px-3 text-xs disabled:opacity-60"
                    >
                      Unlock Next Level
                    </button>
                    <button
                      type="button"
                      onClick={() => handleResetPassword(student._id)}
                      disabled={busyId === `password-${student._id}`}
                      className="secondary-btn inline-flex min-h-[2.2rem] w-full items-center justify-center rounded-lg px-3 text-xs disabled:opacity-60"
                    >
                      Reset Password
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      {pendingApproval && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-gold/30 bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl text-gold">Finalize Enrollment</h3>
              <button
                type="button"
                onClick={() => setPendingApproval(null)}
                className="text-text/50 hover:text-text"
              >
                &#x2715;
              </button>
            </div>

            <p className="mt-1 text-xs text-text/60">
              {pendingApproval.fullName} &mdash; {pendingApproval.email}
            </p>

            <div className="mt-4 space-y-4 text-sm">
              <div>
                <label className="mb-1 block text-xs uppercase tracking-wider text-text/65">
                  Confirm Level
                </label>
                <select
                  value={approvalForm.level}
                  onChange={(e) => setApprovalForm((prev) => ({ ...prev, level: e.target.value }))}
                  className="w-full rounded-lg border border-gold/25 bg-bg/80 px-3 py-2 text-sm outline-none focus:border-gold"
                >
                  {LEVEL_NAMES.map((lvl) => (
                    <option key={lvl} value={lvl}>{lvl}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs uppercase tracking-wider text-text/65">
                  Assign Batch (optional)
                </label>
                <select
                  value={approvalForm.batchId}
                  onChange={(e) => setApprovalForm((prev) => ({ ...prev, batchId: e.target.value }))}
                  className="w-full rounded-lg border border-gold/25 bg-bg/80 px-3 py-2 text-sm outline-none focus:border-gold"
                >
                  <option value="">No batch</option>
                  {batches.map((batch) => (
                    <option key={batch._id} value={batch._id}>
                      {batch.name} ({batch.level})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs uppercase tracking-wider text-text/65">
                  Final Days
                </label>
                <div className="flex flex-wrap gap-2">
                  {DAYS_OF_WEEK.map((day) => (
                    <label key={day} className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-gold/20 bg-bg/60 px-2.5 py-1.5 text-xs text-text/85 hover:border-gold/50">
                      <input
                        type="checkbox"
                        className="accent-gold"
                        checked={approvalForm.finalDays.includes(day)}
                        onChange={() =>
                          setApprovalForm((prev) => ({
                            ...prev,
                            finalDays: prev.finalDays.includes(day)
                              ? prev.finalDays.filter((d) => d !== day)
                              : [...prev.finalDays, day]
                          }))
                        }
                      />
                      {day}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs uppercase tracking-wider text-text/65">
                  Final Time Slot
                </label>
                <input
                  type="text"
                  value={approvalForm.finalTime}
                  onChange={(e) => setApprovalForm((prev) => ({ ...prev, finalTime: e.target.value }))}
                  placeholder="e.g. 5:00 PM – 5:45 PM"
                  className="w-full rounded-lg border border-gold/25 bg-bg/80 px-3 py-2 text-sm outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs uppercase tracking-wider text-text/65">
                  Timezone
                </label>
                <select
                  value={approvalForm.finalTimezone}
                  onChange={(e) => setApprovalForm((prev) => ({ ...prev, finalTimezone: e.target.value }))}
                  className="w-full rounded-lg border border-gold/25 bg-bg/80 px-3 py-2 text-sm outline-none focus:border-gold"
                >
                  <option value="">Select timezone</option>
                  {TIMEZONE_OPTIONS.map((tz) => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </select>
              </div>
            </div>

            {errorMessage && (
              <p className="mt-3 text-xs text-red-400">{errorMessage}</p>
            )}

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={handleApprovalSubmit}
                disabled={approvalBusy}
                className="primary-btn inline-flex min-h-[2.75rem] flex-1 items-center justify-center rounded-lg px-4 text-sm font-semibold disabled:opacity-60"
              >
                {approvalBusy ? "Creating student..." : "Approve & Create Student"}
              </button>
              <button
                type="button"
                onClick={() => setPendingApproval(null)}
                className="secondary-btn inline-flex min-h-[2.75rem] items-center rounded-lg px-4 text-sm font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </PageTransition>
  );
}

export default AdminPage;
