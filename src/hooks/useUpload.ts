import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import imageCompression from 'browser-image-compression'

export function useUpload(bucket: string) {
  const { user } = useAuth()
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function upload(file: File, path?: string): Promise<string | null> {
    if (!user) return null
    setUploading(true)
    setError(null)

    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      })

      const ext = compressed.name.split('.').pop() ?? 'jpg'
      const filePath = path ?? `${user.id}/${Date.now()}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, compressed, { upsert: true })

      if (uploadError) {
        setError(uploadError.message)
        return null
      }

      const { data } = supabase.storage.from(bucket).getPublicUrl(filePath)
      return data.publicUrl
    } catch (err: any) {
      setError(err?.message ?? 'Upload failed')
      return null
    } finally {
      setUploading(false)
    }
  }

  return { upload, uploading, error }
}
