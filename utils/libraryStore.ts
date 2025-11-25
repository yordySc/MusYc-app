import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';

export type Level = 'Principiante' | 'Intermedio' | 'Avanzado';

export type RepertoireItem = {
  id: string;
  title: string;
  type: string;
  instrument: string;
  level: Level;
  owner?: string; // 'system' or userId
  public?: boolean; // for user uploads
  fileUri?: string | null; // local uri or remote
  created_at?: string;
};

const REPO_KEY = 'musyc_repertoire';
const USER_UPLOADS_KEY = (id?: string) => `musyc_user_uploads_${id ?? 'anon'}`;

function makeId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

export async function getRepertoire(): Promise<RepertoireItem[]> {
  try {
    const raw = await AsyncStorage.getItem(REPO_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as RepertoireItem[];
  } catch (err) {
    // getRepertoire error
    return [];
  }
}

export async function fetchPublicRepertoireFromSupabase(): Promise<RepertoireItem[]> {
  try {
    const { data, error } = await supabase
      .from('repertoire')
      .select('id,title,genre,instrumentation,difficulty_level,pdf_url,created_at,created_by_user_id,is_public')
      .eq('is_public', true)
      .order('created_at', { ascending: false });

    if (error) {
      // Supabase fetch public repertoire error
      return [];
    }

    return (data || []).map((r: any) => ({
      id: String(r.id),
      title: r.title,
      type: 'Partitura',
      instrument: r.instrumentation || 'Varios',
      level: (r.difficulty_level as any) || 'Principiante',
      owner: r.created_by_user_id ?? 'system',
      public: r.is_public ?? true,
      fileUri: r.pdf_url ?? null,
      created_at: r.created_at,
    } as RepertoireItem));
  } catch (err) {
    // fetchPublicRepertoireFromSupabase exception
    return [];
  }
}

export function dedupeByPdfUrl(items: RepertoireItem[]) {
  const seen = new Set<string>();
  const out: RepertoireItem[] = [];
  for (const it of items) {
    const key = it.fileUri ?? `${it.title}:${it.owner}:${it.created_at}`;
    if (!seen.has(key)) {
      seen.add(key);
      out.push(it);
    }
  }
  return out;
}

// Extrae la ruta en el bucket a partir de una URL pública o signed de Supabase.
// Ejemplos de URL:
// - https://<proj>.supabase.co/storage/v1/object/public/repertoire/userId/file.pdf
// - https://<proj>.supabase.co/storage/v1/object/sign/repertoire/userId/file.pdf?token=...
export function extractStoragePathFromUrl(url: string | undefined | null): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    const match = u.pathname.match(/\/storage\/v1\/object\/(?:public|sign)\/([^\/]+)\/(.+)$/);
    if (match && match[1] && match[2]) {
      // devolver "bucket/path/to/file"
      return `${match[1]}/${match[2]}`;
    }
  } catch (err) {
    // no es una URL válida
    return null;
  }
  return null;
}

export async function addRepertoireItem(item: Omit<RepertoireItem, 'id' | 'created_at'>) {
  try {
    const list = await getRepertoire();
    const next: RepertoireItem = { ...item, id: makeId(), created_at: new Date().toISOString() };
    const updated = [next, ...list];
    await AsyncStorage.setItem(REPO_KEY, JSON.stringify(updated));
    return next;
  } catch (err) {
    // addRepertoireItem error
    throw err;
  }
}

export async function getUserUploads(userId?: string): Promise<RepertoireItem[]> {
  try {
    const raw = await AsyncStorage.getItem(USER_UPLOADS_KEY(userId));
    if (!raw) return [];
    return JSON.parse(raw) as RepertoireItem[];
  } catch (err) {
    // getUserUploads error
    return [];
  }
}

// Nuevo: obtener repertorio combinado (local + público remoto)
export async function getCombinedRepertoire(userId?: string): Promise<RepertoireItem[]> {
  try {
    const localRepo = await getRepertoire();
    const publicRemote = await fetchPublicRepertoireFromSupabase();
    const userUploads = await getUserUploads(userId);
    // combinar: local repo (system), remote public y uploads del usuario/local
    // Sincronizar: si el usuario eliminó la fila remota en Supabase, borrar también la copia local
    // Construir conjunto de rutas remotas conocidas
    const remotePaths = new Set<string>(publicRemote.map(r => r.fileUri ?? '').filter(Boolean));

    // Filtrar userUploads: si el upload pertenece al usuario y su fileUri parece una ruta de storage
    // pero no está en remotePaths, eliminarlo localmente (se asume que fue borrado remotamente)
    const cleanedUploads = userUploads.filter(u => {
      if (!u.owner || u.owner !== userId) return true; // no es mío -> conservar
      if (!u.fileUri) return true; // sin archivo -> conservar
      // si fileUri es una URL completa (http), no la tocamos
      if (u.fileUri.startsWith('http')) return true;
      // si la ruta está presente en remotePaths, conservar
      if (remotePaths.has(u.fileUri)) return true;
      // en otro caso, fue borrado remotamente: eliminar del listado local
      return false;
    });

    // Si se eliminaron items locales, persistir el cambio
    if (cleanedUploads.length !== userUploads.length) {
      try {
        await AsyncStorage.setItem(USER_UPLOADS_KEY(userId), JSON.stringify(cleanedUploads));
      } catch (err) {
        // Failed to persist cleaned user uploads
      }
    }

    const combined = [...localRepo, ...publicRemote, ...cleanedUploads];
    return dedupeByPdfUrl(combined);
  } catch (err) {
    // getCombinedRepertoire error
    // fallback al repo local + user uploads
    const localRepo = await getRepertoire();
    const userUploads = await getUserUploads(userId);
    return dedupeByPdfUrl([...localRepo, ...userUploads]);
  }
}

