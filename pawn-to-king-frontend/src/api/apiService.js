import apiClient from "./apiClient";

export const submitJoinApplication = async (payload) => {
  const response = await apiClient.post("/join", payload);
  return response.data;
};

export const loginUser = async (payload) => {
  const response = await apiClient.post("/auth/login", payload);
  return response.data;
};

export const getDashboard = async () => {
  const response = await apiClient.get("/dashboard");
  return response.data;
};

export const getCurriculum = async () => {
  const response = await apiClient.get("/curriculum");
  return response.data;
};

export const getCurriculumLevel = async (level) => {
  const response = await apiClient.get(`/curriculum/${level}`);
  return response.data;
};

export const getCurrentTopic = async () => {
  const response = await apiClient.get("/topics/current");
  return response.data;
};

export const getTopics = async (level) => {
  const response = await apiClient.get(`/topics/${level}`);
  return response.data;
};

export const getTopicDetail = async (level, topicNumber) => {
  const response = await apiClient.get(`/topic/${level}/${topicNumber}`);
  return response.data;
};

export const submitHomework = async (payload) => {
  const response = await apiClient.post("/homework/submit", payload);
  return response.data;
};

export const getLevels = async () => {
  const response = await apiClient.get("/levels");
  return response.data;
};

export const getClassroom = async () => {
  const response = await apiClient.get("/classroom");
  return response.data;
};

export const getNextClassroomSession = async () => {
  const response = await apiClient.get("/classroom/next-session");
  return response.data;
};

export const requestClassroomAccess = async (payload) => {
  const response = await apiClient.post("/classroom/access", payload);
  return response.data;
};

export const getBonusMaterials = async () => {
  const response = await apiClient.get("/bonus");
  return response.data;
};

export const getTimetable = async () => {
  const response = await apiClient.get("/timetable");
  return response.data;
};

export const getHomeworkConfigLink = async () => {
  const response = await apiClient.get("/config/homework-link");
  return response.data;
};

export const updateHomeworkConfigLink = async (link) => {
  const response = await apiClient.put("/config/homework-link", { link });
  return response.data;
};

export const getAdminApplications = async (status = "pending") => {
  const response = await apiClient.get("/admin/applications", { params: { status } });
  return response.data;
};

export const approveAdminApplication = async (applicationId, payload = {}) => {
  const response = await apiClient.patch(`/admin/applications/${applicationId}/approve`, payload);
  return response.data;
};

export const rejectAdminApplication = async (applicationId, reason = "") => {
  const response = await apiClient.patch(`/admin/applications/${applicationId}/reject`, { reason });
  return response.data;
};

export const getAdminStudents = async (level = "All") => {
  const response = await apiClient.get("/admin/students", { params: { level } });
  return response.data;
};

export const updateAdminStudentLevel = async (studentId, level) => {
  const response = await apiClient.patch(`/admin/students/${studentId}/level`, { level });
  return response.data;
};

export const unlockAdminStudentNextLevel = async (studentId) => {
  const response = await apiClient.patch(`/admin/students/${studentId}/unlock-next-level`);
  return response.data;
};

export const updateAdminStudentTopic = async (studentId, currentTopic) => {
  const response = await apiClient.patch(`/admin/students/${studentId}/topic`, { currentTopic });
  return response.data;
};

export const resetAdminStudentPassword = async (studentId) => {
  const response = await apiClient.patch(`/admin/students/${studentId}/reset-password`);
  return response.data;
};

export const createAdminBatch = async (payload) => {
  const response = await apiClient.post("/admin/timetable/batches", payload);
  return response.data;
};

export const getAdminBatches = async (level = "") => {
  const response = await apiClient.get("/admin/timetable/batches", {
    params: level ? { level } : undefined
  });
  return response.data;
};

export const getAllStudents = async () => {
  const response = await apiClient.get("/students");
  return response.data;
};

export const assignBatchStudents = async (batchId, studentIds) => {
  const response = await apiClient.put("/batch/assign", {
    batchId,
    studentIds
  });
  return response.data;
};

export const getCurrentStudent = async () => {
  const response = await apiClient.get("/student/me");
  return response.data;
};

export const assignAdminBatchStudents = async (batchId, studentIds) => {
  return assignBatchStudents(batchId, studentIds);
};

export const generateAdminBatchSessions = async (batchId, payload) => {
  const response = await apiClient.post(`/admin/timetable/batches/${batchId}/generate-sessions`, payload);
  return response.data;
};

export const getAdminSessions = async (filters = {}) => {
  const response = await apiClient.get("/admin/timetable/sessions", { params: filters });
  return response.data;
};

export const completeAdminSession = async (sessionId) => {
  const response = await apiClient.patch(`/admin/timetable/sessions/${sessionId}/complete`);
  return response.data;
};

export const cancelAdminSession = async (sessionId) => {
  const response = await apiClient.patch(`/admin/timetable/sessions/${sessionId}/cancel`);
  return response.data;
};

export const rescheduleAdminSession = async (sessionId, payload) => {
  const response = await apiClient.patch(`/admin/timetable/sessions/${sessionId}/reschedule`, payload);
  return response.data;
};

export const getAdminCurriculumTopics = async (levelName) => {
  const response = await apiClient.get(`/admin/curriculum/topics/${levelName}`);
  return response.data;
};

export const updateTopicHomeworkLink = async (topicId, homeworkLink) => {
  const response = await apiClient.put(`/admin/curriculum/topic/${topicId}/homework`, { homeworkLink });
  return response.data;
};

export const getAdminBatchStudents = async (batchId) => {
  const response = await apiClient.get(`/admin/timetable/batches/${batchId}/students`);
  return response.data;
};

export const deleteAdminBatch = async (batchId) => {
  const response = await apiClient.delete(`/admin/timetable/batches/${batchId}`);
  return response.data;
};

export const removeStudentFromAdminBatch = async (batchId, studentId) => {
  const response = await apiClient.patch(`/admin/timetable/batches/${batchId}/remove-student/${studentId}`);
  return response.data;
};

export const getAdminWeeklyTimetable = async () => {
  const response = await apiClient.get("/admin/timetable/weekly");
  return response.data;
};
