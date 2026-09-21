"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { ArrowDown, ArrowUp, Eye, EyeOff, ImagePlus, Trash2 } from "lucide-react";
import {
  createBannerAction,
  deleteBannerAction,
  moveBannerAction,
  toggleBannerAction,
} from "@/app/admin/(protected)/banners/actions";
import { createClient } from "@/lib/supabase/client";
import { BANNERS_BUCKET } from "@/lib/supabase/storage";
import { cn } from "@/lib/cn";
import type { Banner } from "@/types/banner";

const ALLOWED_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/avif": "avif",
};
const MAX_SIZE_MB = 8;

const INPUT_CLASS =
  "w-full rounded-brand border border-brand-gray-200 bg-brand-white px-3 py-2.5 text-sm text-brand-black placeholder:text-brand-gray-400 focus:border-brand-red focus:outline-none";

function validateFile(file: File): string | null {
  if (!ALLOWED_TYPES[file.type]) return `"${file.name}": use PNG, JPEG, WEBP ou AVIF.`;
  if (file.size > MAX_SIZE_MB * 1024 * 1024) return `"${file.name}": maior que ${MAX_SIZE_MB}MB.`;
  return null;
}

export function BannerManager({ banners }: { banners: Banner[] }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [pending, startTransition] = useTransition();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const desktop = formData.get("desktop");
    const mobile = formData.get("mobile");
    const link = String(formData.get("link") ?? "");

    if (!(desktop instanceof File) || desktop.size === 0) {
      setError("Escolha a imagem do banner.");
      return;
    }
    const mobileFile = mobile instanceof File && mobile.size > 0 ? mobile : null;

    const invalid = validateFile(desktop) ?? (mobileFile ? validateFile(mobileFile) : null);
    if (invalid) {
      setError(invalid);
      return;
    }

    setUploading(true);
    const supabase = createClient();
    const uploaded: string[] = [];

    async function upload(file: File): Promise<string> {
      const path = `${crypto.randomUUID()}.${ALLOWED_TYPES[file.type]}`;
      const { error: uploadError } = await supabase.storage
        .from(BANNERS_BUCKET)
        .upload(path, file, { contentType: file.type });
      if (uploadError) throw new Error(uploadError.message);
      uploaded.push(path);
      return path;
    }

    try {
      const imagemCaminho = await upload(desktop);
      const imagemMobileCaminho = mobileFile ? await upload(mobileFile) : null;

      const result = await createBannerAction({ imagemCaminho, imagemMobileCaminho, link });
      if (result.error) throw new Error(result.error);

      formRef.current?.reset();
      router.refresh();
    } catch (err) {
      // A action já limpa órfãos quando ela mesma falha; aqui cobre falha antes dela.
      if (uploaded.length > 0) await supabase.storage.from(BANNERS_BUCKET).remove(uploaded);
      setError(err instanceof Error ? err.message : "Não foi possível enviar o banner.");
    } finally {
      setUploading(false);
    }
  }

  function run(action: () => Promise<{ error: string | null }>) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (result.error) setError(result.error);
      else router.refresh();
    });
  }

  function remove(banner: Banner) {
    if (!window.confirm("Remover este banner?")) return;
    run(() => deleteBannerAction(banner.id));
  }

  return (
    <div className="flex flex-col gap-6">
      {error && (
        <p
          role="alert"
          className="rounded-brand border border-brand-red/40 bg-brand-red/10 px-3 py-2 text-sm text-brand-red"
        >
          {error}
        </p>
      )}

      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 rounded-brand border border-brand-gray-200 bg-brand-white p-4"
      >
        <h2 className="text-sm font-semibold text-brand-black">Novo banner</h2>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-brand-black">Imagem (computador)</span>
            <input
              type="file"
              name="desktop"
              accept="image/png,image/jpeg,image/webp,image/avif"
              required
              className={INPUT_CLASS}
            />
            <span className="text-xs text-brand-gray-600">Ideal: 1920 × 720 px (formato largo).</span>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-brand-black">Imagem (celular) — opcional</span>
            <input
              type="file"
              name="mobile"
              accept="image/png,image/jpeg,image/webp,image/avif"
              className={INPUT_CLASS}
            />
            <span className="text-xs text-brand-gray-600">
              Ideal: 1200 × 750 px. Sem ela, a imagem do computador é recortada no celular.
            </span>
          </label>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-brand-black">Link ao clicar — opcional</span>
          <input
            name="link"
            className={INPUT_CLASS}
            placeholder="/catalogo/perfumes ou https://..."
            maxLength={500}
          />
        </label>

        <button
          type="submit"
          disabled={uploading}
          className="inline-flex w-fit items-center gap-2 rounded-brand bg-brand-red px-5 py-2.5 text-sm font-semibold text-brand-white transition-colors hover:bg-brand-red-dark disabled:opacity-60"
        >
          <ImagePlus className="h-4 w-4" aria-hidden="true" />
          {uploading ? "Enviando..." : "Adicionar banner"}
        </button>
      </form>

      <section className="rounded-brand border border-brand-gray-200 bg-brand-white">
        <h2 className="border-b border-brand-gray-200 px-4 py-3 text-sm font-semibold text-brand-black">
          Banners ({banners.length})
        </h2>

        {banners.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-brand-gray-600">
            Nenhum banner ainda. Enquanto não houver banner ativo, a home mostra a capa padrão.
          </p>
        ) : (
          <ul className="divide-y divide-brand-gray-200">
            {banners.map((banner, index) => (
              <li key={banner.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                <div
                  className={cn(
                    "relative aspect-[8/3] w-full overflow-hidden rounded-brand bg-brand-gray-50 sm:w-64",
                    !banner.ativo && "opacity-40",
                  )}
                >
                  <Image src={banner.imagem} alt="" fill sizes="256px" className="object-cover" />
                </div>

                <div className="flex min-w-0 flex-1 flex-col gap-1 text-xs text-brand-gray-600">
                  <span className="font-semibold text-brand-black">
                    #{index + 1} · {banner.ativo ? "Ativo no site" : "Oculto"}
                  </span>
                  <span className="truncate">{banner.link ? `Link: ${banner.link}` : "Sem link"}</span>
                  <span>{banner.imagemMobile ? "Com imagem para celular" : "Sem imagem para celular"}</span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => run(() => moveBannerAction(banner.id, -1))}
                    disabled={pending || index === 0}
                    aria-label="Mover para cima"
                    className="rounded-brand p-2 text-brand-gray-600 hover:text-brand-black disabled:opacity-30"
                  >
                    <ArrowUp className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => run(() => moveBannerAction(banner.id, 1))}
                    disabled={pending || index === banners.length - 1}
                    aria-label="Mover para baixo"
                    className="rounded-brand p-2 text-brand-gray-600 hover:text-brand-black disabled:opacity-30"
                  >
                    <ArrowDown className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => run(() => toggleBannerAction(banner.id, !banner.ativo))}
                    disabled={pending}
                    aria-label={banner.ativo ? "Ocultar banner" : "Mostrar banner"}
                    className="rounded-brand p-2 text-brand-gray-600 hover:text-brand-black disabled:opacity-60"
                  >
                    {banner.ativo ? (
                      <Eye className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <EyeOff className="h-4 w-4" aria-hidden="true" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(banner)}
                    disabled={pending}
                    aria-label="Remover banner"
                    className="rounded-brand p-2 text-brand-gray-600 hover:text-brand-red disabled:opacity-60"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
