'use client';

import { useAiFeedback } from '@/hooks/useAiFeedback';
import { useState } from 'react';

interface AiFeedbackProps {
  requestId: string | undefined;
  onFeedbackSubmitted?: () => void;
}

export default function AiFeedback({ requestId, onFeedbackSubmitted }: AiFeedbackProps) {
  const { submitFeedback, isSubmitting, isSuccess } = useAiFeedback();
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [showFeedbackNote, setShowFeedbackNote] = useState(false);
  const [feedbackNote, setFeedbackNote] = useState('');

  if (!requestId || isSuccess || feedbackSubmitted) {
    return null;
  }

  const handleFeedback = async (isAccurate: boolean) => {
    if (isAccurate) {
      // Directly submit for thumbs up
      submitFeedback({ requestId, isAccurate: true });
      setFeedbackSubmitted(true);
      onFeedbackSubmitted?.();
    } else {
      // Show feedback note input for thumbs down
      setShowFeedbackNote(true);
    }
  };

  const handleSubmitFeedback = async () => {
    submitFeedback({
      requestId,
      isAccurate: false,
      feedbackNote: feedbackNote.trim() || undefined,
    });
    setFeedbackSubmitted(true);
    onFeedbackSubmitted?.();
  };

  if (showFeedbackNote) {
    return (
      <div className="bg-[#FFED66] border-2 border-black p-4 flex flex-col gap-3">
        <p className="font-bold text-black text-sm">Sorry about that! What went wrong?</p>
        <textarea
          value={feedbackNote}
          onChange={(e) => setFeedbackNote(e.target.value)}
          placeholder="Tell us what you expected... (optional)"
          className="w-full p-2 font-mono bg-white border-2 border-black text-black text-sm resize-none"
          rows={2}
          maxLength={1000}
        />
        <div className="flex gap-2">
          <button
            onClick={handleSubmitFeedback}
            disabled={isSubmitting}
            className="bg-black text-white px-3 py-1 font-bold border-2 border-black text-sm shadow-[2px_2px_0_#000] hover:shadow-[3px_3px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 active:shadow-none active:translate-x-0.5 active:translate-y-0.5 transition-all disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
          <button
            onClick={() => setShowFeedbackNote(false)}
            disabled={isSubmitting}
            className="bg-white text-black px-3 py-1 font-bold border-2 border-black text-sm shadow-[2px_2px_0_#000] hover:bg-gray-100 hover:shadow-[3px_3px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 active:shadow-none active:translate-x-0.5 active:translate-y-0.5 transition-all disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FEF9C3] border-2 border-black p-3 flex items-center justify-between">
      <p className="font-bold text-black text-sm">Was this result helpful?</p>
      <div className="flex gap-2">
        <button
          onClick={() => handleFeedback(true)}
          disabled={isSubmitting}
          className="flex items-center gap-1 bg-[#4ECDC4] px-3 py-1 font-bold border-2 border-black text-sm shadow-[2px_2px_0_#000] hover:shadow-[3px_3px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 active:shadow-none active:translate-x-0.5 active:translate-y-0.5 transition-all disabled:opacity-50"
          title="Yes, this was helpful"
        >
          <span>👍</span>
          <span>Yes</span>
        </button>
        <button
          onClick={() => handleFeedback(false)}
          disabled={isSubmitting}
          className="flex items-center gap-1 bg-[#FF5E5B] px-3 py-1 font-bold border-2 border-black text-sm shadow-[2px_2px_0_#000] hover:shadow-[3px_3px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 active:shadow-none active:translate-x-0.5 active:translate-y-0.5 transition-all disabled:opacity-50"
          title="No, this wasn't helpful"
        >
          <span>👎</span>
          <span>No</span>
        </button>
      </div>
    </div>
  );
}
