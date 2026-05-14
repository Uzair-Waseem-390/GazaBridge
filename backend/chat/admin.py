# """
# Chat Admin Configuration
# =======================
# """

# from django.contrib import admin
# from django.db.models import Count
# from django.utils.html import format_html
# from django.urls import reverse
# from . import models


# @admin.register(models.Conversation)
# class ConversationAdmin(admin.ModelAdmin):
#     list_display = ('id', 'get_users', 'composite_key', 'message_count', 'created_at', 'updated_at')
#     list_filter = ('created_at', 'updated_at')
#     search_fields = ('composite_key', 'user1__email', 'user2__email', 'user1__username', 'user2__username')
#     readonly_fields = ('composite_key', 'created_at', 'updated_at')
#     raw_id_fields = ('user1', 'user2')
    
#     fieldsets = (
#         ('Users', {
#             'fields': ('user1', 'user2')
#         }),
#         ('Metadata', {
#             'fields': ('composite_key', 'created_at', 'updated_at')
#         }),
#     )
    
#     def get_queryset(self, request):
#         return super().get_queryset(request).annotate(
#             message_count=Count('messages')
#         )
    
#     def get_users(self, obj):
#         return f"{obj.user1} ↔ {obj.user2}"
#     get_users.short_description = 'Conversation'
    
#     def message_count(self, obj):
#         return obj.message_count
#     message_count.short_description = 'Messages'
    
#     def view_messages_link(self, obj):
#         count = obj.messages.count()
#         url = reverse('admin:chat_message_changelist')
#         return format_html('<a href="{}?conversation__id__exact={}">{} messages</a>', url, obj.id, count)
#     view_messages_link.short_description = 'Messages'


# @admin.register(models.Group)
# class GroupAdmin(admin.ModelAdmin):
#     list_display = ('id', 'name', 'owner', 'member_count', 'message_count', 'created_at', 'updated_at')
#     list_filter = ('created_at', 'updated_at', 'member_count')
#     search_fields = ('name', 'description', 'owner__email', 'owner__username')
#     raw_id_fields = ('owner',)
#     readonly_fields = ('created_at', 'updated_at', 'member_count')
    
#     fieldsets = (
#         ('Group Info', {
#             'fields': ('name', 'description', 'owner')
#         }),
#         ('Statistics', {
#             'fields': ('member_count', 'created_at', 'updated_at')
#         }),
#     )
    
#     def get_queryset(self, request):
#         return super().get_queryset(request).annotate(
#             message_count=Count('messages')
#         )
    
#     def message_count(self, obj):
#         return obj.message_count
#     message_count.short_description = 'Messages'
    
#     def view_members_link(self, obj):
#         url = reverse('admin:chat_groupmembership_changelist')
#         return format_html('<a href="{}?group__id__exact={}">View Members</a>', url, obj.id)
#     view_members_link.short_description = 'Members'
    
#     actions = ['clear_all_messages']
    
#     def clear_all_messages(self, request, queryset):
#         for group in queryset:
#             deleted_count = group.messages.count()
#             group.messages.all().delete()
#             self.message_user(request, f'Deleted {deleted_count} messages from "{group.name}"')
#     clear_all_messages.short_description = 'Delete all messages in selected groups'


# @admin.register(models.GroupMembership)
# class GroupMembershipAdmin(admin.ModelAdmin):
#     list_display = ('id', 'group', 'user', 'is_admin', 'joined_at')
#     list_filter = ('is_admin', 'joined_at', 'group')
#     search_fields = ('group__name', 'user__email', 'user__username')
#     raw_id_fields = ('group', 'user')
#     list_editable = ('is_admin',)
#     readonly_fields = ('joined_at',)
    
#     fieldsets = (
#         ('Membership', {
#             'fields': ('group', 'user', 'is_admin')
#         }),
#         ('Metadata', {
#             'fields': ('joined_at',)
#         }),
#     )


# @admin.register(models.Message)
# class MessageAdmin(admin.ModelAdmin):
#     list_display = ('id', 'preview', 'sender', 'message_type', 'read_status', 'receipt_count', 'created_at')
#     list_filter = ('is_read', 'created_at', 'conversation', 'group')
#     search_fields = ('content', 'sender__email', 'sender__username')
#     raw_id_fields = ('conversation', 'group', 'sender')
#     readonly_fields = ('created_at',)
    
#     fieldsets = (
#         ('Context', {
#             'fields': ('conversation', 'group', 'sender')
#         }),
#         ('Content', {
#             'fields': ('content',)
#         }),
#         ('Status', {
#             'fields': ('is_read', 'created_at')
#         }),
#     )
    
#     def get_queryset(self, request):
#         return super().get_queryset(request).annotate(
#             receipt_count=Count('receipts')
#         )
    
#     def preview(self, obj):
#         return obj.content[:50] + ('...' if len(obj.content) > 50 else '')
#     preview.short_description = 'Message Preview'
    
#     def message_type(self, obj):
#         if obj.conversation:
#             return format_html('<b>💬 DM</b>')
#         elif obj.group:
#             return format_html('<b>👥 Group</b>')
#         return 'Unknown'
#     message_type.short_description = 'Type'
    
#     def read_status(self, obj):
#         if obj.is_read:
#             return format_html('✅ Read')
#         return format_html('⏳ Unread')
#     read_status.short_description = 'Status'
    
#     def receipt_count(self, obj):
#         return obj.receipt_count
#     receipt_count.short_description = 'Read Receipts'
    
#     actions = ['mark_as_read', 'mark_as_unread']
    
#     def mark_as_read(self, request, queryset):
#         updated = queryset.update(is_read=True)
#         self.message_user(request, f'{updated} message(s) marked as read')
#     mark_as_read.short_description = 'Mark selected messages as read'
    
