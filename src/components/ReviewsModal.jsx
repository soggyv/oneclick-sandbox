import React from 'react';
import { X, Star } from 'lucide-react';

export default function ReviewsModal({
  isOpen,
  onClose,
  selectedVolunteerProfile,
  reviewsModalUserName,
  volunteerReviews,
  apiUrl
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#27272A] rounded-3xl w-full max-w-[390px] p-6 shadow-2xl animate-scaleUp text-left relative flex flex-col max-h-[90vh]">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 text-gray-400 hover:text-black dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800/50 dark:hover:text-white rounded-full transition-all active:scale-95 cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Volunteer Profile Header */}
        <div className="text-center pb-4 border-b border-gray-100 dark:border-transparent mb-4">
          <div className="w-16 h-16 rounded-full overflow-hidden shadow-md mx-auto mb-3">
            {selectedVolunteerProfile?.avatar_url ? (
              <img
                src={`${apiUrl.replace('/api', '')}${selectedVolunteerProfile.avatar_url}`}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-[#F97316] text-white text-2xl font-black flex items-center justify-center">
                {reviewsModalUserName ? reviewsModalUserName.charAt(0).toUpperCase() : 'У'}
              </div>
            )}
          </div>

          <h3 className="font-black text-gray-950 dark:text-zinc-200 text-base leading-snug">
            {reviewsModalUserName}
          </h3>
          <p className="text-[9px] text-gray-400 dark:text-zinc-500 font-extrabold uppercase tracking-widest mt-0.5">
            Профіль волонтера
          </p>

          {/* Rating badge */}
          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-50/60 dark:bg-orange-950/20 border border-orange-100 dark:border-transparent text-orange-700 dark:text-[#F97316] font-black text-[10px] mt-2">
            <Star size={11} className="fill-orange-450 text-orange-500 dark:fill-[#F97316] dark:text-[#F97316]" />
            <span>
              {selectedVolunteerProfile?.rating ? `${selectedVolunteerProfile.rating} / 5.0` : 'Без оцінок'}
            </span>
          </div>
        </div>

        {/* Detailed Stats & Contacts */}
        <div className="space-y-2.5 mb-4 text-xs">
          <div className="bg-gray-50/70 dark:bg-zinc-900/60 p-3 rounded-2xl border border-gray-100 dark:border-transparent space-y-2 text-[11px] font-semibold text-gray-600 dark:text-zinc-400">
            <div className="flex justify-between items-center">
              <span>Виконано змін:</span>
              <span className="font-extrabold text-gray-900 dark:text-zinc-200 bg-gray-200/65 dark:bg-zinc-800 px-2 py-0.5 rounded-full text-[10px]">
                {selectedVolunteerProfile?.completed_shifts_count || 0}
              </span>
            </div>

            {selectedVolunteerProfile?.phone && (
              <div className="flex justify-between items-center">
                <span>Телефон:</span>
                <a
                  href={`tel:${selectedVolunteerProfile.phone}`}
                  className="font-extrabold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {selectedVolunteerProfile.phone}
                </a>
              </div>
            )}

            {selectedVolunteerProfile?.email && (
              <div className="flex justify-between items-center">
                <span>Email:</span>
                <a
                  href={`mailto:${selectedVolunteerProfile.email}`}
                  className="font-extrabold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {selectedVolunteerProfile.email}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Coordinator Reviews Header */}
        <h4 className="font-bold text-[10px] text-gray-400 dark:text-zinc-500 uppercase tracking-widest mb-2 px-0.5">
          Відгуки організаторів
        </h4>

        {/* Reviews List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 no-scrollbar max-h-[200px]">
          {volunteerReviews.length > 0 ? (
            volunteerReviews.map((review) => (
              <div key={review.id} className="bg-gray-55/60 dark:bg-zinc-900/60 p-3 rounded-2xl border border-gray-100 dark:border-transparent">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-black text-gray-800 dark:text-zinc-300">
                    {review.author_name}
                  </span>
                  <div className="flex items-center gap-0.5 text-orange-500 font-bold text-[10px]">
                    <Star size={11} className="fill-orange-450 text-orange-500 dark:fill-[#F97316] dark:text-[#F97316]" />
                    <span>{review.rating}/5</span>
                  </div>
                </div>
                {review.comment && (
                  <p className="text-[11px] text-gray-600 dark:text-zinc-400 font-medium italic leading-relaxed">
                    "{review.comment}"
                  </p>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-4 bg-gray-50/40 dark:bg-zinc-900/40 rounded-2xl border border-dashed border-gray-200 dark:border-transparent">
              <p className="text-[10px] text-gray-400 dark:text-zinc-550 font-bold uppercase tracking-wider">
                Відгуків ще немає
              </p>
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full py-3.5 mt-4 bg-black hover:bg-black/95 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700 dark:hover:text-white font-extrabold rounded-full text-xs transition-all active:scale-95 cursor-pointer"
        >
          Закрити
        </button>
      </div>
    </div>
  );
}
