import React, { useEffect, useState } from "react";
import {
  Stack,
  TextField,
  DatePicker,
  PrimaryButton,
  DefaultButton
} from "@fluentui/react";
import { useFormSettings, FormField } from "../hooks/useFormSettings";

interface TaskFormProps {
  onTaskAdded: () => void;
  task?: any;
  onCancelEdit?: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ onTaskAdded, task, onCancelEdit }) => {
  const { fields, loading } = useFormSettings();
  const [formValues, setFormValues] = useState<Record<string, any>>({});

  // Saat membuka form edit
  useEffect(() => {
    if (task) {
      setFormValues(task);
    } else {
      // Kosongkan jika tambah baru
      const initialValues: Record<string, any> = {};
      fields.forEach(field => {
        initialValues[field.name] = field.type === "date" ? new Date() : "";
      });
      setFormValues(initialValues);
    }
  }, [task, fields]);

  const handleChange = (id: string, value: any) => {
    setFormValues(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSubmit = async () => {
    const payload = {
      ...formValues,
      organizationId: "demo-org"
    };

    const url = task
      ? `http://localhost:7071/api/UpdateTask?id=${task._id}&organizationId=${task.organizationId}`
      : "http://localhost:7071/api/InsertTask";

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      onTaskAdded();
    }
  };

  if (loading) return <p>Loading form settings...</p>;

  return (
    <Stack tokens={{ childrenGap: 10 }}>
      {fields.map((field: FormField) => {
        switch (field.type) {
          case "text":
          case "email":
            return (
              <TextField
                key={field.name}
                label={field.label}
                value={formValues[field.name] || ""}
                onChange={(_, v) => handleChange(field.name, v)}
              />
            );
          case "date":
            return (
              <DatePicker
                key={field.name}
                label={field.label}
                value={
                  formValues[field.name]
                    ? new Date(formValues[field.name])
                    : undefined
                }
                onSelectDate={(date) => handleChange(field.name, date)}
              />
            );
          default:
            return null;
        }
      })}

      <Stack horizontal tokens={{ childrenGap: 10 }}>
        <PrimaryButton text={task ? "Update Task" : "Add Task"} onClick={handleSubmit} />
        {task && onCancelEdit && (
          <DefaultButton text="Cancel" onClick={onCancelEdit} />
        )}
      </Stack>
    </Stack>
  );
};

export default TaskForm;
