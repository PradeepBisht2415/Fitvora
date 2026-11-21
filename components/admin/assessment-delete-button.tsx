'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Trash2, Loader2 } from 'lucide-react';

interface AssessmentDeleteButtonProps {
  assessmentId: string;
  clientName: string;
}

export function AssessmentDeleteButton({ assessmentId, clientName }: AssessmentDeleteButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm(`Permanently delete assessment intake lead for "${clientName}"?`)) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/assessments/${assessmentId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        router.refresh();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to delete assessment');
      }
    } catch (err) {
      console.error('Delete assessment error:', err);
      alert('Network error while deleting assessment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleDelete}
      disabled={loading}
      className="h-8 gap-1.5 font-bold text-xs border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700"
      title="Delete assessment"
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin text-red-600" />
      ) : (
        <Trash2 className="h-3.5 w-3.5 text-red-600" />
      )}
      <span>Delete</span>
    </Button>
  );
}
