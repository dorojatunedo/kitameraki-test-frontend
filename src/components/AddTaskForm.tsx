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

const AddTaskForm: React.FC<TaskFormProps> = ({ onTaskAdded, task, onCancelEdit }) => {
  const { fields: formSettings, loading } = useFormSettings();
  const [customFields, setCustomFields] = useState<Record<string, any>>({});

  // 🔁 Update form state dari task saat edit
  useEffect(() => {
    const initialValues: Record<string, any> = {};
    formSettings.forEach((field) => {
      initialValues[field.name] = task?.[field.name] || "";
    });
    setCustomFields(initialValues);
  }, [formSettings, task]);

  // ✅ Update customFields sesuai field
  const handleChange = (name: string, value: any) => {
    setCustomFields((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    const payload = {
      ...customFields,
      organizationId: task?.organizationId || "demo-org"
    };

    const url = task
      ? `http://localhost:7071/api/UpdateTask?id=${task._id}&organizationId=${task.organizationId}`
      : "http://localhost:7071/api/InsertTask";

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        onTaskAdded();
        setCustomFields({}); // reset form
      }
    } catch (error) {
      console.error("Failed to submit task", error);
    }
  };

  if (loading) return <p>Loading form settings...</p>;

  return (
    <Stack tokens={{ childrenGap: 10 }}>
      {formSettings.map((field) => {
        const value = customFields[field.name] || "";

        if (field.type === "text" || field.type === "email") {
          return (
            <TextField
              key={field.name}
              label={field.label}
              value={value}
              onChange={(_, val) => handleChange(field.name, val || "")}
            />
          );
        }

        if (field.type === "date") {
          return (
            <DatePicker
              key={field.name}
              label={field.label}
              value={value ? new Date(value) : undefined}
              onSelectDate={(date) =>
                handleChange(field.name, date?.toISOString().split("T")[0] || "")
              }
            />
          );
        }

        return null;
      })}

      <Stack horizontal tokens={{ childrenGap: 10 }}>
        <PrimaryButton text={task ? "Update Task" : "Add Task"} onClick={handleSubmit} />
        {task && <DefaultButton text="Cancel" onClick={onCancelEdit} />}
      </Stack>
    </Stack>
  );
};

export default AddTaskForm;
