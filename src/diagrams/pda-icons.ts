// PDA's own icons for components that have no official logo: bold two-tone marks
// (solid shapes plus a 24% tint) on the 24 px grid. They use currentColor, which
// iconG() swaps for the literal colour, so one string works in HTML and in SVG.
import { ICONS } from '../vendor/lucide-icons';

export var PDA_ICONS: Record<string, string> = {
  'pda-agent':
    '<circle cx="7" cy="7" r="5" fill="currentColor" stroke="none"/><circle cx="17" cy="17" r="5" fill="currentColor" stroke="none"/><path d="M12 2h5a5 5 0 015 5v5h-5a5 5 0 01-5-5z" fill="currentColor" fill-opacity=".24" stroke="none"/><path d="M12 12v5a5 5 0 01-5 5H2v-5a5 5 0 015-5z" fill="currentColor" fill-opacity=".24" stroke="none"/>',
  'pda-supervisor':
    '<rect x="2" y="2" width="20" height="9" rx="4.5" fill="currentColor" stroke="none"/><circle cx="7" cy="17.5" r="4.5" fill="currentColor" fill-opacity=".24" stroke="none"/><circle cx="17" cy="17.5" r="4.5" fill="currentColor" fill-opacity=".24" stroke="none"/><circle cx="12" cy="6.5" r="2.2" fill="currentColor" fill-opacity=".24" stroke="none"/>',
  'pda-planner':
    '<rect x="2" y="3" width="20" height="4.6" rx="2.3" fill="currentColor" stroke="none"/><rect x="2" y="9.7" width="14" height="4.6" rx="2.3" fill="currentColor" fill-opacity=".24" stroke="none"/><rect x="2" y="16.4" width="8" height="4.6" rx="2.3" fill="currentColor" stroke="none"/><circle cx="20" cy="12" r="2" fill="currentColor" stroke="none"/>',
  'pda-research':
    '<circle cx="10" cy="10" r="6.2" stroke="currentColor" stroke-width="3.6" fill="currentColor" fill-opacity=".24"/><path d="M15 15l6 6" stroke="currentColor" stroke-width="3.6" stroke-linecap="round"/><circle cx="10" cy="10" r="1.8" fill="currentColor" stroke="none"/>',
  'pda-coder':
    '<path d="M8.5 6.5L3 12l5.5 5.5" stroke="currentColor" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M15.5 6.5L21 12l-5.5 5.5" stroke="currentColor" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/><rect x="10.6" y="9.4" width="2.8" height="8" rx="1.4" transform="rotate(20 12 13)" fill="currentColor" fill-opacity=".24" stroke="none"/>',
  'pda-writer':
    '<rect x="3" y="2.5" width="14" height="19" rx="4.5" fill="currentColor" fill-opacity=".24" stroke="none"/><rect x="6.5" y="7" width="7" height="2.6" rx="1.3" fill="currentColor" stroke="none"/><rect x="6.5" y="12" width="4.5" height="2.6" rx="1.3" fill="currentColor" stroke="none"/><path d="M12.5 17.5l8-8" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>',
  'pda-critic':
    '<rect x="10.6" y="4.5" width="2.8" height="14" rx="1.4" fill="currentColor" stroke="none"/><rect x="6" y="18.6" width="12" height="2.8" rx="1.4" fill="currentColor" stroke="none"/><rect x="2.5" y="5.6" width="19" height="2.8" rx="1.4" fill="currentColor" stroke="none"/><path d="M4.6 8.4L2 14.6M4.6 8.4L7.2 14.6M19.4 8.4L16.8 14.6M19.4 8.4L22 14.6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M1.6 14.6h6a3 3 0 01-6 0zM16.4 14.6h6a3 3 0 01-6 0z" fill="currentColor" fill-opacity=".24" stroke="none"/>',
  'pda-router':
    '<circle cx="5.5" cy="12" r="4.2" fill="currentColor" fill-opacity=".24" stroke="none"/><circle cx="5.5" cy="12" r="1.9" fill="currentColor" stroke="none"/><path d="M9.8 12h3c3 0 3-6 6-6M9.8 12h9M9.8 12h3c3 0 3 6 6 6" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" fill="none"/><circle cx="20.2" cy="6" r="1.9" fill="currentColor" stroke="none"/><circle cx="20.2" cy="12" r="1.9" fill="currentColor" stroke="none"/><circle cx="20.2" cy="18" r="1.9" fill="currentColor" stroke="none"/>',
  'pda-handoff':
    '<rect x="9" y="4" width="13" height="16" rx="4.5" fill="currentColor" fill-opacity=".24" stroke="none"/><rect x="2" y="4" width="13" height="16" rx="4.5" fill="currentColor" stroke="none"/><path d="M6.4 8.8l5 3.2-5 3.2z" fill="currentColor" fill-opacity=".24" stroke="none"/>',
  'pda-human':
    '<circle cx="11" cy="7.5" r="4.5" fill="currentColor" stroke="none"/><path d="M2 21a9 9 0 0118 0z" fill="currentColor" fill-opacity=".24" stroke="none"/><circle cx="19" cy="17.5" r="4" stroke="currentColor" stroke-width="2.6" fill="none"/><path d="M17.3 17.6l1.4 1.4 2.4-2.6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
  'pda-tool':
    '<circle cx="12" cy="12" r="6.2" stroke="currentColor" stroke-width="3.6" fill="currentColor" fill-opacity=".24"/><rect x="10.4" y="1.5" width="3.2" height="4" rx="1.4" fill="currentColor" stroke="none"/><rect x="10.4" y="18.5" width="3.2" height="4" rx="1.4" fill="currentColor" stroke="none"/><rect x="1.5" y="10.4" width="4" height="3.2" rx="1.4" fill="currentColor" stroke="none"/><rect x="18.5" y="10.4" width="4" height="3.2" rx="1.4" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.8" fill="currentColor" stroke="none"/>',
  'pda-mcp':
    '<rect x="7" y="1.8" width="3" height="6.5" rx="1.5" fill="currentColor" stroke="none"/><rect x="14" y="1.8" width="3" height="6.5" rx="1.5" fill="currentColor" stroke="none"/><rect x="3" y="7" width="18" height="10.5" rx="5.2" fill="currentColor" stroke="none"/><circle cx="8.6" cy="12.2" r="1.8" fill="currentColor" fill-opacity=".24" stroke="none"/><circle cx="15.4" cy="12.2" r="1.8" fill="currentColor" fill-opacity=".24" stroke="none"/><rect x="10.5" y="16" width="3" height="6.2" rx="1.5" fill="currentColor" stroke="none"/>',
  'pda-sandbox':
    '<rect x="2.5" y="2.5" width="19" height="19" rx="5.5" stroke="currentColor" stroke-width="3" stroke-dasharray="4.2 3.4" fill="none"/><rect x="8" y="8" width="8" height="8" rx="2.6" fill="currentColor" fill-opacity=".24" stroke="none"/><circle cx="12" cy="12" r="1.7" fill="currentColor" stroke="none"/>',
  'pda-browser':
    '<rect x="2.5" y="3.5" width="19" height="17" rx="4.5" fill="currentColor" fill-opacity=".24" stroke="none"/><path d="M2.5 8a4.5 4.5 0 014.5-4.5h10A4.5 4.5 0 0121.5 8v1.8h-19z" fill="currentColor" stroke="none"/><circle cx="6.2" cy="6.7" r=".9" fill="currentColor" fill-opacity=".24" stroke="none"/><circle cx="9" cy="6.7" r=".9" fill="currentColor" fill-opacity=".24" stroke="none"/><path d="M12.5 11.5l8 3.6-3.3 1.1-1.1 3.4z" fill="currentColor" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/>',
  'pda-chat':
    '<path d="M8 3h8a6 6 0 016 6v2a6 6 0 01-6 6h-3.5L7 21.5V17A6 6 0 012 11V9a6 6 0 016-6z" fill="currentColor" stroke="none"/><circle cx="8" cy="10" r="1.6" fill="currentColor" fill-opacity=".24" stroke="none"/><circle cx="12" cy="10" r="1.6" fill="currentColor" fill-opacity=".24" stroke="none"/><circle cx="16" cy="10" r="1.6" fill="currentColor" fill-opacity=".24" stroke="none"/>',
};

export function install(): void {
  Object.assign(ICONS, PDA_ICONS);
}
