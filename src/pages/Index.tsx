import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import AuthForm from '@/components/AuthForm';
import AddContactDialog from '@/components/AddContactDialog';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: number;
  email: string;
  username: string;
  full_name: string;
  phone: string;
  avatar_url: string;
  status: string;
}

interface Chat {
  id: number;
  name: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
  avatar_url: string;
  online: boolean;
  type: 'personal' | 'group' | 'channel';
}

interface Message {
  id: number;
  chat_id: number;
  sender_id: number;
  content: string;
  created_at: string;
  username: string;
  full_name: string;
  avatar_url: string;
}

export default function Index() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [token, setToken] = useState<string>('');
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [activeSection, setActiveSection] = useState<'chats' | 'contacts' | 'settings'>('chats');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [addContactOpen, setAddContactOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (currentUser) {
      loadChats();
    }
  }, [currentUser]);

  useEffect(() => {
    if (selectedChat) {
      loadMessages(selectedChat.id);
    }
  }, [selectedChat]);

  const loadChats = async () => {
    if (!currentUser) return;

    try {
      const response = await fetch(
        `https://functions.poehali.dev/2462b714-2ad9-47ac-955e-19c189d6d93d?user_id=${currentUser.id}`
      );
      const data = await response.json();
      setChats(data.chats || []);
    } catch (error) {
      console.error('Failed to load chats:', error);
    }
  };

  const loadMessages = async (chatId: number) => {
    try {
      const response = await fetch(
        `https://functions.poehali.dev/ac845eb5-2abd-42f4-bbf0-033ca2024bf6?chat_id=${chatId}`
      );
      const data = await response.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedChat || !currentUser) return;

    try {
      const response = await fetch('https://functions.poehali.dev/ac845eb5-2abd-42f4-bbf0-033ca2024bf6', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: selectedChat.id,
          sender_id: currentUser.id,
          content: messageText
        })
      });

      const data = await response.json();

      if (data.success) {
        const newMessage: Message = {
          ...data.message,
          username: currentUser.username,
          full_name: currentUser.full_name,
          avatar_url: currentUser.avatar_url
        };
        setMessages([...messages, newMessage]);
        setMessageText('');
        loadChats();
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось отправить сообщение',
        variant: 'destructive'
      });
    }
  };

  const handleChatCreated = async (chatId: number) => {
    await loadChats();
    const newChat = chats.find(c => c.id === chatId);
    if (newChat) {
      setSelectedChat(newChat);
    }
  };

  const formatTime = (timestamp: string) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Вчера';
    } else {
      return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
    }
  };

  if (!currentUser) {
    return <AuthForm onSuccess={(user, authToken) => { setCurrentUser(user); setToken(authToken); }} />;
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:relative z-50 w-72 gradient-purple flex flex-col transition-transform duration-300`}>
        <div className="p-6 border-b border-white/20">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-heading font-bold text-white">Visvision</h1>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-white hover:bg-white/20"
              onClick={() => setSidebarOpen(false)}
            >
              <Icon name="X" size={20} />
            </Button>
          </div>
          
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 border-2 border-white/30">
              <AvatarImage src={currentUser.avatar_url} />
              <AvatarFallback className="bg-white/20 text-white font-semibold">
                {currentUser.full_name ? currentUser.full_name.split(' ').map(n => n[0]).join('') : currentUser.username[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-white font-semibold">{currentUser.full_name || currentUser.username}</p>
              <p className="text-white/70 text-sm">@{currentUser.username}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4">
          <div className="space-y-2">
            <Button
              variant={activeSection === 'chats' ? 'secondary' : 'ghost'}
              className={`w-full justify-start text-white ${activeSection === 'chats' ? 'bg-white/20' : 'hover:bg-white/10'}`}
              onClick={() => setActiveSection('chats')}
            >
              <Icon name="MessageSquare" size={20} className="mr-3" />
              Чаты
            </Button>
            <Button
              variant={activeSection === 'contacts' ? 'secondary' : 'ghost'}
              className={`w-full justify-start text-white ${activeSection === 'contacts' ? 'bg-white/20' : 'hover:bg-white/10'}`}
              onClick={() => setActiveSection('contacts')}
            >
              <Icon name="Users" size={20} className="mr-3" />
              Контакты
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-white hover:bg-white/10"
            >
              <Icon name="Radio" size={20} className="mr-3" />
              Каналы
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-white hover:bg-white/10"
            >
              <Icon name="Phone" size={20} className="mr-3" />
              Звонки
            </Button>
            <Button
              variant={activeSection === 'settings' ? 'secondary' : 'ghost'}
              className={`w-full justify-start text-white ${activeSection === 'settings' ? 'bg-white/20' : 'hover:bg-white/10'}`}
              onClick={() => setActiveSection('settings')}
            >
              <Icon name="Settings" size={20} className="mr-3" />
              Настройки
            </Button>
          </div>
        </nav>

        <div className="p-4 border-t border-white/20">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-white hover:bg-white/10"
            onClick={() => { setCurrentUser(null); setToken(''); }}
          >
            <Icon name="LogOut" size={20} className="mr-3" />
            Выход
          </Button>
        </div>
      </div>

      <div className="w-full md:w-96 border-r border-border flex flex-col bg-card">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Icon name="Menu" size={20} />
            </Button>
            <h2 className="text-xl font-heading font-semibold flex-1 text-center md:text-left">Сообщения</h2>
            <Button 
              variant="ghost" 
              size="icon" 
              className="gradient-chat rounded-full text-white"
              onClick={() => setAddContactOpen(true)}
            >
              <Icon name="Plus" size={20} />
            </Button>
          </div>
          
          <div className="relative">
            <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Поиск..."
              className="pl-10 bg-muted border-0 focus-visible:ring-primary"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2">
            {chats.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Нет чатов</p>
                <p className="text-sm mt-2">Нажмите + чтобы добавить контакт</p>
              </div>
            ) : (
              chats.map((chat, index) => (
                <div
                  key={chat.id}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all hover:bg-muted animate-fade-in ${
                    selectedChat?.id === chat.id ? 'bg-primary/10 border border-primary/20' : ''
                  }`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                  onClick={() => setSelectedChat(chat)}
                >
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={chat.avatar_url} />
                      <AvatarFallback className="gradient-chat text-white font-semibold">
                        {chat.name ? chat.name.split(' ').map(n => n[0]).join('') : '?'}
                      </AvatarFallback>
                    </Avatar>
                    {chat.online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-secondary rounded-full border-2 border-card"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold truncate">{chat.name || 'Без имени'}</p>
                      <span className="text-xs text-muted-foreground">{formatTime(chat.last_message_time)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground truncate">{chat.last_message || 'Нет сообщений'}</p>
                      {chat.unread_count > 0 && (
                        <Badge className="ml-2 gradient-accent text-white border-0 px-2">
                          {chat.unread_count}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      <div className="flex-1 flex flex-col bg-background">
        {selectedChat ? (
          <>
            <div className="p-4 border-b border-border flex items-center gap-3 bg-card">
              <Avatar className="h-10 w-10">
                <AvatarImage src={selectedChat.avatar_url} />
                <AvatarFallback className="gradient-chat text-white font-semibold">
                  {selectedChat.name ? selectedChat.name.split(' ').map(n => n[0]).join('') : '?'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <p className="font-semibold">{selectedChat.name || 'Без имени'}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedChat.online ? 'В сети' : 'Был(а) недавно'}
                </p>
              </div>

              <div className="flex gap-2">
                <Button variant="ghost" size="icon" className="text-primary hover:bg-primary/10">
                  <Icon name="Phone" size={20} />
                </Button>
                <Button variant="ghost" size="icon" className="text-primary hover:bg-primary/10">
                  <Icon name="Video" size={20} />
                </Button>
                <Button variant="ghost" size="icon" className="text-primary hover:bg-primary/10">
                  <Icon name="MoreVertical" size={20} />
                </Button>
              </div>
            </div>

            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4 max-w-4xl mx-auto">
                {messages.map((message, index) => {
                  const isMe = message.sender_id === currentUser.id;
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-scale-in`}
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      {!isMe && (
                        <Avatar className="h-8 w-8 mr-2">
                          <AvatarImage src={message.avatar_url} />
                          <AvatarFallback className="gradient-chat text-white text-xs">
                            {message.full_name ? message.full_name.split(' ').map(n => n[0]).join('') : message.username[0]}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                          isMe
                            ? 'gradient-purple text-white'
                            : 'bg-card border border-border'
                        }`}
                      >
                        <p className={isMe ? 'text-white' : 'text-foreground'}>
                          {message.content}
                        </p>
                        <p className={`text-xs mt-1 ${isMe ? 'text-white/70' : 'text-muted-foreground'}`}>
                          {formatTime(message.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>

            <div className="p-4 border-t border-border bg-card">
              <div className="flex gap-2 max-w-4xl mx-auto">
                <Button variant="ghost" size="icon" className="text-primary hover:bg-primary/10">
                  <Icon name="Paperclip" size={20} />
                </Button>
                <Button variant="ghost" size="icon" className="text-primary hover:bg-primary/10">
                  <Icon name="Smile" size={20} />
                </Button>
                
                <Input
                  placeholder="Написать сообщение..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="flex-1 bg-muted border-0 focus-visible:ring-primary"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && messageText.trim()) {
                      handleSendMessage();
                    }
                  }}
                />
                
                <Button 
                  className="gradient-purple text-white hover:opacity-90 transition-opacity"
                  onClick={handleSendMessage}
                  disabled={!messageText.trim()}
                >
                  <Icon name="Send" size={20} />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center p-8">
            <div className="animate-fade-in">
              <div className="w-24 h-24 mx-auto mb-4 gradient-purple rounded-full flex items-center justify-center">
                <Icon name="MessageSquare" size={40} className="text-white" />
              </div>
              <h3 className="text-2xl font-heading font-bold mb-2">Выберите чат</h3>
              <p className="text-muted-foreground">
                Начните общение, выбрав чат из списка
              </p>
            </div>
          </div>
        )}
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      <AddContactDialog
        open={addContactOpen}
        onOpenChange={setAddContactOpen}
        currentUserId={currentUser.id}
        onChatCreated={handleChatCreated}
      />
    </div>
  );
}
