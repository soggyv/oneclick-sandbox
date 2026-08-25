import React from 'react';
import { Camera, Star, MessageSquare, Building2, LogOut, PlusCircle, Mail } from 'lucide-react';
import { useStore } from '../../store/useStore';

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
  API_URL,
  isDark,
  toggleTheme
}) {
  const emailNotificationsEnabled = useStore((state) => state.emailNotificationsEnabled);
  const toggleEmailNotifications = useStore((state) => state.toggleEmailNotifications);

  return (
    <div className="animate-fadeIn max-w-3xl mx-auto px-2 sm:px-4">
      <div className="mb-5 text-left">
        <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-zinc-100">Профіль волонтера</h1>
        <p className="text-xs text-gray-400 dark:text-zinc-550 font-bold uppercase tracking-wider">Ваш student-профіль волонтера</p>
      </div>

      {!isEditingProfile && !user.email && (
        <div className="bg-[#FF5522]/10 border border-[#FF5522]/20 dark:border-transparent rounded-2xl p-4 text-left text-xs text-gray-700 dark:text-zinc-300 mb-5 flex items-start gap-3">
          <span className="text-lg">✉️</span>
          <div>
            <p className="font-extrabold text-gray-900 dark:text-zinc-200 mb-0.5 text-[#FF5522]">Прив'яжіть електронну пошту</p>
            <p className="text-[11px] text-gray-500 dark:text-zinc-400 leading-relaxed">
              Вкажіть ваш email у профілі, щоб миттєво отримувати сповіщення, коли організатори схвалюють ваші заявки на зміни.
            </p>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-[#27272A] rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-transparent shadow-sm text-center mb-6">
        {isEditingProfile ? (
          <form onSubmit={handleSaveProfile} className="text-left space-y-4">
            <div>
              <label className="block text-[9px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest mb-1.5 px-0.5">
                Ім'я
              </label>
              <input
                type="text"
                required
                disabled={emailOtpMode}
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full bg-white dark:bg-zinc-900 border border-gray-250 dark:border-transparent rounded-xl px-3.5 py-2.5 text-xs font-semibold text-gray-800 dark:text-zinc-200 focus:outline-none focus:border-[#FF5522] dark:focus:border-[#FF5522] shadow-sm disabled:bg-gray-50 dark:disabled:bg-zinc-800 disabled:text-gray-400"
              />
            </div>
            <div>
              <label className="block text-[9px] font-bold text-gray-400 dark:text-zinc-550 uppercase tracking-widest mb-1.5 px-0.5">
                Телефон
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs font-semibold text-gray-500 dark:text-zinc-500">
                  +380
                </span>
                <input
                  type="text"
                  required
                  disabled={emailOtpMode}
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value.replace(/\D/g, '').slice(0, 9))}
                  placeholder="9-значний номер (напр. 931234567)"
                  className="w-full bg-white dark:bg-zinc-900 border border-gray-250 dark:border-transparent rounded-xl pl-12 pr-3.5 py-2.5 text-xs font-semibold text-gray-800 dark:text-zinc-200 focus:outline-none focus:border-[#FF5522] dark:focus:border-[#FF5522] shadow-sm disabled:bg-gray-50 dark:disabled:bg-zinc-800 disabled:text-gray-400"
                />
              </div>
            </div>
            <div>
              <label className="block text-[9px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest mb-1.5 px-0.5">
                Електронна пошта (для сповіщень)
              </label>
              <input
                type="email"
                disabled={emailOtpMode}
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                placeholder="Введіть email (напр. user@student.ua)"
                className="w-full bg-white dark:bg-zinc-900 border border-gray-250 dark:border-transparent rounded-xl px-3.5 py-2.5 text-xs font-semibold text-gray-800 dark:text-zinc-200 focus:outline-none focus:border-[#FF5522] dark:focus:border-[#FF5522] shadow-sm disabled:bg-gray-50 dark:disabled:bg-zinc-800 disabled:text-gray-400"
              />
              <p className="text-[10px] text-gray-450 dark:text-zinc-500 mt-1 pl-0.5 leading-relaxed text-left">
                Потрібно виключно для надсилання сповіщень про статус ваших заявок на зміни.
              </p>
            </div>
            {emailOtpMode && (
              <div className="bg-[#FF5522]/5 border border-[#FF5522]/20 dark:border-transparent rounded-xl p-4 space-y-2 mt-2">
                <label className="block text-[9px] font-bold text-[#FF5522] uppercase tracking-widest px-0.5">
                  Введіть код підтвердження з пошти
                </label>
                <input
                  type="text"
                  required
                  value={editEmailOtpCode}
                  onChange={(e) => setEditEmailOtpCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="4-значний код"
                  className="w-full bg-white dark:bg-zinc-900 border border-[#FF5522]/40 dark:border-[#FF5522]/60 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-gray-800 dark:text-zinc-200 focus:outline-none focus:border-[#FF5522] shadow-sm text-center tracking-widest text-lg"
                />
                <p className="text-[10px] text-gray-400 dark:text-zinc-500 text-center leading-normal">
                  Ми надіслали 4-значний код на адресу <b>{editEmail}</b>. Введіть його для підтвердження.
                </p>
              </div>
            )}
            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 py-3 bg-[#FF5522] hover:bg-[#FF5522]/90 dark:bg-orange-500 dark:hover:bg-orange-600 text-white dark:text-white font-extrabold text-[10px] rounded-full uppercase tracking-wider transition-all active:scale-95 cursor-pointer"
              >
                Зберегти
              </button>
              <button
                type="button"
                onClick={cancelEditingProfile}
                className="flex-1 py-3 bg-gray-50 dark:bg-zinc-900 border border-gray-300 dark:border-transparent hover:bg-gray-100 dark:hover:bg-zinc-950 dark:hover:text-white text-gray-655 dark:text-zinc-200 font-extrabold text-[10px] rounded-full uppercase tracking-wider transition-all active:scale-95 cursor-pointer"
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
              className="group relative w-20 h-20 rounded-full overflow-hidden shadow-md mx-auto mb-3 cursor-pointer active:scale-95 transition-all border-2 border-orange-500/20"
              title="Змінити фото профілю"
            >
              {user.avatar_url ? (
                <img
                  src={`${API_URL.replace('/api', '')}${user.avatar_url}`}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-[#FF5522] dark:bg-[#F97316] text-white text-3xl font-black flex items-center justify-center">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'У'}
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                <Camera size={16} className="animate-pulse" />
              </div>
            </div>

            <h2 className="text-xl font-black text-gray-900 dark:text-zinc-200 mb-0.5">{user.name}</h2>
            <p className="text-xs text-gray-400 dark:text-zinc-550 font-bold uppercase tracking-wider mb-4">
              Одеса, Україна
            </p>

            {/* Dynamic Rating Stars */}
            <div
              onClick={() => user.rating && fetchVolunteerReviews(user.id, user.name)}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full border transition-all ${user.rating
                ? 'bg-yellow-50/50 border-yellow-200 text-yellow-700 dark:bg-orange-950/20 dark:border-transparent dark:text-[#F97316] cursor-pointer hover:bg-yellow-50 dark:hover:bg-orange-950/30'
                : 'bg-gray-50 border-gray-200 text-gray-400 dark:bg-zinc-800 dark:border-transparent dark:text-zinc-500'
                }`}
            >
              <Star size={15} className={user.rating ? "fill-yellow-400 text-yellow-500 dark:fill-orange-500 dark:text-orange-500" : ""} />
              <span className="text-xs font-black">
                {user.rating ? `${user.rating} / 5.0` : 'Без оцінок'}
              </span>
              {user.rating && (
                <span className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest pl-1">
                  (Дивитись відгуки)
                </span>
              )}
            </div>

            <div className="border-t border-gray-100 dark:border-zinc-800/80 mt-6 pt-5 text-left space-y-3 text-xs font-semibold text-gray-600 dark:text-zinc-400">
              <div className="flex justify-between items-center py-1">
                <span className="text-gray-400 dark:text-zinc-500 font-bold uppercase text-[10px]">Телефон:</span>
                <span className="text-gray-900 dark:text-zinc-200 font-black">{user.phone}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-t border-gray-50 dark:border-zinc-800/50">
                <span className="text-gray-400 dark:text-zinc-500 font-bold uppercase text-[10px]">Email для сповіщень:</span>
                <span className="text-gray-900 dark:text-zinc-200 font-black">
                  {user.email || <span className="text-gray-400 dark:text-zinc-600 italic font-medium">Не прив'язано</span>}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-t border-gray-50 dark:border-zinc-800/50">
                <span className="text-gray-400 dark:text-zinc-500 font-bold uppercase text-[10px]">Статус:</span>
                <span className="text-green-600 dark:text-green-400 font-black flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  <span>Готовий допомогти</span>
                </span>
              </div>

              {/* Email Notifications Toggle Switch */}
              <div className="flex items-center justify-between p-4 bg-white dark:bg-zinc-800/90 rounded-2xl shadow-md hover:shadow-lg dark:shadow-black/40 transition-all border-0 mt-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl transition-all ${emailNotificationsEnabled ? 'bg-orange-500/10 text-[#FF5522] dark:bg-orange-500/20 dark:text-orange-400' : 'bg-gray-100 text-gray-400 dark:bg-zinc-700/60 dark:text-zinc-400'}`}>
                    <Mail size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-gray-900 dark:text-zinc-100">Сповіщення на пошту</p>
                    <p className="text-[11px] text-gray-500 dark:text-zinc-400 font-medium">Листи про оновлення ваших заявок</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={toggleEmailNotifications}
                  className={`px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 cursor-pointer shadow-sm border-0 ${emailNotificationsEnabled
                      ? 'bg-emerald-500 text-white dark:bg-emerald-500 dark:text-white'
                      : 'bg-rose-500 text-white dark:bg-rose-600 dark:text-white'
                    }`}
                >
                  {emailNotificationsEnabled ? 'Увімкнено' : 'Вимкнено'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
              <button
                onClick={startEditingProfile}
                className="w-full py-3 bg-gray-50 hover:bg-gray-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-gray-800 dark:text-zinc-200 font-extrabold rounded-2xl border border-gray-200 dark:border-transparent transition-all active:scale-[0.98] text-xs uppercase tracking-wider cursor-pointer"
              >
                Редагувати профіль
              </button>

              <a
                href="https://forms.gle/kcDLFPYfXmGP183h6"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-2xl transition-all active:scale-95 text-xs uppercase tracking-wider cursor-pointer shadow-sm flex items-center justify-center gap-2"
              >
                <MessageSquare size={15} />
                <span>Залишити відгук</span>
              </a>
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {organization ? (
          <>
            <button
              onClick={toggleRole}
              className="w-full py-4 bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-700 text-gray-800 dark:text-zinc-200 font-extrabold rounded-2xl border border-gray-200 dark:border-transparent shadow-sm flex items-center justify-center gap-2.5 transition-all active:scale-95 text-xs uppercase tracking-wider cursor-pointer"
            >
              <Building2 size={16} className="text-[#FF5522]" />
              <span>Кабінет Організатора (B2B)</span>
            </button>
            {user.company_role !== 'owner' && (
              <button
                onClick={handleLeaveOrganization}
                className="w-full py-4 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 font-extrabold rounded-2xl border border-red-200 dark:border-transparent transition-all active:scale-[0.98] text-xs uppercase tracking-wider cursor-pointer flex items-center justify-center gap-2"
              >
                <LogOut size={15} />
                <span>Вийти з організації</span>
              </button>
            )}
          </>
        ) : (
          <button
            onClick={() => setIsOrgRegisterModalOpen(true)}
            className="w-full py-4 bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-700 text-gray-800 dark:text-zinc-200 font-extrabold rounded-2xl border border-gray-200 dark:border-transparent shadow-sm flex items-center justify-center gap-2.5 transition-all active:scale-95 text-xs uppercase tracking-wider cursor-pointer"
          >
            <PlusCircle size={16} className="text-[#FF5522]" />
            <span>Зареєструвати компанію</span>
          </button>
        )}

        <button
          onClick={handleSignOut}
          className="w-full py-4 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 font-extrabold rounded-2xl border border-red-200 dark:border-transparent shadow-sm flex items-center justify-center gap-2.5 transition-all active:scale-95 text-xs uppercase tracking-wider cursor-pointer"
        >
          <LogOut size={16} />
          <span>Вийти з акаунту</span>
        </button>
      </div>
    </div>
  );
}
