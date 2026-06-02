"use client";

import { useState, useRef } from "react";
import type { Business, ImageGallery, ImageType } from "@/types";

const IMAGE_TYPE_LABELS: Record<ImageType, string> = {
  cover: "Capa do site",
  logo: "Logo",
  professional: "Foto profissional",
  post: "Post",
  story: "Story",
  general: "Geral",
};

const IMAGE_TYPE_OPTIONS: { id: ImageType; label: string; desc: string }[] = [
  { id: "cover",        label: "Capa do site",      desc: "Banner principal do mini site" },
  { id: "logo",         label: "Logo",               desc: "Logo do negócio" },
  { id: "professional", label: "Foto profissional",  desc: "Foto da equipe ou do local" },
  { id: "post",         label: "Para posts",         desc: "Usada em posts do Instagram" },
  { id: "story",        label: "Para stories",       desc: "Usada em stories" },
  { id: "general",      label: "Geral",              desc: "Imagens diversas do negócio" },
];

interface Props {
  business: Business;
  initialImages: ImageGallery[];
}

export default function GaleriaClient({ business, initialImages }: Props) {
  const [images, setImages] = useState<ImageGallery[]>(initialImages);
  const [uploading, setUploading] = useState(false);
  const [uploadType, setUploadType] = useState<ImageType>("general");
  const [filterType, setFilterType] = useState<ImageType | "all">("all");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = filterType === "all" ? images : images.filter((img) => img.image_type === filterType);
  const favorites = images.filter((img) => img.is_favorite);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);
    setSuccess(null);

    const newImages: ImageGallery[] = [];

    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("business_id", business.id);
      formData.append("image_type", uploadType);

      const res = await fetch("/api/gallery", { method: "POST", body: formData });
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
      setTimeout(() => setSuccess(null), 3000);
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function toggleFavorite(img: ImageGallery) {
    const res = await fetch("/api/gallery", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: img.id, is_favorite: !img.is_favorite }),
    });
    if (res.ok) {
      setImages((prev) => prev.map((i) => i.id === img.id ? { ...i, is_favorite: !i.is_favorite } : i));
    }
  }

  async function deleteImage(img: ImageGallery) {
    if (!confirm("Remover esta imagem?")) return;
    const res = await fetch(`/api/gallery?id=${img.id}`, { method: "DELETE" });
    if (res.ok) {
      setImages((prev) => prev.filter((i) => i.id !== img.id));
    }
  }

  async function changeType(img: ImageGallery, newType: ImageType) {
    const res = await fetch("/api/gallery", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: img.id, image_type: newType }),
    });
    if (res.ok) {
      setImages((prev) => prev.map((i) => i.id === img.id ? { ...i, image_type: newType } : i));
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Minha galeria de imagens</h1>
        <p className="text-gray-500 text-sm mt-1">
          Envie fotos do negócio para usar no mini site, posts, stories e carrosséis.
        </p>
      </div>

      {/* Upload area */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 mb-6">
        <h2 className="font-bold text-gray-800 dark:text-gray-200 mb-4">Enviar imagens</h2>

        <div className="mb-4">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Tipo de imagem</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {IMAGE_TYPE_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setUploadType(opt.id)}
                className={`text-left border rounded-xl px-3 py-2.5 transition text-xs ${
                  uploadType === opt.id
                    ? "border-violet-400 bg-violet-50 dark:bg-violet-950 text-violet-700"
                    : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300"
                }`}
              >
                <p className="font-bold">{opt.label}</p>
                <p className="text-gray-400 mt-0.5 hidden sm:block">{opt.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2 mb-3">{error}</p>}
        {success && <p className="text-sm text-green-700 bg-green-50 rounded-xl px-4 py-2 mb-3">{success}</p>}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleUpload}
          className="hidden"
          id="gallery-upload"
        />
        <label
          htmlFor="gallery-upload"
          className={`flex flex-col items-center justify-center w-full border-2 border-dashed rounded-2xl py-10 cursor-pointer transition ${
            uploading
              ? "border-violet-300 bg-violet-50 dark:bg-violet-950"
              : "border-gray-200 dark:border-gray-700 hover:border-violet-300 hover:bg-violet-50/50 dark:hover:bg-violet-950/30"
          }`}
        >
          <div className="text-4xl mb-3">{uploading ? "⏳" : "📸"}</div>
          <p className="font-bold text-gray-700 dark:text-gray-300 text-sm">
            {uploading ? "Enviando…" : "Clique para selecionar imagens"}
          </p>
          <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP — máx. 5MB cada</p>
        </label>
      </div>

      {/* Favoritas */}
      {favorites.length > 0 && (
        <div className="mb-6">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">⭐ Favoritas</p>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {favorites.map((img) => (
              <ImageCard key={img.id} img={img} onFavorite={toggleFavorite} onDelete={deleteImage} onTypeChange={changeType} />
            ))}
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setFilterType("all")}
          className={`text-xs px-3 py-1.5 rounded-full font-medium border transition ${
            filterType === "all"
              ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white"
              : "border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400"
          }`}
        >
          Todas ({images.length})
        </button>
        {IMAGE_TYPE_OPTIONS.map((opt) => {
          const count = images.filter((i) => i.image_type === opt.id).length;
          if (count === 0) return null;
          return (
            <button
              key={opt.id}
              onClick={() => setFilterType(opt.id)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium border transition ${
                filterType === opt.id
                  ? "bg-violet-600 text-white border-violet-600"
                  : "border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400"
              }`}
            >
              {opt.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Grid de imagens */}
      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 py-16 text-center">
          <div className="text-4xl mb-3">🖼️</div>
          <p className="font-bold text-gray-600 dark:text-gray-400">
            {images.length === 0 ? "Nenhuma imagem ainda" : "Nenhuma imagem nesta categoria"}
          </p>
          <p className="text-sm text-gray-400 mt-1">
            {images.length === 0 ? "Envie fotos do seu negócio para usar nos conteúdos." : "Selecione outra categoria."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
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
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className={`group relative rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 ${large ? "aspect-square" : "aspect-square"}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={img.image_url}
        alt={img.file_name ?? "Imagem"}
        className="w-full h-full object-cover"
      />

      {/* Overlay on hover */}
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
        <div className="flex justify-between">
          <button
            onClick={() => onFavorite(img)}
            className={`w-7 h-7 rounded-full flex items-center justify-center text-sm ${img.is_favorite ? "bg-yellow-400 text-yellow-900" : "bg-white/80 text-gray-700"}`}
            title="Favoritar"
          >
            ⭐
          </button>
          <button
            onClick={() => onDelete(img)}
            className="w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center text-sm"
            title="Remover"
          >
            ✕
          </button>
        </div>
        <div>
          <select
            value={img.image_type}
            onChange={(e) => onTypeChange(img, e.target.value as ImageType)}
            onClick={(e) => e.stopPropagation()}
            className="w-full text-xs bg-white/90 rounded-lg px-2 py-1 text-gray-700 border-0 focus:outline-none"
          >
            {Object.entries(IMAGE_TYPE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tipo badge */}
      <div className="absolute top-1.5 left-1.5 group-hover:opacity-0 transition-opacity">
        <span className="text-xs bg-black/50 text-white px-1.5 py-0.5 rounded-md font-medium">
          {IMAGE_TYPE_LABELS[img.image_type]}
        </span>
      </div>

      {img.is_favorite && (
        <div className="absolute bottom-1.5 right-1.5 group-hover:opacity-0 transition-opacity">
          <span className="text-sm">⭐</span>
        </div>
      )}
    </div>
  );
}
