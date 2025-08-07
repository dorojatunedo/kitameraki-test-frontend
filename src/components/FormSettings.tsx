import React, { useEffect, useState } from "react";
import {
  Stack,
  Text,
  DefaultButton,
  TextField,
  Dropdown,
  IDropdownOption
} from "@fluentui/react";
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface FormField {
  id: string;
  name: string;
  label: string;
  type: "text" | "email" | "date";
}

const fieldTypeOptions: IDropdownOption[] = [
  { key: "text", text: "Text" },
  { key: "email", text: "Email" },
  { key: "date", text: "Date" }
];

const FormSettings: React.FC = () => {
  const [fields, setFields] = useState<FormField[]>([]);
  const [newLabel, setNewLabel] = useState("");
  const [newType, setNewType] = useState<"text" | "email" | "date">("text");

  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    fetch("http://localhost:7071/api/GetFormSettings")
      .then((res) => res.json())
      .then((data) => setFields(data))
      .catch((err) => console.error("Failed to load form settings", err));
  }, []);

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = fields.findIndex((f) => f.id === active.id);
    const newIndex = fields.findIndex((f) => f.id === over.id);
    const newFields = arrayMove(fields, oldIndex, newIndex);
    setFields(newFields);
  };

  const handleAddField = () => {
    if (!newLabel.trim()) return;
    const newField: FormField = {
      id: Date.now().toString(),
      name: newLabel.toLowerCase().replace(/\s+/g, ""),
      label: newLabel,
      type: newType
    };
    setFields([...fields, newField]);
    setNewLabel("");
    setNewType("text");
  };

  const handleDelete = (id: string) => {
    const confirm = window.confirm("Delete this field?");
    if (confirm) {
      setFields((prev) => prev.filter((f) => f.id !== id));
    }
  };

  const handleSave = async () => {
    const res = await fetch("http://localhost:7071/api/SaveFormSettings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fields)
    });

    if (res.ok) {
      alert("Settings saved!");
    } else {
      alert("Failed to save.");
    }
  };

  return (
    <Stack tokens={{ childrenGap: 20, padding: 20 }}>
      <Text variant="xLarge">Form Settings</Text>

      <Stack horizontal tokens={{ childrenGap: 10 }}>
        <TextField
          label="Label"
          value={newLabel}
          onChange={(_, val) => setNewLabel(val || "")}
        />
        <Dropdown
          label="Type"
          options={fieldTypeOptions}
          selectedKey={newType}
          onChange={(_, opt) => setNewType(opt?.key as any)}
        />
        <DefaultButton text="Add Field" onClick={handleAddField} />
      </Stack>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
          {fields.map((field) => (
            <SortableField key={field.id} field={field} onDelete={handleDelete} />
          ))}
        </SortableContext>
      </DndContext>

      <DefaultButton text="Save Settings" onClick={handleSave} />
    </Stack>
  );
};

const SortableField: React.FC<{
  field: FormField;
  onDelete: (id: string) => void;
}> = ({ field, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: field.id
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    padding: 10,
    border: "1px solid #ccc",
    borderRadius: 4,
    marginBottom: 8,
    backgroundColor: "#fafafa",
    cursor: "grab"
  };

  return (
    <div ref={setNodeRef} {...attributes} {...listeners} style={style}>
      <Text>
        <b>Label:</b> {field.label} | <b>Type:</b> {field.type}{" "}
        <DefaultButton text="Delete" onClick={() => onDelete(field.id)} style={{ marginLeft: 10 }} />
      </Text>
    </div>
  );
};

export default FormSettings;
