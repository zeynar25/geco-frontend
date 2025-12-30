import { useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { API_BASE_URL } from "../../../apiConfig";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faLayerGroup,
  faMessage,
  faStar,
  faEnvelope,
  faPhone,
  faThumbsUp,
  faAngleLeft,
  faAngleRight,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";

function ShowFeedback(props) {
  const [feedbackCategoryFilter, setFeedbackCategoryFilter] = useState("ALL");
  const [feedbackActivityFilter, setFeedbackActivityFilter] = useState("ALL");
  const [feedbackStatusFilter, setFeedbackStatusFilter] = useState("ALL");
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");
  const [feedbackPage, setFeedbackPage] = useState(0);

  const [searchEmail, setSearchEmail] = useState("");

  const isActive = (something) => {
    if (!something) return true;
    if (typeof something.active === "boolean") return something.active;
    if (typeof something.enabled === "boolean") return something.enabled;
    if (typeof something.status === "string")
      return something.status.toUpperCase() === "ACTIVE";
    return true;
  };

  const handlePrevFeedbackPage = () => {
    setFeedbackPage((prev) => Math.max(prev - 1, 0));
  };

  const handleNextFeedbackPage = () => {
    setFeedbackPage((prev) => prev + 1);
  };

  const handleFeedbackActivityChange = (event) => {
    setFeedbackActivityFilter(event.target.value);
    setFeedbackPage(0);
  };

  const handleFeedbackStatusChange = (event) => {
    setFeedbackStatusFilter(event.target.value);
    setFeedbackPage(0);
  };

  const {
    data: feedbackCategoryData,
    error: feedbackCategoryError,
    isPending: feedbackCategoryPending,
  } = useQuery({
    queryKey: ["FeedbackCategory", feedbackCategoryFilter],
    enabled:
      props.canViewDashboard &&
      props.feedbackIn &&
      feedbackCategoryFilter === "ALL",
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const feedbackCategories = await fetch(
        `${API_BASE_URL}/feedback-category`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!feedbackCategories.ok) {
        const error = await feedbackCategories.json();
        throw new Error(error?.error || "Getting feedback categories failed");
      }
      return await feedbackCategories.json();
    },
  });

  if (feedbackCategoryError) {
    alert("something went wrong in retrieving feedback categories");
  }

  const {
    data: activeFeedbackCategoryData,
    error: activeFeedbackCategoryError,
    isPending: activeFeedbackCategoryPending,
  } = useQuery({
    queryKey: ["activeFeedbackCategory", feedbackCategoryFilter],
    enabled:
      props.canViewDashboard &&
      props.feedbackIn &&
      feedbackCategoryFilter === "ACTIVE",
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const feedbackCategories = await fetch(
        `${API_BASE_URL}/feedback-category/active`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!feedbackCategories.ok) {
        const error = await feedbackCategories.json();
        throw new Error(
          error?.error || "Getting active feedback categories failed"
        );
      }
      return await feedbackCategories.json();
    },
  });

  if (activeFeedbackCategoryError) {
    alert("something went wrong in retrieving active feedback categories");
  }

  const {
    data: inactiveFeedbackCategoryData,
    error: inactiveFeedbackCategoryError,
    isPending: inactiveFeedbackCategoryPending,
  } = useQuery({
    queryKey: ["inactiveFeedbackCategory", feedbackCategoryFilter],
    enabled:
      props.canViewDashboard &&
      props.feedbackIn &&
      feedbackCategoryFilter === "INACTIVE",
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const feedbackCategories = await fetch(
        `${API_BASE_URL}/feedback-category/inactive`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!feedbackCategories.ok) {
        const error = await feedbackCategories.json();
        throw new Error(
          error?.error || "Getting inactive feedback categories failed"
        );
      }
      return await feedbackCategories.json();
    },
  });

  if (inactiveFeedbackCategoryError) {
    alert("something went wrong in retrieving inactive feedback categories");
  }

  const {
    data: feedbackData,
    error: feedbackError,
    isPending: feedbackPending,
  } = useQuery({
    queryKey: [
      "Feedback",
      feedbackPage,
      feedbackStatusFilter,
      startDateFilter,
      endDateFilter,
      searchEmail,
    ],
    enabled:
      props.canViewDashboard &&
      props.feedbackIn &&
      feedbackActivityFilter === "ALL",
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams();
      params.append("page", feedbackPage.toString());
      params.append("size", "10");

      const trimmedEmail = searchEmail.trim();

      if (feedbackStatusFilter !== "ALL") {
        params.append("feedbackStatus", feedbackStatusFilter);
      }

      if (startDateFilter) {
        params.append("startDate", startDateFilter);
      }

      if (endDateFilter) {
        params.append("endDate", endDateFilter);
      }

      if (trimmedEmail) {
        params.append("email", trimmedEmail);
      }

      const endpoint = `${API_BASE_URL}/feedback?${params.toString()}`;

      const feedbacks = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!feedbacks.ok) {
        const error = await feedbacks.json();
        throw new Error(error?.error || "Getting feedback failed");
      }
      return await feedbacks.json();
    },
  });

  if (feedbackError) {
    console.error("Feedback error:", feedbackError);
    alert(
      "Error: " +
        (feedbackError.message ||
          "Something went wrong in retrieving feedbackss")
    );
  }

  const {
    data: activeFeedbackData,
    error: activeFeedbackError,
    isPending: activeFeedbackPending,
  } = useQuery({
    queryKey: [
      "activeFeedback",
      feedbackPage,
      feedbackStatusFilter,
      startDateFilter,
      endDateFilter,
      searchEmail,
    ],
    enabled:
      props.canViewDashboard &&
      props.feedbackIn &&
      feedbackActivityFilter === "ACTIVE",
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams();
      params.append("page", feedbackPage.toString());
      params.append("size", "10");

      const trimmedEmail = searchEmail.trim();

      if (feedbackStatusFilter !== "ALL") {
        params.append("feedbackStatus", feedbackStatusFilter);
      }

      if (startDateFilter) {
        params.append("startDate", startDateFilter);
      }

      if (endDateFilter) {
        params.append("endDate", endDateFilter);
      }

      if (trimmedEmail) {
        params.append("email", trimmedEmail);
      }

      const activeFeedback = await fetch(
        `${API_BASE_URL}/feedback/active?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!activeFeedback.ok) {
        const error = await activeFeedback.json();
        throw new Error(error?.error || "Getting active feedback failed");
      }
      return await activeFeedback.json();
    },
  });

  if (activeFeedbackError) {
    alert("something went wrong in retrieving active feedbacks");
  }

  const {
    data: inactiveFeedbackData,
    error: inactiveFeedbackError,
    isPending: inactiveFeedbackPending,
  } = useQuery({
    queryKey: [
      "inactiveFeedback",
      feedbackPage,
      feedbackStatusFilter,
      startDateFilter,
      endDateFilter,
      searchEmail,
    ],
    enabled:
      props.canViewDashboard &&
      props.feedbackIn &&
      feedbackActivityFilter === "INACTIVE",
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams();
      params.append("page", feedbackPage.toString());
      params.append("size", "10");

      const trimmedEmail = searchEmail.trim();

      if (feedbackStatusFilter !== "ALL") {
        params.append("feedbackStatus", feedbackStatusFilter);
      }

      if (startDateFilter) {
        params.append("startDate", startDateFilter);
      }

      if (endDateFilter) {
        params.append("endDate", endDateFilter);
      }

      if (trimmedEmail) {
        params.append("email", trimmedEmail);
      }

      const inactiveFeedbacks = await fetch(
        `${API_BASE_URL}/feedback/inactive?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!inactiveFeedbacks.ok) {
        const error = await inactiveFeedbacks.json();
        throw new Error(error?.error || "Getting inactive feedbacks failed");
      }
      return await inactiveFeedbacks.json();
    },
  });

  if (inactiveFeedbackError) {
    alert("something went wrong in retrieving inactive feedbacks");
  }

  const currentFeedbackPageData =
    feedbackActivityFilter === "ALL"
      ? feedbackData
      : feedbackActivityFilter === "ACTIVE"
      ? activeFeedbackData
      : inactiveFeedbackData;

  const feedbacks = Array.isArray(currentFeedbackPageData?.content)
    ? currentFeedbackPageData.content
    : Array.isArray(currentFeedbackPageData)
    ? currentFeedbackPageData
    : [];

  const totalFeedbackPages =
    typeof currentFeedbackPageData?.totalPages === "number"
      ? currentFeedbackPageData.totalPages
      : feedbacks.length > 0
      ? 1
      : 0;

  const totalFeedbackCount =
    typeof currentFeedbackPageData?.totalElements === "number"
      ? currentFeedbackPageData.totalElements
      : feedbacks.length;

  const feedbackIsPending =
    feedbackActivityFilter === "ALL"
      ? feedbackPending
      : feedbackActivityFilter === "ACTIVE"
      ? activeFeedbackPending
      : inactiveFeedbackPending;

  return (
    <div className="flex flex-col gap-10">
      <div className="bg-white rounded-lg overflow-hidden shadow-xl">
        <div className="flex gap-3 flex-wrap justify-between text-white bg-[#48BF56] p-4 font-bold text-2xl">
          <div className="text-2xl flex items-center">
            <FontAwesomeIcon icon={faLayerGroup} className="mr-3" />
            <span>Feedback Categories</span>
          </div>
          <button
            type="button"
            className="text-lg text-[#FDDB3C] bg-[#227B05] px-3 py-2 rounded-lg flex items-center hover:bg-[#227B05]/90"
            onClick={() => props.onAddFeedbackCategory?.()}
          >
            <FontAwesomeIcon icon={faPlus} className="mr-3" />
            <span>Add Feedback Category</span>
          </button>
        </div>
        <div>
          <form className="flex justify-end mt-5 mx-5 my-3 flex-wrap gap-2">
            <div>
              <span className="font-semibold">Feedback Category Status:</span>
              <select
                value={feedbackCategoryFilter}
                onChange={(e) => setFeedbackCategoryFilter(e.target.value)}
                className="ml-2 border border-[#227B05]"
              >
                <option value="ALL">All</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </form>

          {feedbackCategoryFilter === "ALL" &&
            (feedbackCategoryPending ? (
              <div className="flex flex-col items-center justify-center gap-4 h-100">
                <div className="h-10 w-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-600">Loading feedback categories...</p>
              </div>
            ) : feedbackCategoryData && feedbackCategoryData.length > 0 ? (
              <div className="grid grid-cols-4 gap-5 px-5 md:px-10 py-5">
                {feedbackCategoryData.map((feedbackCategory) => (
                  <div
                    key={feedbackCategory.feedbackCategoryId}
                    className={`col-span-4 xs:col-span-2 md:col-span-1 py-3 px-2 md:px-3 rounded-lg flex justify-between items-center gap-2 border ${
                      isActive(feedbackCategory)
                        ? "border-[#227B05]"
                        : "border-gray-300 bg-gray-100 text-gray-400"
                    }`}
                  >
                    <span>{feedbackCategory.label}</span>
                    <button
                      type="button"
                      className="text-gray-600 hover:text-[#227B05]"
                      onClick={() =>
                        props.onEditFeedbackCategory?.(feedbackCategory)
                      }
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center m-5">
                No feedback categories found.
              </div>
            ))}

          {feedbackCategoryFilter === "ACTIVE" &&
            (activeFeedbackCategoryPending ? (
              <div className="flex flex-col items-center justify-center gap-4 h-100">
                <div className="h-10 w-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-600">
                  Loading active feedback categories...
                </p>
              </div>
            ) : activeFeedbackCategoryData &&
              activeFeedbackCategoryData.length > 0 ? (
              <div className="grid grid-cols-4 gap-5 px-5 md:px-10 py-5">
                {activeFeedbackCategoryData.map((feedbackCategory) => (
                  <div
                    key={feedbackCategory.feedbackCategoryId}
                    className="col-span-4 xs:col-span-2 md:col-span-1 py-3 px-2 md:px-3 border border-[#227B05] rounded-lg flex justify-between items-center gap-2"
                  >
                    <span>{feedbackCategory.label}</span>
                    <button
                      type="button"
                      className="text-gray-600 hover:text-[#227B05]"
                      onClick={() => props.onEditFeedback?.(feedbackCategory)}
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center m-5">
                No active feedback categories found.
              </div>
            ))}

          {feedbackCategoryFilter === "INACTIVE" &&
            (inactiveFeedbackCategoryPending ? (
              <div className="flex flex-col items-center justify-center gap-4 h-100">
                <div className="h-10 w-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-600">
                  Loading inactive feedback categories...
                </p>
              </div>
            ) : inactiveFeedbackCategoryData &&
              inactiveFeedbackCategoryData.length > 0 ? (
              <div className="grid grid-cols-4 gap-5 px-5 md:px-10 py-5">
                {inactiveFeedbackCategoryData.map((feedbackCategory) => (
                  <div
                    key={feedbackCategory.feedbackCategoryId}
                    className="col-span-4 xs:col-span-2 md:col-span-1 py-3 px-2 md:px-3 border border-gray-300 bg-gray-100 text-gray-400 rounded-lg flex justify-between items-center gap-2"
                  >
                    <span>{feedbackCategory.label}</span>
                    <button
                      type="button"
                      className="text-gray-600 hover:text-[#227B05]"
                      onClick={() => props.onEditFeedback?.(feedbackCategory)}
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center m-5">
                No inactive feedback categories found.
              </div>
            ))}
        </div>
      </div>

      <div className="bg-white rounded-lg overflow-hidden shadow-xl">
        <div className="text-white bg-[#48BF56] p-4 font-bold text-2xl">
          <FontAwesomeIcon icon={faMessage} className="mr-3 text-2xl" />
          <span>Visitor Feedbacks ({totalFeedbackCount ?? 0})</span>
        </div>
        <div>
          <form className="flex flex-wrap items-end gap-4 px-5 py-4 border-b border-gray-100 bg-white text-sm justify-between">
            <div className="flex flex-col min-w-[200px]">
              <span className="text-xs font-semibold text-gray-600 mb-1">
                Search by Email
              </span>
              <input
                type="text"
                value={searchEmail}
                onChange={(e) => {
                  setSearchEmail(e.target.value);
                  setFeedbackPage(0);
                }}
                placeholder="Enter email or part of it"
                className="border border-[#227B05] rounded-md px-2 py-1 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#227B05]"
              />
            </div>
            <div className="flex flex-col min-w-[150px]">
              <span className="text-xs font-semibold text-gray-600 mb-1">
                Feedback Activity
              </span>
              <select
                value={feedbackActivityFilter}
                onChange={handleFeedbackActivityChange}
                className="border border-[#227B05] rounded-md px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-[#227B05]"
              >
                <option value="ALL">All</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
            <div className="flex flex-col min-w-40">
              <span className="text-xs font-semibold text-gray-600 mb-1">
                Feedback Status
              </span>
              <select
                value={feedbackStatusFilter}
                onChange={handleFeedbackStatusChange}
                className="border border-[#227B05] rounded-md px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-[#227B05]"
              >
                <option value="ALL">All</option>
                <option value="NEW">New</option>
                <option value="VIEWED">Viewed</option>
              </select>
            </div>
            <div className="flex flex-col min-w-[220px]">
              <span className="text-xs font-semibold text-gray-600 mb-1">
                Date Range
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={startDateFilter}
                  onChange={(e) => {
                    setStartDateFilter(e.target.value);
                    setFeedbackPage(0);
                  }}
                  className="border border-[#227B05] rounded-md px-2 py-1 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#227B05]"
                />
                <span className="text-xs text-gray-500">to</span>
                <input
                  type="date"
                  value={endDateFilter}
                  onChange={(e) => {
                    setEndDateFilter(e.target.value);
                    setFeedbackPage(0);
                  }}
                  className="border border-[#227B05] rounded-md px-2 py-1 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#227B05]"
                />
              </div>
            </div>
          </form>
          <div className="px-5 md:px-10 py-5 flex flex-col gap-5">
            {feedbackIsPending && (
              <div className="flex flex-col items-center justify-center gap-4 h-100">
                <div className="h-10 w-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-600">Loading feedbacks...</p>
              </div>
            )}

            {!feedbackIsPending &&
              currentFeedbackPageData &&
              (feedbacks.length > 0 ? (
                <>
                  <div className="flex justify-between items-center text-sm text-gray-600">
                    <span>
                      Page {feedbackPage + 1} of{" "}
                      {Math.max(totalFeedbackPages, 1)}
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

                  <div className="flex flex-col gap-5 mt-2">
                    {feedbacks.map((feedback) => {
                      const fullName = `${feedback.account.detail.firstName} ${feedback.account.detail.surname}`;

                      const statusClass =
                        feedback.feedbackStatus === "NEW"
                          ? "bg-yellow-300 text-gray-800"
                          : feedback.feedbackStatus === "VIEWED"
                          ? "bg-emerald-400 text-white"
                          : "bg-gray-300 text-gray-700";

                      return (
                        <div
                          key={feedback.feedbackId}
                          className={`border rounded-lg p-5 flex flex-col gap-4 ${
                            isActive(feedback)
                              ? "border-[#227B05]"
                              : "border-gray-300 bg-gray-100 text-gray-400"
                          }`}
                        >
                          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                            <div className="flex flex-col gap-2">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-semibold text-lg">
                                  {fullName}
                                </span>
                                <div className="flex items-center gap-1 text-yellow-400">
                                  {Array.from({
                                    length: feedback.stars || 0,
                                  }).map((_, index) => (
                                    <FontAwesomeIcon
                                      key={index}
                                      icon={faStar}
                                    />
                                  ))}
                                  <span className="text-xs text-gray-600 ml-1">
                                    ({feedback.stars}/5)
                                  </span>
                                </div>
                              </div>

                              <div className="flex flex-col gap-1 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                  <FontAwesomeIcon icon={faEnvelope} />
                                  <span>{feedback.account.detail.email}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <FontAwesomeIcon icon={faPhone} />
                                  <span>
                                    {feedback.account.detail.contactNumber}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col items-end gap-2">
                              <span className="text-xs text-gray-500">
                                Booking #{feedback.booking.bookingId}
                              </span>
                              <div
                                className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${statusClass}`}
                              >
                                {feedback.feedbackStatus?.toLowerCase()}
                              </div>
                              {!isActive(feedback) && (
                                <div className="px-2 py-0.5 rounded-full text-[0.65rem] font-semibold bg-gray-300 text-gray-700">
                                  Hidden
                                </div>
                              )}
                              <button
                                type="button"
                                className="text-gray-600 hover:text-[#227B05]"
                                onClick={() => props.onEditFeedback?.(feedback)}
                              >
                                <FontAwesomeIcon icon={faEdit} />
                              </button>
                            </div>
                          </div>

                          <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-xs font-semibold text-gray-700 w-fit">
                            {feedback.category?.label ?? feedback.category}
                          </div>

                          <div className="mt-3 space-y-3 text-sm">
                            <div>
                              <span className="font-semibold block mb-1">
                                Comments:
                              </span>
                              <div className="bg-gray-100 rounded-md px-3 py-2">
                                {feedback.comment}
                              </div>
                            </div>
                            <div>
                              <span className="font-semibold block mb-1">
                                Recommendations:
                              </span>
                              <div className="bg-gray-100 rounded-md px-3 py-2">
                                {feedback.suggestion}
                              </div>
                            </div>
                          </div>

                          {feedback.recommendToOthers && (
                            <div className="mt-3 flex items-center gap-2 text-sm text-emerald-700">
                              <FontAwesomeIcon icon={faThumbsUp} />
                              <span>Would recommend to others</span>
                            </div>
                          )}

                          {feedback.staffReply && (
                            <div className="mt-4 bg-emerald-50 border border-emerald-300 rounded-lg px-4 py-3 text-sm">
                              <span className="font-semibold block mb-1">
                                Admin Response:
                              </span>
                              <span>{feedback.staffReply}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="text-center m-5">No feedbacks found.</div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShowFeedback;
