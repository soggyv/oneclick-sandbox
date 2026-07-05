import React from 'react';
import { Camera, Star, MessageSquare, Building2, LogOut, PlusCircle } from 'lucide-react';

export default function VolunteerProfile({
  user,
  organization,
  isEditingProfile,
  setIsEditingProfile,
  editName,
  setEditName,
  editPhone,
  setEditPhone,
  editEmail,
  setEditEmail,
  editEmailOtpCode,
  setEditEmailOtpCode,
  emailOtpMode,
  cancelEditingProfile,
  handleSaveProfile,
  handleAvatarUpload,
  fetchVolunteerReviews,
  startEditingProfile,
  toggleRole,
  setIsOrgRegisterModalOpen,
  handleLeaveOrganization,
  handleSignOut,
  API_URL
}) {
  return (
    <div className="animate-fadeIn">
      <div className="mb-5 text-left">
        <h1 className="text-xl font-black tracking-tight text-gray-900">Профіль волонтера</h1>
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Ваш студентський профіль волонтера</p>
      </div>

      {!isEditingProfile && !user.email && (
        <div className="bg-[#FF5522]/10 border border-[#FF5522]/20 rounded-2xl p-4 text-left text-xs text-gray-700 mb-5 flex items-start gap-3">
          <span className="text-lg">✉️</span>
          <div>
            <p className="font-extrabold text-gray-900 mb-0.5 text-[#FF5522]">Прив'яжіть електронну пошту</p>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              Вкажіть ваш email у профілі, щоб миттєво отримувати сповіщення, коли організатори схвалюють ваші заявки на зміни.
            </p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm text-center mb-6">
        {isEditingProfile ? (
          <form onSubmit={handleSaveProfile} className="text-left space-y-4">
            <div>
              <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 px-0.5">
                Ім'я
              </label>
              <input
                type="text"
                required
                disabled={emailOtpMode}
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full bg-white border border-gray-250 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-gray-800 focus:outline-none focus:border-[#FF5522] shadow-sm disabled:bg-gray-50 disabled:text-gray-400"
              />
            </div>
            <div>
              <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 px-0.5">
                Телефон
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs font-semibold text-gray-500">
                  +380
                </span>
                <input
                  type="text"
                  required
                  disabled={emailOtpMode}
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="9-значний номер"
                  className="w-full bg-white border border-gray-250 rounded-xl pl-12 pr-3.5 py-2.5 text-xs font-semibold text-gray-800 focus:outline-none focus:border-[#FF5522] shadow-sm disabled:bg-gray-50 disabled:text-gray-400"
                />
              </div>
            </div>
            <div>
              <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 px-0.5">
                Електронна пошта (для сповіщень)
              </label>
              <input
                type="email"
                disabled={emailOtpMode}
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                placeholder="Введіть email (напр. user@student.ua)"
                className="w-full bg-white border border-gray-250 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-gray-800 focus:outline-none focus:border-[#FF5522] shadow-sm disabled:bg-gray-50 disabled:text-gray-400"
              />
              <p className="text-[10px] text-gray-450 mt-1 pl-0.5 leading-relaxed text-left">
                Потрібно виключно для надсилання сповіщень про статус ваших заявок на зміни.
              </p>
            </div>
            {emailOtpMode && (
              <div className="bg-[#FF5522]/5 border border-[#FF5522]/20 rounded-xl p-4 space-y-2 mt-2">
                <label className="block text-[9px] font-bold text-[#FF5522] uppercase tracking-widest px-0.5">
                  Введіть код підтвердження з пошти
                </label>
                <input
                  type="text"
                  required
                  value={editEmailOtpCode}
                  onChange={(e) => setEditEmailOtpCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="4-значний код"
                  className="w-full bg-white border border-[#FF5522]/40 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-gray-800 focus:outline-none focus:border-[#FF5522] shadow-sm text-center tracking-widest text-lg"
                />
                <p className="text-[10px] text-gray-400 text-center leading-normal">
                  Ми надіслали 4-значний код на адресу <b>{editEmail}</b>. Введіть його для підтвердження.
                </p>
              </div>
            )}
            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 py-3 bg-[#FF5522] hover:bg-[#FF5522]/90 text-white font-extrabold text-[10px] rounded-full uppercase tracking-wider transition-all active:scale-95 cursor-pointer"
              >
                Зберегти
              </button>
              <button
                type="button"
                onClick={cancelEditingProfile}
                className="flex-1 py-3 border border-gray-300 hover:bg-gray-50 text-gray-600 font-extrabold text-[10px] rounded-full uppercase tracking-wider transition-all active:scale-95 cursor-pointer"
              >
                Скасувати
              </button>
            </div>
          </form>
        ) : (
          <>
            <input
              type="file"
              id="avatar-upload-input"
              className="hidden"
              accept="image/*"
              onChange={handleAvatarUpload}
            />
            <div
              onClick={() => document.getElementById('avatar-upload-input').click()}
              className="group relative w-16 h-16 rounded-full overflow-hidden shadow-md mx-auto mb-3 cursor-pointer active:scale-95 transition-all"
              title="Змінити фото профілю"
            >
              {user.avatar_url ? (
                <img
                  src={`${API_URL.replace('/api', '')}${user.avatar_url}`}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-[#FFCC00] text-black text-2xl font-black flex items-center justify-center">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'У'}
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                <Camera size={14} className="animate-pulse" />
              </div>
            </div>

            <h2 className="text-lg font-black text-gray-900 mb-0.5">{user.name}</h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-3">
              Одеса, Україна
            </p>

            {/* Dynamic Rating Stars */}
            <div
              onClick={() => user.rating && fetchVolunteerReviews(user.id, user.name)}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full border transition-all ${
                user.rating
                  ? 'bg-yellow-50/50 border-yellow-200 text-yellow-700 cursor-pointer hover:bg-yellow-50'
                  : 'bg-gray-50 border-gray-200 text-gray-400'
              }`}
            >
              <Star size={14} className={user.rating ? "fill-yellow-400 text-yellow-500" : ""} />
              <span className="text-xs font-black">
                {user.rating ? `${user.rating} / 5.0` : 'Без оцінок'}
              </span>
              {user.rating && (
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest pl-1">
                  (Дивитись відгуки)
                </span>
              )}
            </div>

            <div className="border-t border-gray-100 mt-5 pt-4 text-left space-y-2 text-[11px] font-semibold text-gray-600">
              <div className="flex justify-between">
                <span>Телефон:</span>
                <span className="text-gray-950 font-bold">{user.phone}</span>
              </div>
              <div className="flex justify-between">
                <span>Email для сповіщень:</span>
                <span className="text-gray-950 font-bold">
                  {user.email || <span className="text-gray-400 italic font-medium">Не прив'язано</span>}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Статус:</span>
                <span className="text-green-600 font-bold">Готовий допомогти</span>
              </div>
            </div>

            <button
              onClick={startEditingProfile}
              className="w-full mt-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold rounded-xl border border-gray-200 transition-all active:scale-[0.98] text-[10px] uppercase tracking-wider cursor-pointer"
            >
              Редагувати профіль
            </button>

            {/* Leave Feedback Button */}
            <a
              href="https://forms.gle/kcDLFPYfXmGP183h6"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full mt-2 py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl transition-all active:scale-95 text-[10px] uppercase tracking-wider cursor-pointer shadow-md flex items-center justify-center gap-1.5"
            >
              <MessageSquare size={13} />
              <span>Залишити відгук про платформу</span>
            </a>
          </>
        )}
      </div>

      {organization ? (
        <div className="space-y-2">
          <button
            onClick={toggleRole}
            className="w-full py-4 bg-white hover:bg-gray-50 text-gray-800 font-extrabold rounded-full border border-gray-200 shadow-md flex items-center justify-center gap-2.5 transition-all active:scale-95 text-xs uppercase tracking-wider cursor-pointer"
          >
            <Building2 size={15} className="text-[#FFCC00]" />
            <span>Перейти в кабінет Організатора (B2B)</span>
          </button>
          {user.company_role !== 'owner' && (
            <button
              onClick={handleLeaveOrganization}
              className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-650 font-bold rounded-xl border border-red-200 transition-all active:scale-[0.98] text-[10px] uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1.5"
            >
              <LogOut size={13} />
              <span>Вийти з організації</span>
            </button>
          )}
        </div>
      ) : (
        <button
          onClick={() => setIsOrgRegisterModalOpen(true)}
          className="w-full py-4 bg-white hover:bg-gray-50 text-gray-800 font-extrabold rounded-full border border-gray-200 shadow-md flex items-center justify-center gap-2.5 transition-all active:scale-95 text-xs uppercase tracking-wider cursor-pointer"
        >
          <PlusCircle size={15} className="text-[#FF5522]" />
          <span>Зареєструвати компанію / Організацію</span>
        </button>
      )}

      <button
        onClick={handleSignOut}
        className="w-full mt-3 py-4 bg-red-50 hover:bg-red-100 text-red-650 font-extrabold rounded-full border border-red-200 shadow-sm flex items-center justify-center gap-2.5 transition-all active:scale-95 text-xs uppercase tracking-wider cursor-pointer"
      >
        <LogOut size={15} className="text-red-550" />
        <span>Вийти з акаунту</span>
      </button>
    </div>
  );
}
