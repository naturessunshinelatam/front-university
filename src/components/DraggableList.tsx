import React from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Item {
  id: string;
  title: string;
  subtitle?: string;
}

interface Props {
  items: Item[];
  onChange: (items: Item[]) => void;
  renderItem?: (item: Item, index: number) => React.ReactNode;
}

function SortableItem({
  id,
  item,
  index,
  renderItem,
}: {
  id: string;
  item: Item;
  index: number;
  renderItem?: (item: Item, index: number) => React.ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.9 : 1,
    cursor: "grab",
  } as React.CSSProperties;

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-100"
    >
      <div className="flex items-center space-x-3">
        <div className="w-6 h-6 bg-[#124C45] text-white rounded-full flex items-center justify-center text-xs font-bold">
          {index + 1}
        </div>
        <div className="truncate">
          {renderItem ? (
            renderItem(item, index)
          ) : (
            <div className="text-sm font-medium text-gray-900 truncate">
              {item.title}
            </div>
          )}
        </div>
      </div>
      <div {...attributes} {...listeners} className="ml-3 text-gray-400">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 7h16M4 12h16M4 17h16"
          />
        </svg>
      </div>
    </li>
  );
}

export default function DraggableList({ items, onChange, renderItem }: Props) {
  const sensors = useSensors(useSensor(PointerSensor));

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={(event) => {
        const { active, over } = event;
        if (!over) return;
        if (active.id !== over.id) {
          const oldIndex = items.findIndex((i) => i.id === String(active.id));
          const newIndex = items.findIndex((i) => i.id === String(over.id));
          if (oldIndex >= 0 && newIndex >= 0) {
            const next = arrayMove(items, oldIndex, newIndex);
            onChange(next);
          }
        }
      }}
    >
      <SortableContext
        items={items.map((i) => i.id)}
        strategy={verticalListSortingStrategy}
      >
        <ul className="space-y-2">
          {items.map((it, idx) => (
            <SortableItem
              key={it.id}
              id={it.id}
              item={it}
              index={idx}
              renderItem={renderItem}
            />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}
