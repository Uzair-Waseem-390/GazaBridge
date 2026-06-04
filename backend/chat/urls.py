from django.urls import path
from chat.views import (
    ConversationListView, ConversationMessagesView,
    MarkMessageReadView, MarkGroupMessageReadView,
    BlockUserView, UnblockUserView, BlockedListView,
    GroupCreateView, GroupListView, GroupDetailView, GroupMessagesView,
    AddMemberView, RemoveMemberView, MakeAdminView, LeaveGroupView,
)

app_name = "chat"

urlpatterns = [
    # Conversations
    path("conversations/", ConversationListView.as_view(), name="conversation-list"),
    path("conversations/<int:conv_id>/messages/", ConversationMessagesView.as_view(), name="conversation-messages"),
    
    # Read receipts
    path("messages/<int:message_id>/read/", MarkMessageReadView.as_view(), name="mark-read"),
    path("messages/<int:message_id>/read-group/", MarkGroupMessageReadView.as_view(), name="mark-group-read"),
    
    # Blocking
    path("block/<int:user_id>/", BlockUserView.as_view(), name="block-user"),
    path("unblock/<int:user_id>/", UnblockUserView.as_view(), name="unblock-user"),
    path("blocked/", BlockedListView.as_view(), name="blocked-list"),
    
    # Groups
    path("groups/create/", GroupCreateView.as_view(), name="group-create"),
    path("groups/", GroupListView.as_view(), name="group-list"),
    path("groups/<int:pk>/", GroupDetailView.as_view(), name="group-detail"),
    path("groups/<int:pk>/messages/", GroupMessagesView.as_view(), name="group-messages"),
    path("groups/<int:group_id>/add-member/", AddMemberView.as_view(), name="add-member"),
    path("groups/<int:group_id>/remove-member/<int:user_id>/", RemoveMemberView.as_view(), name="remove-member"),
    path("groups/<int:group_id>/make-admin/<int:user_id>/", MakeAdminView.as_view(), name="make-admin"),
    path("groups/<int:group_id>/leave/", LeaveGroupView.as_view(), name="leave-group"),
]