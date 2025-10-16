import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface Chat {
  id: number;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
  avatar: string;
  online: boolean;
  type: 'personal' | 'group' | 'channel';
}

interface Message {
  id: number;
  text: string;
  time: string;
  sender: 'me' | 'other';
  avatar?: string;
}

const mockChats: Chat[] = [
  {
    id: 1,
    name: 'Анна Смирнова',
    lastMessage: 'Привет! Как дела?',
    time: '14:32',
    unread: 3,
    avatar: '',
    online: true,
    type: 'personal'
  },
  {
    id: 2,
    name: 'Команда Разработки',
    lastMessage: 'Сегодня релиз в 18:00',
    time: '13:15',
    unread: 0,
    avatar: '',
    online: false,
    type: 'group'
  },
  {
    id: 3,
    name: 'Новости Tech',
    lastMessage: 'Новый iPhone представлен',
    time: '12:00',
    unread: 5,
    avatar: '',
    online: false,
    type: 'channel'
  },
  {
    id: 4,
    name: 'Дмитрий Иванов',
    lastMessage: 'Спасибо за помощь!',
    time: 'Вчера',
    unread: 0,
    avatar: '',
    online: false,
    type: 'personal'
  }
];

const mockMessages: Message[] = [
  {
    id: 1,
    text: 'Привет! Как твои дела?',
    time: '14:30',
    sender: 'other',
    avatar: ''
  },
  {
    id: 2,
    text: 'Отлично! Работаю над новым проектом',
    time: '14:31',
    sender: 'me'
  },
  {
    id: 3,
    text: 'Круто! Расскажешь подробнее?',
    time: '14:32',
    sender: 'other',
    avatar: ''
  }
];

export default function Index() {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(mockChats[0]);
  const [messages] = useState<Message[]>(mockMessages);
  const [messageText, setMessageText] = useState('');
  const [activeSection, setActiveSection] = useState<'chats' | 'contacts' | 'settings'>('chats');
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
              <AvatarImage src="" />
              <AvatarFallback className="bg-white/20 text-white font-semibold">МП</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-white font-semibold">Мой Профиль</p>
              <p className="text-white/70 text-sm">@myprofile</p>
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
          <Button variant="ghost" className="w-full justify-start text-white hover:bg-white/10">
            <Icon name="Moon" size={20} className="mr-3" />
            Темная тема
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
            <Button variant="ghost" size="icon" className="gradient-chat rounded-full text-white">
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
            {mockChats.map((chat, index) => (
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
                    <AvatarImage src={chat.avatar} />
                    <AvatarFallback className="gradient-chat text-white font-semibold">
                      {chat.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  {chat.online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-secondary rounded-full border-2 border-card"></div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-semibold truncate">{chat.name}</p>
                    <span className="text-xs text-muted-foreground">{chat.time}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
                    {chat.unread > 0 && (
                      <Badge className="ml-2 gradient-accent text-white border-0 px-2">
                        {chat.unread}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      <div className="flex-1 flex flex-col bg-background">
        {selectedChat ? (
          <>
            <div className="p-4 border-b border-border flex items-center gap-3 bg-card">
              <Avatar className="h-10 w-10">
                <AvatarImage src={selectedChat.avatar} />
                <AvatarFallback className="gradient-chat text-white font-semibold">
                  {selectedChat.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <p className="font-semibold">{selectedChat.name}</p>
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
                {messages.map((message, index) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'} animate-scale-in`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {message.sender === 'other' && (
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarImage src={message.avatar} />
                        <AvatarFallback className="gradient-chat text-white text-xs">
                          {selectedChat.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                        message.sender === 'me'
                          ? 'gradient-purple text-white'
                          : 'bg-card border border-border'
                      }`}
                    >
                      <p className={message.sender === 'me' ? 'text-white' : 'text-foreground'}>
                        {message.text}
                      </p>
                      <p className={`text-xs mt-1 ${message.sender === 'me' ? 'text-white/70' : 'text-muted-foreground'}`}>
                        {message.time}
                      </p>
                    </div>
                  </div>
                ))}
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
                      setMessageText('');
                    }
                  }}
                />
                
                <Button className="gradient-purple text-white hover:opacity-90 transition-opacity">
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
    </div>
  );
}