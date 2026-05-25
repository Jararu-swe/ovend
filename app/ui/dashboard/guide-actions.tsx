"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CheckCircleIcon } from "@heroicons/react/24/outline";

interface GuideActionsProps {
  guideId: number;
  completed?: boolean;
}

export default function GuideActions({
  guideId,
  completed = false,
}: GuideActionsProps) {
  const router = useRouter();
  const [isComplete, setIsComplete] = useState(completed);
  const [loading, setLoading] = useState(false);

  async function markComplete() {
    setLoading(true);
    try {
      const res = await fetch("/api/vendor/guides/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guide_id: guideId }),
      });
      if (res.ok) {
        setIsComplete(true);
        router.refresh();
      }
    } catch (error) {
      console.error("Error marking guide complete:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={markComplete}
      disabled={isComplete || loading}
      className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition ${
        isComplete
          ? "bg-slate-100 text-slate-600 cursor-default"
          : "bg-emerald-500 text-white hover:bg-emerald-600"
      }`}
    >
      <CheckCircleIcon className="h-5 w-5" />
      {isComplete ? "Completed" : loading ? "Saving…" : "Mark as completed"}
    </button>
  );
}
