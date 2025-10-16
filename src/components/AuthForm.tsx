import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface AuthFormProps {
  onSuccess: (user: any, token: string) => void;
}

export default function AuthForm({ onSuccess }: AuthFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [registerData, setRegisterData] = useState({
    email: '',
    username: '',
    password: '',
    full_name: '',
    phone: ''
  });

  const [loginData, setLoginData] = useState({
    identifier: '',
    password: ''
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('https://functions.poehali.dev/8a69fb03-327b-44f4-80a7-7f48a1f6ad1e', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'register',
          ...registerData
        })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Добро пожаловать!',
          description: 'Регистрация прошла успешно',
        });
        onSuccess(data.user, data.token);
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось зарегистрироваться',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Проблема с подключением к серверу',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('https://functions.poehali.dev/8a69fb03-327b-44f4-80a7-7f48a1f6ad1e', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'login',
          ...loginData
        })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'С возвращением!',
          description: 'Вход выполнен успешно',
        });
        onSuccess(data.user, data.token);
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Неверные данные для входа',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Проблема с подключением к серверу',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md animate-scale-in">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 gradient-purple rounded-3xl flex items-center justify-center">
            <Icon name="MessageSquare" size={40} className="text-white" />
          </div>
          <h1 className="text-4xl font-heading font-bold gradient-purple bg-clip-text text-transparent">
            Visvision
          </h1>
          <p className="text-muted-foreground mt-2">Современный безопасный мессенджер</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Вход в аккаунт</CardTitle>
            <CardDescription>Войдите или создайте новый аккаунт</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Вход</TabsTrigger>
                <TabsTrigger value="register">Регистрация</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-identifier">Email, телефон или имя пользователя</Label>
                    <Input
                      id="login-identifier"
                      type="text"
                      placeholder="user@example.com"
                      value={loginData.identifier}
                      onChange={(e) => setLoginData({ ...loginData, identifier: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Пароль</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full gradient-purple text-white" disabled={isLoading}>
                    {isLoading ? 'Вход...' : 'Войти'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="user@example.com"
                      value={registerData.email}
                      onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-username">Имя пользователя</Label>
                    <Input
                      id="register-username"
                      type="text"
                      placeholder="username"
                      value={registerData.username}
                      onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-fullname">Полное имя</Label>
                    <Input
                      id="register-fullname"
                      type="text"
                      placeholder="Иван Иванов"
                      value={registerData.full_name}
                      onChange={(e) => setRegisterData({ ...registerData, full_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-phone">Телефон (опционально)</Label>
                    <Input
                      id="register-phone"
                      type="tel"
                      placeholder="+7 (999) 123-45-67"
                      value={registerData.phone}
                      onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Пароль</Label>
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="••••••••"
                      value={registerData.password}
                      onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full gradient-purple text-white" disabled={isLoading}>
                    {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
