import { NextResponse } from 'next/server';
import { createClient } from '@/lib/db/supabase-server';
import { createAdminClient } from '@/lib/db/supabase-admin';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminSupabase = createAdminClient();
    const { searchParams } = new URL(request.url);
    const asMember = searchParams.get('asMember');
    let targetUserId = user.id;

    if (asMember) {
      const { data: profile } = await adminSupabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

      if (profile?.role === 'admin') {
        targetUserId = asMember;
      }
    }

    const { data: photos, error } = await adminSupabase
      .from('progress_photos')
      .select('*')
      .eq('user_id', targetUserId)
      .is('deleted_at', null)
      .order('captured_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: 'Failed to retrieve photos' }, { status: 500 });
    }

    // Generate signed URLs (15 minutes validity) for private storage
    const items = await Promise.all(
      (photos || []).map(async (photo) => {
        let url = photo.storage_path;
        // If storage_path is not a data URL or http, try creating signed URL from bucket
        if (!url.startsWith('data:') && !url.startsWith('http')) {
          const { data: signed } = await adminSupabase.storage
            .from('progress_photos')
            .createSignedUrl(photo.storage_path, 900); // 15 mins
          if (signed?.signedUrl) {
            url = signed.signedUrl;
          }
        }
        return {
          ...photo,
          display_url: url,
        };
      })
    );

    return NextResponse.json({ photos: items });
  } catch (err) {
    console.error('Error fetching photos:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { file_data, file_name, file_type, captured_at, consent_given, notes } = body;

    if (!consent_given) {
      return NextResponse.json(
        { error: 'Explicit consent is required to store progress photos.' },
        { status: 400 }
      );
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file_type)) {
      return NextResponse.json(
        { error: 'Only JPG, PNG, and WebP images are permitted.' },
        { status: 400 }
      );
    }

    const adminSupabase = createAdminClient();
    const dateStr = captured_at || new Date().toISOString().split('T')[0];
    const fileName = `${user.id}/${Date.now()}_${file_name || 'progress.jpg'}`;

    let storagePath = fileName;

    // Check if file_data is base64 string
    if (file_data && file_data.startsWith('data:')) {
      // Decode base64 buffer
      const base64Content = file_data.split(';base64,').pop();
      if (base64Content) {
        const buffer = Buffer.from(base64Content, 'base64');
        if (buffer.length > 5 * 1024 * 1024) {
          return NextResponse.json(
            { error: 'File size must be 5MB or less.' },
            { status: 400 }
          );
        }

        // Try upload to Supabase storage bucket
        const { error: uploadErr } = await adminSupabase.storage
          .from('progress_photos')
          .upload(fileName, buffer, {
            contentType: file_type,
            upsert: true,
          });

        if (uploadErr) {
          // If storage bucket isn't configured in environment, fallback to storing data URL safely
          console.warn('Storage upload fallback note:', uploadErr.message);
          storagePath = file_data;
        }
      }
    } else {
      storagePath = file_data || fileName;
    }

    const { data: record, error: dbErr } = await adminSupabase
      .from('progress_photos')
      .insert({
        user_id: user.id,
        storage_path: storagePath,
        captured_at: dateStr,
        consent_version: 'v1.0',
        notes: notes || null,
      })
      .select()
      .single();

    if (dbErr) {
      console.error('Error inserting photo record:', dbErr);
      return NextResponse.json({ error: 'Failed to record photo' }, { status: 500 });
    }

    return NextResponse.json({ success: true, photo: record });
  } catch (err) {
    console.error('Error in photo upload:', err);
    return NextResponse.json({ error: 'Failed to upload photo' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const photoId = searchParams.get('id');

    if (!photoId) {
      return NextResponse.json({ error: 'Photo ID is required' }, { status: 400 });
    }

    const adminSupabase = createAdminClient();

    // Verify ownership
    const { data: photo } = await adminSupabase
      .from('progress_photos')
      .select('id, user_id, storage_path')
      .eq('id', photoId)
      .single();

    if (!photo || photo.user_id !== user.id) {
      return NextResponse.json({ error: 'Photo not found or unauthorized' }, { status: 404 });
    }

    // Attempt to remove from storage if it's a path
    if (!photo.storage_path.startsWith('data:')) {
      try {
        await adminSupabase.storage
          .from('progress_photos')
          .remove([photo.storage_path]);
      } catch (storageErr) {
        console.warn('Storage remove warning:', storageErr);
      }
    }

    // Hard delete or soft delete
    await adminSupabase
      .from('progress_photos')
      .delete()
      .eq('id', photoId);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error deleting photo:', err);
    return NextResponse.json({ error: 'Failed to delete photo' }, { status: 500 });
  }
}
