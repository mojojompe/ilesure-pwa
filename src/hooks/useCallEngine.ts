import { useEffect, useState, useSyncExternalStore } from 'react';
import { getSocket } from '../api/socketService';
import {
  callService,
  FALLBACK_ICE,
  type CallEndedPayload,
  type CallSignalPayload,
  type IncomingCallPayload,
} from '../api/callService';
import {
  createCallSession,
  type CallSession,
  type CallSessionState,
  type SignallingPort,
} from '../lib/call/callSession';
import { browserPeerAdapter } from '../lib/call/browserPeerAdapter';

/**
 * One-to-one voice and video calling: the React face of the call-session core.
 *
 * The phase machine and the signalling ordering (media before negotiation, queued ICE
 * candidates, caller-only offers) live in ../lib/call/callSession.ts, shared byte-for-byte
 * with the mobile app and the web app; read the notes at the top of that file. This hook
 * only wires the browser media adapter and the socket signalling adapter into it.
 */

export type { CallPhase, MediaError, CallPeer } from '../lib/call/callSession';

export type CallState = Omit<CallSessionState<MediaStream>, 'frontCamera' | 'speakerOn'>;

const trace = (...args: unknown[]) => {
  if (import.meta.env.DEV) console.info('[call]', ...args);
};

/** The call:* socket contract, bound to the shared socket at subscribe time. */
const socketSignalling: SignallingPort = {
  initiate: (chatId, callType) => callService.initiate(chatId, callType),
  accept: (callId) => callService.accept(callId),
  decline: (callId, reason) => callService.decline(callId, reason),
  end: (callId, reason) => callService.end(callId, reason),
  sendOffer: (callId, sdp) => callService.sendOffer(callId, sdp as RTCSessionDescriptionInit),
  sendAnswer: (callId, sdp) => callService.sendAnswer(callId, sdp as RTCSessionDescriptionInit),
  sendIceCandidate: (callId, candidate) => callService.sendIceCandidate(callId, candidate as RTCIceCandidateInit),
  reportConnected: (callId) => callService.reportConnected(callId),
  subscribe(handlers) {
    const socket = getSocket();
    if (!socket) return () => {};

    const onIncoming = (payload: IncomingCallPayload) => handlers.incoming(payload);
    const onAccepted = (payload: { callId: string }) => handlers.accepted(payload);
    const onOffer = (payload: CallSignalPayload) => handlers.offer(payload);
    const onAnswer = (payload: CallSignalPayload) => handlers.answer(payload);
    const onIce = (payload: CallSignalPayload) => handlers.ice(payload);
    const onEnded = (payload: CallEndedPayload) => handlers.ended(payload);
    const onBusy = (payload?: { chatId?: string }) => handlers.busy(payload);
    const onError = (payload?: { message?: string }) => handlers.error(payload);

    socket.on('call:incoming', onIncoming);
    socket.on('call:accepted', onAccepted);
    socket.on('call:offer', onOffer);
    socket.on('call:answer', onAnswer);
    socket.on('call:ice', onIce);
    socket.on('call:ended', onEnded);
    socket.on('call:busy', onBusy);
    socket.on('call:error', onError);

    return () => {
      socket.off('call:incoming', onIncoming);
      socket.off('call:accepted', onAccepted);
      socket.off('call:offer', onOffer);
      socket.off('call:answer', onAnswer);
      socket.off('call:ice', onIce);
      socket.off('call:ended', onEnded);
      socket.off('call:busy', onBusy);
      socket.off('call:error', onError);
    };
  },
};

function createBrowserCallSession(): CallSession<MediaStream> {
  return createCallSession<MediaStream>({
    peer: browserPeerAdapter,
    signalling: socketSignalling,
    fetchIceConfig: () => callService.getIceConfig(),
    fallbackIce: FALLBACK_ICE,
    log: trace,
  });
}

/**
 * @param enabled  whether the engine should do anything at all. Calling is
 *   meaningless before sign-in, and running it there was actively harmful: the
 *   ICE fetch 401'd on the login screen and the socket poll ticked forever.
 */
export function useCallEngine(enabled: boolean = true) {
  const [session] = useState(createBrowserCallSession);
  const { frontCamera: _frontCamera, speakerOn: _speakerOn, ...state } = useSyncExternalStore(
    session.subscribe,
    session.getState
  );

  /**
   * Bumped when the shared socket appears.
   *
   * The socket is connected asynchronously after login, so on first render there is
   * nothing to attach listeners to. Without this the provider mounts, finds no socket,
   * and never hears an incoming call for the rest of the session.
   */
  const [socketEpoch, setSocketEpoch] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    if (getSocket()) return;
    const poll = setInterval(() => {
      if (getSocket()) setSocketEpoch((e) => e + 1);
    }, 500);
    return () => clearInterval(poll);
  }, [socketEpoch, enabled]);

  useEffect(() => {
    if (!enabled) return;
    if (!getSocket()) return;
    return session.connect();
  }, [session, socketEpoch, enabled]);

  /** Release the camera if the tab is closed mid-call. */
  useEffect(() => () => session.dispose(), [session]);

  const callState: CallState = state;
  return {
    ...callState,
    startCall: session.startCall,
    acceptCall: session.acceptCall,
    declineCall: session.declineCall,
    endCall: session.endCall,
    toggleMic: session.toggleMic,
    toggleCamera: session.toggleCamera,
  };
}

export default useCallEngine;
