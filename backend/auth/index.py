'''
Business: User authentication (registration, login, token validation)
Args: event with httpMethod, body (email, username, password)
Returns: HTTP response with user data or auth token
'''

import json
import os
import hashlib
import secrets
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def generate_token() -> str:
    return secrets.token_urlsafe(32)

def get_db_connection():
    database_url = os.environ.get('DATABASE_URL')
    return psycopg2.connect(database_url, cursor_factory=RealDictCursor)

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method == 'POST':
        body = json.loads(event.get('body', '{}'))
        action = body.get('action')
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        try:
            if action == 'register':
                email = body.get('email')
                username = body.get('username')
                password = body.get('password')
                full_name = body.get('full_name', '')
                phone = body.get('phone', '')
                
                password_hash = hash_password(password)
                
                cur.execute(
                    "INSERT INTO users (email, username, password_hash, full_name, phone, status) VALUES (%s, %s, %s, %s, %s, 'online') RETURNING id, email, username, full_name, phone, avatar_url, status, created_at",
                    (email, username, password_hash, full_name, phone)
                )
                user = dict(cur.fetchone())
                conn.commit()
                
                user['created_at'] = user['created_at'].isoformat() if user.get('created_at') else None
                
                token = generate_token()
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({
                        'success': True,
                        'user': user,
                        'token': token
                    }),
                    'isBase64Encoded': False
                }
            
            elif action == 'login':
                identifier = body.get('identifier')
                password = body.get('password')
                password_hash = hash_password(password)
                
                cur.execute(
                    "SELECT id, email, username, full_name, phone, avatar_url, status, created_at FROM users WHERE (email = %s OR username = %s OR phone = %s) AND password_hash = %s",
                    (identifier, identifier, identifier, password_hash)
                )
                user = cur.fetchone()
                
                if user:
                    user_dict = dict(user)
                    cur.execute("UPDATE users SET status = 'online', last_seen = CURRENT_TIMESTAMP WHERE id = %s", (user_dict['id'],))
                    conn.commit()
                    
                    user_dict['created_at'] = user_dict['created_at'].isoformat() if user_dict.get('created_at') else None
                    
                    token = generate_token()
                    
                    return {
                        'statusCode': 200,
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        'body': json.dumps({
                            'success': True,
                            'user': user_dict,
                            'token': token
                        }),
                        'isBase64Encoded': False
                    }
                else:
                    return {
                        'statusCode': 401,
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        'body': json.dumps({
                            'success': False,
                            'error': 'Неверные данные для входа'
                        }),
                        'isBase64Encoded': False
                    }
        
        except psycopg2.IntegrityError as e:
            conn.rollback()
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'success': False,
                    'error': 'Пользователь с такими данными уже существует'
                }),
                'isBase64Encoded': False
            }
        finally:
            cur.close()
            conn.close()
    
    return {
        'statusCode': 405,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }