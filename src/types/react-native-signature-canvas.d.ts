declare module 'react-native-signature-canvas' {
  import * as React from 'react';

  interface SignatureCanvasProps {
    ref?: React.Ref<any>;
    onOK?: (signature: string) => void;
    onEmpty?: () => void;
    onClear?: () => void;
    onBegin?: () => void;
    onEnd?: () => void;
    autoClear?: boolean;
    descriptionText?: string;
    clearText?: string;
    confirmText?: string;
    webStyle?: string;
    backgroundColor?: string;
    penColor?: string;
    dataURL?: string;
    imageType?: 'image/png' | 'image/jpeg' | 'image/svg+xml';
    minWidth?: number;
    maxWidth?: number;
    minDistance?: number;
    dotSize?: number | ((() => number));
    throttle?: number;
    velocityFilterWeight?: number;
    customHtml?: (() => string) | string;
    style?: any;
  }

  export default class SignatureScreen extends React.Component<SignatureCanvasProps> {
    clearSignature(): void;
    readSignature(): void;
    changePenColor(color: string): void;
    undo(): void;
    draw(data: string): void;
    getData(): string;
  }
}