// Sincroniza uploads locales con lo que hay en Supabase: elimina las entradas locales
// cuyo storage path ya no existe en la lista pública remota. Devuelve los items eliminados.
export async function syncUserUploads(userId?: string) {
  try {
    const publicRemote = await fetchPublicRepertoireFromSupabase();
    const userUploads = await getUserUploads(userId);

    // Construir set con rutas remotas conocidas (puede ser storage path o URL)
    const remotePaths = new Set<string>();
    for (const r of publicRemote) {
      if (r.fileUri) {
        remotePaths.add(r.fileUri);
        const extracted = extractStoragePathFromUrl(r.fileUri);
        if (extracted) remotePaths.add(extracted);
      }
    }

    const cleanedUploads: RepertoireItem[] = [];
    const removed: RepertoireItem[] = [];

    for (const u of userUploads) {
      // mantener uploads que no son del usuario (defensivo), o sin fileUri
      if (!u.owner || u.owner !== userId) {
        cleanedUploads.push(u);
        continue;
      }
      if (!u.fileUri) {
        cleanedUploads.push(u);
        continue;
      }

      // Si fileUri es URL (http), intentar extraer storage path; si no pertenece al dominio supabase
      // o no se puede extraer, comparar la URL tal cual con remotePaths
      let matchesRemote = false;
      if (u.fileUri.startsWith('http')) {
        if (remotePaths.has(u.fileUri)) matchesRemote = true;
        const extracted = extractStoragePathFromUrl(u.fileUri);
        if (extracted && remotePaths.has(extracted)) matchesRemote = true;
      } else {
        // fileUri es probablemente storage path
        if (remotePaths.has(u.fileUri)) matchesRemote = true;
      }

      if (matchesRemote) cleanedUploads.push(u);
      else removed.push(u);
    }

    if (removed.length > 0) {
      try {
        await AsyncStorage.setItem(USER_UPLOADS_KEY(userId), JSON.stringify(cleanedUploads));
      } catch (err) {
        // Failed to persist cleaned user uploads
      }
    }

    return { removed };
  } catch (err) {
    // syncUserUploads error
    return { removed: [] };
  }
}

export async function clearUserUploads(userId?: string) {
  try {
    await AsyncStorage.removeItem(USER_UPLOADS_KEY(userId));
    return { ok: true };
  } catch (err) {
    // clearUserUploads error
    return { ok: false, error: err };
  }
}

// Elimina un upload del usuario: borra el archivo en Storage, la fila en Supabase y la entrada local.
export async function deleteUserUpload(userId: string | undefined, upload: RepertoireItem) {
  const result: { ok: boolean; deletedRemote?: boolean; removedFromStorage?: boolean; removedLocal?: boolean; error?: any } = { ok: false };
  try {
    // deleteUserUpload start

    let storagePath: string | null = null;
      if (upload.fileUri) {
      if (upload.fileUri.startsWith('http')) {
        storagePath = extractStoragePathFromUrl(upload.fileUri);
      } else {
        storagePath = upload.fileUri;
      }
    }

    // 1) Buscar la fila exacta en Supabase para confirmar pdf_url
    let remoteId: string | number | null = null;
    if (userId && storagePath) {
      try {
        const { data: rows, error: fetchErr } = await supabase
          .from('repertoire')
          .select('id, pdf_url')
          .eq('created_by_user_id', userId)
          .eq('pdf_url', storagePath)
          .single();

        if (fetchErr) {
          // fetch remote row error
        } else if (rows) {
          remoteId = rows.id;
        }
      } catch (err) {
        // fetch remote row exception
      }
    }

    // 2) Borrar archivo en Storage
    if (storagePath) {
        try {
        const { error: removeErr } = await supabase.storage.from('repertoire').remove([storagePath]);
        if (!removeErr) {
          result.removedFromStorage = true;
        }
      } catch (err) {
        // storage remove exception
      }
    }

    // 3) Borrar fila en tabla `repertoire`
    if (userId) {
      try {
        let deleteQuery: any;
        if (remoteId !== null) {
          deleteQuery = supabase.from('repertoire').delete().eq('id', remoteId).eq('created_by_user_id', userId);
        } else if (storagePath) {
          deleteQuery = supabase.from('repertoire').delete().eq('pdf_url', storagePath).eq('created_by_user_id', userId);
        }

        if (deleteQuery) {
          const { error: delErr } = await deleteQuery;
          if (!delErr) {
            result.deletedRemote = true;
          }
        }
      } catch (err) {
        // delete row exception
      }
    }

    // 4) Borrar de AsyncStorage (user uploads local)
    try {
      const uploads = await getUserUploads(userId);
      const filtered = uploads.filter(u => {
        if (u.id === upload.id) return false;
        if (u.fileUri && upload.fileUri && u.fileUri === upload.fileUri) return false;
        const uPath = u.fileUri && u.fileUri.startsWith('http') ? extractStoragePathFromUrl(u.fileUri) : u.fileUri;
        if (storagePath && uPath === storagePath) return false;
        return true;
      });

      if (filtered.length !== uploads.length) {
        await AsyncStorage.setItem(USER_UPLOADS_KEY(userId), JSON.stringify(filtered));
        result.removedLocal = true;
      }
    } catch (err) {
      // remove local upload error
    }

    result.ok = true;
    return result;
  } catch (err) {
    result.error = err;
    // deleteUserUpload error
    return result;
  }
}

