import React from 'react';

interface Props {
  isActive: boolean;
}

export const SceneFindYourSpace: React.FC<Props> = () => {
  return (
    <div className="absolute inset-0">
      <img
        src="/images/splash_scene2.png"
        alt="Find Your Space"
        className="w-full h-full object-cover"
      />
    </div>
  );
};
