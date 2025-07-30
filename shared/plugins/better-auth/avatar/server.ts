import type { BetterAuthPlugin, Session, User } from 'better-auth'
import { Buffer } from 'node:buffer'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { APIError, createAuthEndpoint } from 'better-auth/api'
import sharp from 'sharp'
import { z } from 'zod'

interface AvatarPluginOptions {
  storageDir?: string
  maxFileSize?: number
  imageSize?: {
    width: number
    height: number
  }
  webpQuality?: number
}

interface UploadAvatarResponse {
  success: boolean
  message: string
  avatarUrl: string
  userId: string
}

interface GetAvatarResponse {
  buffer: Buffer<ArrayBufferLike> | null
  alt: string
}

interface DeleteAvatarResponse {
  success: boolean
  message: string
  userId: string
}

/**
 * Avatar Storage Plugin for Better Auth
 * Handles avatar upload, retrieval, and deletion with WebP conversion
 */
export function avatarPlugin(options: AvatarPluginOptions = {}): BetterAuthPlugin {
  const {
    storageDir = 'storage',
    maxFileSize = 5 * 1024 * 1024, // 5MB default
    imageSize = { width: 400, height: 400 },
    webpQuality = 85,
  } = options

  return {
    id: 'avatar',
    endpoints: {
      uploadAvatar: createAuthEndpoint(
        '/avatar/upload',
        {
          method: 'POST',
          body: z.object({
            avatar: z.instanceof(File),
          }),
          requireAuth: true,
        },
        async (ctx): Promise<UploadAvatarResponse> => {
          try {
            const { avatar } = ctx.body
            const session = ctx.context.session

            if (!session?.user?.id) {
              throw new APIError('UNAUTHORIZED', {
                message: 'User not authenticated',
              })
            }

            const userId = session.user.id

            // Validate file type
            if (!avatar.type.startsWith('image/')) {
              throw new APIError('BAD_REQUEST', {
                message: 'File must be an image',
              })
            }

            // Validate file size
            if (avatar.size > maxFileSize) {
              throw new APIError('BAD_REQUEST', {
                message: `File size must be less than ${maxFileSize / (1024 * 1024)}MB`,
              })
            }

            // Create storage directory if it doesn't exist
            const fullStorageDir = path.join(process.cwd(), storageDir)
            try {
              await fs.access(fullStorageDir)
            }
            catch {
              await fs.mkdir(fullStorageDir, { recursive: true })
            }

            // Convert image to WebP and save
            const fileName = `${userId}.webp`
            const filePath = path.join(fullStorageDir, fileName)

            // Read the uploaded file buffer
            const buffer = Buffer.from(await avatar.arrayBuffer())

            // Process image with Sharp - resize and convert to WebP
            await sharp(buffer)
              .resize(imageSize.width, imageSize.height, {
                fit: 'cover',
                position: 'center',
              })
              .webp({
                quality: webpQuality,
                effort: 4,
              })
              .toFile(filePath)

            // Update user record with avatar URL (optional)
            try {
              await ctx.context.adapter.update({
                model: 'user',
                where: [
                  { field: 'id', operator: 'eq', value: userId },
                ],
                update: {
                  image: `/${storageDir}/${fileName}`,
                },
              })
            }
            catch (error) {
              console.warn('Could not update user avatar URL:', error)
            }

            return {
              success: true,
              message: 'Avatar uploaded successfully',
              avatarUrl: `/${storageDir}/${fileName}`,
              userId,
            }
          }
          catch (error) {
            console.error('Avatar upload error:', error)

            if (error instanceof APIError) {
              throw error
            }

            throw new APIError('INTERNAL_SERVER_ERROR', {
              message: 'Failed to upload avatar',
            })
          }
        },
      ),

      getAvatar: createAuthEndpoint(
        '/avatar/:userId',
        {
          method: 'GET',
          query: z.object({
            token: z.string().optional(),
          }),
          requireAuth: false, // We'll handle auth manually
        },
        async (ctx): Promise<any> => {
          console.log('Fetching avatar for user:', ctx.params.userId)
          try {
            const { userId } = ctx.params
            const { token } = ctx.query

            // Verify authentication - either via session or token
            let isAuthenticated = false

            if (ctx.context.session?.user?.id) {
              // Already authenticated via session
              isAuthenticated = true
            }
            else if (token) {
              try {
                const sessionData = await ctx.context.adapter.findOne<Session>({
                  model: 'session',
                  where: [
                    { field: 'token', operator: 'eq', value: token },

                  ],
                })
                if (sessionData) {
                  isAuthenticated = sessionData.expiresAt > new Date()
                }
              }
              catch (error) {
                console.warn('Token verification failed:', error)
              }
            }

            if (!isAuthenticated) {
              throw new APIError('UNAUTHORIZED', {
                message: 'Authentication required',
              })
            }

            const user = await ctx.context.adapter.findOne<User>({
              model: 'user',
              where: [
                { field: 'id', operator: 'eq', value: userId },
              ],
            })

            if (!user) {
              throw new APIError('NOT_FOUND', {
                message: 'User not found',
              })
            }

            try {
              const fileName = `${userId}.webp`
              const filePath = path.join(process.cwd(), storageDir, fileName)

              const avatarBuffer = await fs.readFile(filePath)

              return new Response(avatarBuffer, {
                headers: {
                  'Content-Type': 'image/webp',
                  'Content-Length': avatarBuffer.length.toString(),
                  'Cache-Control': 'public, max-age=3600',
                },
              })
            }
            catch {
              throw new APIError('NOT_FOUND', {
                message: 'Avatar not found',
              })
            }
          }
          catch (error) {
            if (error instanceof APIError) {
              throw error
            }
            throw new APIError('INTERNAL_SERVER_ERROR', {
              message: 'Failed to get avatar',
            })
          }
        },
      ),

      deleteAvatar: createAuthEndpoint(
        '/avatar/delete',
        {
          method: 'POST',
          requireAuth: true,
        },
        async (ctx): Promise<DeleteAvatarResponse> => {
          try {
            const session = ctx.context.session

            if (!session?.user?.id) {
              throw new APIError('UNAUTHORIZED', {
                message: 'User not authenticated',
              })
            }

            const userId = session.user.id
            const fileName = `${userId}.webp`
            const filePath = path.join(process.cwd(), storageDir, fileName)

            // Delete file if it exists
            try {
              await fs.unlink(filePath)

              // Update user record to remove avatar URL
              try {
                await ctx.context.adapter.update({
                  model: 'user',
                  where: [
                    { field: 'id', operator: 'eq', value: userId },
                  ],
                  update: {
                    image: null,
                  },
                })
              }
              catch (error) {
                console.warn('Could not update user avatar URL:', error)
              }

              return {
                success: true,
                message: 'Avatar deleted successfully',
                userId,
              }
            }
            catch {
              return {
                success: false,
                message: 'Avatar not found or already deleted',
                userId,
              }
            }
          }
          catch (error) {
            console.error('Delete avatar error:', error)

            if (error instanceof APIError) {
              throw error
            }

            throw new APIError('INTERNAL_SERVER_ERROR', {
              message: 'Failed to delete avatar',
            })
          }
        },
      ),
    },
  }
}

// Type exports for external use
export type {
  AvatarPluginOptions,
  DeleteAvatarResponse,
  GetAvatarResponse,
  UploadAvatarResponse,
}
