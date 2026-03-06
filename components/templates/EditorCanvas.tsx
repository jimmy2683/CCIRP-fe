"use client";

import React, { useState } from 'react';
import {
    DndContext,
    DragOverlay,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
    DragStartEvent,
    useDroppable,
    rectIntersection
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy
} from '@dnd-kit/sortable';
import {
    Type, Image as ImageIcon, MousePointerClick, Minus, X, Layout, Code, Star, Grid,
    Columns, Send, Component, Layers, ZoomIn, ZoomOut, Maximize, GripVertical, Settings2, Database, Copy, Check, Sparkles
} from 'lucide-react';
import { DraggableBlock, BlockDef } from './DraggableBlock';
import { SortableBlock, CanvasBlock } from './SortableBlock';

const AVAILABLE_BLOCKS: BlockDef[] = [
    { type: 'text', label: 'Simple Text', icon: Type },
    { type: 'image', label: 'Image Frame', icon: ImageIcon },
    { type: 'button', label: 'Action Button', icon: MousePointerClick },
    { type: 'divider', label: 'Spacer', icon: Minus },
    { type: 'html', label: 'Embed HTML', icon: Code },
    { type: 'hero', label: 'Hero Poster', icon: Star },
    { type: 'features', label: 'Feature Grid', icon: Grid },
    { type: 'columns', label: 'Two Columns', icon: Columns },
    { type: 'newsletter', label: 'Blog Header', icon: Send },
];

interface EditorCanvasProps {
    initialBlocks?: CanvasBlock[];
    onSave?: (blocks: CanvasBlock[], html: string) => void;
    onChange?: (html: string, blocks: CanvasBlock[]) => void;
    isPreview?: boolean;
    availableFields?: any[];
}

