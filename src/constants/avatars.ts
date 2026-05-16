/**
 * Canonical list of available avatars.
 * This is the single source of truth for the application.
 */
export const AVAILABLE_AVATARS = [
  '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼',
] as const;

export type Avatar = typeof AVAILABLE_AVATARS[number];

/** Optional: Helper for validation */
export const isValidAvatar = (value: string): value is Avatar => {
  return AVAILABLE_AVATARS.includes(value as Avatar);
};

/** Optional: Default avatar */
export const DEFAULT_AVATAR: Avatar = AVAILABLE_AVATARS[0];
