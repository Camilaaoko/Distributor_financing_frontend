const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** Returns a URL for an asset stored in the application's public directory. */
export function assetPath(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${basePath}${normalizedPath}`;
}
