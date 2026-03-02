import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
    getApplications,
    getResumes,
    getContacts,
    getSavedJobs,
    getReminders,
    getUpcomingReminders,
    getDashboardAnalytics,
    getMyStats,
} from '../services/api';

const AppContext = createContext(null);

export function AppProvider({ children }) {
    const [applications, setApplications] = useState([]);
    const [resumes, setResumes] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [savedJobs, setSavedJobs] = useState([]);
    const [reminders, setReminders] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    // ── Granular refresh functions ──────────────────────────
    const refreshApplications = useCallback(async () => {
        try {
            const data = await getApplications();
            setApplications(data);
            return data;
        } catch {
            return applications;
        }
    }, []);

    const refreshResumes = useCallback(async () => {
        try {
            const data = await getResumes();
            setResumes(data);
            return data;
        } catch {
            return resumes;
        }
    }, []);

    const refreshContacts = useCallback(async (params = {}) => {
        try {
            const data = await getContacts(params);
            setContacts(data);
            return data;
        } catch {
            return contacts;
        }
    }, []);

    const refreshSavedJobs = useCallback(async (params = {}) => {
        try {
            const data = await getSavedJobs(params);
            setSavedJobs(data);
            return data;
        } catch {
            return savedJobs;
        }
    }, []);

    const refreshReminders = useCallback(async ({ upcoming = true, ...params } = {}) => {
        try {
            const data = upcoming
                ? await getUpcomingReminders(100)
                : await getReminders(params);
            setReminders(data);
            return data;
        } catch {
            return reminders;
        }
    }, []);

    const refreshAnalytics = useCallback(async () => {
        try {
            const data = await getDashboardAnalytics();
            setAnalytics(data);
            return data;
        } catch {
            return analytics;
        }
    }, []);

    const refreshStats = useCallback(async () => {
        try {
            const data = await getMyStats();
            setStats(data);
            return data;
        } catch {
            return stats;
        }
    }, []);

    // ── Load all data on mount ─────────────────────────────
    const refreshAll = useCallback(async () => {
        setLoading(true);
        try {
            const [apps, res, conts, jobs, rems, anal, st] = await Promise.allSettled([
                getApplications(),
                getResumes(),
                getContacts(),
                getSavedJobs(),
                getUpcomingReminders(100),
                getDashboardAnalytics(),
                getMyStats(),
            ]);
            setApplications(apps.status === 'fulfilled' ? apps.value : []);
            setResumes(res.status === 'fulfilled' ? res.value : []);
            setContacts(conts.status === 'fulfilled' ? conts.value : []);
            setSavedJobs(jobs.status === 'fulfilled' ? jobs.value : []);
            setReminders(rems.status === 'fulfilled' ? rems.value : []);
            setAnalytics(anal.status === 'fulfilled' ? anal.value : null);
            setStats(st.status === 'fulfilled' ? st.value : null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshAll();
    }, [refreshAll]);

    // ── Optimistic state helpers ────────────────────────────
    const updateApplicationInState = useCallback((id, updates) => {
        setApplications((prev) =>
            prev.map((a) => (a.id === id ? { ...a, ...updates } : a))
        );
    }, []);

    const removeApplicationFromState = useCallback((id) => {
        setApplications((prev) => prev.filter((a) => a.id !== id));
    }, []);

    const addApplicationToState = useCallback((app) => {
        setApplications((prev) => [app, ...prev]);
    }, []);

    return (
        <AppContext.Provider
            value={{
                // Data
                applications,
                resumes,
                contacts,
                savedJobs,
                reminders,
                analytics,
                stats,
                loading,
                // Refresh functions
                refreshAll,
                refreshApplications,
                refreshResumes,
                refreshContacts,
                refreshSavedJobs,
                refreshReminders,
                refreshAnalytics,
                refreshStats,
                // Optimistic state helpers
                setApplications,
                updateApplicationInState,
                removeApplicationFromState,
                addApplicationToState,
                setContacts,
                setSavedJobs,
                setReminders,
                setResumes,
            }}
        >
            {children}
        </AppContext.Provider>
    );
}

export function useAppData() {
    const ctx = useContext(AppContext);
    if (!ctx) throw new Error('useAppData must be used within AppProvider');
    return ctx;
}
