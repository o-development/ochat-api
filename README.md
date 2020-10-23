# OChat API

 - / (returns a message saying the API is online)
 - /auth (authentication routes)
    - GET /auth/login (trigger a login with solid)
    - GET /auth/callback (callback for auth)
 - /profile (does nothing)
    - GET /profile/authenticated (returns the profile of the currently authenticated person or 404 if not found)
    - POST /profile/authenticated?searchable=true (indexes the profile)
    - POST /profile/search?term=search%20term (searches all profiles)
 - /chat (does nothing)
    - GET /chat/:chat_url (Get a particular chat)
    - POST /chat/:chat_url (Index a particular chat)
    - PUT /chat/:chat_url (Update a particular chat)
    - POST /chat (Create a chat with certain chat information)
    - POST /chat/search (search all chats that you can access)
 - /message (does nothing)
    - GET /message/:chat_url?page=PAGE_NUMBER (get all messages of a certain page)
    - POST /message/:chat_url (send a message)
 - /notification-setting (does nothing)
    - PUT /notification-setting/:chat_url (set notification status for a certain chat)
    - GET /notification-setting/:chat_url (get notification status for a certain chat)
 - cron jobs
    - for all indexed profiles, re-index profile
    - for all indexed chats, re-index chat

