import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createCallSession,
  type CallSession,
  type CallType,
  type IceCandidate,
  type IceConfigResult,
  type InitiateResult,
  type MediaConstraints,
  type PeerAdapter,
  type PeerConnectionEvents,
  type PeerConnectionPort,
  type SessionDescription,
  type SignallingHandlers,
  type SignallingPort,
} from './callSession';

/* -------------------------------------------------------------------------- */
/* Fakes                                                                      */
/* -------------------------------------------------------------------------- */

class FakeTrack {
  enabled = true;
  stopped = false;
  constructor(readonly kind: 'audio' | 'video') {}
  stop() {
    this.stopped = true;
  }
}

class FakeStream {
  constructor(readonly tracks: FakeTrack[]) {}
  getTracks() {
    return this.tracks;
  }
  getAudioTracks() {
    return this.tracks.filter((t) => t.kind === 'audio');
  }
  getVideoTracks() {
    return this.tracks.filter((t) => t.kind === 'video');
  }
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

/** A shared ordered log of everything the ports were asked to do. */
type Log = string[];

class FakeConnection implements PeerConnectionPort<FakeStream> {
  closed = false;
  addedCandidates: IceCandidate[] = [];
  remoteDescriptions: SessionDescription[] = [];
  failSetRemote = false;

  constructor(
    readonly config: unknown,
    readonly events: PeerConnectionEvents<FakeStream>,
    private readonly log: Log
  ) {}

  addTrack(track: FakeTrack) {
    this.log.push(`pc.addTrack:${track.kind}`);
  }
  async createOffer() {
    this.log.push('pc.createOffer');
    return { type: 'offer', sdp: 'local-offer' };
  }
  async createAnswer() {
    this.log.push('pc.createAnswer');
    return { type: 'answer', sdp: 'local-answer' };
  }
  async setLocalDescription(description: SessionDescription) {
    this.log.push(`pc.setLocal:${description.type}`);
  }
  async setRemoteDescription(description: SessionDescription) {
    this.log.push(`pc.setRemote:${description.type}`);
    if (this.failSetRemote) throw new Error('bad sdp');
    this.remoteDescriptions.push(description);
  }
  async addIceCandidate(candidate: IceCandidate) {
    this.log.push(`pc.addIce:${candidate.candidate}`);
    this.addedCandidates.push(candidate);
  }
  close() {
    this.closed = true;
    this.log.push('pc.close');
  }
}

class FakePeerAdapter implements PeerAdapter<FakeStream> {
  connections: FakeConnection[] = [];
  mediaRequests: MediaConstraints[] = [];
  /** Queue of pending getUserMedia results; tests resolve them explicitly or use autoMedia. */
  pendingMedia: ReturnType<typeof deferred<FakeStream>>[] = [];
  autoMedia = true;
  denyVideo = false;
  mediaErrorName: string | null = null;
  supported = true;
  speaker: boolean[] = [];
  audioStarted: CallType[] = [];
  audioStopped = 0;
  streams: FakeStream[] = [];

  constructor(private readonly log: Log) {}

  createPeerConnection(config: unknown, events: PeerConnectionEvents<FakeStream>) {
    this.log.push('pc.create');
    const connection = new FakeConnection(config, events, this.log);
    this.connections.push(connection);
    return connection;
  }

  isMediaSupported() {
    return this.supported;
  }

  getUserMedia(constraints: MediaConstraints): Promise<FakeStream> {
    this.log.push(`media.get:${constraints.video ? 'video' : 'audio'}`);
    this.mediaRequests.push(constraints);
    if (this.mediaErrorName) {
      return Promise.reject(Object.assign(new Error('nope'), { name: this.mediaErrorName }));
    }
    if (this.denyVideo && constraints.video) {
      return Promise.reject(Object.assign(new Error('denied'), { name: 'NotAllowedError' }));
    }
    const make = () => {
      const stream = new FakeStream(
        constraints.video ? [new FakeTrack('audio'), new FakeTrack('video')] : [new FakeTrack('audio')]
      );
      this.streams.push(stream);
      return stream;
    };
    if (this.autoMedia) return Promise.resolve(make());
    const d = deferred<FakeStream>();
    this.pendingMedia.push(d);
    return d.promise.then(() => make());
  }

