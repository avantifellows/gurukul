import { describe, expect, it } from 'vitest';
import { isLibraryRouteAllowed } from './libraryAccess';

const physicalCentre = { showContentLibrary: false, showClassLibrary: false, showLibraryTab: false };
const contentOnly = { showContentLibrary: true, showClassLibrary: false };

describe('isLibraryRouteAllowed', () => {
  it('blocks every library route for physical centres', () => {
    for (const path of ['/library', '/library/content', '/library/class']) {
      expect(isLibraryRouteAllowed(path, physicalCentre)).toBe(false);
    }
  });

  it('blocks the content library when only that flag is off', () => {
    const cfg = { showContentLibrary: false, showClassLibrary: true };
    expect(isLibraryRouteAllowed('/library/content', cfg)).toBe(false);
    expect(isLibraryRouteAllowed('/library/class', cfg)).toBe(true);
    expect(isLibraryRouteAllowed('/library', cfg)).toBe(true);
  });

  it('blocks everything when the library tab is hidden, even if content is on', () => {
    expect(isLibraryRouteAllowed('/library/content', { ...contentOnly, showLibraryTab: false })).toBe(false);
  });

  it('allows content but not class by default', () => {
    expect(isLibraryRouteAllowed('/library', contentOnly)).toBe(true);
    expect(isLibraryRouteAllowed('/library/content', contentOnly)).toBe(true);
    expect(isLibraryRouteAllowed('/library/class', contentOnly)).toBe(false);
  });
});
