"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { ClipboardEvent, DragEvent } from "react";
import { ArrowDown, ArrowUp, ImagePlus, Star, Trash2 } from "lucide-react";
import { cn } from "@/lib/cn";
import {
  deleteProductPhotoAction,
  reorderProductPhotosAction,
  uploadProductPhotoAction,
} from "@/app/admin/(protected)/produtos/actions";
import type { AdminProductPhoto } from "@/types/admin";

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp"];
const MAX_SIZE_MB = 5;

export function PhotoManager({
  productId,
  photos,
  corId = null,
}: {
  productId: string;
  photos: AdminProductPhoto[];
  corId?: string | null;
}) {
  const router = useRouter();
  const [items, setItems] = useState(photos);
  const [pending, setPending] = useState<{ key: string; previewUrl: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleFiles(files: File[] | FileList | null) {
    if (!files) return;
    const list = Array.from(files);
    if (list.length === 0) return;
    setError(null);
    setUploading(true);

    for (const file of list) {
      if (file.type === "image/svg+xml" || !ALLOWED_TYPES.includes(file.type)) {
        setError(`"${file.name}": formato não suportado (use PNG, JPEG ou WEBP).`);
        continue;
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        setError(`"${file.name}": maior que ${MAX_SIZE_MB}MB.`);
        continue;
      }

      // Mostra uma mini prévia local (do arquivo escolhido) enquanto o
      // upload para o Storage ainda está em andamento.
      const previewUrl = URL.createObjectURL(file);
      const key = `${file.name}-${file.lastModified}-${previewUrl}`;
      setPending((prev) => [...prev, { key, previewUrl }]);

      const formData = new FormData();
      formData.set("file", file);
      const result = await uploadProductPhotoAction(productId, formData, corId);

      setPending((prev) => prev.filter((p) => p.key !== key));
      URL.revokeObjectURL(previewUrl);

      if (result.error) {
        setError(result.error);
      } else if (result.photo) {
        setItems((prev) => [...prev, result.photo as AdminProductPhoto]);
      }
    }

    setUploading(false);
    router.refresh();
  }

  function handlePaste(event: ClipboardEvent<HTMLDivElement>) {
    const files = Array.from(event.clipboardData?.items ?? [])
      .filter((item) => item.kind === "file" && item.type.startsWith("image/"))
      .map((item) => item.getAsFile())
      .filter((file): file is File => file !== null);

    if (files.length === 0) return;
    event.preventDefault();
    handleFiles(files);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragActive(false);
    handleFiles(event.dataTransfer.files);
  }

  function handleDelete(photoId: string) {
    startTransition(async () => {
      setError(null);
      const result = await deleteProductPhotoAction(productId, photoId);
      if (result.error) {
        setError(result.error);
        return;
      }
      setItems((prev) => prev.filter((photo) => photo.id !== photoId));
      router.refresh();
    });
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;

    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    setItems(next);

    startTransition(async () => {
      const result = await reorderProductPhotosAction(
        productId,
        next.map((photo) => photo.id),
      );
      if (result.error) {
        setError(result.error);
      }
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        tabIndex={0}
        onPaste={handlePaste}
        onDragOver={(event) => {
          event.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        className={cn(
          "flex flex-col items-start gap-2 rounded-brand border border-dashed px-4 py-3 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red",
          dragActive ? "border-brand-red bg-brand-red/5" : "border-brand-gray-300",
        )}
      >
        <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-brand-black hover:text-brand-red">
          <ImagePlus className="h-4 w-4" aria-hidden="true" />
          {uploading ? "Enviando..." : "Adicionar fotos"}
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            multiple
            className="hidden"
            disabled={uploading}
            onChange={(event) => handleFiles(event.target.files)}
          />
        </label>

        <p className="text-xs text-brand-gray-600">
          PNG, JPEG ou WEBP, até {MAX_SIZE_MB}MB cada. A primeira foto é a principal do catálogo.
          Arraste e solte aqui, ou clique nesta área e cole (Ctrl+V) uma imagem copiada.
        </p>
      </div>

      {error && (
        <p role="alert" className="rounded-brand border border-brand-red/40 bg-brand-red/10 px-3 py-2 text-sm text-brand-red">
          {error}
        </p>
      )}

      {(items.length > 0 || pending.length > 0) && (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {pending.map((p) => (
            <li
              key={p.key}
              className="flex flex-col gap-2 rounded-brand border border-brand-gray-200 p-2"
            >
              <div className="relative aspect-square overflow-hidden rounded-brand bg-brand-gray-50">
                {/* eslint-disable-next-line @next/next/no-img-element -- blob: URL local, não passa pelo otimizador de imagem */}
                <img
                  src={p.previewUrl}
                  alt=""
                  className="h-full w-full object-cover opacity-60"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-brand-black/30 text-[10px] font-semibold text-brand-white">
                  Enviando...
                </div>
              </div>
            </li>
          ))}
          {items.map((photo, index) => (
            <li
              key={photo.id}
              className="flex flex-col gap-2 rounded-brand border border-brand-gray-200 p-2"
            >
              <div className="relative aspect-square overflow-hidden rounded-brand bg-brand-gray-50">
                <Image src={photo.url} alt="" fill sizes="200px" className="object-cover" />
                {index === 0 && (
                  <span className="absolute left-1.5 top-1.5 inline-flex items-center gap-1 rounded-brand bg-brand-black px-1.5 py-0.5 text-[10px] font-semibold text-brand-white">
                    <Star className="h-3 w-3" aria-hidden="true" />
                    Principal
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between gap-1">
                <div className="flex gap-1">
                  <button
                    type="button"
                    disabled={index === 0 || isPending}
                    onClick={() => move(index, -1)}
                    className="rounded-brand p-1.5 text-brand-gray-600 hover:bg-brand-gray-50 disabled:opacity-30"
                    aria-label="Mover para cima"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={index === items.length - 1 || isPending}
                    onClick={() => move(index, 1)}
                    className="rounded-brand p-1.5 text-brand-gray-600 hover:bg-brand-gray-50 disabled:opacity-30"
                    aria-label="Mover para baixo"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                </div>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleDelete(photo.id)}
                  className="rounded-brand p-1.5 text-brand-red hover:bg-brand-red/10"
                  aria-label="Remover foto"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
