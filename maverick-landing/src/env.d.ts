/// <reference types="astro/client" />

declare module 'lucide-astro' {
    import type { AstroComponentFactory } from 'astro/runtime/server/index.js';

    interface Props extends astroHTML.JSX.SVGAttributes {
        size?: number;
    }

    export const Rocket: AstroComponentFactory;
    export const Github: AstroComponentFactory;
    export const ChevronRight: AstroComponentFactory;
    export const Terminal: AstroComponentFactory;
    export const Shield: AstroComponentFactory;
    export const Zap: AstroComponentFactory;
    export const Code: AstroComponentFactory;
    export const Database: AstroComponentFactory;
    export const Lock: AstroComponentFactory;
    export const Eye: AstroComponentFactory;
    export const ArrowRight: AstroComponentFactory;
    export const Check: AstroComponentFactory;
    export const X: AstroComponentFactory;
    export const Star: AstroComponentFactory;
    export const Globe: AstroComponentFactory;
    export const Cpu: AstroComponentFactory;
    export const Server: AstroComponentFactory;
    export const GitBranch: AstroComponentFactory;
    export const Play: AstroComponentFactory;
    export const Copy: AstroComponentFactory;
    export const Download: AstroComponentFactory;
    export const ExternalLink: AstroComponentFactory;
    // Add more icons as needed
}
