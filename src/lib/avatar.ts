/**
 * Deterministic avatar gradient per user, based on user ID.
 * Uses pz-* category accent tokens as specified in spec §25.9.
 * New users are assigned round-robin from the palette.
 */

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg, #6030FF, #4F46E5)',   // violet
  'linear-gradient(135deg, #A855F7, #E12AFB)',   // fuchsia
  'linear-gradient(135deg, #49BBFF, #0EA5E9)',   // sky
  'linear-gradient(135deg, #F59E0B, #D97706)',   // amber
  'linear-gradient(135deg, #00B894, #059669)',   // emerald
]

/** Simple djb2-style hash — fast, no crypto needed. */
function hashString(s: string): number {
  let h = 5381
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h) ^ s.charCodeAt(i)
    h = h >>> 0 // keep unsigned 32-bit
  }
  return h
}

export function getAvatarGradient(userId: string): string {
  return AVATAR_GRADIENTS[hashString(userId) % AVATAR_GRADIENTS.length]
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}
