<?php

namespace App\Http\Controllers;

use App\Services\PusherService;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Message;
use App\Services\DeleteMessagesService;

class MessageController extends Controller
{
    // إرسال رسالة
    public function sendMessage(Request $request)
    {
        $message = $request->input('message');
        $user = $request->input('user');
        
        $userModel = User::where('name', $user)->first();

        if (!$userModel) {
            return response()->json([
                'status' => 'error',
                'message' => 'User not found'
            ], 404);
        }

        // حفظ الرسالة
        $savedMessage = Message::create([
            'msg' => $message,
            'client_id' => $userModel->id
        ]);

        // بث الحدث
        $pusher = new PusherService();
        $pusher->trigger('chat-channel', 'new-message', [
            'id' => $savedMessage->id,
            'message' => $savedMessage->msg,
            'user' => $userModel->name,
            'time' => now()->toDateTimeString()
        ]);

        return response()->json(['status' => 'success']);
    }

    // عرض كل الرسائل
    public function storeMessages()
    {
        $messages = Message::with('user:id,name')->get(['id', 'msg', 'client_id']);

        return response()->json([
            'status' => 'success',
            'data' => $messages
        ]);
    }

    // حذف رسالة وبث الحذف
  public function deleteMessage($id)
{
    $message = Message::find($id);

    if (!$message) {
        return response()->json(['status' => 'error', 'message' => 'Message not found'], 404);
    }

    $message->delete();

    $deleteService = new DeleteMessagesService();
    $deleteService->delete('chat-channel', $id);

    return response()->json(['status' => 'success']);
}

}