export async function addUserUpload(userId: string | undefined, item: Omit<RepertoireItem, 'id' | 'created_at' | 'owner'>) {
  try {
    const key = USER_UPLOADS_KEY(userId);
    const existing = await getUserUploads(userId);
    // `storagePath` será la ruta en el bucket (ej: "userId/1234_file.pdf")
    // Guardaremos en la DB y en el objeto local la `storagePath`, no un signedUrl.
    let fileUri: string | null = item.fileUri ?? null;
    let storagePath: string | null = null;
    // Si viene un fileUri local, intentar subir a Supabase Storage
    if (userId && item.fileUri) {
      try {
        const uri = item.fileUri as string;
        const response = await fetch(uri);
        const blob = await response.blob();
        const filename = `${userId}/${Date.now()}_${uri.split('/').pop()}`;
        const { data: uploadData, error: uploadError } = await supabase.storage.from('repertoire').upload(filename, blob, { contentType: 'application/pdf' });

        if (!uploadError) {
          storagePath = uploadData?.path ?? null;
          if (storagePath) {
            const { data: publicUrlData } = supabase.storage.from('repertoire').getPublicUrl(storagePath);
            const publicUrl = publicUrlData?.publicUrl ?? null;
            fileUri = publicUrl ?? storagePath;
          }
        }
      } catch (err) {
        // Error uploading file to Supabase
      }
    }

    const next: RepertoireItem = { ...item, id: makeId(), owner: userId ?? 'anon', created_at: new Date().toISOString(), fileUri };

    // Guardar inicialmente en el storage local (optimistic UI)
    let updated = [next, ...existing];
    await AsyncStorage.setItem(key, JSON.stringify(updated));

    // Intentar insertar registro en tabla `repertoire` (si hay supabase)
    if (userId) {
      try {
        const pdfUrlToInsert = storagePath ?? fileUri ?? '';
        const { data: inserted, error: insertError } = await supabase.from('repertoire')
          .insert({
            title: item.title,
            genre: null,
            instrumentation: item.instrument,
            difficulty_level: item.level,
            // Guardamos la URL pública completa que puede ser abierta directamente
            pdf_url: pdfUrlToInsert,
            user_id: userId,
            is_public: item.public ?? true,
            created_by_user_id: userId,
          })
          .select()
          .single();

        if (insertError) {
          // Error inserting repertoire row
          return next; // retornar item local si falla DB insert
        } else if (inserted) {
          const realId = String(inserted.id);
          const realPdf = inserted.pdf_url ?? (storagePath ?? fileUri ?? '');
          // Actualizar la copia local: reemplazar el item temporal por el registro real (id numérico y pdf_url exacto)

          const updatedWithReal = updated.map(u => {
            if (u.id === next.id || (u.fileUri && storagePath && u.fileUri === storagePath)) {
              return { ...u, id: realId, fileUri: realPdf } as RepertoireItem;
            }
            return u;
          });

          await AsyncStorage.setItem(key, JSON.stringify(updatedWithReal));
          
          // Retornar el item actualizado con el ID real de la DB
          return { ...next, id: realId, fileUri: realPdf };
        }
        return next;
      } catch (err) {
        // addUserUpload DB error
        return next; // retornar item local si hay error
      }
    }

    return next;
  } catch (err) {
    // addUserUpload final error
    throw err;
  }
}

export async function togglePublish(userId: string | undefined, uploadId: string, makePublic: boolean) {
  try {
    const uploads = await getUserUploads(userId);
    const updated = uploads.map(u => (u.id === uploadId ? { ...u, public: makePublic } : u));
    await AsyncStorage.setItem(USER_UPLOADS_KEY(userId), JSON.stringify(updated));
    return updated.find(u => u.id === uploadId) || null;
  } catch (err) {
    // togglePublish error
    throw err;
  }
}
