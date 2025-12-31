import { useLocation, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import Header from "../Components/Header.jsx";
import Footer from "../Components/Footer";
import BackButton from "../Components/BackButton.jsx";
import { API_BASE_URL, safeFetch, ensureTokenValidOrAlert } from "../apiConfig";
import {
  faAngleLeft,
  faAngleRight,
  faStar,
  faStarHalfStroke,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function Feedback() {
  const location = useLocation();
  const backTo = location.state?.from || "/";

  const [feedbackPage, setFeedbackPage] = useState(0);

  const {
    data: feedbackData,
    error: feedbackError,
    isPending: feedbackPending,
  } = useQuery({
    queryKey: ["feedbacks"],
    queryFn: async () => {
      ensureTokenValidOrAlert();
      const response = await safeFetch(
        `${API_BASE_URL}/feedback/active?page=${feedbackPage}&size=10`
      );
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error?.error || "Getting feedbacks failed");
      }
      return await response.json();
    },
  });

  if (feedbackError) {
    alert("Something went wrong in retrieving feedbacks");
  }

  const feedbacks = feedbackData?.content ?? [];
  const totalFeedbackPages = feedbackData?.totalPages ?? 0;

  const handlePrevFeedbackPage = () => {
    setFeedbackPage((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const handleNextFeedbackPage = () => {
    if (totalFeedbackPages === 0) return;
    setFeedbackPage((prev) =>
      prev + 1 < totalFeedbackPages ? prev + 1 : prev
    );
  };

  return (
    <>
      <Header />
      <main className="bg-green-50 px-5 sm:px-10 md:px-15 lg:px-20 py-10 min-h-screen">
        <BackButton
          to={backTo}
          title="Our Visitors Experience and Their Feedback"
          description="Featured feedbacks and experiences from our valued visitors"
        />

        {feedbackPending ? (
          <div className="flex flex-col items-center justify-center gap-4 h-100">
            <div className="h-10 w-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-600">Loading feedbacks...</p>
          </div>
        ) : feedbacks.length > 0 ? (
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-gray-600">
                Page {feedbackPage + 1} of {Math.max(totalFeedbackPages, 1)}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="px-2 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handlePrevFeedbackPage}
                  disabled={feedbackPage === 0}
                >
                  <FontAwesomeIcon icon={faAngleLeft} />
                </button>
                <button
                  type="button"
                  className="px-2 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleNextFeedbackPage}
                  disabled={
                    totalFeedbackPages === 0 ||
                    feedbackPage + 1 >= totalFeedbackPages
                  }
                >
                  <FontAwesomeIcon icon={faAngleRight} />
                </button>
              </div>
            </div>
            <div className="px-3 py-2 flex flex-wrap gap-5">
              {feedbacks.map((feedback) => {
                const rating = Number(feedback.stars) || 0;
                const fullStars = Math.floor(rating);
                const hasHalfStar = rating - fullStars >= 0.5;

                return (
                  <div
                    key={feedback.feedbackId}
                    className="p-5 bg-white rounded-lg shadow-xl border border-[#227B05] flex flex-col gap-3 lg:w-100"
                  >
                    {feedback.stars != null && (
                      <div className="mb-2">
                        <div className="flex gap-1 items-center justify-end">
                          {Array.from({ length: 5 }).map((_, index) => {
                            const isFull = index < fullStars;
                            const isHalf =
                              !isFull && hasHalfStar && index === fullStars;

                            return (
                              <FontAwesomeIcon
                                key={index}
                                icon={isHalf ? faStarHalfStroke : faStar}
                                className={
                                  isFull || isHalf
                                    ? "text-yellow-400"
                                    : "text-gray-300"
                                }
                              />
                            );
                          })}
                        </div>
                      </div>
                    )}
                    {feedback.comment && (
                      <div className="mb-2">"{feedback.comment}"</div>
                    )}
                    {feedback.staffReply && (
                      <div className="mb-4 bg-[#48BF56]/20 flex flex-col py-2 px-4 rounded-lg">
                        <span className="text-[#0A7A28] font-semibold text-md">
                          Agri-Eco Park Management:
                        </span>
                        <span className="text-sm text-[#007B53]">
                          {feedback.staffReply}
                        </span>
                      </div>
                    )}
                    {!feedback.comment && !feedback.suggestion && (
                      <div className="text-sm text-gray-600 mb-4">
                        No additional details provided.
                      </div>
                    )}
                    <hr className="text-[#227B05] border-2" />
                    <div>
                      <div className="font-semibold text-md">
                        <span>{feedback.account.detail.firstName}</span>{" "}
                        <span>{feedback.account.detail.surname}</span>
                      </div>
                      <div className="text-sm text-[#227B05]">
                        Visited {feedback.booking.visitDate}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div>Park have no feedbacks yet.</div>
        )}
      </main>
      <Footer />
    </>
  );
}

export default Feedback;
