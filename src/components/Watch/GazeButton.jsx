import React from 'react';

// Stabilized Gaze Button with SVG Progress Ring
const GazeButton = ({
    children,
    gazeId,
    isFocused,
    dwellProgress,
    onClick,
    style,
    className
}) => {

    // SVG Config for the progress border
    // We assume the button is roughly square-ish for the ring, 
    // or we draw a rect. A rect is better for tiles.
    // strokeLength = 2 * (w + h). For a percentage we can simpler usage.

    return (
        <div
            data-gaze-id={gazeId}
            onClick={onClick}
            className={className}
            style={{
                position: 'relative',
                transition: 'transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)', // Smooth pop
                transform: isFocused ? 'scale(1.05)' : 'scale(1)',
                zIndex: isFocused ? 10 : 1,
                ...style
            }}
        >
            {children}

            {/* Focus Overlay */}
            {isFocused && (
                <>
                    {/* 1. Base Yellow Border */}
                    <div style={{
                        position: 'absolute',
                        top: -4, left: -4, right: -4, bottom: -4,
                        border: '4px solid rgba(255, 215, 0, 0.3)', // Faint Yellow Base
                        borderRadius: 24,
                        pointerEvents: 'none',
                    }} />

                    {/* 2. Loading Progress Border (SVG) */}
                    <svg style={{
                        position: 'absolute',
                        top: -4, left: -4,
                        width: 'calc(100% + 8px)',
                        height: 'calc(100% + 8px)',
                        pointerEvents: 'none',
                        fill: 'none',
                        borderRadius: 24, // SVG doesn't use radius but container does
                        overflow: 'visible'
                    }}>
                        <rect
                            x="2" y="2"
                            width="calc(100% - 4px)"
                            height="calc(100% - 4px)"
                            rx="24" ry="24" // Matches border radius
                            stroke="#FFD700" // Gold
                            strokeWidth="4"
                            strokeDasharray="400%" // Roughly enough to cover
                            strokeDashoffset={`${400 - (dwellProgress * 4)}%`} // Animate this
                            strokeLinecap="round"
                            style={{
                                transition: 'stroke-dashoffset 0.1s linear',
                                filter: 'drop-shadow(0 0 8px #FFD700)'
                            }}
                        />
                    </svg>
                </>
            )}
        </div>
    );
};

export default GazeButton;