#     def mark_as_unread(self, request, queryset):
#         updated = queryset.update(is_read=False)
#         self.message_user(request, f'{updated} message(s) marked as unread')
#     mark_as_unread.short_description = 'Mark selected messages as unread'


# @admin.register(models.MessageReceipt)
# class MessageReceiptAdmin(admin.ModelAdmin):
#     list_display = ('id', 'message_preview', 'user', 'read_at')
#     list_filter = ('read_at',)
#     search_fields = ('message__content', 'user__email', 'user__username')
#     raw_id_fields = ('message', 'user')
#     readonly_fields = ('read_at',)
    
#     fieldsets = (
#         ('Receipt Info', {
#             'fields': ('message', 'user', 'read_at')
#         }),
#     )
    
#     def message_preview(self, obj):
#         return obj.message.content[:50] + ('...' if len(obj.message.content) > 50 else '')
#     message_preview.short_description = 'Message'


# @admin.register(models.Block)
# class BlockAdmin(admin.ModelAdmin):
#     list_display = ('id', 'blocker', 'blocked', 'created_at')
#     list_filter = ('created_at',)
#     search_fields = ('blocker__email', 'blocker__username', 'blocked__email', 'blocked__username')
#     raw_id_fields = ('blocker', 'blocked')
#     readonly_fields = ('created_at',)
    
#     fieldsets = (
#         ('Block Relationship', {
#             'fields': ('blocker', 'blocked')
#         }),
#         ('Metadata', {
#             'fields': ('created_at',)
#         }),
#     )
    
#     actions = ['unblock_selected']
    
#     def unblock_selected(self, request, queryset):
#         deleted_count = queryset.count()
#         queryset.delete()
#         self.message_user(request, f'Successfully unblocked {deleted_count} relationship(s)')
#     unblock_selected.short_description = 'Unblock selected'


# # Inline admin classes for nested views
# class MessageReceiptInline(admin.TabularInline):
#     model = models.MessageReceipt
#     extra = 0
#     raw_id_fields = ('user',)
#     readonly_fields = ('read_at',)
#     can_delete = False
#     max_num = 0


# class GroupMembershipInline(admin.TabularInline):
#     model = models.GroupMembership
#     extra = 0
#     raw_id_fields = ('user',)
#     readonly_fields = ('joined_at',)
#     fields = ('user', 'is_admin', 'joined_at')
#     show_change_link = True


# # Update GroupAdmin to include members inline
# @admin.register(models.Group)
# class GroupAdminWithInline(admin.ModelAdmin):
#     list_display = ('id', 'name', 'owner', 'member_count', 'message_count', 'created_at', 'updated_at')
#     list_filter = ('created_at', 'updated_at', 'member_count')
#     search_fields = ('name', 'description', 'owner__email', 'owner__username')
#     raw_id_fields = ('owner',)
#     readonly_fields = ('created_at', 'updated_at', 'member_count')
#     inlines = [GroupMembershipInline]
    
#     fieldsets = (
#         ('Group Info', {
#             'fields': ('name', 'description', 'owner')
#         }),
#         ('Statistics', {
#             'fields': ('member_count', 'created_at', 'updated_at')
#         }),
#     )
    
#     def get_queryset(self, request):
#         return super().get_queryset(request).annotate(
#             message_count=Count('messages')
#         )
    
#     def message_count(self, obj):
#         return obj.message_count
#     message_count.short_description = 'Messages'


# # Update MessageAdmin to include receipts inline
# @admin.register(models.Message)
# class MessageAdminWithInline(admin.ModelAdmin):
#     list_display = ('id', 'preview', 'sender', 'message_type', 'read_status', 'receipt_count', 'created_at')
#     list_filter = ('is_read', 'created_at', 'conversation', 'group')
#     search_fields = ('content', 'sender__email', 'sender__username')
#     raw_id_fields = ('conversation', 'group', 'sender')
#     readonly_fields = ('created_at',)
#     inlines = [MessageReceiptInline]
    
#     fieldsets = (
#         ('Context', {
#             'fields': ('conversation', 'group', 'sender')
#         }),
#         ('Content', {
#             'fields': ('content',)
#         }),
#         ('Status', {
#             'fields': ('is_read', 'created_at')
#         }),
#     )
    
#     def get_queryset(self, request):
#         return super().get_queryset(request).annotate(
#             receipt_count=Count('receipts')
#         )
    
#     def preview(self, obj):
#         return obj.content[:50] + ('...' if len(obj.content) > 50 else '')
#     preview.short_description = 'Message Preview'
    
#     def message_type(self, obj):
#         if obj.conversation:
#             return format_html('<b>💬 DM</b>')
#         elif obj.group:
#             return format_html('<b>👥 Group</b>')
#         return 'Unknown'
#     message_type.short_description = 'Type'
    
#     def read_status(self, obj):
#         if obj.is_read:
#             return format_html('✅ Read')
#         return format_html('⏳ Unread')
#     read_status.short_description = 'Status'
    
#     def receipt_count(self, obj):
#         return obj.receipt_count
#     receipt_count.short_description = 'Read Receipts'
    
#     actions = ['mark_as_read', 'mark_as_unread']
    
#     def mark_as_read(self, request, queryset):
#         updated = queryset.update(is_read=True)
#         self.message_user(request, f'{updated} message(s) marked as read')
#     mark_as_read.short_description = 'Mark selected messages as read'
    
#     def mark_as_unread(self, request, queryset):
#         updated = queryset.update(is_read=False)
#         self.message_user(request, f'{updated} message(s) marked as unread')
#     mark_as_unread.short_description = 'Mark selected messages as unread'