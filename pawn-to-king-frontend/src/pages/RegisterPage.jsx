import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ApplicationForm from "../components/ApplicationForm";
import ApplicationSuccessNotice from "../components/ApplicationSuccessNotice";

function JoinPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [placementResult, setPlacementResult] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  if (placementResult) {
    return (
      <div className="mx-auto flex min-h-[75vh] max-w-5xl items-center px-4 py-14 md:px-6">
        <div className="mx-auto w-full max-w-2xl">
          <ApplicationSuccessNotice
            onSubmitAnother={() => setPlacementResult(null)}
            showLoginLink
          />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[75vh] max-w-5xl items-center px-4 py-14 md:px-6">
      <div className="mx-auto w-full max-w-xl rounded-2xl border border-gold/20 bg-card/80 p-7 md:p-8">
        <ApplicationForm onSubmitted={setPlacementResult} />
      </div>
    </div>
  );
}

export default JoinPage;
