"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import React from "react";
import { cn } from "@/lib/utils";

export interface TimelineData {
  id: number;
  title: string;
  category: string;
  icon: LucideIcon;
  status: "completed" | "in-progress" | "pending";
  energy: number; // 0 to 100
}

interface Props {
  timelineData: TimelineData[];
}

export default function RadialOrbitalTimeline({ timelineData }: Props) {
  const radius = 120; // Radius of the orbit

  return (
    <div className="relative w-full h-[400px] flex items-center justify-center bg-transparent">
      {/* Central Hub */}
      <div className="absolute z-10 flex flex-col items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.1, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="w-20 h-20 rounded-full bg-accent/20 border-2 border-accent/50 flex items-center justify-center backdrop-blur-sm"
        >
          <div className="w-12 h-12 rounded-full bg-accent/40 flex items-center justify-center shadow-[0_0_15px_rgba(var(--accent),0.5)]">
             <div className="w-4 h-4 rounded-full bg-accent animate-pulse" />
          </div>
        </motion.div>
        <span className="mt-4 text-sm font-semibold tracking-wider text-muted-foreground uppercase">Processing</span>
      </div>

      {/* Orbits & Nodes */}
      <div className="absolute w-[300px] h-[300px]">
        {/* Orbital Rings */}
        <div className="absolute inset-0 rounded-full border border-border/40 border-dashed animate-[spin_20s_linear_infinite]" />
        <div className="absolute inset-4 rounded-full border border-accent/10 animate-[spin_15s_linear_infinite_reverse]" />
        
        {timelineData.map((node, index) => {
          const angle = (index / timelineData.length) * 360;
          const radian = (angle * Math.PI) / 180;
          const x = Math.cos(radian) * radius;
          const y = Math.sin(radian) * radius;

          const isCompleted = node.status === "completed";
          const isInProgress = node.status === "in-progress";

          return (
            <motion.div
              key={node.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.2 }}
              className="absolute top-1/2 left-1/2 -mt-6 -ml-6 w-12 h-12"
              style={{
                x,
                y,
              }}
            >
              <div className="relative group w-full h-full">
                {/* Connecting Line to Center */}
                <svg className="absolute top-1/2 left-1/2 w-0 h-0 overflow-visible pointer-events-none -z-10">
                   <motion.line
                     x1={0}
                     y1={0}
                     x2={-x}
                     y2={-y}
                     stroke={isCompleted ? "var(--accent)" : "currentColor"}
                     strokeWidth="1.5"
                     strokeOpacity={isCompleted ? 0.5 : 0.1}
                     strokeDasharray={isInProgress ? "4,4" : "none"}
                     initial={{ pathLength: 0 }}
                     animate={{ pathLength: 1 }}
                     transition={{ duration: 1 }}
                   />
                </svg>

                <div
                  className={cn(
                    "w-full h-full rounded-full flex items-center justify-center border-2 transition-all duration-500",
                    isCompleted
                      ? "bg-accent/20 border-accent shadow-[0_0_10px_rgba(var(--accent),0.3)]"
                      : isInProgress
                      ? "bg-card border-accent/50 animate-pulse"
                      : "bg-card/50 border-border opacity-50"
                  )}
                >
                  <node.icon className={cn("w-5 h-5", isCompleted || isInProgress ? "text-accent" : "text-muted-foreground")} />
                </div>

                {/* Energy Indicator */}
                {(isCompleted || isInProgress) && (
                  <svg className="absolute -inset-2 w-16 h-16 -rotate-90 pointer-events-none">
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                      className="text-border/20"
                    />
                    <motion.circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke="var(--accent)"
                      strokeWidth="2"
                      fill="none"
                      strokeDasharray="175.93"
                      initial={{ strokeDashoffset: 175.93 }}
                      animate={{ strokeDashoffset: 175.93 - (175.93 * node.energy) / 100 }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </svg>
                )}

                {/* Tooltip */}
                <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-max px-3 py-1.5 rounded-lg bg-popover border border-border shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-50 text-center pointer-events-none">
                  <p className="text-xs font-semibold">{node.title}</p>
                  <p className="text-[10px] text-muted-foreground">{node.category}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
