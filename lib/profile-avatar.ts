type AvatarStorageClient = {
  storage: {
    from: (bucket: string) => {
      createSignedUrl: (path: string, expiresIn: number) => Promise<{ data: { signedUrl: string } | null }>
    }
  }
}

export async function getSignedAvatarUrl(client: AvatarStorageClient, avatarPath?: string | null) {
  if (!avatarPath) return null
  const { data } = await client.storage.from("avatars").createSignedUrl(avatarPath, 60 * 60)
  return data?.signedUrl || null
}