  audioRoute = {
    start: (callType: CallType) => {
      this.audioStarted.push(callType);
    },
    stop: () => {
      this.audioStopped += 1;
    },
    setSpeaker: (on: boolean) => {
      this.speaker.push(on);
    },
  };

  switchCamera = (stream: FakeStream) => stream.getVideoTracks().length > 0;

  get pc() {
    return this.connections[this.connections.length - 1];
  }
}

class FakeSignalling implements SignallingPort {
  sent: { event: string; callId: string; arg?: unknown }[] = [];
  handlers: SignallingHandlers | null = null;
  initiateResult: InitiateResult = { ok: true, callId: 'call-1' };
  pendingInitiate: ReturnType<typeof deferred<InitiateResult>> | null = null;
  holdInitiate = false;

  constructor(private readonly log: Log) {}

  initiate(chatId: string, callType: CallType) {
    this.log.push(`sig.initiate:${chatId}:${callType}`);
    if (this.holdInitiate) {
      this.pendingInitiate = deferred<InitiateResult>();
      return this.pendingInitiate.promise;
    }
    return Promise.resolve(this.initiateResult);
  }
  private record(event: string, callId: string, arg?: unknown) {
    this.log.push(`sig.${event}`);
    this.sent.push({ event, callId, arg });
  }
  accept(callId: string) {
    this.record('accept', callId);
  }
  decline(callId: string, reason?: string) {
    this.record('decline', callId, reason);
  }
  end(callId: string, reason?: string) {
    this.record('end', callId, reason);
  }
  sendOffer(callId: string, sdp: SessionDescription) {
    this.record('offer', callId, sdp);
  }
  sendAnswer(callId: string, sdp: SessionDescription) {
    this.record('answer', callId, sdp);
  }
  sendIceCandidate(callId: string, candidate: IceCandidate) {
    this.record('ice', callId, candidate);
  }
  reportConnected(callId: string) {
    this.record('connected', callId);
  }
  subscribe(handlers: SignallingHandlers) {
    this.handlers = handlers;
    return () => {
      this.handlers = null;
    };
  }

  /** Simulates an inbound socket event. */
  get in(): SignallingHandlers {
    if (!this.handlers) throw new Error('not subscribed');
    return this.handlers;
  }

