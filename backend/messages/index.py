'''
Business: Message operations (send, get messages for chat)
Args: event with httpMethod, body (chat_id, content, sender_id)
Returns: HTTP response with messages or confirmation
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
            chat_id = params.get('chat_id')
            
            if not chat_id:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'chat_id is required'}),
                    'isBase64Encoded': False
                }
            
            cur.execute("""
                SELECT m.id, m.chat_id, m.sender_id, m.content, m.type, m.created_at, m.is_read,
                       u.username, u.full_name, u.avatar_url
                FROM messages m
                JOIN users u ON m.sender_id = u.id
                WHERE m.chat_id = %s
                ORDER BY m.created_at ASC
            """, (chat_id,))
            
            messages = [dict(row) for row in cur.fetchall()]
            
            for msg in messages:
                msg['created_at'] = msg['created_at'].isoformat() if msg['created_at'] else None
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'messages': messages}),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            chat_id = body.get('chat_id')
            sender_id = body.get('sender_id')
            content = body.get('content')
            msg_type = body.get('type', 'text')
            
            cur.execute("""
                INSERT INTO messages (chat_id, sender_id, content, type)
                VALUES (%s, %s, %s, %s)
                RETURNING id, chat_id, sender_id, content, type, created_at, is_read
            """, (chat_id, sender_id, content, msg_type))
            
            message = dict(cur.fetchone())
            conn.commit()
            
            cur.execute("UPDATE chats SET updated_at = CURRENT_TIMESTAMP WHERE id = %s", (chat_id,))
            conn.commit()
            
            message['created_at'] = message['created_at'].isoformat() if message['created_at'] else None
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'success': True,
                    'message': message
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
