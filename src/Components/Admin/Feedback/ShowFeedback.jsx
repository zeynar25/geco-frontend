import { useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faLayerGroup,
  faMessage,
} from "@fortawesome/free-solid-svg-icons";

function ShowFeedback(props) {
  const [feedbackCategoryFilter, setFeedbackCategoryFilter] =
    useState("ACTIVE");

  const isActiveCategory = (category) => {
    if (!category) return true;
    if (typeof category.active === "boolean") return category.active;
    if (typeof category.enabled === "boolean") return category.enabled;
    if (typeof category.status === "string")
      return category.status.toUpperCase() === "ACTIVE";
    return true;
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
        "http://localhost:8080/feedback-category",
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
        "http://localhost:8080/feedback-category/active",
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
        "http://localhost:8080/feedback-category/inactive",
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

  return (
    <div className="flex flex-col gap-5">
      <div className="bg-white rounded-lg overflow-hidden shadow-xl">
        <div className="text-white bg-[#48BF56] p-4 font-bold text-2xl">
          <FontAwesomeIcon icon={faLayerGroup} className="mr-3 text-2xl" />
          <span>Feedback Categories</span>
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
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="ALL">All</option>
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
                      isActiveCategory(feedbackCategory)
                        ? "border-[#227B05]"
                        : "border-gray-300 bg-gray-100 text-gray-400"
                    }`}
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
          <span>Visitor Feedbacks</span>
        </div>
        <div></div>
      </div>
    </div>
  );
}

export default ShowFeedback;
