import React from 'react';
import { ChevronUp, ChevronDown, X, User, LogOut, Camera } from 'lucide-react';

export default function CoordinatorProfile({
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
  editOrgName,
  setEditOrgName,
  editOrgAddr,
  setEditOrgAddr,
  editOrgDesc,
  setEditOrgDesc,
  handleSaveProfile,
  handleGenerateInvite,
  isMembersListExpanded,
  setIsMembersListExpanded,
  orgMembers,
  handleRemoveMember,
  handleUpdateMemberRole,
  toggleRole,
  handleLeaveOrganization,
  handleSignOut,
  API_URL,
  startEditingProfile,
  cancelEditingProfile,
  handleAvatarUpload
}) {
  return (
    <div className="animate-fadeIn text-left">
      <div className="mb-5">
        <h1 className="text-xl font-black tracking-tight text-gray-900">Кабінет організації</h1>
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Кабінет керування установою / кафедрою</p>
      </div>

      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm mb-6">
        {isEditingProfile ? (
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 px-0.5">
                Ім'я Координатора
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
                  onChange={(e) => setEditPhone(e.target.value.replace(/\D/g, '').slice(0, 9))}
                  placeholder="9-значний номер (напр. 931234567)"
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
                placeholder="Введіть email"
                className="w-full bg-white border border-gray-250 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-gray-800 focus:outline-none focus:border-[#FF5522] shadow-sm disabled:bg-gray-50 disabled:text-gray-400"
              />
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
                <p className="text-[9px] text-[#FF5522] font-bold text-center uppercase tracking-wide">
                  * Якщо лист не надходить, перевірте папку "Спам"
                </p>
              </div>
            )}

            <div className="border-t border-gray-100 pt-4">
              <label className="block text-[10px] font-black text-gray-900 uppercase tracking-wider mb-3">
                Параметри організації
              </label>

              <div className="space-y-4">
                <div>
                  <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 px-0.5">
                    Назва Організації
                  </label>
                  <input
                    type="text"
                    required
                    disabled={user.company_role === 'member'}
                    value={editOrgName}
                    onChange={(e) => setEditOrgName(e.target.value)}
                    className="w-full bg-white border border-gray-250 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-gray-800 focus:outline-none focus:border-[#FF5522] shadow-sm disabled:bg-gray-50 disabled:text-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 px-0.5">
                    Адреса
                  </label>
                  <input
                    type="text"
                    required
                    disabled={user.company_role === 'member'}
                    value={editOrgAddr}
                    onChange={(e) => setEditOrgAddr(e.target.value)}
                    className="w-full bg-white border border-gray-250 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-gray-800 focus:outline-none focus:border-[#FF5522] shadow-sm disabled:bg-gray-50 disabled:text-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 px-0.5">
                    Опис діяльности
                  </label>
                  <textarea
                    rows="3"
                    required
                    disabled={user.company_role === 'member'}
                    value={editOrgDesc}
                    onChange={(e) => setEditOrgDesc(e.target.value)}
                    className="w-full bg-white border border-gray-250 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-gray-800 focus:outline-none focus:border-[#FF5522] shadow-sm resize-none disabled:bg-gray-50 disabled:text-gray-400"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="submit"
                className="flex-1 py-3 bg-[#FF5522] hover:bg-[#FF5522]/90 text-white font-extrabold text-[10px] rounded-full uppercase tracking-wider transition-all active:scale-[0.98] cursor-pointer"
              >
                Зберегти
              </button>
              <button
                type="button"
                onClick={cancelEditingProfile}
                className="flex-1 py-3 border border-gray-300 hover:bg-gray-50 text-gray-600 font-extrabold text-[10px] rounded-full uppercase tracking-wider transition-all active:scale-[0.98] cursor-pointer"
              >
                Скасувати
              </button>
            </div>
          </form>
        ) : (
          <>
            {/* Avatar Upload */}
            <input
              type="file"
              id="avatar-upload-input"
              className="hidden"
              accept="image/*"
              onChange={handleAvatarUpload}
            />
            <div
              onClick={() => document.getElementById('avatar-upload-input').click()}
              className="group relative w-16 h-16 rounded-full overflow-hidden shadow-md mx-auto mb-3 cursor-pointer active:scale-95 transition-all border border-gray-200"
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

            <h2 className="text-lg font-black text-gray-900 mb-0.5 text-center">{user.name}</h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-4 text-center">
              {user.company_role === 'owner' ? 'Засновник організації' : user.company_role === 'manager' ? 'Менеджер' : 'Член команди'}
            </p>

            <div className="border-t border-gray-100 mt-5 pt-4 text-left space-y-2 text-[11px] font-semibold text-gray-600">
              <div className="flex justify-between">
                <span>Телефон:</span>
                <span className="text-gray-950 font-bold">
                  {user.phone || <span className="text-gray-400 italic">Не вказано</span>}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Email для сповіщень:</span>
                <span className="text-gray-950 font-bold">
                  {user.email || <span className="text-gray-400 italic font-medium">Не прив'язано</span>}
                </span>
              </div>
            </div>

            <div className="border-t border-gray-100 mt-5 pt-4">
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Дані організації</p>
              <h3 className="font-black text-gray-900 text-sm mb-1 leading-snug">
                {organization ? organization.name : "..."}
              </h3>
              <p className="text-[9px] text-[#FF5522] font-black uppercase tracking-wider mb-2">
                Адреса: {organization ? organization.address : "..."}
              </p>
              <p className="text-xs text-gray-500 font-semibold leading-relaxed">
                {organization ? organization.description : "..."}
              </p>
            </div>

            {user.company_role === 'member' ? (
              <div className="w-full mt-4 p-3 bg-gray-50 border border-gray-150 rounded-xl text-[9px] font-bold text-gray-400 text-center uppercase tracking-wider">
                Запрошувати колег можуть лише Засновник та Менеджери
              </div>
            ) : (
              <button
                onClick={handleGenerateInvite}
                className="w-full mt-4 py-3.5 bg-[#FF5522] hover:bg-[#FF5522]/90 text-white font-extrabold rounded-xl transition-all active:scale-[0.98] text-[10px] uppercase tracking-wider cursor-pointer shadow-md flex items-center justify-center gap-1.5"
              >
                Згенерувати реферальне посилання
              </button>
            )}

            <button
              type="button"
              onClick={startEditingProfile}
              className="w-full mt-2 py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold rounded-xl border border-gray-200 transition-all active:scale-[0.98] text-[10px] uppercase tracking-wider cursor-pointer"
            >
              Редагувати профіль
            </button>

            {/* Organization Members Section */}
            <div className="mt-6 border-t border-gray-150 pt-5 text-left font-semibold">
              <button
                type="button"
                onClick={() => setIsMembersListExpanded(!isMembersListExpanded)}
                className="w-full flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-gray-900 mb-3 px-0.5 hover:text-[#FF5522] transition-colors cursor-pointer"
              >
                <span>Учасники організації ({orgMembers.length})</span>
                {isMembersListExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>

              {isMembersListExpanded && (
                <div className="space-y-3">
                  {/* Довідка про привілеї ролей */}
                  <div className="bg-orange-50/40 border border-orange-100/50 rounded-xl p-3 text-[10px] space-y-2 text-gray-600">
                    <p className="font-extrabold text-[#FF5522] uppercase tracking-wider mb-1">Довідка щодо прав доступу:</p>
                    <div className="leading-relaxed">
                      <span className="font-black text-gray-800 uppercase tracking-wide">Менеджер:</span> створює та редагує заходи, змінює опис організації, генерує реферальні посилання для запрошення колег.
                    </div>
                    <div className="leading-relaxed">
                      <span className="font-black text-gray-800 uppercase tracking-wide">Член команди:</span> створює заходи та переглядає команду. Не може редагувати компанію або запрошувати нових учасників.
                    </div>
                  </div>

                  {orgMembers.length > 0 ? (
                    <div className="space-y-2">
                      {orgMembers.map(member => {
                        const isCurrentUser = member.id === user.id;
                        const isOwner = member.company_role === 'owner';
                      const canDelete = user.company_role === 'owner' && !isOwner;

                      return (
                        <div key={member.id} className="bg-gray-50 border border-gray-100 rounded-xl p-2.5 flex items-center justify-between shadow-sm">
                          <div className="flex items-center gap-2.5 min-w-0">
                            {/* Avatar / Icon */}
                            <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 shadow-sm border border-gray-200">
                              {member.avatar_url ? (
                                <img
                                  src={`${API_URL.replace('/api', '')}${member.avatar_url}`}
                                  alt={member.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-[#FFCC00] text-black text-xs font-black flex items-center justify-center">
                                  {member.name ? member.name.charAt(0).toUpperCase() : 'У'}
                                </div>
                              )}
                            </div>

                            <div className="min-w-0">
                              <h4 className="text-xs font-black text-gray-800 flex items-center flex-wrap gap-1.5 leading-tight">
                                <span className="truncate max-w-[120px]">{member.name}</span>
                                {isCurrentUser && (
                                  <span className="text-[8px] bg-gray-250 text-gray-700 px-1 py-0.5 rounded font-black uppercase tracking-wider">Ви</span>
                                )}
                                {isOwner ? (
                                  <span className="text-[8px] bg-orange-50 text-orange-600 px-1 py-0.5 rounded font-black uppercase tracking-wider">Засновник</span>
                                ) : (
                                  user.company_role === 'owner' ? (
                                    <select
                                      value={member.company_role || 'member'}
                                      onChange={(e) => handleUpdateMemberRole(member.id, e.target.value)}
                                      className="text-[8px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-black uppercase tracking-wider border border-blue-200 focus:outline-none cursor-pointer"
                                    >
                                      <option value="member">Член команди</option>
                                      <option value="manager">Менеджер</option>
                                    </select>
                                  ) : (
                                    <span className="text-[8px] bg-blue-50 text-blue-600 px-1 py-0.5 rounded font-black uppercase tracking-wider">
                                      {member.company_role === 'manager' ? 'Менеджер' : 'Член команди'}
                                    </span>
                                  )
                                )}
                              </h4>
                            </div>
                          </div>

                          {canDelete && (
                            <button
                              type="button"
                              onClick={() => handleRemoveMember(member.id, member.name)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition-colors cursor-pointer shrink-0"
                              title="Вилучити з організації"
                            >
                              <X size={14} />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-[9px] text-gray-400 font-bold italic px-0.5">Учасників немає</p>
                )}
              </div>
            )}
            </div>
          </>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-150 space-y-2.5">
        <button
          type="button"
          onClick={toggleRole}
          className="w-full py-3.5 bg-white hover:bg-gray-50 text-gray-700 font-extrabold rounded-2xl border border-gray-200 shadow-sm flex items-center justify-center gap-2 transition-all active:scale-95 text-xs uppercase tracking-wider cursor-pointer"
        >
          <User size={14} className="text-[#FF5522]" />
          <span>Кабінет Волонтера (B2C)</span>
        </button>

        <div className="flex gap-2">
          {user.company_role !== 'owner' && (
            <button
              type="button"
              onClick={handleLeaveOrganization}
              className="flex-1 py-3 bg-red-50 hover:bg-red-100 text-red-655 font-bold rounded-xl border border-red-100 transition-all active:scale-95 text-[10px] uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1.5"
            >
              <LogOut size={13} className="text-red-550" />
              <span>Вийти з компанії</span>
            </button>
          )}
          <button
            type="button"
            onClick={handleSignOut}
            className="flex-1 py-3 bg-red-50 hover:bg-red-100 text-red-655 font-bold rounded-xl border border-red-100 transition-all active:scale-95 text-[10px] uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1.5"
          >
            <LogOut size={13} className="text-red-550" />
            <span>Вийти з акаунту</span>
          </button>
        </div>
      </div>
    </div>
  );
}
