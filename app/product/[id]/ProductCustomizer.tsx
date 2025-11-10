"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { PhotoIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";

type ItemImage = {
  id: string;
  type: "image";
  src: string;
  x: number; // top-left (px)
  y: number; // top-left (px)
  w: number; // width (px)
  h: number; // height (px)
};

type ItemText = {
  id: string;
  type: "text";
  text: string;
  x: number; // top-left (px)
  y: number; // top-left (px)
  fontSize: number;
  fontFamily: string;
  color: string;
};

type Item = ItemImage | ItemText;

function isImage(item: Item): item is ItemImage {
  return item.type === "image";
}

export default function ProductCustomizer({
  containerRef,
}: {
  containerRef: React.RefObject<HTMLDivElement | null>;
}) {
  // -------------------------
  // STATE
  // -------------------------
  const [items, setItems] = useState<Item[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  const [addTextOpen, setAddTextOpen] = useState(false);
  const [newText, setNewText] = useState("");
  const [newColor, setNewColor] = useState("#000000");
  const [newFont, setNewFont] = useState("Arial");

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Drag / resize flags
  const dragging = useRef(false);
  const resizing = useRef(false);

  // Pointer start
  const start = useRef({ x: 0, y: 0 });

  // Cache for active item size during drag/resize
  const activeSize = useRef<{ w: number; h: number }>({ w: 0, h: 0 });

  // -------------------------
  // HELPERS
  // -------------------------
  const getRect = () => containerRef.current?.getBoundingClientRect() || null;

  const clamp = (v: number, min: number, max: number) =>
    Math.min(Math.max(v, min), max);

  const getActive = () => items.find((i) => i.id === activeId) || null;

  // -------------------------
  // ADD GRAPHIC
  // -------------------------
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const src = reader.result as string;
      const id = crypto.randomUUID();

      setItems((prev) => [
        ...prev,
        {
          id,
          type: "image",
          src,
          x: 120,
          y: 120,
          w: 160,
          h: 160,
        },
      ]);
      setActiveId(id);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // -------------------------
  // ADD TEXT
  // -------------------------
  const addTextToCanvas = () => {
    if (!newText.trim()) return;
    const id = crypto.randomUUID();
    setItems((prev) => [
      ...prev,
      {
        id,
        type: "text",
        text: newText.trim(),
        x: 100,
        y: 100,
        fontSize: 30,
        fontFamily: newFont,
        color: newColor,
      },
    ]);
    setActiveId(id);
    setAddTextOpen(false);
    setNewText("");
  };

  // -------------------------
  // POINTER HANDLERS
  // -------------------------
  const onItemMouseDown = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    setActiveId(id);
    dragging.current = true;
    resizing.current = false;

    start.current = { x: e.clientX, y: e.clientY };

    // snapshot current size for bounds during drag
    const item = items.find((i) => i.id === id);
    if (item && isImage(item)) {
      activeSize.current = { w: item.w, h: item.h };
    } else {
      // for text, estimate a minimal width/height for bounds
      activeSize.current = { w: 80, h: 40 };
    }
  };

  const onResizeMouseDown = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    setActiveId(id);
    dragging.current = false;
    resizing.current = true;

    start.current = { x: e.clientX, y: e.clientY };

    const item = items.find((i) => i.id === id);
    if (item && isImage(item)) {
      activeSize.current = { w: item.w, h: item.h };
    } else {
      activeSize.current = { w: 80, h: 40 };
    }
  };

  const onWindowMouseMove = (e: MouseEvent) => {
    if (!dragging.current && !resizing.current) return;

    const rect = getRect();
    if (!rect || !activeId) return;

    const dx = e.clientX - start.current.x;
    const dy = e.clientY - start.current.y;

    start.current = { x: e.clientX, y: e.clientY };

    setItems((prev) =>
      prev.map((it) => {
        if (it.id !== activeId) return it;

        // RESIZE (image only)
        if (resizing.current && isImage(it)) {
          const newW = clamp(it.w + dx, 40, rect.width);
          const newH = clamp(it.h + dy, 40, rect.height);
          return { ...it, w: newW, h: newH };
        }

        // DRAG
        const w = isImage(it) ? it.w : activeSize.current.w;
        const h = isImage(it) ? it.h : activeSize.current.h;

        const maxX = rect.width - w;
        const maxY = rect.height - h;

        const nextX = clamp(it.x + dx, 0, Math.max(0, maxX));
        const nextY = clamp(it.y + dy, 0, Math.max(0, maxY));
        return { ...it, x: nextX, y: nextY };
      })
    );
  };

  const onWindowMouseUp = () => {
    dragging.current = false;
    resizing.current = false;
  };

  useEffect(() => {
    window.addEventListener("mousemove", onWindowMouseMove);
    window.addEventListener("mouseup", onWindowMouseUp);
    return () => {
      window.removeEventListener("mousemove", onWindowMouseMove);
      window.removeEventListener("mouseup", onWindowMouseUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId, items.length]);

  // -------------------------
  // DELETE ACTIVE
  // -------------------------
  const deleteActive = () => {
    if (!activeId) return;
    setItems((prev) => prev.filter((i) => i.id !== activeId));
    setActiveId(null);
  };

  // 🔽 EXPORT MERGED IMAGE FUNCTION
  const exportMergedImage = async (): Promise<string | null> => {
    const container = containerRef.current;
    if (!container) return null;

    try {
      const domtoimage =
        (await import("dom-to-image-more")).default ??
        (await import("dom-to-image-more"));

      const clone = container.cloneNode(true) as HTMLElement;
      clone.style.position = "absolute";
      clone.style.left = "-9999px";
      document.body.appendChild(clone);

      clone.querySelectorAll("img").forEach((img) => {
        img.setAttribute("crossOrigin", "anonymous");

        // 🩹 Fix Firebase URLs — remove query params & use appspot.com
        if (img.src.includes("firebasestorage")) {
          try {
            const cleanUrl = img.src.split("?")[0]; // remove ?alt=media&token=...
            img.src = cleanUrl.replace("firebasestorage.app", "appspot.com");
          } catch (err) {
            console.warn("Error cleaning image URL:", err);
          }
        }
      });

      // 🚫 Turn off cacheBust (causes random param)
      const dataUrl = await domtoimage.toPng(clone, {
        quality: 1,
        bgcolor: "#ffffff",
        cacheBust: false, // ✅ FIXED
        pixelRatio: 2,
      });

      document.body.removeChild(clone);
      return dataUrl;
    } catch (err) {
      console.error("Failed to export customized image:", err);
      return null;
    }
  };

  // 🔽 Allow parent to access export function
  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as any).exportCustomizedImage = exportMergedImage;
    }
  }, []);

  // -------------------------
  // RENDER
  // -------------------------
  return (
    <>
      {/* Controls (keep above items) */}
      <div className="absolute top-3 left-3 z-10000 flex gap-2">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="bg-white px-3 py-1.5 rounded-full border text-xs shadow flex items-center gap-1"
        >
          <PhotoIcon className="w-4 h-4" />
          Add Graphic
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleUpload}
        />

        <button
          onClick={() => setAddTextOpen(true)}
          className="bg-white px-3 py-1.5 rounded-full border text-xs shadow flex items-center gap-1"
        >
          <PlusIcon className="w-4 h-4" />
          Add Text
        </button>
        <button
          onClick={exportMergedImage}
          className="bg-green-600 text-white px-3 py-1.5 rounded-full text-xs shadow"
        >
          💾 Save Design
        </button>
        {activeId && (
          <button
            onClick={deleteActive}
            className="bg-red-500 text-white px-3 py-1.5 rounded-full text-xs shadow"
          >
            <TrashIcon className="w-4 h-4" />
            Delete
          </button>
        )}
      </div>

      {/* Add Text Panel */}
      {addTextOpen && (
        <div className="absolute top-14 left-3 z-10000 bg-white p-4 rounded-xl border shadow-lg w-56 space-y-3 text-sm">
          <input
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder="Enter text"
            className="w-full border rounded px-2 py-1"
          />

          <label className="block">
            Color:
            <input
              type="color"
              value={newColor}
              onChange={(e) => setNewColor(e.target.value)}
              className="ml-2 align-middle"
            />
          </label>

          <label className="block">
            Font:
            <select
              value={newFont}
              onChange={(e) => setNewFont(e.target.value)}
              className="ml-2 border px-2 py-1 rounded"
            >
              <option>Arial</option>
              <option>Poppins</option>
              <option>Impact</option>
              <option>Georgia</option>
              <option>Roboto</option>
            </select>
          </label>

          <div className="flex gap-2 pt-1">
            <button
              onClick={addTextToCanvas}
              className="flex-1 bg-black text-white py-1.5 rounded"
            >
              Add
            </button>
            <button
              onClick={() => setAddTextOpen(false)}
              className="flex-1 bg-gray-200 py-1.5 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Draggable / Resizable Items Layer */}
      <div className="absolute inset-0 z-9000">
        {items.map((item) =>
          isImage(item) ? (
            <div
              key={item.id}
              className="pointer-events-auto"
              style={{
                position: "absolute",
                transform: `translate(${item.x}px, ${item.y}px)`,
                width: item.w,
                height: item.h,
                outline:
                  item.id === activeId ? "1px dashed rgba(0,0,0,0.4)" : "none",
              }}
              onMouseDown={(e) => onItemMouseDown(item.id, e)}
            >
              <Image
                src={item.src}
                alt=""
                fill
                sizes="400px"
                unoptimized
                className="object-contain select-none pointer-events-none"
                draggable={false}
              />

              {/* Resize handle */}
              <div
                onMouseDown={(e) => onResizeMouseDown(item.id, e)}
                className="absolute -bottom-2 -right-2 w-5 h-5 bg-black text-white rounded-full text-xs flex items-center justify-center cursor-se-resize pointer-events-auto"
                title="Resize"
              >
                ◢
              </div>
            </div>
          ) : (
            <div
              key={item.id}
              className="pointer-events-auto select-none"
              style={{
                position: "absolute",
                transform: `translate(${item.x}px, ${item.y}px)`,
                fontSize: item.fontSize,
                fontFamily: item.fontFamily,
                color: item.color,
                cursor: "move",
                whiteSpace: "nowrap",
                outline:
                  item.id === activeId ? "1px dashed rgba(0,0,0,0.4)" : "none",
                padding: 2,
              }}
              onMouseDown={(e) => onItemMouseDown(item.id, e)}
            >
              {item.text}
            </div>
          )
        )}
      </div>
    </>
  );
}
