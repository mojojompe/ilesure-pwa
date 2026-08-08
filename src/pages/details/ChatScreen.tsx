import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { AppShell } from '../../components/layout/AppShell';
import { 
  ArrowRight01Icon, 
  CallIcon, 
  Home01Icon, 
  Attachment01Icon, 
  Image01Icon, 
  File01Icon,
  Cancel01Icon,
  Video01Icon,
  MusicNote01Icon,
  ArrowTurnBackwardIcon
} from '@hugeicons/react';
import { chatService, ChatMessage } from '../../api/chatService';
import { useAuthStore } from '../../stores/authStore';
import { clsx } from 'clsx';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

// Mocking chat info that would usually come from the chat service or route state
interface ChatInfo {
  name: string;
  isOnline: boolean;
  phone?: string;
  propertyTitle?: string;
  type?: 'agent' | 'student';
}

export function ChatScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false);
  
  const [chatInfo, setChatInfo] = useState<ChatInfo>({
    name: 'Loading...',
    isOnline: false
  });
  
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        if (!id) return;
        setLoading(true);
        const response = await chatService.getMessages(id);
        
        // Mocking chat info
        setChatInfo({
          name: 'Jane Doe',
          isOnline: true,
          phone: '+2348000000000',
          propertyTitle: '2 Bedroom Flat in Yaba',
          type: 'agent'
        });

        if (response.success) {
          // Add some mock advanced messages for UI testing
          const mockAdvanced: ChatMessage[] = [
            {
              _id: 'img1',
              text: 'Here is the floor plan.',
              senderId: 'partner123',
              createdAt: new Date(Date.now() - 100000).toISOString(),
              type: 'image',
              fileUrl: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&q=80',
            } as any,
            {
              _id: 'doc1',
              text: '',
              senderId: user?.id || 'me',
              createdAt: new Date(Date.now() - 50000).toISOString(),
              type: 'file',
              fileName: 'Tenancy_Agreement.pdf',
              fileUrl: '#'
            } as any,
            {
              _id: 'reply1',
              text: 'Looks great! I will sign it today.',
              senderId: 'partner123',
              createdAt: new Date(Date.now() - 10000).toISOString(),
              replyTo: 'doc1',
              replyPreview: 'Tenancy_Agreement.pdf'
            } as any
          ];
          
          setMessages([...response.data.messages, ...mockAdvanced].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()));
        }
      } catch (error) {
        console.error('Failed to fetch messages', error);
      } finally {
        setLoading(false);
        setTimeout(scrollToBottom, 100);
      }
    };
    fetchMessages();
  }, [id, user?.id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!text.trim() && !replyingTo) return;
    
    setIsSending(true);
    const tempMsg: any = {
      _id: Date.now().toString(),
      text,
      senderId: user?.id || '',
      createdAt: new Date().toISOString(),
      replyTo: replyingTo?._id,
      replyPreview: replyingTo?.text || replyingTo?.fileName || (replyingTo?.type === 'image' ? 'Image' : undefined)
    };
    
    setMessages(prev => [...prev, tempMsg]);
    setText('');
    setReplyingTo(null);
    setTimeout(scrollToBottom, 100);
    
    try {
      await chatService.sendMessage(id || '', tempMsg.text);
    } catch (error) {
      console.error('Failed to send message', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleMessageLongPress = (msg: ChatMessage) => {
    // In a real app, this would use a native-like action sheet. For PWA, we'll just set it to reply on click for simplicity
    setReplyingTo(msg);
  };

  return (
    <AppShell hideTabBar>
      <div className="flex flex-col h-full bg-background relative overflow-hidden">
        
        {/* Custom Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-surface border-b border-borderLight z-20">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate(-1)} 
              className="w-10 h-10 flex items-center justify-center text-textPrimary active:bg-surfaceLight rounded-full transition-colors -ml-2"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            
            <div 
              className="flex items-center gap-3 cursor-pointer active:opacity-70 transition-opacity"
              onClick={() => setShowProfileModal(true)}
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                  <span className="text-white font-bold">{chatInfo.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</span>
                </div>
                {chatInfo.isOnline && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-surface" />
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold text-textPrimary">{chatInfo.name}</span>
                <span className="text-[11px] text-textSecondary">{chatInfo.isOnline ? 'Online' : 'Offline'}</span>
              </div>
            </div>
          </div>
          
          <button 
            onClick={() => chatInfo.phone && window.open(`tel:${chatInfo.phone}`)}
            className={clsx("w-10 h-10 flex items-center justify-center rounded-full active:bg-surfaceLight transition-colors", chatInfo.phone ? "text-primary" : "text-textTertiary")}
          >
            <CallIcon size={22} />
          </button>
        </div>

        {/* Property Banner */}
        {chatInfo.propertyTitle && (
          <div className="flex items-center gap-2 px-4 py-2.5 bg-[#FFF0E6] border-b border-borderLight z-10">
            <Home01Icon size={16} className="text-primary" />
            <span className="text-sm text-primary font-medium truncate">{chatInfo.propertyTitle}</span>
          </div>
        )}
        
        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          {loading ? (
            <div className="text-center text-sm text-textSecondary mt-8">Loading messages...</div>
          ) : messages.length === 0 ? (
            <div className="text-center text-sm text-textSecondary mt-8">No messages yet. Say hi!</div>
          ) : (
            messages.map(msg => {
              const isMe = msg.senderId === user?.id;
              const isDeleted = (msg as any).isDeleted;
              
              return (
                <div 
                  key={msg._id} 
                  className={clsx(
                    "flex flex-col max-w-[80%]",
                    isMe ? "self-end items-end" : "self-start items-start",
                    isDeleted && "opacity-70"
                  )}
                >
                  <div 
                    onClick={() => handleMessageLongPress(msg)}
                    className={clsx(
                      "px-3.5 py-2.5 rounded-[18px] text-sm leading-relaxed relative flex flex-col cursor-pointer active:scale-[0.98] transition-transform",
                      isMe 
                        ? "bg-primary text-white rounded-br-sm shadow-[0_2px_5px_rgba(107,79,58,0.2)]" 
                        : "bg-surface border border-borderLight text-textPrimary rounded-bl-sm shadow-[0_2px_5px_rgba(0,0,0,0.02)]"
                    )}
                  >
                    {/* Reply Preview */}
                    {(msg as any).replyPreview && (
                      <div className={clsx(
                        "pl-2 py-1 mb-1.5 border-l-2 rounded-r overflow-hidden",
                        isMe ? "border-white/50 bg-black/10" : "border-primary bg-primary/5"
                      )}>
                        <span className={clsx("text-xs truncate block", isMe ? "text-white/80" : "text-textSecondary")}>
                          {(msg as any).replyPreview}
                        </span>
                      </div>
                    )}

                    {/* Image Attachment */}
                    {(msg as any).type === 'image' && (msg as any).fileUrl && (
                      <div className="w-[200px] h-[200px] mb-2 rounded-xl overflow-hidden bg-black/10">
                        <img src={(msg as any).fileUrl} alt="Attachment" className="w-full h-full object-cover" />
                      </div>
                    )}

                    {/* File Attachment */}
                    {['file', 'video', 'audio'].includes((msg as any).type) && (msg as any).fileUrl && (
                      <div className={clsx("flex items-center gap-2 mb-2 p-2 rounded-xl", isMe ? "bg-black/10" : "bg-primary/5")}>
                        {((msg as any).type === 'video') ? <Video01Icon size={24} className={isMe ? "text-white" : "text-primary"} /> :
                         ((msg as any).type === 'audio') ? <MusicNote01Icon size={24} className={isMe ? "text-white" : "text-primary"} /> :
                         <File01Icon size={24} className={isMe ? "text-white" : "text-primary"} />}
                        <span className={clsx("text-sm font-semibold truncate max-w-[140px]", isMe ? "text-white" : "text-primary")}>
                          {(msg as any).fileName || 'Attachment'}
                        </span>
                      </div>
                    )}

                    {msg.text && (
                      <span>{msg.text}</span>
                    )}
                    
                    <div className="flex items-center justify-end gap-1 mt-1">
                      <span className={clsx("text-[10px]", isMe ? "text-white/70" : "text-textTertiary")}>
                        {format(new Date(msg.createdAt), 'h:mm a')}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          
          {partnerTyping && (
            <div className="self-start px-4 py-2 rounded-full bg-surfaceLight border border-borderLight flex items-center gap-1 mt-2">
              <span className="text-xs text-textSecondary italic">{chatInfo.name} is typing...</span>
            </div>
          )}
          
          <div ref={messagesEndRef} className="h-2" />
        </div>
        
        {/* Input Area */}
        <div className="bg-surface border-t border-borderLight z-20 pb-safe-bottom">
          {replyingTo && (
            <div className="flex items-center justify-between px-4 py-2 bg-surfaceLight border-b border-borderLight">
              <div className="flex items-center gap-2 overflow-hidden flex-1">
                <ArrowTurnBackwardIcon size={16} className="text-primary shrink-0" />
                <span className="text-sm text-textSecondary truncate">
                  Replying to: {replyingTo.text || ((replyingTo as any).type === 'image' ? 'Image' : 'Attachment')}
                </span>
              </div>
              <button onClick={() => setReplyingTo(null)} className="p-1">
                <Cancel01Icon size={20} className="text-textTertiary" />
              </button>
            </div>
          )}
          
          <div className="p-3 flex items-center gap-2">
            <button 
              onClick={() => setShowAttachmentMenu(true)}
              className="w-10 h-10 flex items-center justify-center text-textTertiary active:bg-surfaceLight rounded-full transition-colors shrink-0"
            >
              <Attachment01Icon size={22} />
            </button>
            
            <div className="flex-1 bg-surfaceLight rounded-full border border-borderLight px-4 py-2.5 flex items-center">
              <input 
                type="text" 
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type a message..."
                className="flex-1 bg-transparent outline-none text-sm text-textPrimary placeholder:text-textSecondary"
              />
            </div>
            
            <button 
              onClick={handleSend}
              disabled={isSending || (!text.trim() && !replyingTo)}
              className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white shrink-0 disabled:opacity-50 transition-all active:scale-95 shadow-[0_2px_8px_rgba(107,79,58,0.25)]"
            >
              {isSending ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <ArrowRight01Icon size={20} />
              )}
            </button>
          </div>
        </div>

        {/* Attachment Menu Modal */}
        <AnimatePresence>
          {showAttachmentMenu && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/50 z-40"
                onClick={() => setShowAttachmentMenu(false)}
              />
              <motion.div 
                initial={{ y: 200, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 200, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="absolute bottom-0 left-0 right-0 bg-surface rounded-t-[24px] p-6 z-50 pb-safe-bottom"
              >
                <h3 className="text-lg font-bold text-textPrimary mb-4 text-center">Send Attachment</h3>
                <div className="space-y-2">
                  <button className="w-full flex items-center gap-3 p-4 rounded-xl active:bg-surfaceLight transition-colors" onClick={() => setShowAttachmentMenu(false)}>
                    <Image01Icon size={24} className="text-primary" />
                    <span className="text-base font-medium text-textPrimary">Photo or Video</span>
                  </button>
                  <button className="w-full flex items-center gap-3 p-4 rounded-xl active:bg-surfaceLight transition-colors" onClick={() => setShowAttachmentMenu(false)}>
                    <File01Icon size={24} className="text-primary" />
                    <span className="text-base font-medium text-textPrimary">Document or Audio</span>
                  </button>
                </div>
                <button 
                  className="w-full mt-4 p-4 rounded-xl bg-surfaceLight text-textSecondary font-bold active:opacity-70 transition-opacity"
                  onClick={() => setShowAttachmentMenu(false)}
                >
                  Cancel
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Profile Modal */}
        <AnimatePresence>
          {showProfileModal && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/50 z-40"
                onClick={() => setShowProfileModal(false)}
              />
              <motion.div 
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="absolute bottom-0 left-0 right-0 bg-surface rounded-t-[32px] p-8 z-50 flex flex-col items-center pb-safe-bottom"
              >
                <div className="w-12 h-1.5 bg-borderLight rounded-full mb-6" />
                <button 
                  className="absolute top-6 right-6 p-2 text-textSecondary"
                  onClick={() => setShowProfileModal(false)}
                >
                  <Cancel01Icon size={24} />
                </button>
                
                <div className="w-20 h-20 rounded-full bg-accent flex items-center justify-center mb-4">
                  <span className="text-3xl font-bold text-white">{chatInfo.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</span>
                </div>
                
                <h2 className="text-2xl font-black text-textPrimary mb-1">{chatInfo.name}</h2>
                <p className="text-sm text-textSecondary mb-6">
                  {chatInfo.type === 'agent' ? 'Landlord / Agent' : 'Student / Individual'}
                </p>
                
                {chatInfo.phone ? (
                  <div className="w-full flex items-center justify-center gap-2 mb-6 p-4 bg-surfaceLight rounded-xl border border-borderLight">
                    <CallIcon size={20} className="text-textSecondary" />
                    <span className="text-base font-medium text-textPrimary">{chatInfo.phone}</span>
                  </div>
                ) : (
                  <p className="text-sm text-textTertiary italic mb-6">Phone number not available</p>
                )}
                
                {chatInfo.phone && (
                  <button 
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-primary text-white shadow-[0_4px_12px_rgba(107,79,58,0.25)] active:scale-[0.98] transition-transform"
                    onClick={() => window.open(`tel:${chatInfo.phone}`)}
                  >
                    <CallIcon size={20} variant="solid" />
                    <span className="font-bold">Call</span>
                  </button>
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>

      </div>
    </AppShell>
  );
}
