"use client";

import { useState, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Business, ImageGallery, ImageType } from "@/types";

const IMAGE_TYPE_LABELS: Record<ImageType, string> = {
  cover:        "Capa do site",
  logo:         "Logo",
  professional: "Foto profissional",
  post:         "Post",
  story:        "Story",
  general:      "Geral",
};

const IMAGE_TYPE_OPTIONS: { id: ImageType; label: string; desc: string; icon: string }[] = [
  { id: "cover",        label: "Capa do site",      desc: "Banner principal do mini site", icon: "🖼️" },
  { id: "logo",         label: "Logo",               desc: "Logo do negócio",               icon: "✨" },
  { id: "professional", label: "Foto profissional",  desc: "Foto da equipe ou do local",    icon: "📷" },
  { id: "post",         label: "Para posts",         desc: "Usada em posts do Instagram",   icon: "📸" },
  { id: "story",        label: "Para stories",       desc: "Usada em stories",              icon: "📱" },
  { id: "general",      label: "Geral",              desc: "Imagens diversas do negócio",   icon: "🗂️" },
];

interface Props {
  business: Business;
  initialImages: ImageGallery[];
}

async function getAuthHeaders(): Promise<HeadersInit> {
  try {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      return { Authorization: `Bearer ${session.access_token}` };
    }
  } catch {}
  return {};
}

