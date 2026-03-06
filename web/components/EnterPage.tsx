'use client';

import React, { useState } from 'react';

// Define colors here to make the component self-contained
const colors = {
  brandCream: '#FFFDF5',
  markerPink: '#ec4899',
  markerBlue: '#3b82f6',
  markerGreen: '#22c55e',
  markerOrange: '#f97316',
  markerPurple: '#a855f7',
  markerYellow: '#eab308',
  doodleTeal: '#14b8a6',
};

const fonts = {
  marker: '"Caveat Brush", cursive',
  hand: '"Indie Flower", cursive',
};

const Doodles = () => (
  <div style={{
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    overflow: 'hidden',
    opacity: 0.6
  }}>
    {/* Top Left Squiggle - Pink */}
    <svg style={{
      position: 'absolute',
      top: '2.5rem',
      left: '2.5rem',
      width: '6rem',
      height: '6rem',
      color: colors.markerPink,
      transform: 'rotate(12deg)'
    }} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
      <path d="M10,50 Q30,10 50,50 T90,50" />
    </svg>
    
    {/* Top Right Star - Yellow */}
    <svg style={{
      position: 'absolute',
      top: '4rem',
      right: '4rem',
      width: '4rem',
      height: '4rem',
      color: colors.markerYellow,
      transform: 'rotate(-12deg)'
    }} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M50,10 L60,40 L90,50 L60,60 L50,90 L40,60 L10,50 L40,40 Z" />
    </svg>

    {/* Bottom Left Circle - Blue */}
    <svg style={{
      position: 'absolute',
      bottom: '8rem',
      left: '4rem',
      width: '5rem',
      height: '5rem',
      color: colors.markerBlue,
      transform: 'rotate(45deg)'
    }} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
      <circle cx="50" cy="50" r="40" strokeDasharray="10 10" />
    </svg>

    {/* Bottom Right Arrow - Orange */}
    <svg style={{
      position: 'absolute',
      bottom: '5rem',
      right: '8rem',
      width: '6rem',
      height: '6rem',
      color: colors.markerOrange,
      transform: 'rotate(-45deg)'
    }} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
      <path d="M10,50 Q50,20 90,50 M70,40 L90,50 L70,70" />
    </svg>

    {/* Middle Left Zigzag - Teal */}
    <svg style={{
      position: 'absolute',
      top: '50%',
      left: '2rem',
      width: '4rem',
      height: '8rem',
      color: colors.doodleTeal
    }} viewBox="0 0 50 100" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M25,10 L10,30 L40,50 L10,70 L25,90" />
    </svg>

    {/* Middle Right Spiral - Purple */}
    <svg style={{
      position: 'absolute',
      top: '33.333%',
      right: '3rem',
      width: '5rem',
      height: '5rem',
      color: colors.markerPurple,
      transform: 'rotate(90deg)'
    }} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
      <path d="M50,50 m-25,0 a25,25 0 1,0 50,0 a25,25 0 1,0 -50,0" strokeDasharray="5 5" />
    </svg>
    
    {/* Random Crosses/Plus signs - Mixed Colors */}
    <div style={{ position: 'absolute', top: '25%', left: '25%', color: colors.markerPink, fontSize: '2.25rem', fontFamily: fonts.marker, opacity: 0.8, transform: 'rotate(12deg)' }}>+</div>
    <div style={{ position: 'absolute', bottom: '33.333%', right: '25%', color: colors.markerBlue, fontSize: '1.875rem', fontFamily: fonts.marker, opacity: 0.8, transform: 'rotate(-12deg)' }}>x</div>
    <div style={{ position: 'absolute', top: '2.5rem', right: '50%', color: colors.markerOrange, fontSize: '1.5rem', fontFamily: fonts.marker, opacity: 0.7, transform: 'rotate(45deg)' }}>#</div>
    <div style={{ position: 'absolute', bottom: '2.5rem', left: '33.333%', color: colors.markerPurple, fontSize: '3rem', fontFamily: fonts.marker, opacity: 0.4, transform: 'rotate(180deg)' }}>?</div>

    {/* Wavy line bottom center - Teal */}
    <svg style={{
      position: 'absolute',
      bottom: '2.5rem',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '12rem',
      height: '3rem',
      color: colors.doodleTeal
    }} viewBox="0 0 200 40" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
       <path d="M0,20 Q25,0 50,20 T100,20 T150,20 T200,20" />
    </svg>

    {/* Sun doodle top center-ish - Yellow/Orange */}
    <svg style={{
      position: 'absolute',
      top: '2rem',
      left: '33.333%',
      width: '4rem',
      height: '4rem',
      color: colors.markerOrange
    }} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
      <circle cx="50" cy="50" r="20" />
      <path d="M50,20 L50,10 M50,80 L50,90 M20,50 L10,50 M80,50 L90,50 M28,28 L20,20 M72,72 L80,80 M28,72 L20,80 M72,28 L80,20" />
    </svg>

    {/* Smiley face bottom left-ish - Pink */}
    <svg style={{
      position: 'absolute',
      bottom: '10rem',
      left: '25%',
      width: '4rem',
      height: '4rem',
      color: colors.markerPink,
      transform: 'rotate(-12deg)'
    }} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
      <circle cx="35" cy="40" r="2" fill="currentColor" />
      <circle cx="65" cy="40" r="2" fill="currentColor" />
      <path d="M30,60 Q50,80 70,60" />
    </svg>

    {/* Cloud top right-ish - Blue */}
    <svg style={{
      position: 'absolute',
      top: '8rem',
      right: '33.333%',
      width: '6rem',
      height: '4rem',
      color: colors.markerBlue
    }} viewBox="0 0 100 60" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10,40 Q10,20 30,20 Q40,5 60,20 Q80,10 90,30 Q100,40 90,50 Q80,60 10,50 Z" />
    </svg>

    {/* Paper Plane - Purple */}
    <svg style={{
      position: 'absolute',
      top: '25%',
      right: '25%',
      width: '5rem',
      height: '5rem',
      color: colors.markerPurple,
      transform: 'rotate(-15deg)'
    }} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10,90 L90,50 L10,10 L30,50 Z" />
    </svg>

    {/* Lightbulb - Yellow */}
    <svg style={{
      position: 'absolute',
      bottom: '25%',
      left: '2.5rem',
      width: '4rem',
      height: '5rem',
      color: colors.markerYellow,
      transform: 'rotate(12deg)'
    }} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M30,60 C30,60 20,40 40,20 C60,0 80,40 70,60 M40,80 L60,80 M45,90 L55,90" />
      <path d="M30,60 L70,60" />
    </svg>

    {/* Musical Note - Teal */}
    <svg style={{
      position: 'absolute',
      top: '5rem',
      left: '25%',
      width: '3rem',
      height: '4rem',
      color: colors.doodleTeal,
      transform: 'rotate(-10deg)'
    }} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="30" cy="80" r="15" fill="currentColor" className="opacity-20" style={{ opacity: 0.2 }} />
      <path d="M45,80 L45,20 L80,30 L80,70" />
      <circle cx="65" cy="70" r="15" fill="currentColor" className="opacity-20" style={{ opacity: 0.2 }} />
    </svg>

    {/* Heart - Pink */}
    <svg style={{
      position: 'absolute',
      bottom: '2.5rem',
      right: '33.333%',
      width: '3rem',
      height: '3rem',
      color: colors.markerPink,
      transform: 'rotate(12deg)'
    }} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M50,90 Q10,60 10,30 Q10,10 30,10 Q50,10 50,30 Q50,10 70,10 Q90,10 90,30 Q90,60 50,90 Z" />
    </svg>

    {/* Random dots - Mixed */}
    <div style={{ position: 'absolute', top: '50%', right: '2.5rem', width: '0.75rem', height: '0.75rem', backgroundColor: colors.markerOrange, borderRadius: '9999px', opacity: 0.6 }}></div>
    <div style={{ position: 'absolute', bottom: '2.5rem', left: '2.5rem', width: '1rem', height: '1rem', backgroundColor: colors.markerBlue, borderRadius: '9999px', opacity: 0.5 }}></div>
    <div style={{ position: 'absolute', top: '5rem', left: '50%', width: '0.5rem', height: '0.5rem', backgroundColor: colors.markerPurple, borderRadius: '9999px', opacity: 0.4 }}></div>
    <div style={{ position: 'absolute', bottom: '50%', left: '5rem', width: '0.75rem', height: '0.75rem', backgroundColor: colors.doodleTeal, borderRadius: '9999px', opacity: 0.7 }}></div>
    <div style={{ position: 'absolute', top: '2.5rem', right: '5rem', width: '0.5rem', height: '0.5rem', backgroundColor: colors.markerPink, borderRadius: '9999px', opacity: 0.5 }}></div>
  </div>
);

