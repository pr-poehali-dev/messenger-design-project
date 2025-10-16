import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface AddContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUserId: number;
  onChatCreated: (chatId: number) => void;
}

interface SearchUser {
  id: number;
  email: string;
  username: string;
  full_name: string;
  phone: string;
  avatar_url: string;
  status: string;
}

export default function AddContactDialog({ open, onOpenChange, currentUserId, onChatCreated }: AddContactDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://functions.poehali.dev/2462b714-2ad9-47ac-955e-19c189d6d93d?action=search_contacts&query=${encodeURIComponent(searchQuery)}&user_id=${currentUserId}`
      );
      const data = await response.json();
      setSearchResults(data.users || []);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось выполнить поиск',
        variant: 'destructive'
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleCreateChat = async (contactId: number) => {
    setIsCreatingChat(true);
    try {
      const response = await fetch('https://functions.poehali.dev/2462b714-2ad9-47ac-955e-19c189d6d93d', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create_chat',
          user_id: currentUserId,
          contact_id: contactId
        })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Успешно',
          description: 'Чат создан',
        });
        onChatCreated(data.chat_id);
        onOpenChange(false);
        setSearchQuery('');
        setSearchResults([]);
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось создать чат',
        variant: 'destructive'
      });
    } finally {
      setIsCreatingChat(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Добавить контакт</DialogTitle>
          <DialogDescription>
            Введите email, телефон или имя пользователя
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex gap-2">
          <Input
            placeholder="Поиск..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button onClick={handleSearch} disabled={isSearching} className="gradient-purple text-white">
            <Icon name="Search" size={20} />
          </Button>
        </div>

        <ScrollArea className="h-[300px] mt-4">
          {searchResults.length === 0 && !isSearching && searchQuery && (
            <div className="text-center text-muted-foreground py-8">
              Пользователи не найдены
            </div>
          )}
          
          {searchResults.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
            >
              <Avatar>
                <AvatarImage src={user.avatar_url} />
                <AvatarFallback className="gradient-chat text-white">
                  {user.full_name ? user.full_name.split(' ').map(n => n[0]).join('') : user.username[0]}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{user.full_name || user.username}</p>
                <p className="text-sm text-muted-foreground truncate">@{user.username}</p>
              </div>

              <Button
                size="sm"
                onClick={() => handleCreateChat(user.id)}
                disabled={isCreatingChat}
                className="gradient-purple text-white"
              >
                <Icon name="Plus" size={16} />
              </Button>
            </div>
          ))}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
