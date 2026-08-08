import React from 'react';

interface Props {
  isActive: boolean;
}

export const SceneMatchMoveIn: React.FC<Props> = () => {
  return (
    <div className="absolute inset-0">
      <img
        src="/images/splash_scene3.png"
        alt="Match and Move In"
        className="w-full h-full object-cover"
      />
    </div>
  );
};
