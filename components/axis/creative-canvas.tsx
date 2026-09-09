'use client';

import dynamic from 'next/dynamic';
import { useCallback, useState } from 'react';
import type { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types';

if (typeof window !== 'undefined') {
  (window as Window & { EXCALIDRAW_ASSET_PATH?: string }).EXCALIDRAW_ASSET_PATH = '/';
}

const Excalidraw = dynamic(() => import('@excalidraw/excalidraw').then((module) => module.Excalidraw), { ssr: false });
type CanvasMode = 'creative' | 'moodboard' | 'storyboard';

const creativeSkeleton = [
  { type: 'text' as const, x: 80, y: 60, text: 'NARA STANDARD', fontSize: 34, strokeColor: '#11110f' },
  { type: 'rectangle' as const, x: 80, y: 132, width: 250, height: 128, backgroundColor: '#f0d9d5', strokeColor: '#d33b2f', label: { text: 'INSIGHT\nThe distinction is already cut into the product.', fontSize: 18 } },
  { type: 'rectangle' as const, x: 410, y: 132, width: 280, height: 128, backgroundColor: '#e7e6e0', strokeColor: '#11110f', label: { text: 'EVIDENCE\nFull-length product brief\n4 comparison sets cluster around crop', fontSize: 17 } },
  { type: 'arrow' as const, x: 330, y: 196, width: 80, height: 0, strokeColor: '#d33b2f', endArrowhead: 'arrow' as const },
  { type: 'rectangle' as const, x: 245, y: 348, width: 300, height: 150, backgroundColor: '#11110f', strokeColor: '#11110f', label: { text: 'BIG IDEA\nKEEP THE LENGTH', fontSize: 25, strokeColor: '#f2f1ed' } },
  { type: 'arrow' as const, x: 392, y: 260, width: 0, height: 88, strokeColor: '#d33b2f', endArrowhead: 'arrow' as const },
  { type: 'rectangle' as const, x: 80, y: 590, width: 205, height: 112, backgroundColor: '#d9d8d2', strokeColor: '#11110f', label: { text: 'ART DIRECTION\nVertical space\nDirect flash\nMeasured red line', fontSize: 16 } },
  { type: 'rectangle' as const, x: 330, y: 590, width: 205, height: 112, backgroundColor: '#d9d8d2', strokeColor: '#11110f', label: { text: 'STORYBOARD\nRoom → silhouette → detail', fontSize: 16 } },
  { type: 'rectangle' as const, x: 580, y: 590, width: 205, height: 112, backgroundColor: '#d9d8d2', strokeColor: '#11110f', label: { text: 'EXECUTIONS\nPortrait film\nPoster diptych\nRetail sheet', fontSize: 16 } },
];
const moodboardSkeleton = [
  { type: 'text' as const, x: 70, y: 50, text: 'MOODBOARD / VERTICAL SPACE', fontSize: 32, strokeColor: '#11110f' },
  { type: 'rectangle' as const, x: 70, y: 130, width: 230, height: 280, backgroundColor: '#c8c7c1', strokeColor: '#11110f', label: { text: 'COMPOSITION\nTall civic interiors\nUnbroken floor and ceiling', fontSize: 18 } },
  { type: 'rectangle' as const, x: 330, y: 130, width: 230, height: 135, backgroundColor: '#11110f', strokeColor: '#11110f', label: { text: 'CONTRAST\nDirect flash\nSoft ambient room', fontSize: 17, strokeColor: '#f2f1ed' } },
  { type: 'rectangle' as const, x: 330, y: 275, width: 230, height: 135, backgroundColor: '#d33b2f', strokeColor: '#d33b2f', label: { text: 'DEVICE\nOne measured red line', fontSize: 17, strokeColor: '#ffffff' } },
  { type: 'rectangle' as const, x: 590, y: 130, width: 230, height: 280, backgroundColor: '#e4e2dc', strokeColor: '#11110f', label: { text: 'MATERIAL\nHeavy cotton\nConcrete\nAluminium\nUncoated paper', fontSize: 18 } },
  { type: 'rectangle' as const, x: 70, y: 480, width: 750, height: 120, backgroundColor: '#f0d9d5', strokeColor: '#d33b2f', label: { text: 'ART DIRECTION PRINCIPLE\nThe image makes the garment feel long before the viewer reads a word.', fontSize: 22 } },
  { type: 'text' as const, x: 70, y: 650, text: 'NOT THIS / alpine performance / decorative smoke / cropped hems', fontSize: 18, strokeColor: '#d33b2f' },
];
const storyboardSkeleton = [
  { type: 'text' as const, x: 70, y: 45, text: 'STORYBOARD / KEEP THE LENGTH', fontSize: 32, strokeColor: '#11110f' },
  { type: 'rectangle' as const, x: 70, y: 120, width: 250, height: 220, backgroundColor: '#deddd7', strokeColor: '#11110f', label: { text: '00:00–00:03\nEmpty vertical room\nA red line crosses the wall', fontSize: 18 } },
  { type: 'rectangle' as const, x: 350, y: 120, width: 250, height: 220, backgroundColor: '#f0d9d5', strokeColor: '#d33b2f', label: { text: '00:03–00:07\nFull silhouette reaches\nthe measurement line', fontSize: 18 } },
  { type: 'rectangle' as const, x: 630, y: 120, width: 250, height: 220, backgroundColor: '#11110f', strokeColor: '#11110f', label: { text: '00:07–00:12\nMaterial details\nin a vertical triptych', fontSize: 18, strokeColor: '#f2f1ed' } },
  { type: 'arrow' as const, x: 320, y: 230, width: 30, height: 0, strokeColor: '#d33b2f', endArrowhead: 'arrow' as const },
  { type: 'arrow' as const, x: 600, y: 230, width: 30, height: 0, strokeColor: '#d33b2f', endArrowhead: 'arrow' as const },
  { type: 'text' as const, x: 70, y: 395, text: 'PURPOSE / establish scale → reveal product truth → prove construction', fontSize: 19, strokeColor: '#11110f' },
  { type: 'text' as const, x: 70, y: 445, text: 'AUDIO / room tone → low pulse → closure click', fontSize: 17, strokeColor: '#74736d' },
];
const skeletons = { creative: creativeSkeleton, moodboard: moodboardSkeleton, storyboard: storyboardSkeleton };

export function CreativeCanvas({ projectId }: { projectId: string }) {
  const [api, setApi] = useState<ExcalidrawImperativeAPI | null>(null);
  const [mode, setMode] = useState<CanvasMode>('creative');
  const [message, setMessage] = useState('Editable board. Move, resize or annotate any element.');
  const [initialData] = useState(() => import('@excalidraw/excalidraw').then(({ convertToExcalidrawElements }) => ({ elements: convertToExcalidrawElements(creativeSkeleton), appState: { viewBackgroundColor: '#f2f1ed', currentItemStrokeColor: '#11110f' }, scrollToContent: true })));

  const switchMode = useCallback(async (next: CanvasMode) => {
    setMode(next);
    if (!api) return;
    const { convertToExcalidrawElements } = await import('@excalidraw/excalidraw');
    api.updateScene({ elements: convertToExcalidrawElements(skeletons[next]) });
    api.scrollToContent(api.getSceneElements(), { fitToContent: true });
    setMessage(`${next === 'creative' ? 'Creative board' : next} loaded. Every element remains editable.`);
  }, [api]);

  const download = useCallback(async (format: 'png' | 'svg' | 'excalidraw') => {
    if (!api) return;
    const elements = api.getSceneElements();
    const appState = api.getAppState();
    const files = api.getFiles();
    const library = await import('@excalidraw/excalidraw');
    let blob: Blob;
    if (format === 'png') blob = await library.exportToBlob({ elements, appState: { ...appState, exportBackground: true }, files, mimeType: 'image/png' });
    else if (format === 'svg') {
      const svg = await library.exportToSvg({ elements, appState: { ...appState, exportBackground: true }, files });
      blob = new Blob([svg.outerHTML], { type: 'image/svg+xml' });
    } else blob = new Blob([library.serializeAsJSON(elements, appState, files, 'local')], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `axis-${mode}.${format === 'excalidraw' ? 'excalidraw' : format}`;
    anchor.click();
    URL.revokeObjectURL(url);
    setMessage(`${format.toUpperCase()} exported.`);
  }, [api, mode]);

  const saveToProject = useCallback(async () => {
    if (!api) return;
    if (projectId.startsWith('demo-')) return setMessage('Demo boards are not stored. Export this board or create a real project.');
    const library = await import('@excalidraw/excalidraw');
    const scene = library.serializeAsJSON(api.getSceneElements(), api.getAppState(), api.getFiles(), 'local');
    const response = await fetch(`/api/projects/${projectId}/canvas`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: `Axis ${mode}`, kind: mode === 'creative' ? 'CREATIVE_BOARD' : mode === 'moodboard' ? 'MOODBOARD' : 'STORYBOARD', scene }),
    });
    setMessage(response.ok ? 'Board saved to this project.' : 'The board could not be saved. Export a local copy before leaving.');
  }, [api, mode, projectId]);

  return <section className="canvas-panel">
    <header className="canvas-toolbar">
      <div className="canvas-modes" aria-label="Canvas type">{(['creative', 'moodboard', 'storyboard'] as CanvasMode[]).map((item) => <button className={mode === item ? 'is-active' : ''} key={item} onClick={() => void switchMode(item)} type="button">{item === 'creative' ? 'Creative board' : item}</button>)}</div>
      <div className="canvas-actions"><button onClick={() => void saveToProject()} type="button">Save to project</button><button onClick={() => void download('png')} type="button">Export PNG</button><button onClick={() => void download('svg')} type="button">Export SVG</button><button onClick={() => void download('excalidraw')} type="button">Save .excalidraw</button></div>
    </header>
    <p className="canvas-status" aria-live="polite">{message}</p>
    <div className="canvas-stage"><Excalidraw excalidrawAPI={setApi} initialData={initialData} name="Axis creative board" theme="light" UIOptions={{ canvasActions: { loadScene: true, saveToActiveFile: true, export: { saveFileToDisk: true } } }} /></div>
  </section>;
}
