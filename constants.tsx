
import React from 'react';

export const CATEGORIES = ['Work', 'Personal', 'Health', 'Learning', 'Social'];

/**
 * 品牌 Logo 组件 - 100% 纯 SVG 矢量构建
 * 融合了“番茄”的外形与“时钟”的语义，采用高饱和度渐变色。
 */
export const BrandLogo = ({ className }: { className?: string }) => (
  <div className={`relative flex items-center justify-center bg-gradient-to-br from-[#FF6B6B] to-[#EE5253] overflow-hidden ${className}`}>
    {/* 内部装饰性光晕 */}
    <div className="absolute top-0 right-0 w-full h-full bg-white opacity-10 translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl" />
    
    <svg viewBox="0 0 100 100" className="w-[70%] h-[70%] text-white drop-shadow-lg">
      {/* 番茄蒂/叶子部分 */}
      <path 
        d="M50 15 Q55 5 65 10" 
        stroke="#4ADE80" 
        strokeWidth="8" 
        strokeLinecap="round" 
        fill="none" 
      />
      {/* 时钟外圆圈 */}
      <circle 
        cx="50" 
        cy="55" 
        r="32" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="7" 
      />
      {/* 时钟指针 - 呈现 3:00 状态 */}
      <path 
        d="M50 38 V55 H62" 
        stroke="currentColor" 
        strokeWidth="7" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        fill="none" 
      />
    </svg>
  </div>
);

export const Icons = {
  Check: ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  Plus: ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  ),
  Timer: ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Layout: ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
  Chart: ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  Sparkles: ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  ),
};
