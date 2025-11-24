import { useEffect, useState } from "react";
import { useAlert } from "./AlertSystem";
import DraggableList from "./DraggableList";

interface ContentItem {
  id: string;
  contentTitle: string;
  contentType?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  categoryId: string;
  sectionId?: string | null;
}

export default function SectionContentsOrderModal({
  isOpen,
  onClose,
  categoryId,
  sectionId,
}: Props) {
  const { showAlert } = useAlert();
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (!categoryId || !sectionId) {
      setItems([]);
      return;
    }

    const fetchItems = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("authToken");
        const res = await fetch(`/api/Content/${categoryId}/${sectionId}`, {
          method: "GET",
          headers: {
            Accept: "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const list = Array.isArray(data?.data)
          ? data.data.map((it: any) => ({
              id: it.id,
              contentTitle: it.contentTitle,
              contentType: it.contentType,
            }))
          : [];
        setItems(list);
      } catch (error) {
        console.error("Error fetching section contents:", error);
        showAlert({
          type: "error",
          title: "Error",
          message: "No se pudieron cargar los contenidos de la sección.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [isOpen, categoryId, sectionId, showAlert]);

  if (!isOpen) return null;

  // Handlers are inlined in JSX to avoid unused-declaration linter issues

  const handleSaveOrder = async () => {
    if (!categoryId || !sectionId) return;
    setSaving(true);
    try {
      const token = localStorage.getItem("authToken");

      // Construir mapping { contentId: index } según la posición en la lista (0 = arriba)
      const mapping: Record<string, number> = {};
      items.forEach((it: ContentItem, idx: number) => {
        mapping[it.id] = idx;
      });

      const res = await fetch("/api/Content/update-order", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(mapping),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status} - ${text}`);
      }

      showAlert({
        type: "success",
        title: "Orden actualizado",
        message: "El orden de contenidos se actualizó correctamente.",
      });
      onClose();
    } catch (error) {
      console.error("Error saving order:", error);
      showAlert({
        type: "error",
        title: "Error",
        message: "No se pudo guardar el nuevo orden.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-xl">
        {/* Header similar al de SectionForm */}
        <div className="bg-gradient-to-r from-[#124C45] to-[#023D4F] text-white p-4 sm:p-6 rounded-t-lg sm:rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <h2 className="text-lg sm:text-xl font-bold">
                Organizar contenidos
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
              disabled={saving}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 sm:w-6 sm:h-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-4 overflow-y-auto" style={{ maxHeight: "60vh" }}>
          {loading ? (
            <div className="text-center py-8">Cargando contenidos...</div>
          ) : items.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No hay contenidos en esta sección.
            </div>
          ) : (
            <DraggableList
              items={items.map((i) => ({
                id: i.id,
                title: i.contentTitle,
                subtitle: i.contentType,
              }))}
              onChange={(next) =>
                setItems(
                  next.map((n) => ({
                    id: n.id,
                    contentTitle: n.title,
                    contentType: n.subtitle,
                  }))
                )
              }
              renderItem={(item) => (
                <>
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {item.title}
                  </div>
                  {item.subtitle && (
                    <div className="text-xs text-gray-500">{item.subtitle}</div>
                  )}
                </>
              )}
            />
          )}
        </div>

        {/* Footer con botones Cancelar / Actualizar similar a SectionForm */}
        <div className="p-4 sm:p-6 border-t flex items-center justify-end space-x-3">
          <button
            onClick={() => {
              onClose();
            }}
            className="px-4 sm:px-6 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={saving}
          >
            Cancelar
          </button>
          <button
            onClick={handleSaveOrder}
            className="flex items-center justify-center space-x-2 px-4 sm:px-6 py-2 text-sm bg-[#124C45] text-white rounded-lg hover:bg-[#0f3d37] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={saving || items.length === 0}
          >
            {saving ? "Guardando..." : "Actualizar orden"}
          </button>
        </div>
      </div>
    </div>
  );
}
