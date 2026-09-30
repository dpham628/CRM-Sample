'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import PostCallTaskModal from '@/components/PostCallTaskModal';

const STORAGE_KEY = 'crm.tasks';

const TaskContext = createContext();

export function TaskProvider({ children }) {
  const [tasks, setTasks] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [draft, setDraft] = useState(null);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) setTasks(JSON.parse(stored));
    } catch (err) {
      console.error('Failed to load tasks', err);
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks, loaded]);

  const addTask = useCallback((task) => setTasks((prev) => [task, ...prev]), []);

  const toggleTask = useCallback((id) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? { ...task, completedAt: task.completedAt ? null : new Date().toISOString() }
          : task
      )
    );
  }, []);

  const removeTask = useCallback((id) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  }, []);

  const openTaskForm = useCallback((call = {}) => setDraft(call), []);
  const closeTaskForm = useCallback(() => setDraft(null), []);

  return (
    <TaskContext.Provider value={{ tasks, loaded, toggleTask, removeTask, openTaskForm }}>
      {children}
      {draft && (
        <PostCallTaskModal
          call={draft}
          onClose={closeTaskForm}
          onSave={(task) => {
            addTask(task);
            closeTaskForm();
          }}
        />
      )}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  return useContext(TaskContext);
}