  events(name: string) {
    return this.sent.filter((s) => s.event === name);
  }
}

/* -------------------------------------------------------------------------- */
/* Harness                                                                    */
/* -------------------------------------------------------------------------- */

const PEER = { id: 'u2', fullName: 'Ada Obi', avatar: 'a.png' };
const INCOMING = {
  callId: 'call-9',
  chatId: 'chat-9',
  callType: 'video' as CallType,
  caller: { _id: 'u2', fullName: 'Ada Obi', avatar: 'a.png' },
};
const REMOTE_OFFER = { type: 'offer', sdp: 'remote-offer' };
const REMOTE_ANSWER = { type: 'answer', sdp: 'remote-answer' };
const cand = (n: number): IceCandidate => ({ candidate: `c${n}`, sdpMid: '0', sdpMLineIndex: 0 });

let log: Log;
let peer: FakePeerAdapter;
let sig: FakeSignalling;
let fetchIceConfig: ReturnType<typeof vi.fn<() => Promise<IceConfigResult | null>>>;
let session: CallSession<FakeStream>;

const flush = () => vi.advanceTimersByTimeAsync(0);

beforeEach(() => {
  vi.useFakeTimers();
  log = [];
  peer = new FakePeerAdapter(log);
  sig = new FakeSignalling(log);
  fetchIceConfig = vi.fn(async () => ({
    iceServers: [{ urls: 'turn:turn.example:3478', username: 'u', credential: 'p' }],
    turnConfigured: true,
  }));
  session = createCallSession<FakeStream>({
    peer,
    signalling: sig,
    fetchIceConfig,
    fallbackIce: { iceServers: [{ urls: 'stun:stun.example:19302' }] },
  });
  session.connect();
});

afterEach(() => {
  vi.useRealTimers();
});

async function dialAndGetAccepted(callType: CallType = 'video') {
  await session.startCall('chat-1', callType, PEER);
  sig.in.accepted({ callId: 'call-1' });
  await flush();
}

async function ringAndAccept() {
  sig.in.incoming(INCOMING);
  await session.acceptCall();
  await flush();
}

/* -------------------------------------------------------------------------- */
/* Tests                                                                      */
/* -------------------------------------------------------------------------- */

describe('caller flow', () => {
  it('acquires media before dialling, offers only after accept, with tracks attached first', async () => {
    await session.startCall('chat-1', 'video', PEER);
    expect(session.getState()).toMatchObject({ phase: 'outgoing', callId: 'call-1', isCaller: true, peer: PEER });
    expect(log.indexOf('media.get:video')).toBeLessThan(log.indexOf('sig.initiate:chat-1:video'));
    expect(sig.events('offer')).toHaveLength(0);
    expect(fetchIceConfig).not.toHaveBeenCalled();

    sig.in.accepted({ callId: 'call-1' });
    expect(session.getState().phase).toBe('connecting');
    await flush();

    expect(fetchIceConfig).toHaveBeenCalledTimes(1);
    expect(peer.pc.config).toEqual({ iceServers: [{ urls: 'turn:turn.example:3478', username: 'u', credential: 'p' }] });
    const order = log.filter((l) => l.startsWith('pc.') || l === 'sig.offer');
    expect(order).toEqual([
      'pc.create',
      'pc.addTrack:audio',
      'pc.addTrack:video',
      'pc.createOffer',
      'pc.setLocal:offer',
      'sig.offer',
    ]);
  });

  it('goes active on connected, reports it, and counts duration', async () => {
    await dialAndGetAccepted();
    sig.in.answer({ callId: 'call-1', sdp: REMOTE_ANSWER });
    await flush();
    peer.pc.events.onConnectionStateChange('connected');
    expect(session.getState().phase).toBe('active');
    expect(sig.events('connected')).toHaveLength(1);
    await vi.advanceTimersByTimeAsync(3000);
    expect(session.getState().durationSeconds).toBe(3);
  });

  it('routes audio: speaker on for video calls, earpiece for voice', async () => {
    await session.startCall('chat-1', 'audio', PEER);
    expect(peer.audioStarted).toEqual(['audio']);
    expect(session.getState().speakerOn).toBe(false);
    session.endCall();
    await session.startCall('chat-1', 'video', PEER);
    expect(session.getState().speakerOn).toBe(true);
  });
});

describe('ICE candidate queue (note 2)', () => {
  it('caller: candidates before the answer are queued, then flushed in order after it', async () => {
    await dialAndGetAccepted();
    sig.in.ice({ callId: 'call-1', candidate: cand(1) });
    sig.in.ice({ callId: 'call-1', candidate: cand(2) });
    await flush();
    expect(peer.pc.addedCandidates).toEqual([]);

    sig.in.answer({ callId: 'call-1', sdp: REMOTE_ANSWER });
    await flush();
    expect(peer.pc.addedCandidates.map((c) => c.candidate)).toEqual(['c1', 'c2']);
    expect(log.indexOf('pc.setRemote:answer')).toBeLessThan(log.indexOf('pc.addIce:c1'));

    sig.in.ice({ callId: 'call-1', candidate: cand(3) });
    await flush();
    expect(peer.pc.addedCandidates.map((c) => c.candidate)).toEqual(['c1', 'c2', 'c3']);
  });

  it('callee: candidates arriving before the offer are queued and flushed before the answer', async () => {
    sig.in.incoming(INCOMING);
    sig.in.ice({ callId: 'call-9', candidate: cand(1) });
    await session.acceptCall();
    sig.in.ice({ callId: 'call-9', candidate: cand(2) });
    sig.in.offer({ callId: 'call-9', sdp: REMOTE_OFFER });
    await flush();

    const order = log.filter((l) => l.startsWith('pc.') || l === 'sig.answer');
    expect(order).toEqual([
      'pc.create',
      'pc.addTrack:audio',
      'pc.addTrack:video',
      'pc.setRemote:offer',
      'pc.addIce:c1',
      'pc.addIce:c2',
      'pc.createAnswer',
      'pc.setLocal:answer',
      'sig.answer',
    ]);
  });

  it('a rejected candidate does not stop the rest of the queue', async () => {
    await dialAndGetAccepted();
    sig.in.ice({ callId: 'call-1', candidate: cand(1) });
    sig.in.ice({ callId: 'call-1', candidate: cand(2) });
    const original = peer.pc.addIceCandidate.bind(peer.pc);
    let first = true;
    peer.pc.addIceCandidate = async (c) => {
      if (first) {
        first = false;
        throw new Error('bad candidate');
      }
      return original(c);
    };
    sig.in.answer({ callId: 'call-1', sdp: REMOTE_ANSWER });
    await flush();
    expect(peer.pc.addedCandidates.map((c) => c.candidate)).toEqual(['c2']);
  });
});

describe('offer held until media settles (note 1)', () => {
  it('an offer arriving while getUserMedia is pending is answered only after media resolves', async () => {
    peer.autoMedia = false;
    sig.in.incoming(INCOMING);
    const accepting = session.acceptCall();
    expect(session.getState().phase).toBe('connecting');

    sig.in.offer({ callId: 'call-9', sdp: REMOTE_OFFER });
    await flush();
    expect(peer.connections).toHaveLength(0);
    expect(sig.events('answer')).toHaveLength(0);

    peer.pendingMedia[0].resolve(undefined as never);
    await accepting;
    await flush();

    expect(log.indexOf('sig.accept')).toBeLessThan(log.indexOf('pc.create'));
    expect(log.slice(log.indexOf('pc.create'), log.indexOf('pc.create') + 3)).toEqual([
      'pc.create',
      'pc.addTrack:audio',
      'pc.addTrack:video',
    ]);
    expect(sig.events('answer')).toHaveLength(1);
  });

  it('an offer reaching a device that is still ringing is held, not answered', async () => {
    sig.in.incoming(INCOMING);
    sig.in.offer({ callId: 'call-9', sdp: REMOTE_OFFER });
    await flush();
    expect(peer.mediaRequests).toHaveLength(0);
    expect(sig.events('answer')).toHaveLength(0);

    await session.acceptCall();
    await flush();
    expect(sig.events('answer')).toHaveLength(1);
  });

  it('camera is not requested while ringing, only on accept', async () => {
    sig.in.incoming(INCOMING);
    expect(session.getState()).toMatchObject({ phase: 'incoming', callId: 'call-9', cameraEnabled: true });
    expect(peer.mediaRequests).toHaveLength(0);
    await session.acceptCall();
    expect(peer.mediaRequests).toHaveLength(1);
    expect(sig.events('accept')).toHaveLength(1);
  });
});

describe('busy / ended / timeout transitions', () => {
  it('call:busy while dialling ends with the busy reason, and the PEER_BUSY ack does not finish twice', async () => {
    sig.holdInitiate = true;
    const dialling = session.startCall('chat-1', 'audio', PEER);
    await flush();
    sig.in.busy({ chatId: 'chat-1' });
    expect(session.getState()).toMatchObject({ phase: 'ended', endedReason: 'They are on another call', peer: PEER });
    sig.pendingInitiate!.resolve({ ok: false, error: 'PEER_BUSY' });
    await dialling;
    expect(session.getState().endedReason).toBe('They are on another call');
    expect(sig.events('end')).toHaveLength(0);
  });

  it('call:busy with no call in progress is ignored', () => {
    sig.in.busy({ chatId: 'chat-1' });
    expect(session.getState().phase).toBe('idle');
  });

  it('call:busy for a different chat is ignored', async () => {
    sig.holdInitiate = true;
    void session.startCall('chat-1', 'audio', PEER);
    await flush();
    sig.in.busy({ chatId: 'chat-2' });
    expect(session.getState().phase).toBe('outgoing');
  });

  it('ring timeout (call:ended missed) shows "No answer", then returns to idle after the linger', async () => {
    await session.startCall('chat-1', 'video', PEER);
    sig.in.ended({ callId: 'call-1', status: 'missed' });
    expect(session.getState()).toMatchObject({ phase: 'ended', endedReason: 'No answer', peer: PEER, callType: 'video' });
    await vi.advanceTimersByTimeAsync(2499);
    expect(session.getState().phase).toBe('ended');
    await vi.advanceTimersByTimeAsync(1);
    expect(session.getState()).toMatchObject({ phase: 'idle', peer: null, callId: null });
  });

  it('keeps relayAvailable across the reset', async () => {
    fetchIceConfig.mockResolvedValueOnce({ iceServers: [{ urls: 'stun:x' }], turnConfigured: false });
    await dialAndGetAccepted();
    expect(session.getState().relayAvailable).toBe(false);
    session.endCall();
    await vi.advanceTimersByTimeAsync(3000);
    expect(session.getState()).toMatchObject({ phase: 'idle', relayAvailable: false });
  });

  it('initiate TIMEOUT and unknown errors map to readable reasons', async () => {
    sig.initiateResult = { ok: false, error: 'TIMEOUT' };
    await session.startCall('chat-1', 'audio', PEER);
    expect(session.getState().endedReason).toBe('Could not reach the server');
    sig.initiateResult = { ok: false, error: 'SOMETHING_NEW' };
    await session.startCall('chat-1', 'audio', PEER);
    expect(session.getState().endedReason).toBe('Call failed');
  });

  it('ICE failure ends the call and tells the server why', async () => {
    await dialAndGetAccepted();
    peer.pc.events.onConnectionStateChange('failed');
    expect(sig.events('end')).toEqual([{ event: 'end', callId: 'call-1', arg: 'ice_failed' }]);
    expect(session.getState()).toMatchObject({ phase: 'ended', endedReason: 'Connection failed' });
  });

  it('a negotiation error ends the call instead of hanging on "connecting"', async () => {
    await dialAndGetAccepted();
    peer.pc.failSetRemote = true;
    sig.in.answer({ callId: 'call-1', sdp: REMOTE_ANSWER });
    await flush();
    expect(sig.events('end')).toEqual([{ event: 'end', callId: 'call-1', arg: 'negotiation_failed' }]);
    expect(session.getState()).toMatchObject({ phase: 'ended', endedReason: 'Connection failed' });
  });

  it('call:error is ignored when idle and ends a live call with its message', async () => {
    sig.in.error({ message: 'boom' });
    expect(session.getState().phase).toBe('idle');
    sig.in.incoming(INCOMING);
    sig.in.error({ message: 'This call is no longer ringing' });
    expect(session.getState()).toMatchObject({ phase: 'ended', endedReason: 'This call is no longer ringing' });
  });
});

describe('duplicate and late events', () => {
  it('duplicate call:accepted sends one offer', async () => {
    await dialAndGetAccepted();
    sig.in.accepted({ callId: 'call-1' });
    await flush();
    expect(sig.events('offer')).toHaveLength(1);
    expect(peer.connections).toHaveLength(1);
  });

  it('duplicate call:answer applies the remote description once', async () => {
    await dialAndGetAccepted();
    sig.in.answer({ callId: 'call-1', sdp: REMOTE_ANSWER });
    sig.in.answer({ callId: 'call-1', sdp: REMOTE_ANSWER });
    await flush();
    expect(peer.pc.remoteDescriptions).toHaveLength(1);
    expect(session.getState().phase).toBe('connecting');
  });

  it('duplicate call:offer answers once', async () => {
    await ringAndAccept();
    sig.in.offer({ callId: 'call-9', sdp: REMOTE_OFFER });
    sig.in.offer({ callId: 'call-9', sdp: REMOTE_OFFER });
    await flush();
    expect(sig.events('answer')).toHaveLength(1);
    expect(peer.connections).toHaveLength(1);
  });

  it('the caller ignores an offer (only the caller offers)', async () => {
    await dialAndGetAccepted();
    sig.in.offer({ callId: 'call-1', sdp: REMOTE_OFFER });
    await flush();
    expect(sig.events('answer')).toHaveLength(0);
  });

  it('events for another call id are ignored', async () => {
    await dialAndGetAccepted();
    sig.in.answer({ callId: 'other', sdp: REMOTE_ANSWER });
    sig.in.ice({ callId: 'other', candidate: cand(1) });
    sig.in.ended({ callId: 'other', status: 'ended' });
    await flush();
    expect(peer.pc.remoteDescriptions).toHaveLength(0);
    expect(session.getState().phase).toBe('connecting');
  });

  it('late signalling after the call ended is ignored', async () => {
    await dialAndGetAccepted();
    session.endCall();
    const before = [...log];
    sig.in.accepted({ callId: 'call-1' });
    sig.in.answer({ callId: 'call-1', sdp: REMOTE_ANSWER });
    sig.in.ice({ callId: 'call-1', candidate: cand(1) });
    sig.in.ended({ callId: 'call-1', status: 'missed' });
    await flush();
    expect(log).toEqual(before);
    expect(session.getState().endedReason).toBe('Call ended');
  });

  it('a re-delivered ring for the same call is not declined as busy', () => {
    sig.in.incoming(INCOMING);
    sig.in.incoming(INCOMING);
    expect(sig.events('decline')).toHaveLength(0);
    expect(session.getState().phase).toBe('incoming');
  });

  it('a second call while busy is declined with reason busy, current call untouched', async () => {
    await dialAndGetAccepted();
    sig.in.incoming({ ...INCOMING, callId: 'call-2' });
    expect(sig.events('decline')).toEqual([{ event: 'decline', callId: 'call-2', arg: 'busy' }]);
    expect(session.getState()).toMatchObject({ phase: 'connecting', callId: 'call-1' });
  });

  it('an incoming call while still waiting for our own call id is declined as busy', async () => {
    sig.holdInitiate = true;
    void session.startCall('chat-1', 'audio', PEER);
    await flush();
    sig.in.incoming(INCOMING);
    expect(sig.events('decline')).toEqual([{ event: 'decline', callId: 'call-9', arg: 'busy' }]);
    expect(session.getState().phase).toBe('outgoing');
  });

  it('accepting twice acquires media and emits call:accept once', async () => {
    sig.in.incoming(INCOMING);
    await Promise.all([session.acceptCall(), session.acceptCall()]);
    expect(peer.mediaRequests).toHaveLength(1);
    expect(sig.events('accept')).toHaveLength(1);
  });

  it('startCall is refused while another call is being dialled', async () => {
    sig.holdInitiate = true;
    void session.startCall('chat-1', 'audio', PEER);
    await flush();
    await session.startCall('chat-2', 'audio', PEER);
    expect(log.filter((l) => l.startsWith('sig.initiate'))).toHaveLength(1);
  });

  it('a device still ringing stops quietly when the call is answered on another device', () => {
    sig.in.incoming(INCOMING);
    sig.in.accepted({ callId: 'call-9' });
    expect(session.getState()).toMatchObject({ phase: 'ended', endedReason: 'Answered on another device' });
    // No decline or end: either would hang up the conversation now running on the other device.
    expect(sig.sent).toHaveLength(0);
    expect(peer.mediaRequests).toHaveLength(0);
  });

  it('the device that accepted is unaffected by its own accept being echoed back', async () => {
    await ringAndAccept();
    sig.in.accepted({ callId: 'call-9' });
    await flush();
    expect(session.getState()).toMatchObject({ phase: 'connecting', callId: 'call-9' });
    expect(sig.events('offer')).toHaveLength(0);
  });

  it('call:error about another call leaves the current call alone', async () => {
    await dialAndGetAccepted();
    sig.in.error({ callId: 'call-old', message: 'This call is no longer ringing' });
    expect(session.getState()).toMatchObject({ phase: 'connecting', callId: 'call-1' });
    sig.in.error({ callId: 'call-1', message: 'Something went wrong with the call.' });
    expect(session.getState()).toMatchObject({ phase: 'ended', endedReason: 'Something went wrong with the call.' });
  });

  it('a peer whose account cannot take calls is explained, not reported as a generic failure', async () => {
    sig.initiateResult = { ok: false, error: 'PEER_UNAVAILABLE' };
    await session.startCall('chat-1', 'audio', PEER);
    expect(session.getState()).toMatchObject({ phase: 'ended', endedReason: 'This person cannot take calls right now' });
  });
});

describe('cleanup on end', () => {
  it('endCall notifies the server, closes the connection, stops tracks and audio routing', async () => {
    await dialAndGetAccepted();
    const connection = peer.pc;
    const stream = peer.streams[0];
    session.endCall();
    expect(sig.events('end')).toEqual([{ event: 'end', callId: 'call-1', arg: undefined }]);
    expect(connection.closed).toBe(true);
    expect(stream.tracks.every((t) => t.stopped)).toBe(true);
    expect(peer.audioStopped).toBe(1);
    expect(session.getState()).toMatchObject({
      phase: 'ended',
      endedReason: 'Call ended',
      callId: null,
      localStream: null,
      remoteStream: null,
      peer: PEER,
      isCaller: true,
    });
  });

  it('declineCall notifies the server and ends', () => {
    sig.in.incoming(INCOMING);
    session.declineCall();
    expect(sig.events('decline')).toEqual([{ event: 'decline', callId: 'call-9', arg: undefined }]);
    expect(session.getState().endedReason).toBe('Call declined');
  });

  it('endCall with nothing in progress does nothing', () => {
    session.endCall();
    expect(session.getState().phase).toBe('idle');
    expect(sig.sent).toHaveLength(0);
  });

  it('hanging up while the camera prompt is open stops the late stream and never dials', async () => {
    peer.autoMedia = false;
    const dialling = session.startCall('chat-1', 'video', PEER);
    session.endCall();
    peer.pendingMedia[0].resolve(undefined as never);
    await dialling;
    expect(peer.streams[0].tracks.every((t) => t.stopped)).toBe(true);
    expect(log.some((l) => l.startsWith('sig.initiate'))).toBe(false);
    expect(session.getState().localStream).toBeNull();
  });

  it('hanging up while the server places the call cancels it on the server', async () => {
    sig.holdInitiate = true;
    const dialling = session.startCall('chat-1', 'audio', PEER);
    await flush();
    session.endCall();
    sig.pendingInitiate!.resolve({ ok: true, callId: 'call-1' });
    await dialling;
    expect(sig.events('end')).toEqual([{ event: 'end', callId: 'call-1', arg: undefined }]);
    expect(session.getState()).toMatchObject({ phase: 'ended', callId: null });
    // The line is free again.
    sig.holdInitiate = false;
    await session.startCall('chat-1', 'audio', PEER);
    expect(session.getState()).toMatchObject({ phase: 'outgoing', callId: 'call-1' });
  });

  it('peer-connection events after teardown are ignored', async () => {
    await dialAndGetAccepted();
    const connection = peer.pc;
    session.endCall();
    connection.events.onConnectionStateChange('connected');
    connection.events.onIceCandidate(cand(1));
    expect(session.getState().phase).toBe('ended');
    expect(sig.events('connected')).toHaveLength(0);
    expect(sig.events('ice')).toHaveLength(0);
  });

  it('dispose releases media but leaves the session usable', async () => {
    await dialAndGetAccepted();
    const stream = peer.streams[0];
    session.dispose();
    expect(stream.tracks.every((t) => t.stopped)).toBe(true);
    expect(peer.pc.closed).toBe(true);
  });
});

describe('media', () => {
  it('a refused camera downgrades a video call to audio-only', async () => {
    peer.denyVideo = true;
    await session.startCall('chat-1', 'video', PEER);
    expect(session.getState()).toMatchObject({ cameraEnabled: false, mediaError: 'denied' });
    expect(session.getState().localStream?.getVideoTracks()).toHaveLength(0);
    expect(session.getState().phase).toBe('outgoing');
  });

  it('a missing device is reported as not-found and the call still dials', async () => {
    peer.mediaErrorName = 'NotFoundError';
    await session.startCall('chat-1', 'audio', PEER);
    expect(session.getState()).toMatchObject({ mediaError: 'not-found', localStream: null, callId: 'call-1' });
  });

  it('no getUserMedia at all is reported as unsupported', async () => {
    peer.supported = false;
    await session.startCall('chat-1', 'audio', PEER);
    expect(session.getState().mediaError).toBe('unsupported');
    expect(peer.mediaRequests).toHaveLength(0);
  });

  it('toggles mic, camera, speaker and camera facing', async () => {
    await session.startCall('chat-1', 'video', PEER);
    const stream = peer.streams[0];
    session.toggleMic();
    expect(stream.getAudioTracks()[0].enabled).toBe(false);
    expect(session.getState().micEnabled).toBe(false);
    session.toggleCamera();
    expect(stream.getVideoTracks()[0].enabled).toBe(false);
    expect(session.getState().cameraEnabled).toBe(false);
    session.toggleSpeaker();
    expect(session.getState().speakerOn).toBe(false);
    expect(peer.speaker[peer.speaker.length - 1]).toBe(false);
    session.switchCamera();
    expect(session.getState().frontCamera).toBe(false);
  });
});

describe('ICE configuration', () => {
  it('is fetched lazily, once, and reused across calls', async () => {
    await dialAndGetAccepted();
    session.endCall();
    await vi.advanceTimersByTimeAsync(3000);
    sig.initiateResult = { ok: true, callId: 'call-2' };
    await session.startCall('chat-1', 'audio', PEER);
    sig.in.accepted({ callId: 'call-2' });
    await flush();
    expect(fetchIceConfig).toHaveBeenCalledTimes(1);
  });

  it('falls back to STUN when the fetch fails, and retries on the next call', async () => {
    fetchIceConfig.mockResolvedValueOnce(null);
    await dialAndGetAccepted();
    expect(peer.pc.config).toEqual({ iceServers: [{ urls: 'stun:stun.example:19302' }] });
    session.endCall();
    sig.initiateResult = { ok: true, callId: 'call-2' };
    await session.startCall('chat-1', 'audio', PEER);
    sig.in.accepted({ callId: 'call-2' });
    await flush();
    expect(fetchIceConfig).toHaveBeenCalledTimes(2);
    expect(peer.pc.config).toEqual({ iceServers: [{ urls: 'turn:turn.example:3478', username: 'u', credential: 'p' }] });
  });
});

describe('subscription', () => {
  it('notifies listeners on change and stops after unsubscribe', async () => {
    const listener = vi.fn();
    const off = session.subscribe(listener);
    sig.in.incoming(INCOMING);
    expect(listener).toHaveBeenCalled();
    off();
    listener.mockClear();
    session.declineCall();
    expect(listener).not.toHaveBeenCalled();
  });
});
