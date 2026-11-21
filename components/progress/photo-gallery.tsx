'use client';

import React, { useState } from 'react';
import { Trash2, ZoomIn, X, Calendar, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface ProgressPhotoItem {
  id: string;
  storage_path: string;
  display_url?: string;
  captured_at: string;
  notes?: string | null;
}

interface PhotoGalleryProps {
  photos: ProgressPhotoItem[];
  onPhotoDeleted: () => void;
}

export function PhotoGallery({ photos, onPhotoDeleted }: PhotoGalleryProps) {
  const [activePhoto, setActivePhoto] = useState<ProgressPhotoItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (photoId: string) => {
    if (!confirm('Are you sure you want to permanently delete this progress photo?')) {
      return;
    }

    setDeletingId(photoId);
    try {
      const res = await fetch(`/api/me/photos?id=${photoId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        if (activePhoto?.id === photoId) {
          setActivePhoto(null);
        }
        onPhotoDeleted();
      }
    } catch (err) {
      console.error('Failed to delete photo:', err);
    } finally {
      setDeletingId(null);
    }
  };

  if (!photos || photos.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-emerald-100 bg-white p-6 text-center">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-[#075B2B]">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <h4 className="mt-2 text-sm font-bold text-[#1A2E1C]">No Private Photos Yet</h4>
        <p className="mt-1 max-w-sm mx-auto text-xs text-gray-500">
          Progress photos are completely optional. If you choose to upload, they are stored securely and encrypted for private review only.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {photos.map((photo) => {
          const imgUrl = photo.display_url || photo.storage_path;
          return (
            <div
              key={photo.id}
              className="group relative overflow-hidden rounded-xl border border-emerald-100 bg-gray-50 shadow-2xs"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imgUrl}
                alt={`Progress ${photo.captured_at}`}
                className="h-36 w-full object-cover transition-transform duration-200 group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(photo.id)}
                    disabled={deletingId === photo.id}
                    className="h-7 w-7 p-0 bg-red-600/90 text-white border-none hover:bg-red-700"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-white flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {photo.captured_at}
                  </span>
                  <button
                    onClick={() => setActivePhoto(photo)}
                    className="rounded-full bg-white/30 p-1 text-white hover:bg-white/50 backdrop-blur-xs"
                  >
                    <ZoomIn className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Mobile bottom date banner */}
              <div className="sm:hidden bg-white px-2 py-1 text-[10px] text-gray-600 flex items-center justify-between border-t border-emerald-50">
                <span>{photo.captured_at}</span>
                <button
                  onClick={() => handleDelete(photo.id)}
                  className="text-red-600 p-0.5"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Full preview modal */}
      {activePhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs">
          <div className="relative max-w-2xl w-full rounded-2xl bg-white p-4 shadow-2xl">
            <button
              onClick={() => setActivePhoto(null)}
              className="absolute right-3 top-3 z-10 rounded-full bg-gray-100 p-1.5 text-gray-700 hover:bg-gray-200"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="overflow-hidden rounded-xl bg-black/5 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activePhoto.display_url || activePhoto.storage_path}
                alt={`Photo on ${activePhoto.captured_at}`}
                className="max-h-[70vh] w-auto object-contain"
              />
            </div>

            <div className="mt-3 flex items-center justify-between px-1">
              <div>
                <p className="text-xs font-bold text-[#1A2E1C]">
                  Captured: {activePhoto.captured_at}
                </p>
                {activePhoto.notes && (
                  <p className="text-xs text-gray-500 mt-0.5">{activePhoto.notes}</p>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDelete(activePhoto.id)}
                className="text-xs text-red-600 border-red-200 hover:bg-red-50"
              >
                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
