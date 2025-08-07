import { useEffect, useState } from "react";

export interface FormField {
  name: string; // used as key in data object
  label: string; // displayed as label
  type: "text" | "email" | "date"; // field type
}
// src/hooks/useFormSettings.ts
export const useFormSettings = () => {
  const [fields, setFields] = useState<FormField[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFields = async () => {
    try {
      const res = await fetch("http://localhost:7071/api/GetFormSettings");
      const data = await res.json();
      setFields(data);
    } catch (err) {
      console.error("Failed to load form settings", err);
    } finally {
      setLoading(false);
    }
  };

  const updateFields = async (newFields: FormField[]) => {
    await fetch("http://localhost:7071/api/SaveFormSettings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "formSettings", fields: newFields })
    });
    setFields(newFields); // refresh locally
  };

  useEffect(() => {
    fetchFields();
  }, []);

  return { fields, loading, updateFields };
};
