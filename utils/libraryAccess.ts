import { GroupConfig } from '@/app/types';

type LibraryFlags = Pick<GroupConfig, 'showContentLibrary' | 'showClassLibrary' | 'showLibraryTab'>;

/**
 * Whether a program may open a given /library route. Hiding the Library tab is
 * not enough on its own: links, bookmarks and browser history still reach these
 * pages, so the routes themselves have to check the same flags.
 */
export function isLibraryRouteAllowed(pathname: string, config: LibraryFlags): boolean {
  const content = config.showContentLibrary !== false;
  const classes = config.showClassLibrary === true;

  if (config.showLibraryTab === false) return false;
  if (pathname.startsWith('/library/content')) return content;
  if (pathname.startsWith('/library/class')) return classes;
  // The library landing page lists content and class courses; it is only
  // useful if at least one of them is on.
  return content || classes;
}