export default function GaleriaClient({ business, initialImages }: Props) {
  const [images, setImages]       = useState<ImageGallery[]>(initialImages);
  const [uploading, setUploading] = useState(false);
  const [uploadType, setUploadType] = useState<ImageType>("general");
  const [filterType, setFilterType] = useState<ImageType | "all">("all");
  const [error, setError]         = useState<string | null>(null);
  const [success, setSuccess]     = useState<string | null>(null);
  const [dragging, setDragging]   = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered  = filterType === "all" ? images : images.filter((img) => img.image_type === filterType);
  const favorites = images.filter((img) => img.is_favorite);

  const uploadFiles = useCallback(async (files: FileList) => {
    if (files.length === 0) return;
    setUploading(true);
    setError(null);
    setSuccess(null);

    const headers = await getAuthHeaders();
    const newImages: ImageGallery[] = [];

    for (const file of Array.from(files)) {
      if (file.size > 5 * 1024 * 1024) {
        setError(`"${file.name}" é maior que 5MB. Reduza o tamanho e tente novamente.`);
        break;
      }
      if (!file.type.startsWith("image/")) {
        setError(`"${file.name}" não é uma imagem válida.`);
        break;
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("business_id", business.id);
      formData.append("image_type", uploadType);

      const res  = await fetch("/api/gallery", { method: "POST", headers, body: formData });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Erro ao enviar imagem.");
        break;
      }
      newImages.push(data.image);
    }

    if (newImages.length > 0) {
      setImages((prev) => [...newImages, ...prev]);
      setSuccess(`${newImages.length} imagem${newImages.length > 1 ? "s" : ""} enviada${newImages.length > 1 ? "s" : ""} com sucesso!`);
      setTimeout(() => setSuccess(null), 4000);
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [business.id, uploadType]);

  async function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) await uploadFiles(e.target.files);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setDragging(true);
  }
  function handleDragLeave() { setDragging(false); }
  async function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files) await uploadFiles(e.dataTransfer.files);
  }

  async function toggleFavorite(img: ImageGallery) {
    const headers = { ...(await getAuthHeaders()), "Content-Type": "application/json" };
    const res = await fetch("/api/gallery", {
      method: "PATCH", headers,
      body: JSON.stringify({ id: img.id, is_favorite: !img.is_favorite }),
    });
    if (res.ok) setImages((prev) => prev.map((i) => i.id === img.id ? { ...i, is_favorite: !i.is_favorite } : i));
  }

  async function deleteImage(img: ImageGallery) {
    if (!confirm("Remover esta imagem permanentemente?")) return;
    const headers = await getAuthHeaders();
    const res = await fetch(`/api/gallery?id=${img.id}`, { method: "DELETE", headers });
    if (res.ok) setImages((prev) => prev.filter((i) => i.id !== img.id));
  }

  async function changeType(img: ImageGallery, newType: ImageType) {
    const headers = { ...(await getAuthHeaders()), "Content-Type": "application/json" };
    const res = await fetch("/api/gallery", {
      method: "PATCH", headers,
      body: JSON.stringify({ id: img.id, image_type: newType }),
    });
    if (res.ok) setImages((prev) => prev.map((i) => i.id === img.id ? { ...i, image_type: newType } : i));
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Minha galeria de imagens</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Envie fotos do negócio para usar no mini site, posts, stories e carrosséis.
        </p>
      </div>

      {/* Upload area */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 mb-6 shadow-sm">
        <h2 className="font-bold text-gray-800 dark:text-gray-200 mb-4">Enviar imagens</h2>

        {/* Tipo */}
        <div className="mb-5">
          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
            Tipo de imagem
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {IMAGE_TYPE_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setUploadType(opt.id)}
                className={`text-left border rounded-xl px-3 py-2.5 transition text-xs ${
                  uploadType === opt.id
                    ? "border-violet-400 bg-violet-50 dark:bg-violet-950 text-violet-700 dark:text-violet-300"
                    : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-violet-300"
                }`}
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span>{opt.icon}</span>
                  <p className="font-bold">{opt.label}</p>
                </div>
                <p className="text-gray-400 hidden sm:block">{opt.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Feedback */}
        {error   && <p className="text-sm text-red-600 bg-red-50 dark:bg-red-950 rounded-xl px-4 py-2.5 mb-3">{error}</p>}
        {success && <p className="text-sm text-green-700 bg-green-50 dark:bg-green-950 rounded-xl px-4 py-2.5 mb-3">✅ {success}</p>}

        {/* Drop zone */}
        <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileInput} className="hidden" id="gallery-upload" />
        <label
          htmlFor="gallery-upload"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center w-full border-2 border-dashed rounded-2xl py-12 cursor-pointer transition ${
            uploading  ? "border-violet-400 bg-violet-50 dark:bg-violet-950" :
            dragging   ? "border-violet-400 bg-violet-50/70 dark:bg-violet-950/50 scale-[1.01]" :
                         "border-gray-200 dark:border-gray-700 hover:border-violet-300 hover:bg-violet-50/40 dark:hover:bg-violet-950/20"
          }`}
        >
          <div className="text-5xl mb-3">{uploading ? "⏳" : dragging ? "📂" : "📸"}</div>
          <p className="font-bold text-gray-700 dark:text-gray-300 text-sm">
            {uploading ? "Enviando…" : dragging ? "Solte as imagens aqui" : "Clique ou arraste imagens aqui"}
          </p>
          <p className="text-xs text-gray-400 mt-1.5">JPG, PNG, WEBP — máx. 5MB cada</p>
          {!uploading && (
            <span className="mt-3 text-xs font-semibold text-violet-600 bg-violet-100 dark:bg-violet-950 px-3 py-1 rounded-full">
              Tipo selecionado: {IMAGE_TYPE_LABELS[uploadType]}
            </span>
          )}
        </label>
      </div>

      {/* Favoritas */}
      {favorites.length > 0 && (
        <div className="mb-6">
          <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-3">⭐ Favoritas</p>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {favorites.map((img) => (
              <ImageCard key={img.id} img={img} onFavorite={toggleFavorite} onDelete={deleteImage} onTypeChange={changeType} />
            ))}
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button onClick={() => setFilterType("all")} className={`text-xs px-3 py-1.5 rounded-full font-medium border transition ${filterType === "all" ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-transparent" : "border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400"}`}>
          Todas ({images.length})
        </button>
        {IMAGE_TYPE_OPTIONS.map((opt) => {
          const count = images.filter((i) => i.image_type === opt.id).length;
          if (count === 0) return null;
          return (
            <button key={opt.id} onClick={() => setFilterType(opt.id)} className={`text-xs px-3 py-1.5 rounded-full font-medium border transition ${filterType === opt.id ? "bg-violet-600 text-white border-violet-600" : "border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-violet-300"}`}>
              {opt.icon} {opt.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 py-20 text-center">
          <div className="text-5xl mb-4">🖼️</div>
          <p className="font-bold text-gray-600 dark:text-gray-400 mb-1">
            {images.length === 0 ? "Nenhuma imagem ainda" : "Nenhuma imagem nesta categoria"}
          </p>
          <p className="text-sm text-gray-400">
            {images.length === 0 ? "Envie fotos do seu negócio para usar nos conteúdos." : "Selecione outra categoria."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map((img) => (
            <ImageCard key={img.id} img={img} onFavorite={toggleFavorite} onDelete={deleteImage} onTypeChange={changeType} large />
          ))}
        </div>
      )}
    </div>
  );
}

function ImageCard({
  img, onFavorite, onDelete, onTypeChange, large,
}: {
  img: ImageGallery;
  onFavorite: (img: ImageGallery) => void;
  onDelete: (img: ImageGallery) => void;
  onTypeChange: (img: ImageGallery, type: ImageType) => void;
  large?: boolean;
}) {
  return (
    <div className={`group relative rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 aspect-square`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={img.image_url} alt={img.file_name ?? "Imagem"} className="w-full h-full object-cover" />

      {/* Overlay hover */}
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-200 flex flex-col justify-between p-2">
        <div className="flex justify-between">
          <button onClick={() => onFavorite(img)} className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shadow transition hover:scale-110 ${img.is_favorite ? "bg-yellow-400 text-yellow-900" : "bg-white/90 text-gray-700"}`} title={img.is_favorite ? "Remover favorito" : "Favoritar"}>
            ⭐
          </button>
          <button onClick={() => onDelete(img)} className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center text-sm shadow hover:bg-red-600 transition hover:scale-110" title="Remover">
            ✕
          </button>
        </div>
        <div>
          <select
            value={img.image_type}
            onChange={(e) => onTypeChange(img, e.target.value as ImageType)}
            onClick={(e) => e.stopPropagation()}
            className="w-full text-xs bg-white/95 rounded-lg px-2 py-1.5 text-gray-700 border-0 focus:outline-none font-medium"
          >
            {Object.entries(IMAGE_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
      </div>

      {/* Badge tipo */}
      <div className="absolute top-1.5 left-1.5 group-hover:opacity-0 transition-opacity">
        <span className="text-[10px] bg-black/60 text-white px-1.5 py-0.5 rounded-md font-semibold backdrop-blur-sm">
          {IMAGE_TYPE_LABELS[img.image_type]}
        </span>
      </div>

      {img.is_favorite && (
        <div className="absolute bottom-1.5 right-1.5 group-hover:opacity-0 transition-opacity">
          <span className="text-sm drop-shadow">⭐</span>
        </div>
      )}
    </div>
  );
}
