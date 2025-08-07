import React, { useEffect, useState, useMemo } from "react";
import {
  DetailsList,
  IColumn,
  Stack,
  Text,
  DefaultButton,
  TextField,
  Selection,
  SelectionMode
} from "@fluentui/react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export interface Task {
  [key: string]: any;
}

interface FormField {
  name: string;
  label: string;
  type: string;
}

interface TaskListProps {
  tasks: Task[];
  loading: boolean;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

const ITEMS_PER_PAGE = 5;

const TaskList: React.FC<TaskListProps> = ({ tasks, loading, onEdit, onDelete }) => {
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [columns, setColumns] = useState<IColumn[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortedColumn, setSortedColumn] = useState<string | null>(null);
  const [isDescending, setIsDescending] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [columnOrder, setColumnOrder] = useState<string[]>([]);

  const selection = useMemo(
    () =>
      new Selection({
        onSelectionChanged: () => {}
      }),
    []
  );

  // Sensor untuk drag
  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    const fetchFormSettings = async () => {
      try {
        const res = await fetch("http://localhost:7071/api/GetFormSettings");
        const fields: FormField[] = await res.json();
        setFormFields(fields);
        setColumnOrder(fields.map((f) => f.name));
      } catch (err) {
        console.error("Failed to load form settings", err);
      }
    };

    fetchFormSettings();
  }, []);

  useEffect(() => {
    const dynamicColumns: IColumn[] = columnOrder.map((name) => {
      const field = formFields.find((f) => f.name === name);
      if (!field) return null;

      return {
        key: field.name,
        name: field.label,
        fieldName: field.name,
        minWidth: 120,
        isResizable: true,
        isSorted: sortedColumn === field.name,
        isSortedDescending: isDescending,
        onColumnClick: handleColumnClick
      };
    }).filter(Boolean) as IColumn[];

    const actionColumns: IColumn[] = [
      {
        key: "edit",
        name: "Edit",
        fieldName: "edit",
        minWidth: 70,
        onRender: (item: Task) => (
          <DefaultButton text="Edit" onClick={() => onEdit(item)} />
        )
      },
      {
        key: "delete",
        name: "Delete",
        fieldName: "delete",
        minWidth: 70,
        onRender: (item: Task) => (
          <DefaultButton text="Delete" onClick={() => onDelete(item)} />
        )
      }
    ];

    setColumns([...dynamicColumns, ...actionColumns]);
  }, [formFields, columnOrder, sortedColumn, isDescending]);

  const handleColumnClick = (
    _ev?: React.MouseEvent<HTMLElement>,
    column?: IColumn
  ) => {
    if (!column || !column.fieldName) return;
    const isDesc = sortedColumn === column.fieldName ? !isDescending : false;
    setSortedColumn(column.fieldName);
    setIsDescending(isDesc);
  };

  const filteredTasks = tasks.filter((task) =>
    Object.values(task)
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (!sortedColumn) return 0;
    const aVal = a[sortedColumn];
    const bVal = b[sortedColumn];

    if (typeof aVal === "string" && typeof bVal === "string") {
      return isDescending
        ? bVal.localeCompare(aVal)
        : aVal.localeCompare(bVal);
    }

    if (aVal < bVal) return isDescending ? 1 : -1;
    if (aVal > bVal) return isDescending ? -1 : 1;
    return 0;
  });

  const totalPages = Math.ceil(sortedTasks.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const pagedTasks = sortedTasks.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePrevious = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  // Drag handler
  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = columnOrder.indexOf(active.id);
    const newIndex = columnOrder.indexOf(over.id);
    const newOrder = arrayMove(columnOrder, oldIndex, newIndex);
    setColumnOrder(newOrder);
  };

  return (
    <Stack tokens={{ childrenGap: 20, padding: 20 }}>
      <Text variant="xLarge">Task List</Text>

      <TextField
        label="Search"
        value={searchTerm}
        onChange={(_, val) => setSearchTerm(val || "")}
        placeholder="Search..."
      />

      {loading ? (
        <Text>Loading...</Text>
      ) : tasks.length === 0 ? (
        <Text>No tasks found.</Text>
      ) : (
        <>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={columnOrder} strategy={verticalListSortingStrategy}>
              <DetailsList
                items={pagedTasks}
                columns={columns.map((col) => ({
                  ...col,
                  onRenderHeader: () => (
                    <SortableColumnHeader id={col.key} label={col.name} />
                  )
                }))}
                selection={selection}
                selectionMode={SelectionMode.multiple}
              />
            </SortableContext>
          </DndContext>

          <Stack horizontal tokens={{ childrenGap: 10 }}>
            <DefaultButton text="Previous" onClick={handlePrevious} disabled={currentPage === 1} />
            <Text>{`Page ${currentPage} of ${totalPages}`}</Text>
            <DefaultButton text="Next" onClick={handleNext} disabled={currentPage === totalPages} />
          </Stack>
        </>
      )}
    </Stack>
  );
};

// 🔁 Sortable column header component
const SortableColumnHeader: React.FC<{ id: string; label: string }> = ({ id, label }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    <div ref={setNodeRef} {...attributes} {...listeners} style={style}>
      <b>::</b> {label}
    </div>
  );
};

export default TaskList;
