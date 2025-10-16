'''
Business: Chat operations (get user chats, create chat, add contact)
Args: event with httpMethod, queryParams (user_id), body (contact search)
Returns: HTTP response with chats list or created chat
'''

import json
import os
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

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
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        if method == 'GET':
            params = event.get('queryStringParameters', {})
            user_id = params.get('user_id')
            action = params.get('action')
            
            if action == 'search_contacts':
                query = params.get('query', '')
                
                cur.execute("""
                    SELECT id, email, username, full_name, phone, avatar_url, status
                    FROM users
                    WHERE (email ILIKE %s OR username ILIKE %s OR phone ILIKE %s OR full_name ILIKE %s)
                    AND id != %s
                    LIMIT 20
                """, (f'%{query}%', f'%{query}%', f'%{query}%', f'%{query}%', user_id))
                
                users = [dict(row) for row in cur.fetchall()]
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'users': users}),
                    'isBase64Encoded': False
                }
            
            if not user_id:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'user_id is required'}),
                    'isBase64Encoded': False
                }
            
            cur.execute("""
                SELECT DISTINCT c.id, c.type, c.name, c.avatar_url, c.updated_at,
                       (SELECT content FROM messages WHERE chat_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
                       (SELECT created_at FROM messages WHERE chat_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message_time,
                       (SELECT COUNT(*) FROM messages WHERE chat_id = c.id AND sender_id != %s AND is_read = FALSE) as unread_count
                FROM chats c
                JOIN chat_members cm ON c.id = cm.chat_id
                WHERE cm.user_id = %s
                ORDER BY c.updated_at DESC
            """, (user_id, user_id))
            
            chats = [dict(row) for row in cur.fetchall()]
            
            for chat in chats:
                if chat['type'] == 'personal':
                    cur.execute("""
                        SELECT u.id, u.username, u.full_name, u.avatar_url, u.status
                        FROM users u
                        JOIN chat_members cm ON u.id = cm.user_id
                        WHERE cm.chat_id = %s AND u.id != %s
                    """, (chat['id'], user_id))
                    
                    other_user = cur.fetchone()
                    if other_user:
                        other_user_dict = dict(other_user)
                        chat['name'] = other_user_dict['full_name'] or other_user_dict['username']
                        chat['avatar_url'] = other_user_dict['avatar_url']
                        chat['online'] = other_user_dict['status'] == 'online'
                else:
                    chat['online'] = False
                
                chat['updated_at'] = chat['updated_at'].isoformat() if chat['updated_at'] else None
                chat['last_message_time'] = chat['last_message_time'].isoformat() if chat['last_message_time'] else None
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'chats': chats}),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            action = body.get('action')
            
            if action == 'create_chat':
                user_id = body.get('user_id')
                contact_id = body.get('contact_id')
                
                cur.execute("""
                    SELECT c.id FROM chats c
                    JOIN chat_members cm1 ON c.id = cm1.chat_id
                    JOIN chat_members cm2 ON c.id = cm2.chat_id
                    WHERE c.type = 'personal'
                    AND cm1.user_id = %s
                    AND cm2.user_id = %s
                """, (user_id, contact_id))
                
                existing_chat = cur.fetchone()
                
                if existing_chat:
                    return {
                        'statusCode': 200,
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        'body': json.dumps({
                            'success': True,
                            'chat_id': existing_chat['id']
                        }),
                        'isBase64Encoded': False
                    }
                
                cur.execute("INSERT INTO chats (type) VALUES ('personal') RETURNING id")
                chat = cur.fetchone()
                chat_id = chat['id']
                
                cur.execute("INSERT INTO chat_members (chat_id, user_id) VALUES (%s, %s), (%s, %s)", (chat_id, user_id, chat_id, contact_id))
                
                cur.execute("INSERT INTO contacts (user_id, contact_user_id) VALUES (%s, %s) ON CONFLICT DO NOTHING", (user_id, contact_id))
                cur.execute("INSERT INTO contacts (user_id, contact_user_id) VALUES (%s, %s) ON CONFLICT DO NOTHING", (contact_id, user_id))
                
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({
                        'success': True,
                        'chat_id': chat_id
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
