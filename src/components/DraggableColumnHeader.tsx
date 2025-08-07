import React from "react";
import { useDraggable } from "@dnd-kit/core";

interface Props {
  id: string;
  children: React.ReactNode;
}

const DraggableColumnHeader: React.FC<Props> = ({ id, children }) => {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{ cursor: "grab", display: "inline-block" }}
    >
      {children}
    </div>
  );
};

export default DraggableColumnHeader;
