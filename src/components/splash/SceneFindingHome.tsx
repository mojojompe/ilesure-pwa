import React from 'react';

interface Props {
  isActive: boolean;
}

export const SceneFindingHome: React.FC<Props> = () => {
  return (
    <div className="absolute inset-0">
      <img
        src="/images/splash_scene1.png"
        alt="Finding Home"
        className="w-full h-full object-cover"
      />
    </div>
  );
};
