/* eslint-disable @next/next/no-img-element */
'use client';

import React from 'react';
import { Camera, CheckCircle, Info, QrCode, AlertTriangle } from 'lucide-react';
import { useSandbox } from './src/hooks/useSandbox';
import { Header } from './src/components/sandbox/Header';
import { WelcomeScreen } from './src/components/sandbox/WelcomeScreen';
import { WorkerView } from './src/components/sandbox/WorkerView';
import { EmployerView } from './src/components/sandbox/EmployerView';
import { ArbitratorModal } from './src/components/sandbox/ArbitratorModal';

export default function OneClickApp() {
  const sandbox = useSandbox();

  const {
    isLoggedIn,
    setIsLoggedIn,
    userName,
    userPhone,
    userAvatar,
    setUserAvatar,
    isDiiaVerified,
    showAgreementModal,
    setShowAgreementModal,
    agreedToTerms,
    setAgreedToTerms,
    showAvatarEditModal,
    setShowAvatarEditModal,
    arbitratorModalShiftId,
    setArbitratorModalShiftId,
    authStep,
    setAuthStep,
    regRole,
    setRegRole,
    regCompanyName,
    setRegCompanyName,
    regCompanyEdrpou,
    setRegCompanyEdrpou,
    regCompanyAddress,
    setRegCompanyAddress,
    regCompanyCategory,
    setRegCompanyCategory,
    tempPhone,
    setTempPhone,
    tempName,
    setTempName,
    smsCode,
    setSmsCode,
    expectedSmsCode,
    setExpectedSmsCode,
    companyName,
    companyDetails,
    theme,
    setTheme,
    shifts,
    setShifts,
    userRole,
    setUserRole,
    activeTab,
    setActiveTab,
    b2bTab,
    setB2bTab,
    balance,
    rating,
    transactions,
    employerBalance,
    employerFrozenBalance,
    selectedShift,
    setSelectedShift,
    signedContract,
    setSignedContract,
    showQRModal,
    setShowQRModal,
    showScannerModal,
    setShowScannerModal,
    showCancelModal,
    setShowCancelModal,
    showB2BQRModalId,
    setShowB2BQRModalId,
    showDisputeModalId,
    setShowDisputeModalId,
    disputeReasonInput,
    setDisputeReasonInput,
    disputeCommentInput,
    setDisputeCommentInput,
    collapsedDisputes,
    setCollapsedDisputes,
    disputeChats,
    disputeMessageText,
    setDisputeMessageText,
    showReportModalId,
    setShowReportModalId,
    capturedPhoto,
    setCapturedPhoto,
    reportComment,
    setReportComment,
    isTakingPhoto,
    setIsTakingPhoto,
    simulateDeadline,
    setSimulateDeadline,
    selectedDate,
    setSelectedDate,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    profileSubPage,
    setProfileSubPage,
    newRole,
    setNewRole,
    isRoleComboOpen,
    setIsRoleComboOpen,
    newDate,
    setNewDate,
    newTime,
    setNewTime,
    newPrice,
    setNewPrice,
    newAddress,
    setNewAddress,
    newDetails,
    setNewDetails,
    newCategory,
    setNewCategory,
    myShiftsSubTab,
    setMyShiftsSubTab,
    toast,
    triggerToast,
    activeFeedbackShiftId,
    setActiveFeedbackShiftId,
    feedbackRating,
    setFeedbackRating,
    feedbackComment,
    setFeedbackComment,
    nowDate,
    calendarDays,
    feedShifts,
    handleSignOut,
    handleSubmitFeedback,
    handleWithdraw,
    handleSimulateScan,
    handleBookShift,
    handleCancelShift,
    handleCreateShift,
    handleAvatarFileChange,
    handleLoginSuccess,
    handleRegisterCompanySubmit,
    handleToggleUserRole,
    handleApproveShift,
    handleResolveDisputeClean,
    handleSendDisputeMessage,
    handleSummonArbitrator,
    handleSendReport,
    requiresScreening,
    setRequiresScreening,
    branches,
    selectedBranchId,
    setSelectedBranchId,
    handleAddBranch,
    handleDeleteBranch,
    handleDeposit
  } = sandbox;

  // Handler to open dispute from modal
  const handleSubmitDispute = () => {
    if (!disputeCommentInput.trim()) {
      triggerToast('Будь ласка, вкажіть опис претензії!');
      return;
    }

    setShifts(prev =>
      prev.map(s =>
        s.id === showDisputeModalId
          ? {
              ...s,
              status: 'disputed' as const,
              disputeReason: disputeReasonInput,
              disputeComment: disputeCommentInput.trim(),
              disputeStatus: 'pending_settlement' as const
            }
          : s
      )
    );
    setShowDisputeModalId(null);
    setDisputeCommentInput('');
    triggerToast('Спір відкрито. Оберіть варіант врегулювання! ⚖️');
  };

  return (
    <div className="h-[100dvh] md:h-auto w-screen bg-[#070913] text-[#1c1b1b] font-sans flex items-center justify-center p-0 md:p-6 transition-colors duration-300 overflow-hidden">
      {/* Mobile-first Mockup Frame */}
      <div className={`w-full max-w-[450px] h-[100dvh] md:h-[850px] md:min-h-[850px] md:max-h-[850px] md:rounded-[42px] md:shadow-[0_24px_80px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col relative border-none md:border-[8px] md:border-[#0f1424] transition-colors duration-300 ${
        theme === 'minimalist' ? 'bg-[#F9FAFB] theme-light' : theme === 'light' ? 'bg-[#eae5e0] theme-light' : 'bg-[#0b0f19] theme-dark'
      }`}>

        {/* LIQUID GLASS: Animated background blobs */}
        {theme !== 'minimalist' && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            <div className="absolute -top-10 -left-10 w-64 h-64 rounded-full bg-[#FF5722]/22 dark:bg-[#FF5722]/18 blur-[50px] animate-blob"></div>
            <div className="absolute top-[280px] -right-16 w-72 h-72 rounded-full bg-blue-500/24 dark:bg-blue-600/16 blur-[55px] animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-12 -left-16 w-64 h-64 rounded-full bg-purple-500/22 dark:bg-purple-600/16 blur-[50px] animate-blob animation-delay-4000"></div>
          </div>
        )}

        {/* Toast notifications */}
        {toast && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[9999] bg-[#001B3D]/75 backdrop-blur-[24px] text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-2 border border-white/10 text-xs font-semibold max-w-[85%] text-center animate-bounce">
            <span className="w-2 h-2 rounded-full bg-[#FF5722] inline-block"></span>
            {toast}
          </div>
        )}

        {/* Fullscreen Arbitrator Modal */}
        {arbitratorModalShiftId && (
          <ArbitratorModal
            theme={theme}
            arbitratorModalShiftId={arbitratorModalShiftId}
            setArbitratorModalShiftId={setArbitratorModalShiftId}
            shifts={shifts}
            disputeChats={disputeChats}
            userRole={userRole}
            disputeMessageText={disputeMessageText}
            setDisputeMessageText={setDisputeMessageText}
            handleSendDisputeMessage={handleSendDisputeMessage}
            handleResolveDisputeClean={handleResolveDisputeClean}
            handleSummonArbitrator={handleSummonArbitrator}
          />
        )}

        {!isLoggedIn ? (
          <WelcomeScreen
            theme={theme}
            setTheme={setTheme}
            authStep={authStep}
            setAuthStep={setAuthStep}
            regRole={regRole}
            setRegRole={setRegRole}
            agreedToTerms={agreedToTerms}
            setAgreedToTerms={setAgreedToTerms}
            setShowAgreementModal={setShowAgreementModal}
            regCompanyName={regCompanyName}
            setRegCompanyName={setRegCompanyName}
            regCompanyEdrpou={regCompanyEdrpou}
            setRegCompanyEdrpou={setRegCompanyEdrpou}
            regCompanyAddress={regCompanyAddress}
            setRegCompanyAddress={setRegCompanyAddress}
            regCompanyCategory={regCompanyCategory}
            setRegCompanyCategory={setRegCompanyCategory}
            tempPhone={tempPhone}
            setTempPhone={setTempPhone}
            tempName={tempName}
            setTempName={setTempName}
            smsCode={smsCode}
            setSmsCode={setSmsCode}
            expectedSmsCode={expectedSmsCode}
            setExpectedSmsCode={setExpectedSmsCode}
            handleRegisterCompanySubmit={handleRegisterCompanySubmit}
            handleLoginSuccess={handleLoginSuccess}
            triggerToast={triggerToast}
            setIsLoggedIn={setIsLoggedIn}
            setUserRole={setUserRole}
          />
        ) : (
          <>
            <Header
              theme={theme}
              setTheme={setTheme}
            />

            {userRole === 'worker' ? (
              <WorkerView
                theme={theme}
                setTheme={setTheme}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                selectedShift={selectedShift}
                setSelectedShift={setSelectedShift}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                calendarDays={calendarDays}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                feedShifts={feedShifts}
                shifts={shifts}
                nowDate={nowDate}
                signedContract={signedContract}
                setSignedContract={setSignedContract}
                handleBookShift={handleBookShift}
                myShiftsSubTab={myShiftsSubTab}
                setMyShiftsSubTab={setMyShiftsSubTab}
                activeFeedbackShiftId={activeFeedbackShiftId}
                setActiveFeedbackShiftId={setActiveFeedbackShiftId}
                feedbackRating={feedbackRating}
                setFeedbackRating={setFeedbackRating}
                feedbackComment={feedbackComment}
                setFeedbackComment={setFeedbackComment}
                handleSubmitFeedback={handleSubmitFeedback}
                handleWithdraw={handleWithdraw}
                triggerToast={triggerToast}
                setShowScannerModal={setShowScannerModal}
                setShowCancelModal={setShowCancelModal}
                setShowReportModalId={setShowReportModalId}
                collapsedDisputes={collapsedDisputes}
                setCollapsedDisputes={setCollapsedDisputes}
                setArbitratorModalShiftId={setArbitratorModalShiftId}
                balance={balance}
                transactions={transactions}
                userName={userName}
                userPhone={userPhone}
                userAvatar={userAvatar}
                isDiiaVerified={isDiiaVerified}
                rating={rating}
                profileSubPage={profileSubPage}
                setProfileSubPage={setProfileSubPage}
                setShowAvatarEditModal={setShowAvatarEditModal}
                simulateDeadline={simulateDeadline}
                setSimulateDeadline={setSimulateDeadline}
                handleSignOut={handleSignOut}
              />
            ) : (
              <EmployerView
                theme={theme}
                b2bTab={b2bTab}
                setB2bTab={setB2bTab}
                employerBalance={employerBalance}
                employerFrozenBalance={employerFrozenBalance}
                shifts={shifts}
                handleApproveShift={handleApproveShift}
                setShowDisputeModalId={setShowDisputeModalId}
                setShowB2BQRModalId={setShowB2BQRModalId}
                setArbitratorModalShiftId={setArbitratorModalShiftId}
                newRole={newRole}
                setNewRole={setNewRole}
                isRoleComboOpen={isRoleComboOpen}
                setIsRoleComboOpen={setIsRoleComboOpen}
                newCategory={newCategory}
                setNewCategory={setNewCategory}
                newPrice={newPrice}
                setNewPrice={setNewPrice}
                newDate={newDate}
                setNewDate={setNewDate}
                newTime={newTime}
                setNewTime={setNewTime}
                newAddress={newAddress}
                setNewAddress={setNewAddress}
                newDetails={newDetails}
                setNewDetails={setNewDetails}
                calendarDays={calendarDays}
                handleCreateShift={handleCreateShift}
                requiresScreening={requiresScreening}
                setRequiresScreening={setRequiresScreening}
                branches={branches}
                selectedBranchId={selectedBranchId}
                setSelectedBranchId={setSelectedBranchId}
                companyName={companyName}
                companyDetails={companyDetails}
                transactions={transactions}
                userName={userName}
                userPhone={userPhone}
                userAvatar={userAvatar}
                handleSignOut={handleSignOut}
                handleAddBranch={handleAddBranch}
                handleDeleteBranch={handleDeleteBranch}
                handleDeposit={handleDeposit}
              />
            )}
          </>
        )}
      </div>

      {/* --- MOCK QR MODAL POPUP --- */}
      {showQRModal && (() => {
        const qrData = `oneclick:checkin:${showQRModal}:${userPhone}`;
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrData)}`;
        return (
          <div className="fixed inset-0 z-50 bg-[#001B3D]/80 flex items-center justify-center p-6 backdrop-blur-2xl">
            <div className={`rounded-[32px] p-8 w-full max-w-sm text-center shadow-2xl relative z-10 border flex flex-col items-center animate-modal-in ${
              theme === 'minimalist' || theme === 'light' ? 'bg-white border-slate-200' : 'bg-[#1c2541]/80 border-white/10'
            }`}>
              <div className="w-20 h-20 bg-[#FF5722]/10 rounded-full flex items-center justify-center mb-6">
                <QrCode className="w-10 h-10 text-[#FF5722]" />
              </div>
              <h3 className={`text-2xl font-bold mb-2 ${theme === 'minimalist' || theme === 'light' ? 'text-slate-800' : 'text-white'}`}>Чек-ін на зміну</h3>
              <p className={`text-xs font-bold leading-normal mb-8 ${theme === 'minimalist' || theme === 'light' ? 'text-slate-500' : 'text-gray-300'}`}>
                Покажіть цей код менеджеру закладу для фіксації прибуття на роботу.
              </p>
              <div className={`p-6 rounded-3xl mb-8 border-2 border-dashed flex items-center justify-center ${
                theme === 'minimalist' || theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-[#121829]/60 border-white/10'
              }`}>
                <img src={qrUrl} className="w-48 h-48 rounded-xl bg-white p-2 border shadow-inner" alt="QR Code" />
              </div>
              <button
                onClick={() => setShowQRModal(null)}
                className={`w-full py-4 rounded-2xl font-bold text-sm active:scale-95 transition-all shadow-md ${
                  theme === 'minimalist'
                    ? 'bg-slate-900 text-white hover:bg-slate-850'
                    : theme === 'light'
                      ? 'bg-[#001B3D] text-white hover:bg-[#001430]'
                      : 'bg-[#FF5722] text-white hover:bg-[#e64a19]'
                }`}
              >
                Закрити
              </button>
            </div>
          </div>
        );
      })()}

      {/* --- MOCK QR SCANNER MODAL FOR WORKER --- */}
      {showScannerModal && (() => {
        const targetShift = shifts.find(s => s.id === showScannerModal);
        return (
          <div className="fixed inset-0 z-50 bg-[#001B3D]/80 flex items-center justify-center p-6 backdrop-blur-2xl">
            <div className={`rounded-[32px] p-8 w-full max-w-sm text-center shadow-2xl relative z-10 border flex flex-col items-center animate-modal-in ${
              theme === 'minimalist' || theme === 'light' ? 'bg-white border-slate-200' : 'bg-[#1c2541]/80 border-white/10'
            }`}>
              <div className="w-16 h-16 bg-[#FF5722]/10 rounded-full flex items-center justify-center mb-5">
                <Camera className="w-8 h-8 text-[#FF5722]" />
              </div>
              <h3 className={`text-xl font-bold mb-2 ${theme === 'minimalist' || theme === 'light' ? 'text-slate-850' : 'text-white'}`}>Сканування QR закладу</h3>
              <p className={`text-xs font-semibold leading-normal mb-6 ${theme === 'minimalist' || theme === 'light' ? 'text-slate-500' : 'text-gray-300'}`}>
                Наведіть камеру на QR-код, який надасть менеджер у закладі <span className="text-[#FF5722] font-black">{targetShift?.company}</span>.
              </p>
              {/* Simulated Viewfinder */}
              <div className="relative w-48 h-48 rounded-3xl overflow-hidden mb-6 border-2 border-[#FF5722]/35 bg-black">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#FF5722]/10 pointer-events-none" />
                <div className="absolute left-0 right-0 h-1 bg-[#FF5722] shadow-[0_0_8px_#FF5722] animate-bounce top-1/2" />
                <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-white" />
                <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-white" />
                <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-white" />
                <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-white" />
                <QrCode className="w-24 h-24 text-white/15 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => handleSimulateScan(showScannerModal)}
                  className="flex-1 bg-gradient-to-br from-[#10B981] to-[#0ea975] text-white py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all active:scale-95 shadow-md"
                >
                  Зісканувати
                </button>
                <button
                  onClick={() => setShowScannerModal(null)}
                  className={`px-5 py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all active:scale-95 border ${
                    theme === 'minimalist' || theme === 'light' ? 'border-slate-200 text-slate-800 hover:bg-slate-50' : 'border-white/10 text-white'
                  }`}
                >
                  Скасувати
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* --- CANCELLATION MODAL POPUP --- */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 bg-[#001B3D]/80 flex items-center justify-center p-6 backdrop-blur-2xl">
          <div className={`rounded-[32px] p-8 w-full max-w-sm text-center shadow-2xl relative z-10 border flex flex-col items-center animate-modal-in ${
            theme === 'minimalist' || theme === 'light' ? 'bg-white border-slate-200' : 'bg-[#1c2541]/80 border-white/10'
          }`}>
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-5">
              <Info className="w-8 h-8 text-red-500" />
            </div>
            <h3 className={`text-xl font-bold mb-2 ${theme === 'minimalist' || theme === 'light' ? 'text-slate-850' : 'text-white'}`}>Скасувати зміну?</h3>
            <p className={`text-xs font-semibold leading-normal mb-6 ${theme === 'minimalist' || theme === 'light' ? 'text-slate-500' : 'text-gray-300'}`}>
              Виберіть варіант скасування. Зверніть увагу, що пізня відмова порушує правила платформи та призведе до штрафу.
            </p>
            <div className="space-y-3 w-full mb-6">
              <button
                onClick={() => handleCancelShift(showCancelModal, false)}
                className={`w-full py-3.5 px-4 rounded-xl border text-xs font-bold transition-all text-left flex justify-between items-center ${
                  theme === 'minimalist' || theme === 'light'
                    ? 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
                    : 'bg-[#121829]/50 border-white/10 text-white hover:bg-[#121829]'
                }`}
              >
                <div>
                  <p className="font-bold">Скасувати заздалегідь</p>
                  <p className="text-[10px] font-semibold text-gray-400 mt-0.5">Більше ніж за 2 години до початку</p>
                </div>
                <span className="text-[10px] bg-green-500/10 text-green-500 px-2 py-0.5 rounded font-black">БЕЗ ШТРАФУ</span>
              </button>
              <button
                onClick={() => handleCancelShift(showCancelModal, true)}
                className={`w-full py-3.5 px-4 rounded-xl border text-xs font-bold transition-all text-left flex justify-between items-center ${
                  theme === 'minimalist' || theme === 'light'
                    ? 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
                    : 'bg-[#121829]/50 border-white/10 text-white hover:bg-[#121829]'
                }`}
              >
                <div>
                  <p className="font-bold text-red-500">Термінове скасування</p>
                  <p className="text-[10px] font-semibold text-gray-400 mt-0.5">Менш ніж за 2 години до початку</p>
                </div>
                <span className="text-[10px] bg-red-500/10 text-red-500 px-2 py-0.5 rounded font-black">ШТРАФ 250 ₴</span>
              </button>
            </div>
            <button
              onClick={() => setShowCancelModal(null)}
              className={`w-full py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider active:scale-95 transition-all ${
                theme === 'minimalist' || theme === 'light' ? 'bg-slate-100 text-slate-800 hover:bg-slate-200' : 'bg-[#1c2541] text-white'
              }`}
            >
              Назад
            </button>
          </div>
        </div>
      )}

      {/* --- B2B PERSISTENT VENUE QR CODE DISPLAY MODAL --- */}
      {showB2BQRModalId && (() => {
        const targetShift = shifts.find(s => s.id === showB2BQRModalId);
        const qrData = `oneclick:venue:${showB2BQRModalId}`;
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrData)}`;
        return (
          <div className="fixed inset-0 z-50 bg-[#001B3D]/80 flex items-center justify-center p-6 backdrop-blur-2xl">
            <div className={`rounded-[32px] p-8 w-full max-w-sm text-center shadow-2xl relative z-10 border flex flex-col items-center animate-modal-in ${
              theme === 'minimalist' || theme === 'light' ? 'bg-white border-slate-200' : 'bg-[#1c2541]/90 border-white/10'
            }`}>
              <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-5">
                <QrCode className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className={`text-xl font-bold mb-2 ${theme === 'minimalist' || theme === 'light' ? 'text-slate-850' : 'text-white'}`}>QR закладу</h3>
              <p className={`text-xs font-semibold leading-normal mb-6 ${theme === 'minimalist' || theme === 'light' ? 'text-slate-550' : 'text-gray-350'}`}>
                Надайте цей QR-код виконавцю для старту зміни <span className="text-[#FF5722] font-black">{targetShift?.role}</span>.
              </p>
              <div className={`p-6 rounded-3xl mb-8 border-2 border-dashed flex items-center justify-center ${
                theme === 'minimalist' || theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-[#121829]/60 border-white/10'
              }`}>
                <img src={qrUrl} className="w-40 h-40 rounded-xl bg-white p-2 border shadow-inner" alt="Venue QR Code" />
              </div>
              <button
                onClick={() => setShowB2BQRModalId(null)}
                className={`w-full py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider active:scale-95 transition-all ${
                  theme === 'minimalist'
                    ? 'bg-slate-900 text-white hover:bg-slate-850'
                    : theme === 'light'
                      ? 'bg-[#001B3D] text-white'
                      : 'bg-[#FF5722] text-white'
                }`}
              >
                Закрити
              </button>
            </div>
          </div>
        );
      })()}

      {/* --- B2B OPEN DISPUTE MODAL --- */}
      {showDisputeModalId && (
        <div className="fixed inset-0 z-50 bg-[#001B3D]/80 flex items-center justify-center p-6 backdrop-blur-2xl">
          <div className={`rounded-[32px] p-6 w-full max-w-sm text-center shadow-2xl relative z-10 border flex flex-col animate-modal-in ${
            theme === 'minimalist' || theme === 'light' ? 'bg-white border-slate-200' : 'bg-[#1c2541]/90 border-white/10'
          }`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-sm font-black uppercase tracking-wider ${theme === 'minimalist' || theme === 'light' ? 'text-slate-850' : 'text-white'}`}>
                Відкрити спір
              </h3>
              <button
                onClick={() => {
                  setShowDisputeModalId(null);
                  setDisputeCommentInput('');
                }}
                className={`text-xs font-bold ${theme === 'minimalist' || theme === 'light' ? 'text-slate-400 hover:text-slate-600' : 'text-gray-400'}`}
              >
                Закрити
              </button>
            </div>
            <div className="text-left space-y-3 mb-6">
              <div>
                <label className={`text-[10px] font-black uppercase tracking-wider block mb-1 ${theme === 'minimalist' || theme === 'light' ? 'text-slate-500' : 'text-gray-400'}`}>
                  Причина спору:
                </label>
                <select
                  value={disputeReasonInput}
                  onChange={(e) => setDisputeReasonInput(e.target.value)}
                  className={`w-full border rounded-xl px-3 py-2.5 text-xs font-bold outline-none transition-all ${
                    theme === 'minimalist' || theme === 'light'
                      ? 'bg-slate-50 border-slate-200 text-slate-800 focus:border-[#FF5722]'
                      : 'bg-[#121829]/50 border-[#2a3454] text-white focus:border-[#FF5722]'
                  }`}
                >
                  <option value="Некачественно выполненная работа">Неякісно виконана робота</option>
                  <option value="Неполный рабочий день">Неповний робочий час</option>
                  <option value="Опоздание / Отсутствие">Запізнення / Відсутність</option>
                  <option value="Несоответствие требованиям">Невідповідність вимогам</option>
                  <option value="Другая причина">Інша причина</option>
                </select>
              </div>
              <div>
                <label className={`text-[10px] font-black uppercase tracking-wider block mb-1 ${theme === 'minimalist' || theme === 'light' ? 'text-slate-500' : 'text-gray-400'}`}>
                  Опис претензії:
                </label>
                <textarea
                  rows={3}
                  value={disputeCommentInput}
                  onChange={(e) => setDisputeCommentInput(e.target.value)}
                  placeholder="Детально опишіть, що саме виконано не так..."
                  className={`w-full border rounded-xl px-3 py-2 text-xs font-bold outline-none resize-none transition-all ${
                    theme === 'minimalist' || theme === 'light'
                      ? 'bg-slate-50 border-slate-200 text-slate-800 focus:border-[#FF5722]'
                      : 'bg-[#121829]/50 border-[#2a3454] text-white focus:border-[#FF5722]'
                  }`}
                />
              </div>
            </div>
            <button
              onClick={handleSubmitDispute}
              className="w-full bg-[#FF5722] hover:bg-[#e64a19] text-white py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-md"
            >
              <AlertTriangle className="w-4 h-4" />
              Ініціювати спір
            </button>
          </div>
        </div>
      )}

      {/* --- MOCK USER AGREEMENT MODAL --- */}
      {showAgreementModal && (
        <div className="fixed inset-0 z-[9999] bg-[#001B3D]/80 flex items-center justify-center p-4 backdrop-blur-2xl">
          <div className={`rounded-[32px] p-6 w-full max-w-md shadow-2xl relative z-10 border flex flex-col max-h-[85vh] animate-modal-in ${
            theme === 'minimalist' || theme === 'light' ? 'bg-white border-slate-200' : 'bg-[#1c2541] border-white/10'
          }`}>
            <h3 className={`text-xl font-black mb-4 uppercase tracking-tight ${theme === 'minimalist' || theme === 'light' ? 'text-slate-850' : 'text-white'}`}>
              Угода користувача OneClick
            </h3>
            <div className={`flex-1 overflow-y-auto pr-2 text-xs leading-relaxed space-y-3 mb-6 no-scrollbar ${
              theme === 'minimalist' || theme === 'light' ? 'text-slate-600' : 'text-gray-300'
            }`}>
              <p className="font-bold text-[#FF5722]">Тестова версія угоди для платформи OneClick</p>
              <p>
                <strong>1. Загальні положення</strong><br />
                Цей документ визначає умови використання платформи OneClick, яка з’єднує незалежних виконавців (робітників) та замовників (роботодавців) для короткострокових змін.
              </p>
              <p>
                <strong>2. Верифікація профілю</strong><br />
                Для гарантування безпеки користувачі проходять обов’язкову верифікацію через інтеграцію з державним сервісом Дія або за допомогою підтвердження номера телефону через SMS.
              </p>
              <p>
                <strong>3. Оплата та страхування</strong><br />
                Оплата за виконані зміни резервується на балансі роботодавця до моменту успішного завершення робіт. Усі розбіжності вирішуються через вбудований арбітраж та систему спорів з менеджером.
              </p>
              <p>
                <strong>4. Зміна даних та Identity</strong><br />
                Ви маєте право змінювати фото профілю, особисті дані та реквізити для виплат виключно у відповідності з чинним законодавством України.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setAgreedToTerms(true);
                  setShowAgreementModal(false);
                  triggerToast('Угоду успішно прийнято! 👍');
                }}
                className="flex-1 bg-[#FF5722] hover:bg-[#e64a19] text-white py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all active:scale-95"
              >
                Я погоджуюсь
              </button>
              <button
                onClick={() => setShowAgreementModal(false)}
                className={`px-5 py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all active:scale-95 border ${
                  theme === 'minimalist' || theme === 'light' ? 'border-slate-200 text-slate-800 hover:bg-slate-50' : 'border-white/10 text-white'
                }`}
              >
                Закрити
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- PHOTO EDIT MODAL --- */}
      {showAvatarEditModal && (
        <div className="fixed inset-0 z-[9999] bg-[#001B3D]/80 flex items-center justify-center p-4 backdrop-blur-2xl">
          <div className={`rounded-[32px] p-6 w-full max-w-sm shadow-2xl relative z-10 border flex flex-col animate-modal-in ${
            theme === 'minimalist' || theme === 'light' ? 'bg-white border-slate-200' : 'bg-[#1c2541] border-white/10'
          }`}>
            <h3 className={`text-lg font-black mb-4 uppercase tracking-tight text-center ${theme === 'minimalist' || theme === 'light' ? 'text-slate-850' : 'text-white'}`}>
              Зміна фото профілю
            </h3>
            <div className="mb-6">
              <input
                type="file"
                id="avatar-file-input"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarFileChange}
              />
              <button
                onClick={() => document.getElementById('avatar-file-input')?.click()}
                className="w-full bg-[#FF5722] hover:bg-[#e64a19] text-white py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-md"
              >
                <Camera className="w-4 h-4" />
                Завантажити з пристрою
              </button>
            </div>
            <div className={`border-t my-4 pt-4 text-center ${theme === 'minimalist' || theme === 'light' ? 'border-slate-100' : 'border-white/5'}`}>
              <p className={`text-[10px] font-black uppercase tracking-wider mb-3 ${theme === 'minimalist' || theme === 'light' ? 'text-slate-500' : 'text-gray-400'}`}>
                Або оберіть готовий аватар:
              </p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
                  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
                  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
                  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
                  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&auto=format&fit=crop&q=80'
                ].map((url, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setUserAvatar(url);
                      setShowAvatarEditModal(false);
                      triggerToast('Фото профілю оновлено! 📸');
                    }}
                    className="relative rounded-full overflow-hidden w-16 h-16 mx-auto border-2 border-transparent hover:border-[#FF5722] transition-all hover:scale-105"
                  >
                    <img src={url} className="w-full h-full object-cover" alt={`Preset ${idx + 1}`} />
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={() => setShowAvatarEditModal(false)}
              className={`w-full py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider mt-4 border transition-all ${
                theme === 'minimalist' || theme === 'light' ? 'border-slate-200 text-slate-800 hover:bg-slate-50' : 'border-white/10 text-white'
              }`}
            >
              Скасувати
            </button>
          </div>
        </div>
      )}

      {/* --- B2C WORK REPORT & PHOTO REPORT SCREEN --- */}
      {showReportModalId && (() => {
        return (
          <div className="fixed inset-0 z-50 bg-[#001B3D]/80 flex items-center justify-center p-6 backdrop-blur-2xl">
            <div className={`rounded-[32px] p-6 w-full max-w-sm text-center shadow-2xl relative z-10 border flex flex-col animate-modal-in ${
              theme === 'minimalist' || theme === 'light' ? 'bg-white border-slate-200' : 'bg-[#1c2541]/90 border-white/10'
            }`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className={`text-sm font-black uppercase tracking-wider ${theme === 'minimalist' || theme === 'light' ? 'text-slate-850' : 'text-white'}`}>
                  Звіт про виконання
                </h3>
                <button
                  onClick={() => {
                    setShowReportModalId(null);
                    setCapturedPhoto(null);
                    setReportComment('');
                  }}
                  className={`text-xs font-bold ${theme === 'minimalist' || theme === 'light' ? 'text-slate-400 hover:text-slate-650' : 'text-gray-400'}`}
                >
                  Закрити
                </button>
              </div>

              {/* Photo Area */}
              <div className="mb-4">
                {capturedPhoto ? (
                  <div className="relative w-full h-44 rounded-2xl overflow-hidden bg-black border border-white/10">
                    <img src={capturedPhoto} alt="Work Report Proof" className="w-full h-full object-cover" />
                    <button
                      onClick={() => setCapturedPhoto(null)}
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
                    >
                      Видалити
                    </button>
                  </div>
                ) : isTakingPhoto ? (
                  <div className="relative w-full h-44 rounded-2xl bg-black flex flex-col items-center justify-center text-white space-y-2 border border-white/10">
                    <div className="w-3.5 h-3.5 rounded-full bg-red-500 animate-pulse absolute top-3 left-3" />
                    <Camera className="w-8 h-8 text-white/50 animate-bounce" />
                    <p className="text-[10px] font-bold text-white/70">Вирівняйте кадр робочої зони...</p>
                    <button
                      onClick={() => {
                        setIsTakingPhoto(false);
                        setCapturedPhoto('https://images.unsplash.com/photo-1513694203232-719a280e022f?w=400&auto=format&fit=crop&q=80');
                        triggerToast('Фотозвіт успішно створено! 📸');
                      }}
                      className="bg-[#10B981] hover:bg-[#0ea975] text-white px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all"
                    >
                      Зробити знімок
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsTakingPhoto(true)}
                    className={`w-full h-44 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all ${
                      theme === 'minimalist' || theme === 'light'
                        ? 'bg-slate-50 border-slate-200 hover:bg-slate-100/60'
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <Camera className="w-8 h-8 text-[#FF5722] mb-2" />
                    <span className={`text-[11px] font-bold ${theme === 'minimalist' || theme === 'light' ? 'text-slate-850' : 'text-white'}`}>Сфотографувати робоче місце *</span>
                    <span className="text-[9px] text-gray-400 mt-1 uppercase font-semibold">Обов’язково для оплати</span>
                  </button>
                )}
              </div>

              {/* Comment Input */}
              <div className="text-left mb-6">
                <label className={`text-[10px] font-black uppercase tracking-wider block mb-1.5 ${theme === 'minimalist' || theme === 'light' ? 'text-slate-500' : 'text-gray-400'}`}>
                  Коментар до звіту (необов’язково):
                </label>
                <textarea
                  rows={2}
                  value={reportComment}
                  onChange={(e) => setReportComment(e.target.value)}
                  placeholder="Наприклад: роботу завершено, все прибрано, полиці заповнені..."
                  className={`w-full border rounded-xl px-3 py-2 text-xs font-bold outline-none resize-none transition-all ${
                    theme === 'minimalist' || theme === 'light'
                      ? 'bg-slate-50 border-slate-200 text-slate-800 focus:border-[#FF5722] focus:bg-white'
                      : 'bg-[#121829]/50 border-[#2a3454] text-white focus:border-[#FF5722] focus:bg-[#121829]'
                  }`}
                />
              </div>

              <button
                onClick={handleSendReport}
                className="w-full bg-[#10B981] hover:bg-[#0ea975] text-white py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-md"
              >
                <CheckCircle className="w-4 h-4" />
                Надіслати звіт та Чек-аут
              </button>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
