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
  theme: localStorage.getItem('oneclick_theme') || 'light',

  // Forms and settings
  isOrgRegisterModalOpen: false,
  showSettingsPanel: false,

  // Data States
  shifts: [],
  bookedShifts: [],
  b2bApplications: [],
  b2bShifts: [],
  orgMembers: [],
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
  setIsOrgRegisterModalOpen: (open) => set({ isOrgRegisterModalOpen: open }),
  setShowSettingsPanel: (show) => set({ showSettingsPanel: show }),
  setSelectedVolunteerProfile: (profile) => set({ selectedVolunteerProfile: profile }),
  setVolunteerReviews: (reviews) => set({ volunteerReviews: reviews }),
  setReviewsModalUserName: (name) => set({ reviewsModalUserName: name }),
  setIsReviewsModalOpen: (open) => set({ isReviewsModalOpen: open }),
  toggleTheme: () => {
    const nextTheme = get().theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('oneclick_theme', nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    set({ theme: nextTheme });
  },

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
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Помилка запиту');
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

    // Cache/throttle requests for 10 seconds to optimize server/DB performance on weak VPS
    if (!force && !paramsChanged && (now - lastFetchTime < 10000)) {
      return;
    }

    try {
      if (currentRole === 'B2C') {
        const fetchedShifts = await apiCall(`/shifts?date=${selectedDateStr}&category=${encodeURIComponent(selectedFilter)}&search=${encodeURIComponent(searchQuery)}`);
        set({ 
          shifts: fetchedShifts,
          lastFetchParams: { date: selectedDateStr, filter: selectedFilter, search: searchQuery }
        });
        const booked = await apiCall('/applications/my');
        set({ bookedShifts: booked, lastFetchTime: now });
      } else {
        if (!organization) {
          set({
            b2bApplications: [],
            b2bShifts: [],
            orgMembers: []
          });
          return;
        }
        const [apps, b2bShiftsData, membersData] = await Promise.all([
          apiCall('/applications/b2b'),
          apiCall('/shifts/b2b'),
          apiCall('/organizations/members').catch(() => [])
        ]);
        set({
          b2bApplications: apps,
          b2bShifts: b2bShiftsData,
          orgMembers: membersData,
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
      showToastMsg("Зміну успішно оновлено!", "success");
      loadData(undefined, undefined, undefined, true);
    } catch (err) {
      console.error("Помилка оновлення смени:", err);
      throw err;
    }
  }
}));
