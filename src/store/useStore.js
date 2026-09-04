import { create } from 'zustand';

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:8000/api" : "/api");

export const useStore = create((set, get) => ({
  user: null,
  organization: null,
  currentRole: 'B2C',
  activeB2CTab: 'search',
  activeB2BTab: 'manage',
  activeB2BFilter: 'АКТИВНІ',
  activeB2CShiftsFilter: 'АКТИВНІ',
  activeFacultyFilter: 'ALL',

  // Forms and settings
  isOrgRegisterModalOpen: false,
  showSettingsPanel: false,

  // Data States
  shifts: [],
  bookedShifts: [],
  b2bApplications: [],
  b2bShifts: [],
  orgMembers: [],
  shiftTemplates: [],
  // Notification state
  notifications: [],
  emailNotificationsEnabled: localStorage.getItem('email_notifications_enabled') !== 'false',

  toggleEmailNotifications: () => {
    set((state) => {
      const next = !state.emailNotificationsEnabled;
      localStorage.setItem('email_notifications_enabled', String(next));
      return { emailNotificationsEnabled: next };
    });
  },

  setEmailNotificationsEnabled: (enabled) => {
    localStorage.setItem('email_notifications_enabled', String(enabled));
    set({ emailNotificationsEnabled: enabled });
  },

  lastFetchTime: 0,
  lastFetchParams: { date: '', filter: '', search: '' },

  // Toast State
  toast: null,

  // Selected profile details
  selectedVolunteerProfile: null,
  volunteerReviews: [],
  reviewsModalUserName: '',
  isReviewsModalOpen: false,

  // Actions
  setUser: (user) => {
    if (user && !user.token) {
      const currentToken = get().user?.token || localStorage.getItem('oneclick_user_token');
      if (currentToken) {
        user = { ...user, token: currentToken };
      }
    }
    set({ user });
  },
  setOrganization: (org) => set({ organization: org }),
  setCurrentRole: (role) => set({ currentRole: role }),
  setActiveB2CTab: (tab) => set({ activeB2CTab: tab }),
  setActiveB2BTab: (tab) => set({ activeB2BTab: tab }),
  setActiveB2BFilter: (filter) => set({ activeB2BFilter: filter }),
  setActiveB2CShiftsFilter: (filter) => set({ activeB2CShiftsFilter: filter }),
  setActiveFacultyFilter: (filter) => set({ activeFacultyFilter: filter }),
  setIsOrgRegisterModalOpen: (open) => set({ isOrgRegisterModalOpen: open }),
  setShowSettingsPanel: (show) => set({ showSettingsPanel: show }),
  setSelectedVolunteerProfile: (profile) => set({ selectedVolunteerProfile: profile }),
  setVolunteerReviews: (reviews) => set({ volunteerReviews: reviews }),
  setReviewsModalUserName: (name) => set({ reviewsModalUserName: name }),
  setIsReviewsModalOpen: (open) => set({ isReviewsModalOpen: open }),

  showToastMsg: (message, type = 'success') => {
    set({ toast: { message, type } });
    setTimeout(() => {
      if (get().toast?.message === message) {
        set({ toast: null });
      }
    }, 3000);
  },

  apiCall: async (endpoint, method = 'GET', body = null) => {
    const headers = {
      'Content-Type': 'application/json',
    };
    const token = localStorage.getItem('oneclick_user_token') || (get().user && get().user.token);
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const config = {
      method,
      headers,
    };
    if (body) {
      config.body = JSON.stringify(body);
    }
    try {
      const response = await fetch(`${API_URL}${endpoint}`, config);
      if (!response.ok) {
        if (response.status === 401) {
          get().logout();
          throw new Error('UNAUTHORIZED');
        }
        if (response.status === 429) {
          const errorData = await response.json().catch(() => ({}));
          const rawDetail = typeof errorData.detail === 'string' ? errorData.detail : '';
          const friendlyMsg = rawDetail ? rawDetail : "Занадто багато запитів. Зачекайте кілька секунд.";
          throw new Error(friendlyMsg);
        }
        const errorData = await response.json().catch(() => ({}));
        let msg = 'Помилка запиту';
        if (typeof errorData.detail === 'string') {
          msg = errorData.detail;
        } else if (Array.isArray(errorData.detail) && errorData.detail.length > 0) {
          msg = errorData.detail[0]?.msg || 'Помилка валідації даних';
        }
        throw new Error(msg);
      }
      return await response.json();
    } catch (err) {
      if (err.message !== 'UNAUTHORIZED') {
        get().showToastMsg(err.message, 'error');
      }
      throw err;
    }
  },

  logout: () => {
    set({ user: null, organization: null });
    localStorage.removeItem('oneclick_user_id');
    localStorage.removeItem('oneclick_user_role');
    localStorage.removeItem('oneclick_user_token');
  },

  loadData: async (selectedDateStr, selectedFilter, searchQuery, force = false) => {
    const { user, organization, currentRole, apiCall, lastFetchTime, lastFetchParams } = get();
    if (!user) return;

    const now = Date.now();
    const paramsChanged =
      lastFetchParams.date !== selectedDateStr ||
      lastFetchParams.filter !== selectedFilter ||
      lastFetchParams.search !== searchQuery;

    // Cache/throttle requests for 60 seconds to ensure instant tab switching & optimize performance
    if (!force && !paramsChanged && (now - lastFetchTime < 60000)) {
      return;
    }

    try {
      if (currentRole === 'B2C') {
        const [fetchedShifts, allShiftsData, booked, notifsData] = await Promise.all([
          apiCall(`/shifts?date=${selectedDateStr}&category=${encodeURIComponent(selectedFilter)}&search=${encodeURIComponent(searchQuery)}`),
          apiCall('/shifts').catch(() => []),
          apiCall('/applications/my').catch(() => []),
          apiCall('/notifications?role=B2C').catch(() => [])
        ]);
        set({
          shifts: fetchedShifts,
          allShifts: allShiftsData || [],
          bookedShifts: booked,
          notifications: notifsData || [],
          lastFetchParams: { date: selectedDateStr, filter: selectedFilter, search: searchQuery },
          lastFetchTime: now
        });
      } else {
        if (!organization) {
          set({
            b2bApplications: [],
            b2bShifts: [],
            orgMembers: [],
            shiftTemplates: []
          });
          return;
        }
        const [apps, b2bShiftsData, membersData, templatesData, notifsData] = await Promise.all([
          apiCall('/applications/b2b'),
          apiCall('/shifts/b2b'),
          apiCall('/organizations/members').catch(() => []),
          apiCall('/shift-templates').catch(() => []),
          apiCall('/notifications?role=B2B').catch(() => [])
        ]);
        set({
          b2bApplications: apps,
          b2bShifts: b2bShiftsData,
          orgMembers: membersData,
          shiftTemplates: templatesData,
          notifications: notifsData || [],
          lastFetchTime: now
        });
      }
    } catch (err) {
      console.error("Помилка завантаження даних:", err);
    }
  },

  fetchVolunteerReviews: async (volunteerId, volunteerName) => {
    const { apiCall } = get();
    try {
      const [profileData, reviewsData] = await Promise.all([
        apiCall(`/users/${volunteerId}`),
        apiCall(`/users/${volunteerId}/reviews`)
      ]);
      set({
        selectedVolunteerProfile: profileData,
        volunteerReviews: reviewsData,
        reviewsModalUserName: volunteerName,
        isReviewsModalOpen: true
      });
    } catch (err) {
      console.error("Помилка при завантаженні профілю/відгуків:", err);
    }
  },

  deleteShift: async (shiftId) => {
    const { apiCall, showToastMsg, loadData } = get();
    try {
      const res = await apiCall(`/shifts/${shiftId}`, 'DELETE');
      showToastMsg(res.message, 'success');
      loadData(undefined, undefined, undefined, true);
    } catch (err) {
      console.error("Помилка видалення смени:", err);
    }
  },

  updateShift: async (shiftId, shiftData) => {
    const { apiCall, showToastMsg, loadData } = get();
    try {
      await apiCall(`/shifts/${shiftId}`, 'PUT', shiftData);
      set((state) => ({
        b2bShifts: state.b2bShifts.map((s) => (s.id === shiftId ? { ...s, ...shiftData } : s)),
        shifts: state.shifts.map((s) => (s.id === shiftId ? { ...s, ...shiftData } : s)),
      }));
      showToastMsg("Захід успішно оновлено!", "success");
      loadData(undefined, undefined, undefined, true);
    } catch (err) {
      console.error("Помилка оновлення смени:", err);
      throw err;
    }
  },

  createTemplate: async (templateData) => {
    const { apiCall, showToastMsg, loadData } = get();
    try {
      const newTemplate = await apiCall('/shift-templates', 'POST', templateData);
      showToastMsg("Шаблон успішно створено!", "success");
      loadData(undefined, undefined, undefined, true);
      return newTemplate;
    } catch (err) {
      console.error("Помилка створення шаблону:", err);
      throw err;
    }
  },

  deleteTemplate: async (templateId) => {
    const { apiCall, showToastMsg, loadData } = get();
    try {
      const res = await apiCall(`/shift-templates/${templateId}`, 'DELETE');
      showToastMsg(res.message, "success");
      loadData(undefined, undefined, undefined, true);
    } catch (err) {
      console.error("Помилка видалення шаблону:", err);
    }
  },

  updateTemplate: async (templateId, templateData) => {
    const { apiCall, showToastMsg, loadData } = get();
    try {
      await apiCall(`/shift-templates/${templateId}`, 'PUT', templateData);
      showToastMsg("Шаблон успішно оновлено!", "success");
      loadData(undefined, undefined, undefined, true);
    } catch (err) {
      console.error("Помилка оновлення шаблону:", err);
      throw err;
    }
  },

  cancelApplication: async (appId) => {
    const { apiCall, showToastMsg, loadData } = get();
    try {
      const res = await apiCall(`/applications/${appId}`, 'DELETE');
      showToastMsg(res.message || "Заявку успішно скасовано!", "success");
      loadData(undefined, undefined, undefined, true);
      return true;
    } catch (err) {
      console.error("Помилка скасування заявки:", err);
      return false;
    }
  },

  fetchNotifications: async () => {
    const { apiCall, currentRole } = get();
    const role = currentRole || 'B2C';
    try {
      const data = await apiCall(`/notifications?role=${role}`);
      set({ notifications: data || [] });
    } catch (err) {
      console.error("Помилка завантаження сповіщень:", err);
    }
  },

  markNotificationsRead: async () => {
    const { apiCall, fetchNotifications, currentRole } = get();
    const role = currentRole || 'B2C';
    try {
      await apiCall(`/notifications/read-all?role=${role}`, 'POST');
      fetchNotifications();
    } catch (err) {
      console.error("Помилка позначення сповіщень прочитаними:", err);
    }
  },

  clearNotifications: async () => {
    const { apiCall, fetchNotifications, currentRole } = get();
    const role = currentRole || 'B2C';
    try {
      await apiCall(`/notifications/clear?role=${role}`, 'DELETE');
      fetchNotifications();
    } catch (err) {
      console.error("Помилка очищення сповіщень:", err);
    }
  }
}));


