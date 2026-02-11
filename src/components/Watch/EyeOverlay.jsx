import React, { useState } from 'react';

const EyeOverlay = ({ cursorPos, paused, onTogglePause }) => {

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            pointerEvents: 'none', // Let clicks pass through!
            zIndex: 9999,
        }}>
            {/* Head Cursor - Cyan Crosshair */}
            {!paused && cursorPos && (
                <div style={{
                    position: 'absolute',
                    left: cursorPos.x,
                    top: cursorPos.y,
                    width: 30,
                    height: 30,
                    border: '3px solid cyan',
                    borderRadius: '50%',
                    transform: 'translate(-50%, -50%)',
                    opacity: 0.8,
                    boxShadow: '0 0 15px cyan',
                    pointerEvents: 'none',
                    transition: 'left 0.05s linear, top 0.05s linear', // Fast follow
                    zIndex: 10001
                }}>
                    {/* Crosshair Center */}
                    <div style={{
                        position: 'absolute', top: '50%', left: '50%',
                        width: 4, height: 4, background: 'cyan',
                        transform: 'translate(-50%, -50%)', borderRadius: '50%'
                    }} />
                </div>
            )}
        </div>
    );
};

export default EyeOverlay;
