"use client"

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2 } from 'lucide-react';

export interface CanvasBlock {
    id: string;
    type: string;
    content: any;
}

interface SortableBlockProps {
    block: CanvasBlock;
    isSelected: boolean;
    onSelect: (id: string) => void;
    onDelete: (id: string) => void;
    onUpdate?: (updates: any) => void; // Added to support resize write-backs
}

export function SortableBlock({ block, isSelected, onSelect, onDelete, onUpdate }: SortableBlockProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: block.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const renderContent = () => {
        switch (block.type) {
            case 'text':
                return (
                    <div
                        className="prose max-w-none p-4"
                        style={{
                            color: block.content.color || '#F3F4F6',
                            fontSize: block.content.fontSize || '16px',
                            textAlign: block.content.textAlign || 'left',
                            fontWeight: block.content.fontWeight || 'normal'
                        }}
                    >
                        {block.content.text || 'Enter text here...'}
                    </div>
                );
            case 'button':
                return (
                    <div className="p-4 flex flex-col justify-center h-full" style={{ alignItems: block.content.textAlign === 'left' ? 'flex-start' : block.content.textAlign === 'right' ? 'flex-end' : 'center' }}>
                        <button
                            className="px-6 py-2 font-medium shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer w-full h-full min-h-[40px]"
                            style={{
                                backgroundColor: block.content.backgroundColor || 'var(--primary)',
                                color: block.content.color || 'var(--primary-foreground)',
                                borderRadius: block.content.borderRadius || '8px'
                            }}
                        >
                            {block.content.text || 'Click Here'}
                        </button>
                    </div>
                );
            case 'image':
                return (
                    <div className="p-4 flex justify-center w-full h-full">
                        {block.content.url ? (
                            <img
                                src={block.content.url}
                                alt={block.content.alt || 'Template image'}
                                className="shadow-lg object-contain w-full h-full"
                                style={{
                                    borderRadius: block.content.borderRadius || '12px'
                                }}
                            />
                        ) : (
                            <div className="w-full h-full min-h-[12rem] bg-muted rounded-lg border-2 border-dashed border-border flex items-center justify-center text-muted-foreground">
                                Placeholder Image (Edit in properties)
                            </div>
                        )}
                    </div>
                );
            case 'divider':
                return (
                    <div className="py-6 px-4 w-full flex flex-col justify-center h-full">
                        <hr style={{
                            borderTopWidth: block.content.thickness || '1px',
                            borderColor: block.content.color || 'var(--border)',
                            width: '100%'
                        }} />
                    </div>
                );
            case 'html':
                return (
                    <div className="p-4 w-full h-full">
                        <div
                            className="bg-muted rounded-lg p-4 border border-border font-mono text-xs overflow-auto w-full h-full text-foreground"
                            dangerouslySetInnerHTML={{ __html: block.content.html || '' }}
                        />
                    </div>
                );
            case 'hero':
                return (
                    <div className="p-8 my-4 text-primary-foreground rounded-3xl text-center shadow-xl relative group/hero flex flex-col justify-center h-full w-full" style={{ backgroundColor: block.content.backgroundColor || 'var(--primary)' }}>
                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50 rounded-3xl"></div>
                        <h1 className="text-4xl font-black mb-4 relative z-10 tracking-tight">{block.content.title || 'Main Title'}</h1>
                        <p className="text-lg opacity-90 max-w-lg mx-auto relative z-10 leading-relaxed">{block.content.subtitle || 'Add a compelling description.'}</p>
                    </div>
                );
            case 'features':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 my-4 w-full h-full">
                        {(block.content.features || []).map((f: any, i: number) => (
                            <div key={i} className="p-6 bg-card rounded-2xl border border-border text-center hover:bg-accent/50 transition-colors flex flex-col justify-center">
                                <div className="text-base font-bold text-foreground mb-2">{f.title}</div>
                                <div className="text-xs text-muted-foreground leading-relaxed">{f.desc}</div>
                            </div>
                        ))}
                    </div>
                );
            case 'columns':
                return (
                    <div className="flex flex-col md:flex-row gap-8 p-8 my-4 items-center w-full h-full">
                        <div className="flex-1 space-y-4">
                            <h2 className="text-2xl font-bold text-foreground tracking-tight">{block.content.leftTitle || 'Section Title'}</h2>
                            <p className="text-sm text-muted-foreground leading-relaxed">{block.content.leftText || 'Add some descriptive content here.'}</p>
                        </div>
                        <div className="flex-1 w-full max-w-sm h-full flex items-center">
                            <img
                                src={block.content.rightImageUrl || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=2426'}
                                className="w-full rounded-2xl shadow-lg object-cover ring-1 ring-border"
                                alt="Section visual"
                                style={{ maxHeight: '100%' }}
                            />
                        </div>
                    </div>
                );
            case 'newsletter':
                return (
                    <div className="p-10 my-4 bg-card border border-border rounded-3xl text-center shadow-2xl relative flex flex-col justify-center w-full h-full">
                        <div className="absolute top-0 left-0 w-full h-2 bg-primary rounded-t-3xl"></div>
                        <div className="inline-block px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full mb-4 mx-auto w-max">Blog Header</div>
                        <h2 className="text-3xl font-black text-foreground mb-4 tracking-tight">{block.content.title || 'Latest Updates'}</h2>
                        <div className="w-12 h-1 bg-border mx-auto mb-6"></div>
                        <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">{block.content.text || 'Description goes here.'}</p>
                    </div>
                );
            default:
                return <div className="p-4 text-destructive">Unknown block type</div>;
        }
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`
                relative group transition-all
                ${isSelected ? 'ring-2 ring-primary ring-offset-4 ring-offset-background rounded-sm z-20' : 'hover:outline hover:outline-1 hover:outline-primary/30 z-10'}
                ${isDragging ? 'opacity-50 scale-105 z-50' : ''}
            `}
            onClick={(e) => {
                e.stopPropagation();
                onSelect(block.id);
            }}
        >
            {/* Drag Handle */}
            <div
                {...attributes}
                {...listeners}
                className={`
                    absolute left-2 top-1/2 -translate-y-1/2 p-1 rounded-md bg-card border border-border shadow-sm
                    cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity z-30
                `}
                aria-label="Drag handle"
            >
                <GripVertical className="w-4 h-4" />
            </div>

            {/* Delete Button */}
            {isSelected && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(block.id);
                    }}
                    className="absolute right-2 top-2 p-1.5 rounded-md bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors z-30 cursor-pointer"
                    aria-label="Delete block"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            )}

            {/* Content Rendering Wrapper with Resize */}
            <div className={`${isDragging ? 'pointer-events-none' : ''} pl-10 pr-4 w-full flex justify-center`}>
                <div
                    style={{
                        width: block.content.width || '100%',
                        height: block.content.height || 'auto',
                        resize: isSelected ? 'both' : 'none',
                        overflow: 'hidden', // Required for CSS resize to work
                        minWidth: '100px',
                        minHeight: '50px',
                    }}
                    onMouseUp={(e) => {
                        if (isSelected && onUpdate) {
                            const target = e.currentTarget;
                            // Only update if dimensions actually changed
                            if (target.style.width !== block.content.width || target.style.height !== block.content.height) {
                                onUpdate({
                                    width: target.style.width,
                                    height: target.style.height
                                });
                            }
                        }
                    }}
                    className={`relative rounded-xl transition-shadow ${isSelected ? 'ring-1 ring-primary/20 bg-background/30 shadow-sm' : ''}`}
                >
                    {renderContent()}
                </div>
            </div>
        </div>
    );
}