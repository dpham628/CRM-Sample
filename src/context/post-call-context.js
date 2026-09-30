'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import PostCallWorkflowModal from '@/components/PostCallWorkflowModal';

const STORAGE_KEY = 'crm.actionItems';

const PostCallContext = createContext();

export function PostCallProvider({ children }) {
  const [actionItems, setActionItems] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [workflowCall, setWorkflowCall] = useState(null);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) setActionItems(JSON.parse(stored));
    } catch (err) {
      console.error('Failed to load action items', err);
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(actionItems));
  }, [actionItems, loaded]);

  const addActionItems = useCallback((items) => {
    setActionItems((prev) => [...items, ...prev]);
  }, []);

  const toggleComplete = useCallback((id) => {
    setActionItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, completedAt: item.completedAt ? null : new Date().toISOString() }
          : item
      )
    );
  }, []);

  const removeActionItem = useCallback((id) => {
    setActionItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const openWorkflow = useCallback((call = {}) => setWorkflowCall(call), []);
  const closeWorkflow = useCallback(() => setWorkflowCall(null), []);

  return (
    <PostCallContext.Provider
      value={{ actionItems, loaded, addActionItems, toggleComplete, removeActionItem, openWorkflow }}
    >
      {children}
      {workflowCall && (
        <PostCallWorkflowModal
          call={workflowCall}
          onClose={closeWorkflow}
          onSave={(items) => {
            addActionItems(items);
            closeWorkflow();
          }}
        />
      )}
    </PostCallContext.Provider>
  );
}

export function usePostCall() {
  return useContext(PostCallContext);
}
