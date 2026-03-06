"use client"
import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { LucideIcon } from 'lucide-react';

export interface BlockDef {
    type: string;
    label: string;
    icon: LucideIcon;
}

interface DraggableBlockProps {
    block: BlockDef;
}

export function DraggableBlock({ block }: DraggableBlockProps) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: `new-${block.type}`,
        data: {
            type: block.type,
            isNew: true,
        },
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined;

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className={`
                flex items-center gap-3 p-3 rounded-xl border border-border bg-card shadow-sm
                cursor-pointer hover:border-primary hover:text-primary transition-colors
                ${isDragging ? 'opacity-50 ring-2 ring-primary z-50' : ''}
            `}
        >
            <block.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
            <span className="font-medium text-sm text-foreground">{block.label}</span>
        </div>
    );
}