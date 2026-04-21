import React from 'react';
import { Box } from '@mui/material';

const FlowerSpinner = ({ animationDuration = 1000, dotSize = 15, dotsNum = 3, color = '#ff1d5e' }) => {
  const dots = Array.from({ length: dotsNum }, (_, index) => index);

  return (
    <Box
      sx={{
        position: 'relative',
        width: dotSize * dotsNum * 2,
        height: dotSize * 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {dots.map((dot, index) => (
        <Box
          key={dot}
          sx={{
            position: 'absolute',
            width: dotSize,
            height: dotSize,
            border: `2px solid ${color}`,
            borderRadius: '50%',
            backgroundColor: 'transparent',
            left: `calc(50% + ${(index - (dotsNum - 1) / 2) * dotSize * 1.8}px)`,
            animation: `hollowDotPulse ${animationDuration}ms ease-in-out infinite`,
            animationDelay: `${(animationDuration / dotsNum) * index}ms`,
            opacity: 0.8,
          }}
        />
      ))}
      <style>
        {`
          @keyframes hollowDotPulse {
            0%, 100% { transform: scale(1); opacity: 0.5; }
            50% { transform: scale(1.4); opacity: 1; }
          }
        `}
      </style>
    </Box>
  );
};

export default FlowerSpinner;
