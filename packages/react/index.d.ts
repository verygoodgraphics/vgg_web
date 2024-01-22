import { EventType } from '@verygoodgraphics/vgg-wasm';
import { JSX as JSX_2 } from 'react/jsx-runtime';
import { MutableRefObject } from 'react';
import { RefObject } from 'react';
import { State } from '@verygoodgraphics/vgg-wasm';
import { VGG } from '@verygoodgraphics/vgg-wasm';
import { VGGEvent } from '@verygoodgraphics/vgg-wasm';
import { VGGProps as VGGProps_2 } from '@verygoodgraphics/vgg-wasm';

export { EventType }

export { State }

export declare function useVGG(options: VGGOptions): {
    canvasRef: RefObject<HTMLCanvasElement>;
    vgg: MutableRefObject<VGG<string> | null>;
    isLoading: boolean;
    state: State;
};

export declare interface VGGOptions extends Omit<VGGProps_2, "canvas"> {
}

export declare interface VGGProps<T extends string> extends Omit<VGGProps_2, "canvas" | "onLoad" | "onLoadError" | "onStateChange"> {
    canvasStyle?: React.CSSProperties;
    onLoad?: (event: VGGEvent, instance: VGG<T>) => Promise<void>;
    onLoadError?: (event: VGGEvent) => Promise<void>;
    onStateChange?: (event: VGGEvent, instance: VGG<T>) => Promise<void>;
    onSelect?: (event: VGGEvent) => Promise<void>;
}

export declare function VGGRender<T extends string>(props: VGGProps<T>): JSX_2.Element;

export { }
