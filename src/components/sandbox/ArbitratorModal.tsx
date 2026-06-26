import React from 'react';
import { ArrowLeft, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { Shift, DisputeMessage } from '../../types/sandbox';

interface ArbitratorModalProps {
  theme: 'light' | 'dark' | 'minimalist';
  arbitratorModalShiftId: string | null;
  setArbitratorModalShiftId: React.Dispatch<React.SetStateAction<string | null>>;
  shifts: Shift[];
  disputeChats: Record<string, DisputeMessage[]>;
  userRole: 'worker' | 'employer';
  disputeMessageText: string;
  setDisputeMessageText: React.Dispatch<React.SetStateAction<string>>;
  handleSendDisputeMessage: (shiftId: string, sender: 'employer' | 'worker') => void;
  handleResolveDisputeClean: (shiftId: string, resolution: 'pay_full' | 'compromise' | 'refund_full', decidedBy?: 'employer' | 'arbitrator') => void;
  handleSummonArbitrator: (shiftId: string) => void;
}

export function ArbitratorModal({
  theme,
  arbitratorModalShiftId,
  setArbitratorModalShiftId,
  shifts,
  disputeChats,
  userRole,
  disputeMessageText,
  setDisputeMessageText,
  handleSendDisputeMessage,
  handleResolveDisputeClean,
  handleSummonArbitrator
}: ArbitratorModalProps) {
  if (!arbitratorModalShiftId) return null;
  const shift = shifts.find(s => s.id === arbitratorModalShiftId);
  if (!shift) return null;

  const chatMessages = disputeChats[shift.id] || [];
  const isDisputeActive = shift.status === 'disputed';
  const isUnderReview = shift.disputeStatus === 'under_review';
  const isEmployer = userRole === 'employer';

  return (
    <div className={`absolute inset-0 z-50 flex flex-col animate-modal-in transition-colors duration-300 ${theme === 'light' ? 'bg-[#fcfbf9]' : 'bg-[#0f1424]'
      }`}>
      {/* Header */}
      <div className={`p-4 border-b flex items-center justify-between backdrop-blur-md sticky top-0 z-10 ${theme === 'light' ? 'bg-white/95 border-gray-150 text-[#001B3D]' : 'bg-[#161d33]/95 border-white/5 text-white'
        }`}>
        <button
          onClick={() => setArbitratorModalShiftId(null)}
          className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 transition-all"
        >
          <ArrowLeft className="w-5 h-5 text-[#FF5722]" />
        </button>
        <div className="flex-1 text-center px-2">
          {!isDisputeActive ? (
            <div className="flex items-center justify-center gap-1.5 animate-fade-in">
              <span className="font-black text-sm uppercase tracking-wider text-green-500">Спір вирішено</span>
              <CheckCircle className="w-4 h-4 text-green-500" />
            </div>
          ) : (
            <div className="flex items-center justify-center gap-1.5">
              <span className="font-black text-sm uppercase tracking-wider">Арбітраж OneClick</span>
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            </div>
          )}
          <p className="text-[10px] font-bold opacity-60 truncate">
            Івент #{shift.id.slice(0, 8).toUpperCase()} • {shift.role}
          </p>
        </div>
        <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 font-extrabold text-xs">
          ⚖️
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">

        {/* Dispute Summary Card */}
        <div className={`p-4 rounded-3xl border text-left space-y-3 ${theme === 'light'
          ? 'bg-white border-[#E5E7EB] text-[#001B3D] shadow-sm'
          : 'bg-[#161d33] border-white/5 text-white'
          }`}>
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-black text-sm">{shift.role}</h4>
              <p className="text-[11px] font-bold opacity-65">{shift.company}</p>
            </div>
            <span className="text-sm font-black text-[#FF5722]">
              {shift.volunteerReward || `+${Math.round(shift.price / 10)} балів`}
            </span>
          </div>

          <div className="pt-2.5 border-t border-dashed border-black/10 dark:border-white/10 space-y-2">
            <div className="flex items-center gap-1.5 text-xs text-red-500 font-bold">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span>Причина спору: {shift.disputeReason || 'Вирішено'}</span>
            </div>
            {shift.disputeComment && (
              <p className={`text-[11px] italic p-2.5 rounded-xl ${theme === 'light' ? 'bg-[#fcfbf9] text-gray-600' : 'bg-[#0f1424]/50 text-gray-300'
                }`}>
                &ldquo;{shift.disputeComment}&rdquo;
              </p>
            )}
          </div>

          <div className={`p-3 rounded-2xl text-[10px] font-semibold flex items-start gap-2 ${!isDisputeActive
            ? theme === 'light' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-green-950/20 border border-green-900/45 text-green-400'
            : isUnderReview
              ? theme === 'light' ? 'bg-blue-50 border border-blue-200 text-blue-800' : 'bg-blue-950/20 border border-blue-900/45 text-blue-400'
              : theme === 'light' ? 'bg-amber-50 border border-amber-200 text-amber-800' : 'bg-amber-950/20 border border-amber-900/45 text-amber-300'
            }`}>
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              {!isDisputeActive
                ? 'Справу закрито. Бали успішно нараховано/кориговано відповідно до рішення.'
                : isUnderReview
                  ? 'Справу розглядає незалежний арбітр. Менеджер вивчає фотозвіти та аргументи сторін.'
                  : 'Нарахування балів за івент призупинено в системі OneClick до винесення рішення.'
              }
            </span>
          </div>
        </div>

        {/* Dispute Actions or Chat */}
        {!isDisputeActive ? (
          /* Resolved Chat History */
          <div className="space-y-3 animate-fade-in">
            <div className="flex items-center justify-between text-[10px] font-black text-green-600 dark:text-green-400 px-1">
              <span>ЧАТ З АРБІТРОМ (СПІР ЗАКРИТО)</span>
              <span className="text-[9px] font-bold">Архів спору</span>
            </div>

            <div className={`p-3 rounded-2xl space-y-3 flex flex-col text-[11px] leading-relaxed min-h-[180px] ${theme === 'light' ? 'bg-white border border-[#E5E7EB]' : 'bg-[#161d33] border-white/5'
              }`}>
              {chatMessages.map((msg) => {
                if (msg.sender === 'system') {
                  return (
                    <div key={msg.id} className="text-center text-[9px] font-bold text-gray-500 py-1.5 bg-gray-500/5 rounded-xl border border-dashed border-gray-500/10 self-stretch">
                      {msg.text}
                    </div>
                  );
                }

                const isMe = msg.sender === (isEmployer ? 'employer' : 'worker');
                const isMgr = msg.sender === 'manager';

                let bubbleStyle = '';
                let alignStyle = '';

                if (isMe) {
                  alignStyle = 'self-end';
                  bubbleStyle = 'bg-[#FF5722] text-white rounded-2xl rounded-tr-none px-3.5 py-2.5 max-w-[85%] text-right font-semibold';
                } else if (isMgr) {
                  alignStyle = 'self-start';
                  bubbleStyle = 'bg-blue-500 text-white rounded-2xl rounded-tl-none px-3.5 py-2.5 max-w-[85%] font-semibold';
                } else {
                  alignStyle = 'self-start';
                  bubbleStyle = 'bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-2xl rounded-tl-none px-3.5 py-2.5 max-w-[85%] font-semibold';
                }

                return (
                  <div key={msg.id} className={`flex flex-col ${alignStyle}`}>
                    <span className="text-[9px] text-gray-400 font-bold mb-0.5 px-1">
                      {isMgr ? 'Арбітр OneClick' : isMe ? 'Ви' : (isEmployer ? 'Волонтер' : 'Організатор')}
                    </span>
                    <div className={bubbleStyle}>
                      {msg.text}
                    </div>
                    <span className="text-[8px] text-gray-400/70 font-semibold mt-0.5 px-1 self-end">
                      {msg.timestamp}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : isUnderReview ? (
          /* Under Review Chat History */
          <div className="space-y-3">
            <div className="flex items-center justify-between text-[10px] font-black text-blue-500 px-1">
              <span>ЧАТ З АРБІТРОМ</span>
              <span className="text-[9px] opacity-75 font-semibold">Арбітр у мережі</span>
            </div>

            <div className={`p-3 rounded-2xl space-y-3 flex flex-col text-[11px] leading-relaxed min-h-[180px] ${theme === 'light' ? 'bg-white border border-[#E5E7EB]' : 'bg-[#161d33] border-white/5'
              }`}>
              {chatMessages.map((msg) => {
                if (msg.sender === 'system') {
                  return (
                    <div key={msg.id} className="text-center text-[9px] font-bold text-gray-500 py-1.5 bg-gray-500/5 rounded-xl border border-dashed border-gray-500/10 self-stretch">
                      {msg.text}
                    </div>
                  );
                }

                const isMe = msg.sender === (isEmployer ? 'employer' : 'worker');
                const isMgr = msg.sender === 'manager';

                let bubbleStyle = '';
                let alignStyle = '';

                if (isMe) {
                  alignStyle = 'self-end';
                  bubbleStyle = 'bg-[#FF5722] text-white rounded-2xl rounded-tr-none px-3.5 py-2.5 max-w-[85%] text-right font-semibold';
                } else if (isMgr) {
                  alignStyle = 'self-start';
                  bubbleStyle = 'bg-blue-500 text-white rounded-2xl rounded-tl-none px-3.5 py-2.5 max-w-[85%] font-semibold';
                } else {
                  alignStyle = 'self-start';
                  bubbleStyle = 'bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-2xl rounded-tl-none px-3.5 py-2.5 max-w-[85%] font-semibold';
                }

                return (
                  <div key={msg.id} className={`flex flex-col ${alignStyle}`}>
                    <span className="text-[9px] text-gray-400 font-bold mb-0.5 px-1">
                      {isMgr ? 'Арбітр OneClick' : isMe ? 'Ви' : (isEmployer ? 'Волонтер' : 'Організатор')}
                    </span>
                    <div className={bubbleStyle}>
                      {msg.text}
                    </div>
                    <span className="text-[8px] text-gray-400/70 font-semibold mt-0.5 px-1 self-end">
                      {msg.timestamp}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Pending Initiation actions */
          <div className="py-6 text-center space-y-5">
            {isEmployer ? (
              <div className="space-y-4 text-left">
                <div className="rounded-xl p-3 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-semibold">
                  Виберіть рішення для врегулювання спору або передайте справу арбітру.
                </div>
                <div className="grid grid-cols-1 gap-2.5">
                  <button
                    onClick={() => {
                      handleResolveDisputeClean(shift.id, 'pay_full');
                      setArbitratorModalShiftId(null);
                    }}
                    className="w-full bg-[#10B981] hover:bg-[#0ea975] text-white py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all"
                  >
                    Нарахувати повністю ({shift.volunteerReward || `+${Math.round(shift.price / 10)} балів`})
                  </button>
                  <button
                    onClick={() => {
                      handleResolveDisputeClean(shift.id, 'compromise');
                      setArbitratorModalShiftId(null);
                    }}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all"
                  >
                    🤝 Компроміс (50% балів)
                  </button>
                  <button
                    onClick={() => {
                      handleResolveDisputeClean(shift.id, 'refund_full');
                      setArbitratorModalShiftId(null);
                    }}
                    className="w-full bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all"
                  >
                    Скасувати участь та анулювати бали
                  </button>
                  <button
                    onClick={() => handleSummonArbitrator(shift.id)}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider shadow-md transition-all active:scale-95"
                  >
                    ⚖️ Передати Справу Арбітру
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="w-16 h-16 mx-auto bg-amber-500/10 rounded-full flex items-center justify-center text-3xl">
                  ⚖️
                </div>
                <div className="space-y-1 px-4">
                  <h3 className={`font-black text-sm ${theme === 'light' ? 'text-[#001B3D]' : 'text-white'}`}>
                    Передати справу на розгляд арбітру?
                  </h3>
                  <p className={`text-[11px] leading-relaxed font-semibold ${theme === 'light' ? 'text-gray-550' : 'text-gray-400'}`}>
                    Арбітр OneClick детально вивчить фотозвіт, коментарі та чат з організатором, щоб прийняти рішення про зарахування протягом 10 секунд.
                  </p>
                </div>

                <button
                  onClick={() => handleSummonArbitrator(shift.id)}
                  className="w-full max-w-[280px] mx-auto bg-blue-500 hover:bg-blue-600 text-white py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider shadow-md transition-all active:scale-95"
                >
                  ⚖️ Залучити Арбітраж
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Chat Input Footer or Closed Chat Banner */}
      {!isDisputeActive ? (
        <div className={`p-4 border-t sticky bottom-0 z-10 text-center text-xs font-bold text-gray-500 flex items-center justify-center gap-1.5 ${theme === 'light' ? 'bg-white border-gray-150' : 'bg-[#161d33] border-white/5'
          }`}>
          <span className="w-2 h-2 rounded-full bg-green-500 inline-block animate-pulse"></span>
          <span>🔒 Спір вирішено. Чат закрито для нових повідомлень.</span>
        </div>
      ) : isUnderReview && (
        <div className={`p-4 border-t sticky bottom-0 z-10 flex gap-2 ${theme === 'light' ? 'bg-white border-gray-150' : 'bg-[#161d33] border-white/5'
          }`}>
          <input
            type="text"
            value={disputeMessageText}
            onChange={(e) => setDisputeMessageText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendDisputeMessage(shift.id, isEmployer ? 'employer' : 'worker');
            }}
            placeholder="Повідомлення арбітру..."
            className={`flex-1 px-4 py-3 text-xs font-semibold rounded-2xl border outline-none transition-all ${theme === 'light'
              ? 'bg-white border-gray-200 text-[#001B3D] focus:border-[#FF5722]'
              : 'bg-[#0f1424] border-[#2a3454] text-white focus:border-[#FF5722]'
              }`}
          />
          <button
            onClick={() => handleSendDisputeMessage(shift.id, isEmployer ? 'employer' : 'worker')}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 rounded-2xl text-xs font-black uppercase tracking-wider transition-all active:scale-95 flex items-center justify-center"
          >
            Надіслати
          </button>
        </div>
      )}
    </div>
  );
}
