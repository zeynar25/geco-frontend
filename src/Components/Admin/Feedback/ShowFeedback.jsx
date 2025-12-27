import { useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLayerGroup } from "@fortawesome/free-solid-svg-icons";

function ShowFeedback(props) {
  const [feedbackCategoryFilter, setFeedbackCategoryFilter] =
    useState("ACTIVE");

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
            <div className="text-center my-5">
              Loading feedback categories...
            </div>
          ) : feedbackCategoryData && feedbackCategoryData.length > 0 ? (
            <div>
              {feedbackCategoryData.map((feedbackCategory) => (
                <div
                  key={feedbackCategory.feedbackCategoryId}
                  className="px-5 md:px-10 py-3 border border-[#227B05] rounded-lg"
                >
                  {feedbackCategory.label}
                </div>
              ))}
            </div>
          ) : (
            <div>No feedback categories found.</div>
          ))}

        {feedbackCategoryFilter === "ACTIVE" &&
          (activeFeedbackCategoryPending ? (
            <div className="text-center my-5">
              Loading active feedback categories...
            </div>
          ) : activeFeedbackCategoryData &&
            activeFeedbackCategoryData.length > 0 ? (
            <div>
              {activeFeedbackCategoryData.map((feedbackCategory) => (
                <div
                  key={feedbackCategory.feedbackCategoryId}
                  className="px-5 md:px-10 py-3 border border-[#227B05] rounded-lg"
                >
                  {feedbackCategory.label}
                </div>
              ))}
            </div>
          ) : (
            <div>No active feedback categories found.</div>
          ))}

        {feedbackCategoryFilter === "INACTIVE" &&
          (inactiveFeedbackCategoryPending ? (
            <div className="text-center my-5">
              Loading inactive feedback categories...
            </div>
          ) : inactiveFeedbackCategoryData &&
            inactiveFeedbackCategoryData.length > 0 ? (
            <div>
              {inactiveFeedbackCategoryData.map((feedbackCategory) => (
                <div
                  key={feedbackCategory.feedbackCategoryId}
                  className="px-5 md:px-10 py-3 border border-[#227B05] rounded-lg"
                >
                  {feedbackCategory.label}
                </div>
              ))}
            </div>
          ) : (
            <div>No inactive feedback categories found.</div>
          ))}
      </div>
    </div>
  );
}

export default ShowFeedback;
