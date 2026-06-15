import { useMutation } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

export function useUpdatePassword() {
  return useMutation({
    mutationFn: async ({ password }: { password: string }) => {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      return true
    },
    onSuccess: () => {
      toast.success('Password updated successfully.')
    },
    onError: (error: any) => {
      toast.error(error?.message ?? 'Failed to update password.')
    },
  })
}