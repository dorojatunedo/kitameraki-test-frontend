import React, { useEffect, useState } from "react";
import {
  Stack,
  PrimaryButton,
  Dialog,
  DialogType,
  DefaultButton,
} from "@fluentui/react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

import TaskList, { Task } from "./components/TaskList";
import TaskForm from "./components/AddTaskForm";
import FormSettings from "./components/FormSettings"; // Pastikan file ini ada

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:7071/api/GetTasks");
      const data = await res.json();
      setTasks(data);
    } catch (error) {
      console.error("Failed to fetch tasks", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsDialogOpen(true);
  };

  const handleCancelEdit = () => {
    setEditingTask(null);
    setIsDialogOpen(false);
  };

  const handleDeleteTask = async (task: Task) => {
    const confirmDelete = window.confirm(`Delete task "${task.title}"?`);
    if (!confirmDelete) return;

    try {
      const res = await fetch(
        `http://localhost:7071/api/DeleteTask?id=${task._id}&organizationId=${task.organizationId}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        await fetchTasks();
      }
    } catch (err) {
      console.error("Failed to delete task", err);
    }
  };

  return (
    <Router>
      <Stack tokens={{ childrenGap: 20, padding: 20 }}>
        <Stack horizontal tokens={{ childrenGap: 10 }}>
          <Link to="/">
            <DefaultButton text="Task Manager" />
          </Link>
          <Link to="/FormSettings">
            <DefaultButton text="Form Settings" />
          </Link>
        </Stack>

        <Routes>
          <Route
            path="/"
            element={
              <>
                <h1>Task Manager</h1>
                <PrimaryButton
                  text="Add Task"
                  onClick={() => setIsDialogOpen(true)}
                  style={{ width: 120 }}
                />
                <Dialog
                  hidden={!isDialogOpen}
                  onDismiss={() => setIsDialogOpen(false)}
                  dialogContentProps={{
                    type: DialogType.largeHeader,
                    title: editingTask ? "Edit Task" : "Add Task",
                  }}
                >
                  <TaskForm
                    task={editingTask}
                    onTaskAdded={() => {
                      fetchTasks();
                      setEditingTask(null);
                      setIsDialogOpen(false);
                    }}
                    onCancelEdit={handleCancelEdit}
                  />
                </Dialog>

                <TaskList
                  tasks={tasks}
                  loading={loading}
                  onEdit={handleEditTask}
                  onDelete={handleDeleteTask}
                />
              </>
            }
          />

          <Route path="/FormSettings" element={<FormSettings />} />
        </Routes>
      </Stack>
    </Router>
  );
};

export default App;
