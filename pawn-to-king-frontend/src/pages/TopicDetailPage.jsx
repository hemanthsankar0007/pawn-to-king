import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { getTopicDetail, submitHomework } from "../api/apiService";
import { useAuth } from "../context/AuthContext";
import LoadingPanel from "../components/LoadingPanel";
import EmptyStateCard from "../components/EmptyStateCard";
import PageTransition from "../components/PageTransition";
import StatusMessage from "../components/StatusMessage";
import { getNextLevelTopicPath, toLevelName, toLevelSlug } from "../utils/levelUtils";

function TopicDetailPage() {
  const { level, topicNumber } = useParams();
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();

  const levelName = useMemo(() => toLevelName(level), [level]);
  const parsedTopicNumber = useMemo(() => Number.parseInt(topicNumber, 10), [topicNumber]);

  const [topic, setTopic] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [warning, setWarning] = useState("");
  const [result, setResult] = useState(null);

  useEffect(() => {
    const loadTopic = async () => {
      if (!levelName || Number.isNaN(parsedTopicNumber) || parsedTopicNumber < 1) {
        setWarning("This topic could not be found.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setWarning("");
        setResult(null);
        const response = await getTopicDetail(toLevelSlug(levelName), parsedTopicNumber);
        setTopic(response.topic || null);
      } catch (_error) {
        setTopic(null);
        setWarning("Topic is unavailable or still locked.");
      } finally {
        setLoading(false);
      }
    };

    loadTopic();
  }, [levelName, parsedTopicNumber]);

  useEffect(() => {
    setAnswers({});
    setResult(null);
  }, [topic?._id]);

  const handleAnswerChange = (questionIndex, value) => {
    setAnswers((prev) => ({
      ...prev,
      [questionIndex]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!topic || submitting) {
      return;
    }

    const hasBlank = topic.homeworkQuestions.some((question) => !String(answers[question.questionIndex] || "").trim());
    if (hasBlank) {
      setWarning("Please complete every question before submitting.");
      return;
    }

    try {
      setSubmitting(true);
      setWarning("");

      const formattedAnswers = topic.homeworkQuestions.map((question) => ({
        questionIndex: question.questionIndex,
        answer: answers[question.questionIndex]
      }));

      const response = await submitHomework({
        topicId: topic._id,
        level: levelName,
        topicNumber: topic.orderNumber,
        answers: formattedAnswers
      });

      const dashboard = await refreshProfile();
      setResult({
        score: response.score,
        passed: response.passed
      });

      if (response.passed) {
        const nextTopic = response.currentTopic;
        if (nextTopic > topic.orderNumber && nextTopic <= (dashboard?.totalTopics || 20)) {
          setTimeout(() => {
            navigate(getNextLevelTopicPath(levelName, nextTopic));
          }, 1100);
        }
      }
    } catch (_error) {
      setWarning("Homework submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingPanel text="Loading topic lesson and homework..." />;
  }

  if (!topic) {
    return (
      <PageTransition>
        <EmptyStateCard
          title="Topic Locked"
          text={warning || "Complete earlier topics to unlock this lesson."}
        />
      </PageTransition>
    );
  }

  return (
    <PageTransition className="space-y-6">
      <section className="glass-card rounded-2xl p-6 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-gold">Topic Detail</p>
            <h1 className="mt-2 font-display text-3xl text-gold">
              {topic.levelName} - Topic {topic.orderNumber}
            </h1>
            <h2 className="mt-1 text-xl text-text">{topic.title}</h2>
          </div>
          <Link
            to={`/curriculum/${toLevelSlug(topic.levelName)}`}
            className="secondary-btn rounded-lg px-4 py-2 text-sm font-semibold"
          >
            Back to Topic List
          </Link>
        </div>
        <p className="mt-5 text-sm leading-relaxed text-text/85">{topic.content}</p>
      </section>

      <section className="glass-card rounded-2xl p-6 md:p-8">
        <p className="text-xs uppercase tracking-[0.2em] text-gold">Homework</p>
        <form className="mt-5 space-y-5" onSubmit={handleSubmit}>
          {topic.homeworkQuestions.map((question, index) => (
            <motion.article
              key={question.questionIndex}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: index * 0.05 }}
              className="rounded-xl border border-gold/20 bg-bg/65 p-4"
            >
              <p className="text-sm font-semibold text-text">
                Q{index + 1}. {question.question}
              </p>
              {question.type === "mcq" ? (
                <div className="mt-3 grid gap-2">
                  {question.options.map((option) => (
                    <label
                      key={option}
                      className="flex cursor-pointer items-center gap-2 rounded-md border border-gold/10 bg-card/60 px-3 py-2 text-sm text-text/85 transition hover:border-gold/45"
                    >
                      <input
                        type="radio"
                        name={`question-${question.questionIndex}`}
                        value={option}
                        checked={answers[question.questionIndex] === option}
                        onChange={(event) =>
                          handleAnswerChange(question.questionIndex, event.target.value)
                        }
                        className="accent-[#d4af37]"
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <textarea
                  rows={3}
                  value={answers[question.questionIndex] || ""}
                  onChange={(event) => handleAnswerChange(question.questionIndex, event.target.value)}
                  className="mt-3 w-full rounded-lg border border-gold/20 bg-card/80 px-3 py-2 text-sm text-text outline-none transition focus:border-gold"
                  placeholder="Write your answer..."
                />
              )}
            </motion.article>
          ))}

          <StatusMessage type="warning" text={warning} />
          <StatusMessage
            type={result?.passed ? "success" : "warning"}
            text={
              result
                ? result.passed
                  ? `Score: ${result.score}%. Passed. Unlocking next topic.`
                  : `Score: ${result.score}%. Review the lesson and try again.`
                : ""
            }
          />

          <button
            type="submit"
            disabled={submitting}
            className="primary-btn rounded-lg px-5 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-65"
          >
            {submitting ? "Submitting..." : "Submit Homework"}
          </button>
        </form>
      </section>
    </PageTransition>
  );
}

export default TopicDetailPage;