export function EditorCanvas({ initialBlocks, onSave, onChange, isPreview = false, availableFields = [] }: EditorCanvasProps) {
    const defaultBlocks: CanvasBlock[] = [
        {
            id: '1',
            type: 'hero',
            content: {
                title: 'Design Without Limits',
                subtitle: 'Create stunning, responsive communication templates with our premium visual engine. Built for teams that demand excellence.',
                backgroundColor: 'var(--primary)',
                width: '100%',
                height: 'auto'
            }
        },
        {
            id: '2',
            type: 'features',
            content: {
                width: '100%',
                height: 'auto',
                features: [
                    { title: 'Visual Precision', desc: 'Drag, drop, and refine every pixel of your message.' },
                    { title: 'Smart Variables', desc: 'Dynamic data binding for personalized outreach.' },
                    { title: 'Global CDN', desc: 'Instant delivery across all major email clients.' }
                ]
            }
        },
    ];

    const [blocks, setBlocks] = useState<CanvasBlock[]>(
        initialBlocks !== undefined ? initialBlocks : defaultBlocks
    );

    const { setNodeRef: setCanvasRef } = useDroppable({
        id: 'canvas-droppable',
    });

    const [activeId, setActiveId] = useState<string | null>(null);
    const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
    const [leftSidebarTab, setLeftSidebarTab] = useState<'components' | 'layers' | 'data'>('components');
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);

    // Sync changes to parent
    const notifyChange = (newBlocks: CanvasBlock[]) => {
        if (onChange) {
            const html = serializeBlocksToHtml(newBlocks);
            onChange(html, newBlocks);
        }
    };

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5, // Prevents immediate drag, allowing clicks to register
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // FIX 1: Click to add handler for empty canvas support
    const handleAddBlock = (type: string) => {
        if (isPreview) return;
        const newBlock: CanvasBlock = {
            id: `block-${Date.now()}`,
            type: type as any,
            content: {
                ...getDefaultContent(type),
                width: '100%',
                height: 'auto'
            }
        };
        const nextBlocks = [...blocks, newBlock];
        setBlocks(nextBlocks);
        notifyChange(nextBlocks);
        setSelectedBlockId(newBlock.id);
    };

    const handleDragStart = (event: DragStartEvent) => {
        if (isPreview) return;
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        if (isPreview) return;
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        const overId = over.id;
        const overIndex = blocks.findIndex((b) => b.id === overId);

        // Handle new block dragged from sidebar
        if (active.data.current?.isNew) {
            const newBlock: CanvasBlock = {
                id: `block-${Date.now()}`,
                type: active.data.current.type,
                content: {
                    ...getDefaultContent(active.data.current.type),
                    width: '100%',
                    height: 'auto'
                }
            };

            const nextBlocks = [...blocks];
            // Fix: If dropping on an existing block, insert at that index
            // If dropping on the canvas itself (empty state), push to end
            if (overIndex >= 0) {
                nextBlocks.splice(overIndex, 0, newBlock);
            } else {
                nextBlocks.push(newBlock);
            }

            setBlocks(nextBlocks);
            notifyChange(nextBlocks);
            setSelectedBlockId(newBlock.id);
            return;
        }

        // Handle reordering existing blocks
        if (active.id !== over.id) {
            const oldIndex = blocks.findIndex((item) => item.id === active.id);

            // Fix: Fallback for dropping on canvas background instead of over an item
            if (overId === 'canvas-droppable') {
                const nextBlocks = [...blocks];
                const [movedBlock] = nextBlocks.splice(oldIndex, 1);
                nextBlocks.push(movedBlock);
                setBlocks(nextBlocks);
                notifyChange(nextBlocks);
            } else if (overIndex >= 0) {
                const nextBlocks = arrayMove(blocks, oldIndex, overIndex);
                setBlocks(nextBlocks);
                notifyChange(nextBlocks);
            }
        }
    };

    const handleDelete = (id: string) => {
        if (isPreview) return;
        const nextBlocks = blocks.filter((b) => b.id !== id);
        setBlocks(nextBlocks);
        notifyChange(nextBlocks);
        if (selectedBlockId === id) setSelectedBlockId(null);
    };

    const updateSelectedBlock = (updates: any) => {
        if (!selectedBlockId || isPreview) return;
        const nextBlocks = blocks.map((b) =>
            b.id === selectedBlockId ? { ...b, content: { ...b.content, ...updates } } : b
        );
        setBlocks(nextBlocks);
        notifyChange(nextBlocks);
    };

    const selectedBlock = blocks.find((b) => b.id === selectedBlockId);

    const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 2));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.5));
    const handleResetZoom = () => {
        setZoom(1);
        setPan({ x: 0, y: 0 });
    };

    const handleWheel = (e: React.WheelEvent) => {
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -0.1 : 0.1;
            setZoom(prev => Math.min(Math.max(prev + delta, 0.5), 2));
        }
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.button === 1 || (e.button === 0 && e.altKey)) {
            setIsPanning(true);
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isPanning) {
            setPan(prev => ({
                x: prev.x + e.movementX,
                y: prev.y + e.movementY
            }));
        }
    };

    const handleMouseUp = () => setIsPanning(false);

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={rectIntersection}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div
                className="flex h-screen bg-background overflow-hidden select-none"
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >

                {/* Left Sidebar - Building Blocks & Layers */}
                {!isPreview && (
                    <div className="w-72 bg-card/90 backdrop-blur-xl border-r border-border flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.5)] z-30 animate-slide-up">
                        {/* Tab Switcher */}
                        <div className="flex border-b border-border">
                            <button
                                onClick={() => setLeftSidebarTab('components')}
                                className={`cursor-pointer flex-1 flex items-center justify-center gap-2 py-3 text-[11px] font-black uppercase tracking-widest transition-all ${leftSidebarTab === 'components' ? 'text-primary border-b-2 border-primary bg-primary/10' : 'text-muted-foreground hover:bg-accent/50'}`}
                            >
                                <Component className="w-3.5 h-3.5" />
                                Assets
                            </button>
                            <button
                                onClick={() => setLeftSidebarTab('layers')}
                                className={`cursor-pointer flex-1 flex items-center justify-center gap-2 py-3 text-[11px] font-black uppercase tracking-widest transition-all ${leftSidebarTab === 'layers' ? 'text-primary border-b-2 border-primary bg-primary/10' : 'text-muted-foreground hover:bg-accent/50'}`}
                            >
                                <Layers className="w-3.5 h-3.5" />
                                Layers
                            </button>
                            <button
                                onClick={() => setLeftSidebarTab('data')}
                                className={`cursor-pointer flex-1 flex items-center justify-center gap-2 py-3 text-[11px] font-black uppercase tracking-widest transition-all ${leftSidebarTab === 'data' ? 'text-primary border-b-2 border-primary bg-primary/10' : 'text-muted-foreground hover:bg-accent/50'}`}
                            >
                                <Database className="w-3.5 h-3.5" />
                                Data
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 flex flex-col gap-4">
                            {leftSidebarTab === 'components' && (
                                <>
                                    <div className="space-y-1 mb-2">
                                        <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] px-2">Design Blocks</h3>
                                        <p className="text-[9px] text-muted-foreground/60 px-2 leading-tight">Drag elements onto the boundless canvas</p>
                                    </div>
                                    <div className="flex flex-col gap-2.5">
                                        {AVAILABLE_BLOCKS.map((block) => (
                                            <div
                                                key={block.type}
                                                onClick={() => handleAddBlock(block.type)}
                                                className="cursor-pointer"
                                            >
                                                <DraggableBlock block={block} />
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}

                            {leftSidebarTab === 'layers' && (
                                <div className="flex flex-col gap-1">
                                    <div className="space-y-1 mb-2">
                                        <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] px-2">Object Tree ({blocks.length})</h3>
                                        <p className="text-[9px] text-muted-foreground/60 px-2 leading-tight">Rearrange your design hierarchy</p>
                                    </div>
                                    <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
                                        {blocks.map((block) => (
                                            <div
                                                key={block.id}
                                                onClick={() => setSelectedBlockId(block.id)}
                                                className={`group flex items-center gap-3 p-2 rounded-xl transition-all cursor-pointer ${selectedBlockId === block.id ? 'bg-primary/10 text-primary ring-1 ring-primary/20' : 'hover:bg-accent/50 text-muted-foreground hover:text-foreground'}`}
                                            >
                                                <div className={`p-1.5 rounded-lg ${selectedBlockId === block.id ? 'bg-primary/20' : 'bg-muted group-hover:bg-accent/50 shadow-sm'}`}>
                                                    {React.createElement(AVAILABLE_BLOCKS.find(b => b.type === block.type)?.icon || Type, {
                                                        className: "w-3.5 h-3.5"
                                                    })}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[11px] font-bold truncate capitalize">{block.type}</p>
                                                    <p className="text-[9px] opacity-50 truncate">ID: {block.id.split('-')[1] || block.id}</p>
                                                </div>
                                                <GripVertical className="w-3.5 h-3.5 opacity-0 group-hover:opacity-30 cursor-grab" />
                                            </div>
                                        ))}
                                    </SortableContext>
                                </div>
                            )}

                            {leftSidebarTab === 'data' && (
                                <div className="flex flex-col gap-4">
                                    {/* Data Tab Content Remaining Unchanged */}
                                    <div className="space-y-1 mb-2">
                                        <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] px-2">Merge Fields</h3>
                                        <p className="text-[9px] text-muted-foreground/60 px-2 leading-tight">Dynamic values available in this context</p>
                                    </div>
                                    <div className="space-y-2">
                                        {availableFields.map((field) => (
                                            <div key={field.key} className="group p-3 bg-muted border border-border rounded-xl hover:border-primary/30 transition-all">
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className="text-[10px] font-black text-foreground uppercase tracking-tight">{field.label}</span>
                                                    <code className="text-[9px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-md font-mono">{"{{" + field.key + "}}"}</code>
                                                </div>
                                                <p className="text-[9px] text-muted-foreground leading-relaxed mb-2">{field.description}</p>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[8px] font-bold text-muted-foreground/60 uppercase">Example: {field.example}</span>
                                                    <button onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText("{{" + field.key + "}}"); }} className="p-1 hover:bg-accent/50 rounded-md transition-all text-muted-foreground hover:text-foreground">
                                                        <Copy className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Center Canvas */}
                <div
                    ref={setCanvasRef}
                    className={`flex-1 overflow-auto bg-background/50 relative transition-colors duration-300 ${isPanning ? 'cursor-grabbing' : 'cursor-default'}`}
                    onClick={() => setSelectedBlockId(null)}
                >
                    <div
                        className="min-h-full flex flex-col items-center justify-start py-32 transform-gpu transition-transform duration-200 ease-out origin-center"
                        style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
                    >
                        <div className={`w-full max-w-3xl min-h-[1200px] flex flex-col gap-12 transition-all duration-500 ${isPreview ? 'max-w-4xl' : ''}`}>
                            <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
                                {blocks.length === 0 ? (
                                    <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground space-y-4 pt-40">
                                        <div className="p-8 rounded-[2.5rem] bg-card border border-border shadow-2xl animate-pulse">
                                            <Layout className="w-12 h-12 text-primary" />
                                        </div>
                                        <p className="font-black text-xs uppercase tracking-[0.3em] opacity-40">Drop or Click items to start</p>
                                    </div>
                                ) : (
                                    blocks.map((block) => (
                                        <SortableBlock
                                            key={block.id}
                                            block={block}
                                            isSelected={!isPreview && selectedBlockId === block.id}
                                            onSelect={isPreview ? () => { } : setSelectedBlockId}
                                            onDelete={handleDelete}
                                            // FIX 3: Pass down an updater so SortableBlock can drag-resize itself
                                            onUpdate={(updates: any) => {
                                                const nextBlocks = blocks.map((b) => b.id === block.id ? { ...b, content: { ...b.content, ...updates } } : b);
                                                setBlocks(nextBlocks);
                                                notifyChange(nextBlocks);
                                            }}
                                        />
                                    ))
                                )}
                            </SortableContext>
                        </div>
                    </div>

                    {/* Design Controls Overlay */}
                    {!isPreview && (
                        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 p-2 bg-card/80 backdrop-blur-xl border border-border shadow-2xl rounded-2xl z-[40]">
                            <button onClick={handleZoomOut} className="cursor-pointer p-2 hover:bg-accent/50 rounded-xl transition-all text-muted-foreground hover:text-foreground">
                                <ZoomOut className="w-4 h-4" />
                            </button>
                            <button onClick={handleResetZoom} className="cursor-pointer px-4 py-2 hover:bg-accent/50 rounded-xl transition-all text-[11px] font-black flex items-center gap-2 group">
                                <span className="text-muted-foreground group-hover:text-foreground">{Math.round(zoom * 100)}%</span>
                                <Maximize className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground" />
                            </button>
                            <button onClick={handleZoomIn} className="cursor-pointer p-2 hover:bg-accent/50 rounded-xl transition-all text-muted-foreground hover:text-foreground">
                                <ZoomIn className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Right Sidebar - Properties */}
                {!isPreview && (
                    <div className="w-80 bg-card/90 backdrop-blur-xl border-l border-border overflow-y-auto shadow-[-4px_0_24px_rgba(0,0,0,0.5)] z-30 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                        {selectedBlock ? (
                            <>
                                <div className="p-5 border-b border-border flex justify-between items-center bg-accent/20">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-primary/10 rounded-xl">
                                            <Settings2 className="w-4 h-4 text-primary" />
                                        </div>
                                        <div>
                                            <h2 className="text-[10px] font-black text-foreground capitalize leading-none uppercase tracking-widest">{selectedBlock.type}</h2>
                                            <p className="text-[9px] font-bold text-muted-foreground tracking-tight mt-1">Properties</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setSelectedBlockId(null)} className="cursor-pointer p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-lg transition-all">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="p-6 custom-scrollbar">
                                    <PropertiesPanel block={selectedBlock} onChange={updateSelectedBlock} />
                                </div>
                            </>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-accent/30">
                                <div className="p-6 rounded-[2rem] bg-card shadow-xl border border-border mb-6 group transition-all hover:scale-110">
                                    <Star className="w-8 h-8 text-primary/20 group-hover:text-primary transition-colors" />
                                </div>
                                <p className="text-[10px] font-black text-foreground uppercase tracking-widest leading-relaxed">Select an element<br />to edit style</p>
                                <p className="mt-2 text-[9px] text-muted-foreground font-bold">Every detail matters.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <DragOverlay>
                {activeId ? (
                    <div className="p-3 bg-card border border-primary rounded-lg shadow-xl ring-2 ring-primary opacity-80 flex items-center gap-2">
                        Dragging Item...
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}

// FIX 2: Universal Dimensions Panel in Properties
function PropertiesPanel({ block, onChange }: { block: CanvasBlock, onChange: (updates: any) => void }) {
    const inputClasses = "w-full text-[11px] bg-muted border border-border text-foreground rounded-lg shadow-sm focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/50 p-2";
    const labelClasses = "block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5 ml-1";

    const DimensionsControls = (
        <div className="space-y-4 mb-6 pb-6 border-b border-border/50">
            <div>
                <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-3">Dimensions</h3>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className={labelClasses}>Width</label>
                        <input
                            type="text"
                            className={inputClasses}
                            value={block.content.width || '100%'}
                            onChange={(e) => onChange({ width: e.target.value })}
                            placeholder="e.g., 100%, 300px"
                        />
                    </div>
                    <div>
                        <label className={labelClasses}>Height</label>
                        <input
                            type="text"
                            className={inputClasses}
                            value={block.content.height || 'auto'}
                            onChange={(e) => onChange({ height: e.target.value })}
                            placeholder="e.g., auto, 250px"
                        />
                    </div>
                </div>
            </div>
        </div>
    );

    const renderSpecificProperties = () => {
        if (block.type === 'text') {
            return (
                <div className="space-y-5">
                    <div>
                        <label className={labelClasses}>Content</label>
                        <textarea className={inputClasses} rows={4} value={block.content.text || ''} onChange={(e) => onChange({ text: e.target.value })} placeholder="Enter your message here..." />
                    </div>
                    <div>
                        <label className={labelClasses}>Typography</label>
                        <div className="grid grid-cols-2 gap-2">
                            <select className={inputClasses} value={block.content.fontSize || '16px'} onChange={(e) => onChange({ fontSize: e.target.value })}>
                                <option value="12px">Caption (12px)</option>
                                <option value="16px">Product (16px)</option>
                                <option value="20px">Subhead (20px)</option>
                                <option value="24px">Headline (24px)</option>
                                <option value="32px">Display (32px)</option>
                            </select>
                            <select className={inputClasses} value={block.content.fontWeight || '400'} onChange={(e) => onChange({ fontWeight: e.target.value })}>
                                <option value="400">Regular</option>
                                <option value="600">Semibold</option>
                                <option value="800">Extra Bold</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className={labelClasses}>Alignment</label>
                        <div className="flex p-1 bg-muted rounded-xl border border-border">
                            {['left', 'center', 'right'].map((align) => (
                                <button key={align} onClick={() => onChange({ textAlign: align })} className={`cursor-pointer flex-1 py-1.5 flex items-center justify-center rounded-lg transition-all ${block.content.textAlign === align ? 'bg-primary text-primary-foreground shadow-sm ring-1 ring-primary/10' : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'}`}>
                                    {align === 'left' && <Layout className="w-3.5 h-3.5 rotate-90" />}
                                    {align === 'center' && <Layout className="w-3.5 h-3.5" />}
                                    {align === 'right' && <Layout className="w-3.5 h-3.5 -rotate-90" />}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            );
        }

        if (block.type === 'button') {
            return (
                <div className="space-y-5">
                    <div>
                        <label className={labelClasses}>Button Text</label>
                        <input type="text" className={inputClasses} value={block.content.text || ''} onChange={(e) => onChange({ text: e.target.value })} placeholder="Click Me" />
                    </div>
                    <div>
                        <label className={labelClasses}>Destination URL</label>
                        <input type="url" placeholder="https://example.com" className={inputClasses} value={block.content.url || ''} onChange={(e) => onChange({ url: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClasses}>Bg Color</label>
                            <div className="flex items-center gap-2 p-1.5 bg-muted border border-border rounded-lg">
                                <input type="color" className="h-6 w-6 rounded-md cursor-pointer border-none bg-transparent" value={block.content.backgroundColor || 'var(--primary)'} onChange={(e) => onChange({ backgroundColor: e.target.value })} />
                                <span className="text-[10px] font-mono text-muted-foreground uppercase">{block.content.backgroundColor || 'Primary'}</span>
                            </div>
                        </div>
                        <div>
                            <label className={labelClasses}>Corner Radius</label>
                            <select className={inputClasses} value={block.content.borderRadius || '8px'} onChange={(e) => onChange({ borderRadius: e.target.value })}>
                                <option value="0px">Sharp</option>
                                <option value="4px">Soft</option>
                                <option value="8px">Standard</option>
                                <option value="16px">Round</option>
                                <option value="999px">Pill</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className={labelClasses}>Alignment</label>
                        <div className="flex p-1 bg-muted rounded-xl border border-border">
                            {['left', 'center', 'right'].map((align) => (
                                <button key={align} onClick={() => onChange({ textAlign: align })} className={`cursor-pointer flex-1 py-1.5 flex items-center justify-center rounded-lg transition-all ${block.content.textAlign === align ? 'bg-primary text-primary-foreground shadow-sm ring-1 ring-primary/10' : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'}`}>
                                    {align === 'left' && <Layout className="w-3.5 h-3.5 rotate-90" />}
                                    {align === 'center' && <Layout className="w-3.5 h-3.5" />}
                                    {align === 'right' && <Layout className="w-3.5 h-3.5 -rotate-90" />}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            );
        }

        if (block.type === 'hero') {
            return (
                <div className="space-y-5">
                    <div>
                        <label className={labelClasses}>Headline</label>
                        <input type="text" className={inputClasses} value={block.content.title || ''} onChange={(e) => onChange({ title: e.target.value })} placeholder="Big Bold Statement" />
                    </div>
                    <div>
                        <label className={labelClasses}>Supporting Text</label>
                        <textarea className={inputClasses} rows={3} value={block.content.subtitle || ''} onChange={(e) => onChange({ subtitle: e.target.value })} placeholder="Add more details here..." />
                    </div>
                    <div>
                        <label className={labelClasses}>Brand Color</label>
                        <div className="flex items-center gap-3 p-2 bg-muted border border-border rounded-xl">
                            <input type="color" className="h-10 w-10 rounded-lg cursor-pointer border-none bg-transparent" value={block.content.backgroundColor || 'var(--primary)'} onChange={(e) => onChange({ backgroundColor: e.target.value })} />
                            <div className="flex flex-col">
                                <span className="text-[11px] font-black uppercase text-foreground">{block.content.backgroundColor || 'Primary'}</span>
                                <span className="text-[9px] text-muted-foreground font-bold">Primary Accent</span>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        if (block.type === 'features') {
            return (
                <div className="space-y-6">
                    <div>
                        <label className={labelClasses}>Features Grid</label>
                        <p className="text-[9px] text-muted-foreground mb-4 ml-1">Configure individual cards</p>
                    </div>
                    {(block.content.features || []).map((feature: any, index: number) => (
                        <div key={index} className="space-y-4 p-4 bg-muted rounded-2xl border border-border relative group/feature">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-[9px] font-black text-primary uppercase tracking-tighter bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">Feature {index + 1}</span>
                            </div>
                            <div>
                                <label className={labelClasses}>Title</label>
                                <input type="text" className={inputClasses} value={feature.title} onChange={(e) => { const newFeatures = [...block.content.features]; newFeatures[index].title = e.target.value; onChange({ features: newFeatures }); }} />
                            </div>
                            <div>
                                <label className={labelClasses}>Description</label>
                                <textarea className={inputClasses} rows={2} value={feature.desc} onChange={(e) => { const newFeatures = [...block.content.features]; newFeatures[index].desc = e.target.value; onChange({ features: newFeatures }); }} />
                            </div>
                        </div>
                    ))}
                </div>
            );
        }

        if (block.type === 'columns') {
            return (
                <div className="space-y-5">
                    <div>
                        <label className={labelClasses}>Left Column Content</label>
                        <div className="space-y-3 p-4 bg-muted rounded-2xl border border-border">
                            <div><label className={labelClasses}>Title</label><input type="text" className={inputClasses} value={block.content.leftTitle || ''} onChange={(e) => onChange({ leftTitle: e.target.value })} /></div>
                            <div><label className={labelClasses}>Body</label><textarea className={inputClasses} rows={3} value={block.content.leftText || ''} onChange={(e) => onChange({ leftText: e.target.value })} /></div>
                        </div>
                    </div>
                    <div>
                        <label className={labelClasses}>Right Column Media</label>
                        <div className="p-4 bg-muted rounded-2xl border border-border">
                            <label className={labelClasses}>Image URL</label><input type="text" className={inputClasses} value={block.content.rightImageUrl || ''} onChange={(e) => onChange({ rightImageUrl: e.target.value })} placeholder="https://..." />
                        </div>
                    </div>
                </div>
            );
        }

        if (block.type === 'newsletter') {
            return (
                <div className="space-y-5">
                    <div>
                        <label className={labelClasses}>Blog Layout</label>
                        <div className="space-y-4">
                            <div><label className={labelClasses}>Headline</label><input type="text" className={inputClasses} value={block.content.title || ''} onChange={(e) => onChange({ title: e.target.value })} /></div>
                            <div><label className={labelClasses}>Excerpt</label><textarea className={inputClasses} rows={4} value={block.content.text || ''} onChange={(e) => onChange({ text: e.target.value })} /></div>
                        </div>
                    </div>
                </div>
            );
        }

        if (block.type === 'image') {
            return (
                <div className="space-y-5">
                    <div><label className={labelClasses}>Media Source</label><input type="text" className={inputClasses} value={block.content.url || ''} onChange={(e) => onChange({ url: e.target.value })} placeholder="https://images.unsplash.com/..." /></div>
                    <div><label className={labelClasses}>Alt Text</label><input type="text" className={inputClasses} value={block.content.alt || ''} onChange={(e) => onChange({ alt: e.target.value })} placeholder="Describe the image" /></div>
                    <div>
                        <label className={labelClasses}>Corner Radius</label>
                        <select className={inputClasses} value={block.content.borderRadius || '12px'} onChange={(e) => onChange({ borderRadius: e.target.value })}>
                            <option value="0px">Sharp</option>
                            <option value="8px">Soft</option>
                            <option value="12px">Standard</option>
                            <option value="24px">Round</option>
                        </select>
                    </div>
                </div>
            );
        }

        if (block.type === 'divider') {
            return (
                <div className="space-y-5">
                    <div>
                        <label className={labelClasses}>Thickness</label>
                        <input type="range" min="1" max="10" step="1" className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary" value={parseInt(block.content.thickness || '1')} onChange={(e) => onChange({ thickness: e.target.value + 'px' })} />
                        <div className="flex justify-between mt-1 px-1"><span className="text-[9px] text-muted-foreground">1px</span><span className="text-[9px] text-muted-foreground font-black">{block.content.thickness || '1px'}</span><span className="text-[9px] text-muted-foreground">10px</span></div>
                    </div>
                    <div>
                        <label className={labelClasses}>Divider Color</label>
                        <div className="flex items-center gap-2 p-1.5 bg-gray-950 border border-white/10 rounded-lg">
                            <input type="color" className="h-6 w-6 rounded-md cursor-pointer border-none bg-transparent" value={block.content.color || '#e5e7eb'} onChange={(e) => onChange({ color: e.target.value })} />
                            <span className="text-[10px] font-mono text-gray-400 uppercase">{block.content.color || '#E5E7EB'}</span>
                        </div>
                    </div>
                </div>
            );
        }

        if (block.type === 'html') {
            return (
                <div className="space-y-5">
                    <div>
                        <label className={labelClasses}>Raw HTML Source</label>
                        <p className="text-[9px] text-amber-600 font-bold mb-2 ml-1 flex items-center gap-1"><Settings2 className="w-2.5 h-2.5" /> Direct DOM insertion - Use with caution</p>
                        <textarea className={`${inputClasses} font-mono`} rows={10} value={block.content.html || ''} onChange={(e) => onChange({ html: e.target.value })} placeholder="<div class='custom'>...</div>" />
                    </div>
                </div>
            );
        }

        return <div>Properties not available for this block type.</div>;
    };

    return (
        <div>
            {DimensionsControls}
            {renderSpecificProperties()}
        </div>
    );
}

// FIX 4: Integrated width and height properly into all serialized outputs
export function serializeBlocksToHtml(blocks: CanvasBlock[]): string {
    const serializedBlocks = blocks.map(block => {
        const w = block.content.width || '100%';
        const h = block.content.height || 'auto';

        // We wrap every single output in a dimension wrapper so you don't have to code it 9 times
        const wrapperStart = `<div style="width: ${w}; height: ${h}; box-sizing: border-box; margin-bottom: 20px;">`;
        const wrapperEnd = `</div>`;

        let innerHtml = '';

        switch (block.type) {
            case 'text':
                innerHtml = `
                    <div style="color: ${block.content.color || '#374151'}; font-size: ${block.content.fontSize || '16px'}; text-align: ${block.content.textAlign || 'left'}; font-weight: ${block.content.fontWeight || 'normal'}; line-height: 1.6;">
                        ${block.content.text || ''}
                    </div>
                `;
                break;
            case 'button':
                innerHtml = `
                    <div style="text-align: ${block.content.textAlign || 'center'}; width: 100%; height: 100%;">
                        <a href="${block.content.url || '#'}" style="display: inline-block; padding: 12px 24px; background-color: ${block.content.backgroundColor || '#4f46e5'}; color: ${block.content.color || '#ffffff'}; text-decoration: none; border-radius: ${block.content.borderRadius || '8px'}; font-weight: bold;">
                            ${block.content.text || 'Click Here'}
                        </a>
                    </div>
                `;
                break;
            case 'image':
                innerHtml = `
                    <div style="text-align: center; width: 100%; height: 100%;">
                        <img src="${block.content.url || ''}" alt="${block.content.alt || ''}" style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: ${block.content.borderRadius || '12px'};" />
                    </div>
                `;
                break;
            case 'divider':
                innerHtml = `
                    <div style="padding: 20px 0; width: 100%;">
                        <hr style="border: 0; border-top: ${block.content.thickness || '1px'} solid ${block.content.color || '#e5e7eb'}; width: 100%;" />
                    </div>
                `;
                break;
            case 'html':
                innerHtml = block.content.html || '';
                break;
            case 'hero':
                innerHtml = `
                    <div style="background: ${block.content.backgroundColor || '#4f46e5'}; color: #ffffff; padding: 60px 40px; border-radius: 24px; text-align: center; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); width: 100%; height: 100%; box-sizing: border-box;">
                        <h1 style="font-size: 36px; font-weight: 800; margin: 0 0 16px 0; letter-spacing: -0.025em;">${block.content.title || 'Main Title Goes Here'}</h1>
                        <p style="font-size: 18px; opacity: 0.9; max-width: 480px; margin: 0 auto; line-height: 1.6;">${block.content.subtitle || 'Add a compelling description to hook your audience.'}</p>
                    </div>
                `;
                break;
            case 'features':
                innerHtml = `
                    <div style="display: flex; gap: 20px; width: 100%; height: 100%;">
                        ${(block.content.features || []).map((f: any) => `
                            <div style="flex: 1; padding: 24px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; text-align: center;">
                                <div style="font-size: 18px; font-weight: 700; color: #1e293b; margin-bottom: 8px;">${f.title}</div>
                                <div style="font-size: 14px; color: #64748b; line-height: 1.5;">${f.desc}</div>
                            </div>
                        `).join('')}
                    </div>
                `;
                break;
            case 'columns':
                innerHtml = `
                    <div style="display: flex; gap: 30px; align-items: center; width: 100%; height: 100%;">
                        <div style="flex: 1;">
                            <h2 style="font-size: 24px; font-weight: 700; color: #1e293b; margin-bottom: 12px;">${block.content.leftTitle || 'Left Side'}</h2>
                            <p style="font-size: 16px; color: #475569; line-height: 1.6;">${block.content.leftText || 'Add some descriptive content here.'}</p>
                        </div>
                        <div style="flex: 1;">
                            <img src="${block.content.rightImageUrl || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=2426'}" style="width: 100%; border-radius: 16px; aspect-ratio: 4/3; object-fit: cover;" />
                        </div>
                    </div>
                `;
                break;
            case 'newsletter':
                innerHtml = `
                    <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 20px; padding: 40px; text-align: center; border-top: 8px solid #4f46e5; width: 100%; height: 100%; box-sizing: border-box;">
                        <div style="text-transform: uppercase; font-size: 12px; font-weight: 800; color: #4f46e5; letter-spacing: 0.1em; margin-bottom: 12px;">Weekly Digest</div>
                        <h2 style="font-size: 28px; font-weight: 800; color: #0f172a; margin-bottom: 16px;">${block.content.title || 'Latest Updates'}</h2>
                        <div style="width: 40px; height: 4px; background: #e2e8f0; margin: 0 auto 24px auto;"></div>
                        <p style="font-size: 16px; color: #334155; line-height: 1.6; margin-bottom: 0;">${block.content.text || 'The most important news delivered straight to your inbox.'}</p>
                    </div>
                `;
                break;
        }

        return wrapperStart + innerHtml + wrapperEnd;
    }).join('');

    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #374151;">
            ${serializedBlocks}
        </div>
    `;
}

function getDefaultContent(type: string) {
    switch (type) {
        case 'text': return { text: 'New text block', fontSize: '16px', textAlign: 'left' };
        case 'button': return { text: 'Click Here', backgroundColor: '#4f46e5', textAlign: 'center' };
        case 'image': return { url: '', alt: '' };
        case 'divider': return { color: '#e5e7eb', thickness: '1px' };
        case 'html': return { html: '<div style="padding: 20px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; text-align: center;">\n  <h3 style="margin: 0 0 10px 0;">Custom Component</h3>\n  <p style="margin: 0;">Edit this HTML to create something unique.</p>\n</div>' };
        case 'hero': return { title: 'The Future of CCIRP', subtitle: 'Experience the next generation of communication and intelligent reminders, built for scale and aesthetic excellence.', backgroundColor: '#4f46e5' };
        case 'features': return {
            features: [
                { title: 'Smart Sync', desc: 'Real-time data propagation across all devices.' },
                { title: 'AI Reminders', desc: 'Intelligent scheduling based on your workflow.' },
                { title: 'Secure Ops', desc: 'Enterprise-grade encryption for every message.' }
            ]
        };
        case 'columns': return { leftTitle: 'Powerful Insights', leftText: 'Get a birds-eye view of your entire communication engine with advanced analytics and predictive modeling.', rightImageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=2426' };
        case 'newsletter': return { title: 'Latest Innovations', text: 'Stunning designs and powerful features combine to create the ultimate notification platform for modern businesses.' };
        default: return {};
    }
}