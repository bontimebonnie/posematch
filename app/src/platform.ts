// Phones and tablets save to the photo album through the share sheet;
// desktops download straight to the Downloads folder. Pure so it can be
// unit tested with a fake navigator.
export function isMobile(nav: Pick<Navigator, 'userAgent' | 'maxTouchPoints'> = navigator): boolean {
  if (/Android|iPhone|iPad|iPod/i.test(nav.userAgent)) return true
  // iPadOS reports itself as a Mac but has a touch screen.
  return /Macintosh/.test(nav.userAgent) && nav.maxTouchPoints > 1
}
