from django.urls import path
from chat.consumers import ChatConsumer, GroupChatConsumer

websocket_urlpatterns = [
    path("ws/chat/<int:user_id>/", ChatConsumer.as_asgi()),
    path("ws/chat/group/<int:group_id>/", GroupChatConsumer.as_asgi()),
]