export default function EnterPage({ onEnter }: { onEnter?: () => void }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      backgroundColor: colors.brandCream,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      overflow: 'hidden',
      position: 'relative'
    }}>
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Caveat+Brush&family=Indie+Flower&display=swap');
        
        .responsive-container {
          transform: scale(1);
        }
        @media (min-width: 768px) {
          .responsive-container {
            transform: scale(1.25);
          }
          .text-the {
            font-size: 1.5rem !important; /* text-2xl */
          }
          .text-infinite {
            font-size: 7.5rem !important; /* md:text-[7.5rem] */
          }
          .text-canvas {
            font-size: 1.875rem !important; /* text-3xl */
          }
          .text-stun {
            font-size: 5.5rem !important; /* md:text-[5.5rem] */
          }
        }
        @media (min-width: 1024px) {
          .responsive-container {
            transform: scale(1.5);
          }
          .text-infinite {
            font-size: 9rem !important; /* lg:text-[9rem] */
          }
          .text-stun {
            font-size: 6.5rem !important; /* lg:text-[6.5rem] */
          }
        }
      `}} />

      <Doodles />
      
      <div 
        className="responsive-container"
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          userSelect: 'none',
        }}
      >
        
        {/* "THE" - Top Left, tucked in */}
        <div style={{
          position: 'absolute',
          top: '-1.25rem', // -top-5
          left: '0.25rem', // left-1
          transform: 'rotate(-8deg)',
          zIndex: 20
        }}>
          <span className="text-the" style={{
            fontFamily: fonts.marker,
            fontSize: '1.25rem', // text-xl
            letterSpacing: '0.1em', // tracking-widest
            color: colors.markerPink
          }}>THE</span>
        </div>

        {/* "INFINITE" - Main Text */}
        <div style={{
          position: 'relative',
          zIndex: 10,
          lineHeight: 0.75
        }}>
          <span className="text-infinite" style={{
            fontFamily: fonts.marker,
            fontSize: '5.5rem', // text-[5.5rem]
            letterSpacing: '-0.02em',
            display: 'block',
            filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))', // drop-shadow-sm
            color: colors.markerBlue
          }}>
            INFINITE
          </span>
        </div>

        {/* "CANVAS" - Middle, nestled */}
        <div style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.75rem',
          marginTop: '-0.5rem',
          marginBottom: '-0.5rem',
          zIndex: 20,
          paddingTop: '15px',
          paddingBottom: '15px'
        }}>
          <div style={{
            width: '1rem',
            height: '2px',
            backgroundColor: colors.markerOrange,
            borderRadius: '9999px',
            opacity: 0.9,
            transform: 'rotate(-2deg)'
          }}></div>
          <span className="text-canvas" style={{
            fontFamily: fonts.hand,
            fontSize: '1.5rem', // text-2xl
            fontWeight: 'bold',
            marginTop: '-0.5rem',
            transform: 'rotate(-3deg)',
            color: colors.markerOrange
          }}>CANVAS</span>
          <div style={{
            width: '1rem',
            height: '2px',
            backgroundColor: colors.markerOrange,
            borderRadius: '9999px',
            opacity: 0.9,
            transform: 'rotate(2deg)'
          }}></div>
        </div>

        {/* "STUN" - Bottom Text */}
        <div style={{
          position: 'relative',
          zIndex: 10,
          lineHeight: 0.75,
          marginTop: '-0.25rem'
        }}>
          <span className="text-stun" style={{
            fontFamily: fonts.marker,
            fontSize: '4rem', // text-[4rem]
            letterSpacing: '-0.02em',
            display: 'block',
            filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))',
            color: colors.markerPurple
          }}>
            STUN
          </span>
        </div>

        {/* Decorative Swash - Underlining "STUN" */}
        <div style={{
          position: 'absolute',
          bottom: '-1.5rem',
          left: '-10%',
          width: '120%',
          height: '6rem',
          pointerEvents: 'none',
          zIndex: 0
        }}>
           <svg viewBox="0 0 300 100" style={{
             width: '100%',
             height: '100%',
             overflow: 'visible',
             color: colors.markerGreen
           }}>
             {/* Main swash stroke */}
             <path 
               d="M 20,40 Q 100,70 200,30 T 280,20" 
               fill="none" 
               stroke="currentColor" 
               strokeWidth="6" 
               strokeLinecap="round"
               style={{ opacity: 0.9 }}
             />
             {/* Slight taper/accent at the end */}
             <path 
               d="M 270,25 Q 280,20 285,15" 
               fill="none" 
               stroke="currentColor" 
               strokeWidth="4" 
               strokeLinecap="round"
               style={{ opacity: 0.9 }}
             />
           </svg>
        </div>

        {/* Enter Button - Absolute to preserve layout */}
        <div style={{
          position: 'absolute',
          bottom: '-3.5rem', // -bottom-14
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 20
        }}>
          <button 
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={onEnter}
            style={{
              fontFamily: fonts.marker,
              fontSize: '1.5rem', // text-2xl
              color: colors.brandCream,
              backgroundColor: colors.markerGreen,
              padding: '0.5rem 2rem', // px-8 py-2
              borderRadius: '9999px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              border: isHovered ? `2px solid ${colors.brandCream}` : '2px solid transparent',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'transform 200ms',
              transform: isHovered ? 'scale(1.05) rotate(1deg)' : 'rotate(-2deg)'
            }}
          >
            ENTER
          </button>
        </div>

      </div>
    </div>
  );
}
