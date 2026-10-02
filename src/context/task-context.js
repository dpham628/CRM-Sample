'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import PostCallTaskModal from '@/components/PostCallTaskModal';
import TranscriptTaskWatcher from '@/components/TranscriptTaskWatcher';

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

  const addTasks = useCallback((newTasks) => setTasks((prev) => [...newTasks, ...prev]), []);

  // Upsert: replaces a task when the id already exists (edit flow), otherwise prepends.
  const saveTask = useCallback((task) => {
    setTasks((prev) =>
      prev.some((t) => t.id === task.id)
        ? prev.map((t) => (t.id === task.id ? task : t))
        : [task, ...prev]
    );
  }, []);

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
    <TaskContext.Provider value={{ tasks, loaded, addTasks, toggleTask, removeTask, openTaskForm }}>
      {children}
      <TranscriptTaskWatcher />
      {draft && (
        <PostCallTaskModal
          call={draft}
          onClose={closeTaskForm}
          onSave={(task) => {
            saveTask(task);
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
